'use client'

import { useState } from 'react'
import { signOut } from '@/app/login/actions'
import type { CaseReport } from './actions'
import {
  Shield,
  Users,
  AlertTriangle,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  LogOut,
  FileText,
  Search,
  Pill,
} from 'lucide-react'

const RISK_CONFIG: Record<string, { color: string; bg: string; ring: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10', ring: 'ring-red-500/20' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10', ring: 'ring-orange-500/20' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', ring: 'ring-yellow-500/20' },
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', ring: 'ring-emerald-500/20' },
}

interface Props {
  cases: CaseReport[]
  error: string | null
  userEmail: string
  role: 'counselor' | 'primary_admin'
}

export function ReviewDashboardClient({ cases, error, userEmail, role }: Props) {
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCases = cases.filter((c) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      c.incident_description.toLowerCase().includes(q) ||
      c.location_address?.toLowerCase().includes(q) ||
      c.reported_drugs.some((d) => d.toLowerCase().includes(q)) ||
      c.ai_response?.scene_summary?.toLowerCase().includes(q)
    )
  })

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500/20 to-emerald-500/20 ring-1 ring-teal-500/30">
              <Users className="h-4.5 w-4.5 text-teal-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Case Review
              </h1>
              <p className="text-xs text-zinc-500">Read-only incident browser</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-zinc-500">{userEmail}</span>
            <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-400 ring-1 ring-teal-500/20">
              {role === 'primary_admin' ? 'Admin' : 'Counselor'}
            </span>
            {role === 'primary_admin' && (
              <a
                href="/admin"
                id="counselor-to-admin-btn"
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-350 transition-colors px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10"
              >
                <Shield className="h-3.5 w-3.5" />
                Admin Dashboard
              </a>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total Cases</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1">{cases.length}</p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Critical</p>
            <p className="text-2xl font-bold text-red-400 mt-1">
              {cases.filter((c) => c.ai_response?.risk_level === 'CRITICAL').length}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">High Risk</p>
            <p className="text-2xl font-bold text-orange-400 mt-1">
              {cases.filter((c) => c.ai_response?.risk_level === 'HIGH').length}
            </p>
          </div>
          <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-4">
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Pending Review</p>
            <p className="text-2xl font-bold text-amber-400 mt-1">
              {cases.filter((c) => c.status === 'PENDING_REVIEW').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            id="case-search"
            type="text"
            placeholder="Search cases by description, location, drugs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-white/[0.06] bg-zinc-900/50 pl-11 pr-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-teal-500/30 focus:ring-1 focus:ring-teal-500/20 transition-all"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {filteredCases.length === 0 && !error && (
          <div className="text-center py-20">
            <FileText className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">No cases found.</p>
          </div>
        )}

        {/* Cases list */}
        <div className="space-y-3">
          {filteredCases.map((c) => {
            const isExpanded = expandedId === c.id
            const risk = c.ai_response?.risk_level || 'LOW'
            const riskCfg = RISK_CONFIG[risk] || RISK_CONFIG.LOW

            return (
              <div
                key={c.id}
                className="rounded-xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden transition-all"
              >
                {/* Row header */}
                <button
                  onClick={() => toggleExpand(c.id)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-white/[0.01] transition-colors"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ring-1 ${riskCfg.bg} ${riskCfg.color} ${riskCfg.ring}`}>
                      {risk}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm text-zinc-200 truncate max-w-md font-medium">
                        {c.incident_description.substring(0, 100)}
                        {c.incident_description.length > 100 ? '...' : ''}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] text-zinc-600 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(c.created_at)}
                        </span>
                        {c.location_address && (
                          <span className="text-[10px] text-zinc-600 flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {c.location_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {c.ai_response?.risk_score != null && (
                      <span className="text-sm font-bold text-zinc-300">
                        {c.ai_response.risk_score}<span className="text-zinc-600 text-xs">/100</span>
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-zinc-500" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-zinc-500" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-white/[0.04] p-5 space-y-5">
                    {/* Full description */}
                    <div>
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Incident Description</p>
                      <p className="text-sm text-zinc-300 leading-6">{c.incident_description}</p>
                    </div>

                    {/* Metadata row */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-3">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Reported Drug(s)</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.reported_drugs.length > 0 ? c.reported_drugs.map((d, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded-md ring-1 ring-white/[0.04]">
                              <Pill className="h-3 w-3 text-zinc-500" />
                              {d}
                            </span>
                          )) : (
                            <span className="text-xs text-zinc-600">None reported</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-3">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Severity Tier</p>
                        <p className="text-sm text-zinc-300 font-medium">{c.drug_severity_tier}</p>
                      </div>
                      <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-3">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1">Location</p>
                        <p className="text-sm text-zinc-300">{c.location_address || 'Not provided'}</p>
                        {c.location_lat != null && c.location_lng != null && (
                          <p className="text-[10px] text-zinc-600 mt-0.5">{c.location_lat.toFixed(5)}, {c.location_lng.toFixed(5)}</p>
                        )}
                      </div>
                    </div>

                    {/* AI Insights */}
                    {c.ai_response && (
                      <>
                        <div className="border-t border-white/[0.04] pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-indigo-400" />
                            <p className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">AI Analysis</p>
                          </div>

                          {/* Scene summary */}
                          {c.ai_response.scene_summary && (
                            <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-4 mb-4">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-1.5">Scene Summary</p>
                              <p className="text-sm text-zinc-300 leading-6">{c.ai_response.scene_summary}</p>
                            </div>
                          )}

                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Sentiment */}
                            <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-4">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Sentiment</p>
                              <p className="text-sm text-zinc-300">
                                <span className="text-zinc-500">Tone:</span> {c.ai_response.sentiment_tone || 'N/A'}
                              </p>
                              <p className="text-sm text-zinc-300 mt-1">
                                <span className="text-zinc-500">Urgency:</span>{' '}
                                <span className="capitalize">{c.ai_response.urgency_level || 'N/A'}</span>
                              </p>
                            </div>

                            {/* Score */}
                            <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-4">
                              <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Risk Assessment</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold text-zinc-100">{c.ai_response.risk_score ?? 'N/A'}</span>
                                <span className="text-xs text-zinc-500">/ 100</span>
                              </div>
                              <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ring-1 ${riskCfg.bg} ${riskCfg.color} ${riskCfg.ring}`}>
                                {c.ai_response.risk_level}
                              </span>
                            </div>
                          </div>

                          {/* Lists */}
                          <div className="grid gap-4 sm:grid-cols-2 mt-4">
                            {c.ai_response.identified_concerns && c.ai_response.identified_concerns.length > 0 && (
                              <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-4">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Identified Concerns</p>
                                <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                                  {c.ai_response.identified_concerns.map((x, i) => (
                                    <li key={i}>{x}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {c.ai_response.contributing_factors && c.ai_response.contributing_factors.length > 0 && (
                              <div className="rounded-lg border border-white/[0.04] bg-zinc-950/40 p-4">
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold mb-2">Contributing Factors</p>
                                <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                                  {c.ai_response.contributing_factors.map((x, i) => (
                                    <li key={i}>{x}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Recommendations */}
                          {c.ai_response.recommendations && c.ai_response.recommendations.length > 0 && (
                            <div className="mt-4 rounded-lg border border-red-500/10 bg-red-500/[0.02] p-4">
                              <p className="text-[10px] text-red-400 uppercase tracking-widest font-semibold mb-2">Recommendations</p>
                              <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1.5">
                                {c.ai_response.recommendations.map((r, i) => (
                                  <li key={i} className="leading-5">{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-5 pt-4 border-t border-white/[0.04] flex justify-end">
                            <a
                              href={`/review/${c.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-teal-400 hover:text-teal-300 transition-colors px-3 py-1.5 rounded-lg border border-teal-500/20 hover:border-teal-500/40 bg-teal-500/5 hover:bg-teal-500/10"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              Review &amp; Edit Case
                            </a>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
