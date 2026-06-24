import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractFrames } from '@/utils/video/extractFrames';

export const config = {
  api: {
    bodyParser: false,
  },
};

const SYSTEM_PROMPT = `You are a drug safety analyst operating in Mauritius.
Analyse the provided video frames carefully for behavioural, environmental,
and verbal indicators of substance use, psychological distress,
self-harm, or unsafe behaviour.

Consider all available signals: body language, facial expressions,
speech patterns, environment, objects visible, and overall context.
The video may contain English, French, or Mauritian Kreol — analyse all equally.

Return ONLY a valid JSON object. No markdown, no code blocks, no explanation outside JSON.
Use this exact schema:

{
  "scene_summary": "string — what is happening across the video frames",
  "sentiment": {
    "tone": "string — overall emotional tone",
    "urgency_level": "low | medium | high | critical",
    "emotional_indicators": ["array of observed emotional signals"]
  },
  "risk_assessment": {
    "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
    "risk_score": "integer 0-100",
    "identified_concerns": ["array of specific concerns observed"],
    "contributing_factors": ["array of factors that informed the risk score"]
  },
  "recommendations": ["array of actionable next steps, referencing NDEA Mauritius helpline 148 where appropriate"]
}`;

const SEVERITY_MAP: Record<string, string> = {
  'LOW': 'Low',
  'MEDIUM': 'Medium',
  'HIGH': 'High',
  'CRITICAL': 'High',
};

interface OpenRouterReport {
  scene_summary: string;
  sentiment: {
    tone: string;
    urgency_level: 'low' | 'medium' | 'high' | 'critical';
    emotional_indicators: string[];
  };
  risk_assessment: {
    risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    risk_score: number | string;
    identified_concerns: string[];
    contributing_factors: string[];
  };
  recommendations: string[];
}

export async function POST(request: Request) {
  const openRouterApiKey = process.env.OPENROUTER_API_KEY;
  const openRouterModel = process.env.OPENROUTER_MODEL || 'qwen/qwen2.5-vl-72b-instruct';

  if (!openRouterApiKey) {
    console.error('OPENROUTER_API_KEY environment variable is not defined.');
    return NextResponse.json(
      { error: 'Server configuration error: OpenRouter API key is missing.' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('video') as File | null;
    const durationStr = formData.get('duration') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No video file provided.' }, { status: 400 });
    }

    // 1. Validate file type and size
    const validExtensions = ['mp4', 'mov', 'webm'];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const fileMimeType = file.type || '';

    const isValidType =
      validExtensions.includes(extension) ||
      fileMimeType.includes('video/mp4') ||
      fileMimeType.includes('video/quicktime') ||
      fileMimeType.includes('video/webm');

    if (!isValidType) {
      return NextResponse.json(
        { error: 'Invalid file type. Only MP4, MOV, and WEBM are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds the 100MB limit.' },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr || '', 10) || 0;

    // Convert file to Buffer in-memory
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Extract frames using the ffmpeg utility
    const frames = await extractFrames(buffer, fileMimeType);

    if (frames.length === 0) {
      return NextResponse.json(
        { error: 'Failed to extract any frames from the provided video.' },
        { status: 500 }
      );
    }

    // 3. Call OpenRouter endpoint
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'SafeGuard MU',
      },
      body: JSON.stringify({
        model: openRouterModel,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: [
              ...frames.map((frame) => ({
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${frame}`,
                },
              })),
              {
                type: 'text',
                text: 'Analyse these video frames and return the JSON risk assessment as instructed.',
              },
            ],
          },
        ],
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (status ${response.status}):`, errorText);
      
      // Clearly log rate limit or other API failures
      if (response.status === 429) {
        return NextResponse.json(
          { error: 'OpenRouter rate limit exceeded. Please try again later.' },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { error: `OpenRouter analysis failed: ${response.statusText}` },
        { status: 500 }
      );
    }

    const responseJson = await response.json();
    const rawContent = responseJson.choices?.[0]?.message?.content;

    if (!rawContent) {
      console.error('OpenRouter response has no content:', JSON.stringify(responseJson));
      return NextResponse.json(
        { error: 'Empty response returned from the vision model.' },
        { status: 500 }
      );
    }

    // 4. JSON parsing safety: Strip ```json or ``` wrappers
    let cleanText = rawContent.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```$/, '')
        .trim();
    }

    let parsedReport: OpenRouterReport;
    try {
      parsedReport = JSON.parse(cleanText) as OpenRouterReport;
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response as JSON:', parseError);
      console.error('Raw content was:', rawContent);
      return NextResponse.json(
        {
          error: 'Failed to parse JSON response from the vision model.',
          rawResponse: rawContent,
        },
        { status: 500 }
      );
    }

    // 5. Save report to Supabase `reports` table
    const supabase = await createClient();

    // Query the max ID to assign newId manually to avoid primary key duplicate violations
    const { data: maxRows, error: maxError } = await supabase
      .from('reports')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (maxError) {
      console.error('Error fetching max report ID from Supabase:', maxError);
    }

    const nextId = maxRows && maxRows.length > 0 ? Number(maxRows[0].id) + 1 : 1;

    // Create a beautiful structured markdown summary that embeds the JSON block
    const aiSuggestionText = `
Scene Summary:
${parsedReport.scene_summary}

Sentiment Tone:
${parsedReport.sentiment.tone} (Urgency: ${parsedReport.sentiment.urgency_level})
Emotional Indicators: ${parsedReport.sentiment.emotional_indicators.join(', ')}

Risk Assessment:
Level: ${parsedReport.risk_assessment.risk_level} (Score: ${parsedReport.risk_assessment.risk_score})
Concerns Identified: ${parsedReport.risk_assessment.identified_concerns.join(', ')}
Contributing Factors: ${parsedReport.risk_assessment.contributing_factors.join(', ')}

Recommendations:
${parsedReport.recommendations.map((r) => `- ${r}`).join('\n')}

[JSON_DATA]
${JSON.stringify({
  scene_summary: parsedReport.scene_summary,
  sentiment: parsedReport.sentiment,
  risk_assessment: parsedReport.risk_assessment,
  recommendations: parsedReport.recommendations,
  raw_response: rawContent,
  video_duration: duration,
  status: 'PENDING_REVIEW',
})}
`.trim();

    const severityValue = SEVERITY_MAP[parsedReport.risk_assessment.risk_level] || 'Low';

    const { error: insertError } = await supabase.from('reports').insert([
      {
        id: nextId,
        category: 'Unverified',
        video_id: duration, // saving duration in video_id as it is a bigint field
        ai_suggestion: aiSuggestionText,
        severity: severityValue,
      },
    ]);

    if (insertError) {
      console.error('Error inserting report to Supabase:', insertError);
      // We still return the report to the client even if DB write fails, per user requirement
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      report: parsedReport,
    });

  } catch (error: any) {
    console.error('Video analysis pipeline failed:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during video analysis.' },
      { status: 500 }
    );
  }
}
