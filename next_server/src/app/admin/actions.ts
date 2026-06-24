'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ── Analytics Data ──

export interface AnalyticsData {
  totalCases: number
  criticalCases: number
  highRiskCases: number
  avgRiskScore: number
  severityDistribution: { name: string; value: number }[]
  drugTypeDistribution: { name: string; count: number }[]
  reportsOverTime: { date: string; count: number }[]
  recentReports: {
    id: number
    incident_description: string
    risk_level: string | null
    risk_score: number | null
    location_address: string | null
    location_lat: number | null
    location_lng: number | null
    created_at: string
  }[]
  mapPoints: { lat: number; lng: number; address: string; risk_level: string; risk_score: number }[]
}

export async function fetchAnalyticsData(): Promise<{ data: AnalyticsData | null; error: string | null }> {
  const supabase = await createClient()

  const { data: reports, error: reportError } = await supabase
    .from('reports')
    .select('*')
    .order('created_at', { ascending: false })

  if (reportError) {
    return { data: null, error: reportError.message }
  }

  const reportIds = reports.map((r: any) => r.id)

  const { data: aiResponses } = await supabase
    .from('ai_responses')
    .select('*')
    .in('report_id', reportIds)

  const aiMap = new Map<number, any>()
  if (aiResponses) {
    for (const ai of aiResponses) {
      aiMap.set(ai.report_id, ai)
    }
  }

  // Compute analytics
  const totalCases = reports.length
  let criticalCases = 0
  let highRiskCases = 0
  let totalScore = 0
  let scoreCount = 0

  const severityCount: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 }
  const drugCount: Record<string, number> = {}
  const dateCount: Record<string, number> = {}
  const mapPoints: AnalyticsData['mapPoints'] = []

  for (const r of reports) {
    const ai = aiMap.get(r.id)
    const riskLevel = ai?.risk_level || 'LOW'
    const riskScore = ai?.risk_score ?? 0

    if (riskLevel === 'CRITICAL') criticalCases++
    if (riskLevel === 'HIGH') highRiskCases++

    if (ai?.risk_score != null) {
      totalScore += ai.risk_score
      scoreCount++
    }

    if (severityCount[riskLevel] !== undefined) {
      severityCount[riskLevel]++
    }

    // Drug type distribution
    const drugs: string[] = r.reported_drugs || []
    for (const d of drugs) {
      drugCount[d] = (drugCount[d] || 0) + 1
    }

    // Reports over time (by date)
    const dateKey = new Date(r.created_at).toISOString().split('T')[0]
    dateCount[dateKey] = (dateCount[dateKey] || 0) + 1

    // Map points
    if (r.location_lat != null && r.location_lng != null) {
      mapPoints.push({
        lat: r.location_lat,
        lng: r.location_lng,
        address: r.location_address || 'Unknown',
        risk_level: riskLevel,
        risk_score: riskScore,
      })
    }
  }

  const avgRiskScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : 0

  const severityDistribution = Object.entries(severityCount)
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const drugTypeDistribution = Object.entries(drugCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }))

  const reportsOverTime = Object.entries(dateCount)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, count]) => ({ date, count }))

  const recentReports = reports.slice(0, 10).map((r: any) => {
    const ai = aiMap.get(r.id)
    return {
      id: r.id,
      incident_description: r.incident_description,
      risk_level: ai?.risk_level || null,
      risk_score: ai?.risk_score ?? null,
      location_address: r.location_address,
      location_lat: r.location_lat,
      location_lng: r.location_lng,
      created_at: r.created_at,
    }
  })

  return {
    data: {
      totalCases,
      criticalCases,
      highRiskCases,
      avgRiskScore,
      severityDistribution,
      drugTypeDistribution,
      reportsOverTime,
      recentReports,
      mapPoints,
    },
    error: null,
  }
}

// ── Team Management ──

export interface TeamMember {
  id: string
  email: string
  role: string
  created_at: string
}

export async function fetchTeamMembers(): Promise<{ data: TeamMember[]; error: string | null }> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .in('role', ['primary_admin', 'counselor'])
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: error.message }
  }

  return { data: data as TeamMember[], error: null }
}

export async function createStaffUser(
  email: string,
  password: string,
  role: 'primary_admin' | 'counselor'
): Promise<{ error: string | null }> {
  const adminClient = createAdminClient()

  // Create the auth user
  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (authError) {
    return { error: authError.message }
  }

  if (!authData.user) {
    return { error: 'Failed to create user.' }
  }

  // Upsert into profiles
  const { error: profileError } = await adminClient
    .from('profiles')
    .upsert({
      id: authData.user.id,
      email,
      role,
    })

  if (profileError) {
    return { error: profileError.message }
  }

  return { error: null }
}

export async function removeStaffUser(userId: string): Promise<{ error: string | null }> {
  const adminClient = createAdminClient()

  // Delete from auth
  const { error } = await adminClient.auth.admin.deleteUser(userId)

  if (error) {
    return { error: error.message }
  }

  // Profile will be removed by cascade or RLS

  return { error: null }
}
