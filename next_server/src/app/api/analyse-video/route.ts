import { NextResponse } from 'next/server';
import { supabaseService } from '@/utils/supabase/service';
import { extractFrames } from '@/utils/video/extractFrames';

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
    const incidentDescription = formData.get('incident_description') as string | null;
    const reportedDrugsStr = formData.get('reported_drugs') as string | null;
    const drugSeverityTier = formData.get('drug_severity_tier') as string | null;
    const locationLatStr = formData.get('location_lat') as string | null;
    const locationLngStr = formData.get('location_lng') as string | null;
    const locationAddress = formData.get('location_address') as string | null;

    // 1. Validations
    if (!incidentDescription || incidentDescription.length < 20) {
      return NextResponse.json(
        { error: 'Incident description must be present and at least 20 characters.' },
        { status: 400 }
      );
    }

    if (!reportedDrugsStr) {
      return NextResponse.json(
        { error: 'Reported drugs must be provided.' },
        { status: 400 }
      );
    }

    let reportedDrugs: string[];
    try {
      reportedDrugs = JSON.parse(reportedDrugsStr);
      if (!Array.isArray(reportedDrugs)) {
        throw new Error('Reported drugs is not an array.');
      }
    } catch (err) {
      return NextResponse.json(
        { error: 'Reported drugs must be a valid JSON array.' },
        { status: 400 }
      );
    }

    if (!file) {
      return NextResponse.json({ error: 'No video file provided.' }, { status: 400 });
    }

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
        { error: 'Invalid video file type. Only MP4, MOV, and WEBM are allowed.' },
        { status: 400 }
      );
    }

    if (file.size > 100 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video file size exceeds the 100MB limit.' },
        { status: 400 }
      );
    }

    const duration = parseInt(durationStr || '', 10) || 0;
    const locationLat = locationLatStr ? parseFloat(locationLatStr) : null;
    const locationLng = locationLngStr ? parseFloat(locationLngStr) : null;

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

    // 3. Construct System Prompt with injected witness context
    const systemPrompt = `You are a drug safety analyst operating in Mauritius.
You have been provided with both an incident report from a witness and video frames 
from the scene.

== INCIDENT REPORT ==
Description: ${incidentDescription}
Location: ${locationAddress ?? 'Not provided'} ${locationLat !== null && locationLng !== null ? `(${locationLat}, ${locationLng})` : ''}
Reported drug(s) involved: ${reportedDrugs.join(', ') || 'None specified'}
Drug severity tier: ${drugSeverityTier || 'NONE'}

== INSTRUCTIONS ==
Analyse the attached video frames for additional behavioural, environmental, and 
visual signals. Cross-reference what you observe in the video with the incident 
report provided. If the video contradicts the report, note the discrepancy in 
your response. Calibrate your risk score using BOTH the reported context AND 
visual evidence. The higher the drug severity tier and the more distressing the 
visual evidence, the higher the risk score should be.

The video or report may contain English, French, or Mauritian Kreol — analyse all equally.

Return ONLY a valid JSON object. No markdown, no code blocks, no preamble.
Use this exact schema:
{
  "scene_summary": "string",
  "sentiment": {
    "tone": "string",
    "urgency_level": "low | medium | high | critical",
    "emotional_indicators": []
  },
  "risk_assessment": {
    "risk_level": "LOW | MEDIUM | HIGH | CRITICAL",
    "risk_score": 0,
    "identified_concerns": [],
    "contributing_factors": []
  },
  "recommendations": []
}`;

    // 4. Call OpenRouter endpoint
    const startTime = Date.now();
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
            content: systemPrompt,
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

    const processingTimeMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenRouter API error (status ${response.status}):`, errorText);
      
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

    // 5. JSON parsing safety: Strip ```json or ``` wrappers
    let cleanText = rawContent.trim();
    if (cleanText.startsWith('```')) {
      cleanText = cleanText
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/, '')
        .replace(/```$/, '')
        .trim();
    }

    let parsedReport: any;
    try {
      parsedReport = JSON.parse(cleanText);
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

    // 6. DB writes: Sequential insertions using Supabase SERVICE ROLE client

    // Step 1: Insert into reports table
    const { data: maxReports, error: maxRepError } = await supabaseService
      .from('reports')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (maxRepError) {
      console.error('Error fetching max report ID from Supabase:', maxRepError);
    }
    const nextReportId = maxReports && maxReports.length > 0 ? Number(maxReports[0].id) + 1 : 1;

    const { error: reportInsertError } = await supabaseService.from('reports').insert([
      {
        id: nextReportId,
        incident_description: incidentDescription,
        reported_drugs: reportedDrugs,
        drug_severity_tier: drugSeverityTier || 'NONE',
        location_lat: locationLat,
        location_lng: locationLng,
        location_address: locationAddress,
        video_duration: duration,
        status: 'PENDING_REVIEW',
      },
    ]);

    if (reportInsertError) {
      console.error('Failed to insert report into Supabase reports table:', reportInsertError);
      throw new Error(`Database error (reports): ${reportInsertError.message}`);
    }

    // Step 2: Insert into ai_responses table using report_id
    const { data: maxResponses, error: maxResError } = await supabaseService
      .from('ai_responses')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (maxResError) {
      console.error('Error fetching max response ID from Supabase:', maxResError);
    }
    const nextResponseId = maxResponses && maxResponses.length > 0 ? Number(maxResponses[0].id) + 1 : 1;

    const { error: responseInsertError } = await supabaseService.from('ai_responses').insert([
      {
        id: nextResponseId,
        report_id: nextReportId,
        scene_summary: parsedReport.scene_summary,
        sentiment_tone: parsedReport.sentiment.tone,
        urgency_level: parsedReport.sentiment.urgency_level,
        emotional_indicators: parsedReport.sentiment.emotional_indicators,
        risk_level: parsedReport.risk_assessment.risk_level,
        risk_score: parsedReport.risk_assessment.risk_score,
        identified_concerns: parsedReport.risk_assessment.identified_concerns,
        contributing_factors: parsedReport.risk_assessment.contributing_factors,
        recommendations: parsedReport.recommendations,
        model_used: openRouterModel,
        raw_response: rawContent,
        processing_time_ms: processingTimeMs,
      },
    ]);

    if (responseInsertError) {
      console.error('Failed to insert response into Supabase ai_responses table:', responseInsertError);
      throw new Error(`Database error (ai_responses): ${responseInsertError.message}`);
    }

    // 7. Return payload to client
    return NextResponse.json({
      success: true,
      report_id: nextReportId,
      ai_response: {
        scene_summary: parsedReport.scene_summary,
        sentiment: parsedReport.sentiment,
        risk_assessment: parsedReport.risk_assessment,
        recommendations: parsedReport.recommendations,
      },
    });

  } catch (error: any) {
    console.error('Video analysis pipeline failed:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred during video analysis.' },
      { status: 500 }
    );
  }
}
