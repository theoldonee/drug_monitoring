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

// Dynamically import Leaflet map to avoid SSR
const AdminMap = dynamic(() => import('./AdminMap'), { ssr: false })

type TabType = 'analytics' | 'team'

const PIE_COLORS: Record<string, string> = {
  CRITICAL: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#10b981',
}

const RISK_BADGE: Record<string, { color: string; bg: string }> = {
  CRITICAL: { color: 'text-red-400', bg: 'bg-red-500/10' },
  HIGH: { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  MEDIUM: { color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  LOW: { color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
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
      setFormError('Email and password are required.')
      return
    }
    if (newPassword.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }

    setCreating(true)
    setFormError(null)
    setFormSuccess(null)

    const result = await createStaffUser(newEmail, newPassword, newRole)

    if (result.error) {
      setFormError(result.error)
    } else {
      setFormSuccess(`${newRole === 'primary_admin' ? 'Administrator' : 'Counselor'} account created for ${newEmail}`)
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
    if (!confirm('Are you sure you want to remove this staff member? This action cannot be undone.')) return
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
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric', month: 'short', year: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-zinc-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-indigo-500/30">
              <Shield className="h-4.5 w-4.5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
                Admin Dashboard
              </h1>
              <p className="text-xs text-zinc-500">System Analytics &amp; Team Management</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-xs text-zinc-500">{userEmail}</span>
            <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
              Admin
            </span>
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

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Tab switcher */}
        <div className="flex gap-1 mb-8 p-1 bg-zinc-900/50 border border-white/[0.04] rounded-xl w-fit">
          <button
            id="tab-analytics"
            onClick={() => setTab('analytics')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'analytics'
                ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </button>
          <button
            id="tab-team"
            onClick={() => setTab('team')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === 'team'
                ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-500/20'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.02]'
            }`}
          >
            <Users className="h-4 w-4" />
            Team
          </button>
        </div>

        {/* ── ANALYTICS TAB ── */}
        {tab === 'analytics' && (
          <>
            {analyticsError && (
              <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 flex items-start gap-3">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
                <p className="text-sm text-red-300">{analyticsError}</p>
              </div>
            )}

            {analytics && (
              <div className="space-y-8">
                {/* KPI cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Activity className="h-4 w-4 text-zinc-500" />
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Total Cases</p>
                    </div>
                    <p className="text-3xl font-bold text-zinc-100">{analytics.totalCases}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Critical</p>
                    </div>
                    <p className="text-3xl font-bold text-red-400">{analytics.criticalCases}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">High Risk</p>
                    </div>
                    <p className="text-3xl font-bold text-orange-400">{analytics.highRiskCases}</p>
                  </div>
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <TrendingUp className="h-4 w-4 text-indigo-500" />
                      <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Avg Risk Score</p>
                    </div>
                    <p className="text-3xl font-bold text-zinc-100">
                      {analytics.avgRiskScore}<span className="text-sm text-zinc-500 font-normal">/100</span>
                    </p>
                  </div>
                </div>

                {/* Charts row */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Severity Pie */}
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-6">
                    <h3 className="text-sm font-semibold text-zinc-200 mb-4">Severity Distribution</h3>
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
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#d4d4d8' }}
                          />
                          <Legend
                            iconType="circle"
                            iconSize={8}
                            formatter={(value: string) => <span className="text-xs text-zinc-400">{value}</span>}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-zinc-500 text-center py-10">No data yet</p>
                    )}
                  </div>

                  {/* Drug Type Bar */}
                  <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-6">
                    <h3 className="text-sm font-semibold text-zinc-200 mb-4">Drug Types Reported</h3>
                    {analytics.drugTypeDistribution.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <BarChart data={analytics.drugTypeDistribution} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                          <XAxis type="number" tick={{ fill: '#71717a', fontSize: 11 }} />
                          <YAxis
                            dataKey="name"
                            type="category"
                            width={120}
                            tick={{ fill: '#a1a1aa', fontSize: 10 }}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' }}
                            itemStyle={{ color: '#d4d4d8' }}
                          />
                          <Bar dataKey="count" fill="#6366f1" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-zinc-500 text-center py-10">No data yet</p>
                    )}
                  </div>
                </div>

                {/* Reports over time */}
                <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-6">
                  <h3 className="text-sm font-semibold text-zinc-200 mb-4">Reports Over Time</h3>
                  {analytics.reportsOverTime.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                      <LineChart data={analytics.reportsOverTime}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="date" tick={{ fill: '#71717a', fontSize: 10 }} />
                        <YAxis tick={{ fill: '#71717a', fontSize: 11 }} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', fontSize: '12px' }}
                          itemStyle={{ color: '#d4d4d8' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8b5cf6"
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-sm text-zinc-500 text-center py-10">No data yet</p>
                  )}
                </div>

                {/* Geographic Map */}
                <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <MapPin className="h-4 w-4 text-indigo-400" />
                    <h3 className="text-sm font-semibold text-zinc-200">Incident Map — Mauritius</h3>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-white/[0.06]" style={{ height: 400 }}>
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
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 p-6">
              <h3 className="text-sm font-semibold text-zinc-200 mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4 text-indigo-400" />
                Add Staff Member
              </h3>

              {formError && (
                <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-sm text-red-300 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                  {formError}
                </div>
              )}
              {formSuccess && (
                <div className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
                  ✓ {formSuccess}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-4">
                <div className="sm:col-span-1">
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Email</label>
                  <input
                    id="new-staff-email"
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="user@safeguard.mu"
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Password</label>
                  <input
                    id="new-staff-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 chars"
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs text-zinc-500 mb-1.5 font-medium">Role</label>
                  <select
                    id="new-staff-role"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value as 'counselor' | 'primary_admin')}
                    className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-3 text-sm text-zinc-100 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 appearance-none"
                  >
                    <option value="counselor">Counselor</option>
                    <option value="primary_admin">Administrator</option>
                  </select>
                </div>
                <div className="sm:col-span-1 flex items-end">
                  <button
                    id="create-staff-btn"
                    onClick={handleCreateUser}
                    disabled={creating}
                    className="h-10 w-full rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    Create
                  </button>
                </div>
              </div>
            </div>

            {/* Team list */}
            <div className="rounded-xl border border-white/[0.06] bg-zinc-900/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.04]">
                <h3 className="text-sm font-semibold text-zinc-200">Staff Members ({members.length})</h3>
              </div>

              {teamError && (
                <div className="px-6 py-4">
                  <p className="text-sm text-red-300">{teamError}</p>
                </div>
              )}

              {members.length === 0 && !teamError && (
                <div className="px-6 py-10 text-center">
                  <Users className="h-8 w-8 text-zinc-700 mx-auto mb-2" />
                  <p className="text-sm text-zinc-500">No staff members found.</p>
                </div>
              )}

              {members.length > 0 && (
                <div className="divide-y divide-white/[0.04]">
                  {members.map((m) => (
                    <div key={m.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-white/[0.01] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400 uppercase ring-1 ring-white/[0.04]">
                          {m.email?.[0] || '?'}
                        </div>
                        <div>
                          <p className="text-sm text-zinc-200 font-medium">{m.email}</p>
                          <p className="text-[10px] text-zinc-600">Joined {formatDate(m.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ring-1 ${
                          m.role === 'primary_admin'
                            ? 'text-indigo-400 bg-indigo-500/10 ring-indigo-500/20'
                            : 'text-teal-400 bg-teal-500/10 ring-teal-500/20'
                        }`}>
                          {m.role === 'primary_admin' ? 'Admin' : 'Counselor'}
                        </span>
                        <button
                          onClick={() => handleDeleteUser(m.id)}
                          disabled={deletingId === m.id}
                          className="text-zinc-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-red-500/5 disabled:opacity-50"
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
