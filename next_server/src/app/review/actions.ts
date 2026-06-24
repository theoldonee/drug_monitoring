'use server'

import { createClient } from '@/lib/supabase/server'

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
