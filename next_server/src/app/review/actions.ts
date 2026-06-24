'use server'

import { createClient } from '@/lib/supabase/server'
import { requireCounselorOrAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'


export interface CaseReport {
  id: number
  incident_description: string
  reported_drugs: string[]
  drug_severity_tier: string
  location_lat: number | null
  location_lng: number | null
  location_address: string | null
  video_duration: number | null
  status: string
  created_at: string
  ai_response: {
    scene_summary: string | null
    sentiment_tone: string | null
    urgency_level: string | null
    emotional_indicators: string[] | null
    risk_level: string | null
    risk_score: number | null
    identified_concerns: string[] | null
    contributing_factors: string[] | null
    recommendations: string[] | null
  } | null
}

export async function fetchCaseReports(): Promise<{ data: CaseReport[]; error: string | null }> {
  const supabase = await createClient()

  const { data: reports, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (reportError) {
    return { data: [], error: reportError.message }
  }

  // Fetch corresponding AI responses
  const reportIds = reports.map((r: any) => r.id)

  const { data: aiResponses, error: aiError } = await supabase
    .from('ai_responses')
    .select('*')
    .in('report_id', reportIds)

  if (aiError) {
    console.error('Error fetching AI responses:', aiError)
  }

  // Map AI responses by report_id for quick lookup
  const aiMap = new Map<number, any>()
  if (aiResponses) {
    for (const ai of aiResponses) {
      aiMap.set(ai.report_id, ai)
    }
  }

  const caseReports: CaseReport[] = reports.map((r: any) => {
    const ai = aiMap.get(r.id)
    return {
      id: r.id,
      incident_description: r.incident_description,
      reported_drugs: r.reported_drugs || [],
      drug_severity_tier: r.drug_severity_tier || 'NONE',
      location_lat: r.location_lat,
      location_lng: r.location_lng,
      location_address: r.location_address,
      video_duration: r.video_duration,
      status: r.status || 'PENDING_REVIEW',
      created_at: r.created_at,
      ai_response: ai
        ? {
            scene_summary: ai.scene_summary,
            sentiment_tone: ai.sentiment_tone,
            urgency_level: ai.urgency_level,
            emotional_indicators: ai.emotional_indicators,
            risk_level: ai.risk_level,
            risk_score: ai.risk_score,
            identified_concerns: ai.identified_concerns,
            contributing_factors: ai.contributing_factors,
            recommendations: ai.recommendations,
          }
        : null,
    }
  })

  return { data: caseReports, error: null }
}

export async function updateCaseReport(
  reportId: number,
  reportUpdates: {
    incident_description?: string
    reported_drugs?: string[]
    drug_severity_tier?: string
    location_address?: string | null
    status?: string
  },
  aiUpdates: {
    scene_summary?: string | null
    sentiment_tone?: string | null
    urgency_level?: string | null
    emotional_indicators?: string[] | null
    risk_level?: string | null
    risk_score?: number | null
    identified_concerns?: string[] | null
    contributing_factors?: string[] | null
    recommendations?: string[] | null
  }
): Promise<{ success: boolean; error: string | null }> {
  // 1. Guard against non-staff
  try {
    await requireCounselorOrAdmin()
  } catch (err) {
    return { success: false, error: 'Unauthorized' }
  }

  const adminClient = createAdminClient()

  // 2. Update reports table
  const { error: reportError } = await adminClient
    .from('reports')
    .update(reportUpdates)
    .eq('id', reportId)

  if (reportError) {
    return { success: false, error: `Failed to update report: ${reportError.message}` }
  }

  // 3. Update ai_responses table (or upsert if it doesn't exist)
  const { data: existingAi, error: fetchAiError } = await adminClient
    .from('ai_responses')
    .select('id')
    .eq('report_id', reportId)
    .maybeSingle()

  if (existingAi) {
    const { error: aiError } = await adminClient
      .from('ai_responses')
      .update(aiUpdates)
      .eq('report_id', reportId)

    if (aiError) {
      return { success: false, error: `Failed to update AI response: ${aiError.message}` }
    }
  } else {
    // Get max ID
    const { data: maxResponses } = await adminClient
      .from('ai_responses')
      .select('id')
      .order('id', { ascending: false })
      .limit(1)
    const nextResponseId = maxResponses && maxResponses.length > 0 ? Number(maxResponses[0].id) + 1 : 1

    const { error: aiError } = await adminClient
      .from('ai_responses')
      .insert({
        id: nextResponseId,
        report_id: reportId,
        ...aiUpdates,
      })

    if (aiError) {
      return { success: false, error: `Failed to insert AI response: ${aiError.message}` }
    }
  }

  return { success: true, error: null }
}

