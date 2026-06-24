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
import { useLanguage } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { RiskGauge } from '@/components/RiskGauge'

const RISK_CONFIG: Record<string, { color: string; bg: string; ring: string }> = {
  CRITICAL: { color: 'text-[var(--sg-coral)]', bg: 'bg-[var(--sg-coral-dim)]', ring: 'ring-[var(--sg-coral)]/20' },
  HIGH: { color: 'text-[var(--sg-orange)]', bg: 'bg-[var(--sg-orange)]/10', ring: 'ring-[var(--sg-orange)]/20' },
  MEDIUM: { color: 'text-[var(--sg-amber)]', bg: 'bg-[var(--sg-amber-dim)]', ring: 'ring-[var(--sg-amber)]/20' },
  LOW: { color: 'text-[var(--sg-lagoon)]', bg: 'bg-[var(--sg-lagoon-dim)]', ring: 'ring-[var(--sg-lagoon)]/20' },
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
  const { t, lang } = useLanguage()

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
    const locale = lang === 'kr' ? 'en-GB' : lang
    return d.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-[var(--sg-slate)] text-[var(--sg-mist)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--sg-line)] bg-[var(--sg-slate)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sg-lagoon-dim)] ring-1 ring-[var(--sg-lagoon)]/30">
              <Users className="h-4.5 w-4.5 text-[var(--sg-lagoon)]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                {t('review.title')}
              </h1>
              <p className="text-xs text-[var(--sg-mist-dim)]">{t('review.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-[var(--sg-mist-dim)]">{userEmail}</span>
            <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-[var(--sg-lagoon-dim)] text-[var(--sg-lagoon)] ring-1 ring-[var(--sg-lagoon)]/20">
              {role === 'primary_admin' ? t('nav.admin') : t('nav.counselor')}
            </span>
            {role === 'primary_admin' && (
              <a
                href="/admin"
                id="counselor-to-admin-btn"
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 hover:text-indigo-350 transition-colors px-3 py-1.5 rounded-lg border border-indigo-500/20 hover:border-indigo-500/40 bg-indigo-500/5 hover:bg-indigo-500/10"
              >
                <Shield className="h-3.5 w-3.5" />
                {t('nav.adminDashboard')}
              </a>
            )}
            <LanguageSwitcher />
            <form action={signOut}>
              <button
                type="submit"
                className="flex items-center gap-1.5 text-xs text-[var(--sg-mist-dim)] hover:text-[var(--sg-coral)] transition-colors px-2 py-1 rounded-lg hover:bg-[var(--sg-coral-dim)]"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t('nav.signOut')}
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-4">
            <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('review.totalCases')}</p>
            <p className="text-2xl font-bold text-zinc-100 mt-1 sg-mono">{cases.length}</p>
          </div>
          <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-4">
            <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('review.critical')}</p>
            <p className="text-2xl font-bold text-[var(--sg-coral)] mt-1 sg-mono">
              {cases.filter((c) => c.ai_response?.risk_level === 'CRITICAL').length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-4">
            <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('review.highRisk')}</p>
            <p className="text-2xl font-bold text-[var(--sg-orange)] mt-1 sg-mono">
              {cases.filter((c) => c.ai_response?.risk_level === 'HIGH').length}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-4">
            <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('review.pendingReview')}</p>
            <p className="text-2xl font-bold text-[var(--sg-amber)] mt-1 sg-mono">
              {cases.filter((c) => c.status === 'PENDING_REVIEW').length}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--sg-mist-dim)]" />
          <input
            id="case-search"
            type="text"
            placeholder={t('review.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-[var(--sg-line-strong)] bg-[var(--sg-surface)] pl-11 pr-4 text-sm text-zinc-100 placeholder-[var(--sg-mist-dim)] outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] transition-all"
          />
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-[var(--sg-coral)]/20 bg-[var(--sg-coral-dim)] px-4 py-3 flex items-start gap-3">
            <AlertTriangle className="h-4 w-4 text-[var(--sg-coral)] mt-0.5 shrink-0" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {filteredCases.length === 0 && !error && (
          <div className="text-center py-20">
            <FileText className="h-10 w-10 text-[var(--sg-mist-dim)] mx-auto mb-3" />
            <p className="text-sm text-[var(--sg-mist-dim)]">{t('review.noCases')}</p>
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
                className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] overflow-hidden transition-all"
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
                        <span className="text-[10px] text-[var(--sg-mist-dim)] flex items-center gap-1 sg-mono">
                          <Clock className="h-3 w-3" />
                          {formatDate(c.created_at)}
                        </span>
                        {c.location_address && (
                          <span className="text-[10px] text-[var(--sg-mist-dim)] flex items-center gap-1 truncate max-w-[200px]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {c.location_address}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {c.ai_response?.risk_score != null && (
                      <span className="text-sm font-bold text-zinc-300 sg-mono">
                        {c.ai_response.risk_score}<span className="text-[var(--sg-mist-dim)] text-xs">/100</span>
                      </span>
                    )}
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-[var(--sg-mist-dim)]" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-[var(--sg-mist-dim)]" />
                    )}
                  </div>
                </button>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-[var(--sg-line)] p-5 space-y-5">
                    {/* Full description */}
                    <div>
                      <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-2">{t('review.incidentDescription')}</p>
                      <p className="text-sm text-zinc-350 leading-6">{c.incident_description}</p>
                    </div>

                    {/* Metadata row */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-3">
                        <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-1">{t('review.reportedDrugs')}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {c.reported_drugs.length > 0 ? c.reported_drugs.map((d, i) => (
                            <span key={i} className="inline-flex items-center gap-1 text-xs bg-[var(--sg-surface-raised)] text-zinc-300 px-2 py-0.5 rounded-md ring-1 ring-[var(--sg-line)]">
                              <Pill className="h-3 w-3 text-[var(--sg-mist-dim)]" />
                              {d}
                            </span>
                          )) : (
                            <span className="text-xs text-[var(--sg-mist-dim)]">{t('review.noneReported')}</span>
                          )}
                        </div>
                      </div>
                      <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-3">
                        <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-1">{t('review.severityTier')}</p>
                        <p className="text-sm text-zinc-300 font-medium">{c.drug_severity_tier}</p>
                      </div>
                      <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-3">
                        <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-1">{t('review.locationLabel')}</p>
                        <p className="text-sm text-zinc-300">{c.location_address || t('review.notProvided')}</p>
                        {c.location_lat != null && c.location_lng != null && (
                          <p className="text-[10px] text-[var(--sg-mist-dim)] mt-0.5 sg-mono">{c.location_lat.toFixed(5)}, {c.location_lng.toFixed(5)}</p>
                        )}
                      </div>
                    </div>

                    {/* AI Insights */}
                    {c.ai_response && (
                      <>
                        <div className="border-t border-[var(--sg-line)] pt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-4 w-4 text-[var(--sg-lagoon)]" />
                            <p className="text-xs text-[var(--sg-lagoon)] font-semibold uppercase tracking-wider">{t('review.aiAnalysis')}</p>
                          </div>

                          {/* Scene summary */}
                          {c.ai_response.scene_summary && (
                            <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-4 mb-4">
                              <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-1.5">{t('review.sceneSummary')}</p>
                              <p className="text-sm text-zinc-300 leading-6">{c.ai_response.scene_summary}</p>
                            </div>
                          )}

                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Sentiment */}
                            <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-4">
                              <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-2">{t('review.sentimentLabel')}</p>
                              <p className="text-sm text-zinc-300">
                                <span className="text-[var(--sg-mist-dim)]">{t('home.tone')}:</span> {c.ai_response.sentiment_tone || 'N/A'}
                              </p>
                              <p className="text-sm text-zinc-300 mt-1">
                                <span className="text-[var(--sg-mist-dim)]">{t('home.urgency')}:</span>{' '}
                                <span className="capitalize">{c.ai_response.urgency_level || 'N/A'}</span>
                              </p>
                            </div>

                            {/* Risk Gauge component instead of raw text */}
                            <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-4 flex flex-col items-center justify-center">
                              <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-4 w-full text-left">{t('review.riskAssessment')}</p>
                              <RiskGauge
                                score={c.ai_response.risk_score ?? 0}
                                level={c.ai_response.risk_level as any || 'LOW'}
                                size={140}
                              />
                            </div>
                          </div>

                          {/* Lists */}
                          <div className="grid gap-4 sm:grid-cols-2 mt-4">
                            {c.ai_response.identified_concerns && c.ai_response.identified_concerns.length > 0 && (
                              <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-4">
                                <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-2">{t('review.identifiedConcerns')}</p>
                                <ul className="list-disc pl-4 text-xs text-zinc-300 space-y-1">
                                  {c.ai_response.identified_concerns.map((x, i) => (
                                    <li key={i}>{x}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {c.ai_response.contributing_factors && c.ai_response.contributing_factors.length > 0 && (
                              <div className="rounded-lg border border-[var(--sg-line)] bg-[var(--sg-slate)]/40 p-4">
                                <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold mb-2">{t('review.contributingFactors')}</p>
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
                            <div className="mt-4 rounded-lg border border-[var(--sg-coral)]/10 bg-[var(--sg-coral-dim)]/20 p-4">
                              <p className="text-[10px] text-[var(--sg-coral)] uppercase tracking-widest font-semibold mb-2">{t('review.recommendations')}</p>
                              <ul className="list-disc pl-4 text-xs text-zinc-350 space-y-1.5">
                                {c.ai_response.recommendations.map((r, i) => (
                                  <li key={i} className="leading-5">{r}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          <div className="mt-5 pt-4 border-t border-[var(--sg-line)] flex justify-end">
                            <a
                              href={`/review/${c.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--sg-lagoon)] hover:text-opacity-80 transition-colors px-3 py-1.5 rounded-lg border border-[var(--sg-lagoon)]/20 hover:border-[var(--sg-lagoon)]/40 bg-[var(--sg-lagoon-dim)]"
                            >
                              <FileText className="h-3.5 w-3.5" />
                              {t('review.reviewCase')}
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
