'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { signOut } from '@/app/login/actions'
import { createStaffUser, removeStaffUser } from './actions'
import type { AnalyticsData, TeamMember } from './actions'
import {
  PieChart, Pie, Cell, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  Shield, LogOut, BarChart3, Users, Plus, Trash2,
  Loader2, AlertTriangle, TrendingUp, Activity,
  AlertCircle, MapPin,
} from 'lucide-react'
import { useLanguage } from '@/lib/i18n'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

// Dynamically import Leaflet map to avoid SSR
const AdminMap = dynamic(() => import('./AdminMap'), { ssr: false })

type TabType = 'analytics' | 'team'

const PIE_COLORS: Record<string, string> = {
  CRITICAL: 'var(--sg-coral)',
  HIGH: 'var(--sg-orange)',
  MEDIUM: 'var(--sg-amber)',
  LOW: 'var(--sg-lagoon)',
}

interface Props {
  analytics: AnalyticsData | null
  analyticsError: string | null
  teamMembers: TeamMember[]
  teamError: string | null
  userEmail: string
}

export function AdminDashboardClient({ analytics, analyticsError, teamMembers: initialMembers, teamError, userEmail }: Props) {
  const [tab, setTab] = useState<TabType>('analytics')
  const [members, setMembers] = useState<TeamMember[]>(initialMembers)
  const { t, lang } = useLanguage()

  // Team form state
  const [newEmail, setNewEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [newRole, setNewRole] = useState<'counselor' | 'primary_admin'>('counselor')
  const [creating, setCreating] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword) {
      setFormError(t('admin.emailRequired'))
      return
    }
    if (newPassword.length < 6) {
      setFormError(t('admin.passwordMin'))
      return
    }

    setCreating(true)
    setFormError(null)
    setFormSuccess(null)

    const result = await createStaffUser(newEmail, newPassword, newRole)

    if (result.error) {
      setFormError(result.error)
    } else {
      setFormSuccess(`${newRole === 'primary_admin' ? t('login.administrator') : t('login.counselor')} account created for ${newEmail}`)
      setNewEmail('')
      setNewPassword('')
      // Add to local list
      setMembers([
        { id: crypto.randomUUID(), email: newEmail, role: newRole, created_at: new Date().toISOString() },
        ...members,
      ])
    }
    setCreating(false)
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm(t('admin.confirmDelete'))) return
    setDeletingId(userId)
    const result = await removeStaffUser(userId)
    if (result.error) {
      setFormError(result.error)
    } else {
      setMembers(members.filter((m) => m.id !== userId))
    }
    setDeletingId(null)
  }

  const formatDate = (dateStr: string) => {
    const locale = lang === 'kr' ? 'en-GB' : lang
    return new Date(dateStr).toLocaleDateString(locale, {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-[var(--sg-slate)] text-[var(--sg-mist)]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--sg-line)] bg-[var(--sg-slate)]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--sg-lagoon-dim)] ring-1 ring-[var(--sg-lagoon)]/30">
              <Shield className="h-4.5 w-4.5 text-[var(--sg-lagoon)]" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                {t('admin.title')}
              </h1>
              <p className="text-xs text-[var(--sg-mist-dim)]">{t('admin.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-[var(--sg-mist-dim)]">{userEmail}</span>
            <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-[var(--sg-lagoon-dim)] text-[var(--sg-lagoon)] ring-1 ring-[var(--sg-lagoon)]/20">
              {t('nav.admin')}
            </span>
            <a
              href="/review"
              id="admin-to-counselor-btn"
              className="flex items-center gap-1.5 text-xs font-semibold text-[var(--sg-lagoon)] hover:text-opacity-80 transition-colors px-3 py-1.5 rounded-lg border border-[var(--sg-lagoon)]/20 hover:border-[var(--sg-lagoon)]/40 bg-[var(--sg-lagoon-dim)]"
            >
              <Users className="h-3.5 w-3.5" />
              {t('nav.caseReview')}
            </a>
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 p-1 bg-[var(--sg-surface)] border border-[var(--sg-line)] rounded-xl w-fit">
          <button
            id="tab-analytics"
            onClick={() => setTab('analytics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'analytics'
                ? 'bg-[var(--sg-lagoon)] text-[var(--sg-slate)] font-bold shadow-lg shadow-[var(--sg-lagoon-glow)]'
                : 'text-[var(--sg-mist-dim)] hover:text-[var(--sg-mist)] hover:bg-white/[0.02]'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            {t('admin.analytics')}
          </button>
          <button
            id="tab-team"
            onClick={() => setTab('team')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'team'
                ? 'bg-[var(--sg-lagoon)] text-[var(--sg-slate)] font-bold shadow-lg shadow-[var(--sg-lagoon-glow)]'
                : 'text-[var(--sg-mist-dim)] hover:text-[var(--sg-mist)] hover:bg-white/[0.02]'
            }`}
          >
            <Users className="h-4 w-4" />
            {t('admin.team')}
          </button>
        </div>

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <>
            {analyticsError && (
              <div className="mb-6 rounded-lg border border-[var(--sg-coral)]/20 bg-[var(--sg-coral-dim)] px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-[var(--sg-coral)] mt-0.5" />
                <p className="text-sm text-red-350">{analyticsError}</p>
              </div>
            )}

            {analytics && (
              <div className="space-y-8">
                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-[var(--sg-mist-dim)]" />
                      <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('admin.totalCases')}</p>
                    </div>
                    <p className="text-3xl font-bold text-zinc-100 sg-mono">{analytics.totalCases}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-[var(--sg-coral)]" />
                      <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('admin.critical')}</p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--sg-coral)] sg-mono">{analytics.criticalCases}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-[var(--sg-orange)]" />
                      <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('admin.highRisk')}</p>
                    </div>
                    <p className="text-3xl font-bold text-[var(--sg-orange)] sg-mono">{analytics.highRiskCases}</p>
                  </div>
                  <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-[var(--sg-lagoon)]" />
                      <p className="text-[10px] text-[var(--sg-mist-dim)] uppercase tracking-widest font-semibold">{t('admin.avgRiskScore')}</p>
                    </div>
                    <p className="text-3xl font-bold text-zinc-100 sg-mono">
                      {analytics.avgRiskScore}<span className="text-sm text-[var(--sg-mist-dim)] font-normal">/100</span>
                    </p>
                  </div>
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Severity Pie */}
                  <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-6">
                    <h3 className="text-sm font-semibold text-zinc-200 mb-4">{t('admin.severityDist')}</h3>
                    {analytics.severityDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={analytics.severityDistribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                            nameKey="name"
                            strokeWidth={0}
                          >
                            {analytics.severityDistribution.map((entry) => (
                              <Cell key={entry.name} fill={PIE_COLORS[entry.name] || '#6b7280'} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--sg-surface)', border: '1px solid var(--sg-line)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#d4d4d8' }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value: string) => <span className="text-xs text-[var(--sg-mist)]">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-[var(--sg-mist-dim)] text-center py-10">{t('admin.noData')}</p>
                    )}
                  </div>

                  {/* Drug Type Bar */}
                  <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-6">
                    <h3 className="text-sm font-semibold text-zinc-200 mb-4">{t('admin.drugTypes')}</h3>
                    {analytics.drugTypeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={analytics.drugTypeDistribution} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--sg-line)" />
                          <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: 'var(--sg-surface)', border: '1px solid var(--sg-line)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#d4d4d8' }}
                          />
                          <Bar dataKey="count" fill="var(--sg-lagoon)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-[var(--sg-mist-dim)] text-center py-10">{t('admin.noData')}</p>
                    )}
                  </div>
                </div>

                {/* Reports over time */}
                <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-6">
                  <h3 className="text-sm font-semibold text-zinc-200 mb-4">{t('admin.reportsOverTime')}</h3>
                  {analytics.reportsOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={analytics.reportsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--sg-line)" />
                        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: 'var(--sg-surface)', border: '1px solid var(--sg-line)', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: '#d4d4d8' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="var(--sg-lagoon)"
                          strokeWidth={2}
                          dot={{ fill: 'var(--sg-lagoon)', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-[var(--sg-mist-dim)] text-center py-10">{t('admin.noData')}</p>
                  )}
                </div>

                {/* Geographic Map */}
                <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-[var(--sg-lagoon)]" />
                    <h3 className="text-sm font-semibold text-zinc-200">{t('admin.incidentMap')}</h3>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-[var(--sg-line)]" style={{ height: 400 }}>
                    <AdminMap points={analytics.mapPoints} />
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* ── TEAM TAB ── */}
        {tab === 'team' && (
          <div className="space-y-8">
            {/* Add staff form */}
            <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] p-6">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-[var(--sg-lagoon)]" />
                {t('admin.addStaff')}
              </h3>

              {formError && (
                <div className="mb-4 rounded-lg border border-[var(--sg-coral)]/20 bg-[var(--sg-coral-dim)] px-4 py-2.5 text-sm text-[var(--sg-coral)] flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-305">
                  ✓ {formSuccess}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs text-[var(--sg-mist-dim)] mb-1.5 font-medium">{t('login.email')}</label>
                  <input
                    id="new-staff-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@safeguard.mu"
                    className="h-10 w-full rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)]"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-[var(--sg-mist-dim)] mb-1.5 font-medium">{t('login.password')}</label>
                  <input
                    id="new-staff-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="h-10 w-full rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)]"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-[var(--sg-mist-dim)] mb-1.5 font-medium">{t('admin.role')}</label>
                  <div className="relative">
                    <select
                      id="new-staff-role"
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as 'counselor' | 'primary_admin')}
                      className="h-10 w-full rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-3 text-sm text-zinc-100 outline-none focus:border-[var(--sg-lagoon)] focus:ring-1 focus:ring-[var(--sg-lagoon-glow)] appearance-none"
                    >
                      <option value="counselor">{t('login.counselor')}</option>
                      <option value="primary_admin">{t('login.administrator')}</option>
                    </select>
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--sg-mist-dim)] pointer-events-none text-xs">▼</span>
                  </div>
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    id="create-staff-btn"
                    onClick={handleCreateUser}
                    disabled={creating}
                    className="h-10 w-full rounded-lg bg-[var(--sg-lagoon)] text-sm font-bold text-[var(--sg-slate)] shadow-lg shadow-[var(--sg-lagoon-glow)] hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {t('admin.create')}
                  </button>
                </div>
              </div>
            </div>

            {/* Team list */}
            <div className="rounded-xl border border-[var(--sg-line)] bg-[var(--sg-surface)] overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--sg-line)]">
                <h3 className="text-sm font-semibold text-zinc-200">{t('admin.staffMembers')} ({members.length})</h3>
              </div>

              {teamError && (
                <div className="px-6 py-4">
                  <p className="text-sm text-[var(--sg-coral)]">{teamError}</p>
                </div>
              )}

              {members.length === 0 && !teamError && (
                <div className="px-6 py-10 text-center">
                  <Users className="h-8 w-8 text-[var(--sg-mist-dim)] mx-auto mb-2" />
                  <p className="text-sm text-[var(--sg-mist-dim)]">{t('admin.noStaff')}</p>
                </div>
              )}

              {members.length > 0 && (
                <div className="divide-y divide-[var(--sg-line)]">
                  {members.map((m) => (
                    <div key={m.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-[var(--sg-slate)] flex items-center justify-center text-xs font-bold text-[var(--sg-mist)] uppercase ring-1 ring-[var(--sg-line)]">
                          {m.email?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm text-zinc-200 font-medium">{m.email}</p>
                          <p className="text-[10px] text-[var(--sg-mist-dim)]">{t('admin.joined')} {formatDate(m.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${
                          m.role === 'primary_admin'
                            ? 'text-indigo-400 bg-indigo-500/10 ring-indigo-500/20'
                            : 'text-[var(--sg-lagoon)] bg-[var(--sg-lagoon-dim)] ring-[var(--sg-lagoon)]/20'
                        }`}>
                          {m.role === 'primary_admin' ? t('nav.admin') : t('nav.counselor')}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(m.id)}
                          disabled={deletingId === m.id}
                          className="text-[var(--sg-mist-dim)] hover:text-[var(--sg-coral)] transition-colors p-1 rounded hover:bg-[var(--sg-coral-dim)] disabled:opacity-50"
                          title="Remove member"
                        >
                          {deletingId === m.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
