'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from './actions'
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Users, ChevronLeft } from 'lucide-react'

type PortalType = 'counselor' | 'admin'

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  )
}

function LoginContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [portal, setPortal] = useState<PortalType>('counselor')

  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setLoading(true)
    setError(null)

    const result = await login(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
    // If successful, the server action redirects — no need to handle here
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  const isAdmin = portal === 'admin'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-700 ${isAdmin ? 'bg-indigo-600/10' : 'bg-teal-600/10'}`} />
        <div className={`absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-700 ${isAdmin ? 'bg-violet-600/10' : 'bg-emerald-600/10'}`} />
        <div className={`absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-colors duration-700 ${isAdmin ? 'bg-blue-600/5' : 'bg-cyan-600/5'}`} />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Back to home link */}
      <Link
        href="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" />
        Back to Report
      </Link>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Top accent bar */}
        <div className={`mx-auto mb-0 h-1 w-24 rounded-full bg-gradient-to-r transition-colors duration-700 ${isAdmin ? 'from-indigo-500 via-violet-500 to-purple-500' : 'from-teal-500 via-emerald-500 to-cyan-500'}`} />

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Header */}
          <div className="px-8 pb-2 pt-10 text-center">
            <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-colors duration-500 ${isAdmin ? 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-indigo-500/30' : 'bg-gradient-to-br from-teal-500/20 to-emerald-500/20 ring-teal-500/30'}`}>
              {isAdmin ? (
                <Shield className="h-7 w-7 text-indigo-400" />
              ) : (
                <Users className="h-7 w-7 text-teal-400" />
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              {isAdmin ? 'Administrator Portal' : 'Counselor Portal'}
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              SafeGuard MU — Authorized personnel only
            </p>
          </div>

          {/* Portal toggle */}
          <div className="mx-8 mt-4 flex rounded-xl bg-zinc-800/60 p-1 border border-white/[0.04]">
            <button
              id="portal-counselor-tab"
              onClick={() => { setPortal('counselor'); setError(null) }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                !isAdmin
                  ? 'bg-gradient-to-r from-teal-600/80 to-emerald-600/80 text-white shadow-lg shadow-teal-500/20'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Counselor
            </button>
            <button
              id="portal-admin-tab"
              onClick={() => { setPortal('admin'); setError(null) }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                isAdmin
                  ? 'bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-zinc-400 hover:text-zinc-300'
              }`}
            >
              Administrator
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 px-8 pb-10 pt-6">
            {/* Error display */}
            {(error || callbackError) && (
              <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                <p className="text-sm text-red-300">
                  {error ||
                    (callbackError === 'auth_callback_failed'
                      ? 'Email confirmation failed. Please try again.'
                      : 'An error occurred. Please try again.')}
                </p>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-zinc-300"
              >
                Email
              </label>
              <input
                id="login-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isAdmin ? 'admin@safeguard.mu' : 'counselor@safeguard.mu'}
                autoComplete="email"
                disabled={loading}
                className={`h-11 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 disabled:opacity-50 ${isAdmin ? 'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20' : 'focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20'}`}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="block text-sm font-medium text-zinc-300"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  className={`h-11 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-4 pr-11 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 disabled:opacity-50 ${isAdmin ? 'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20' : 'focus:border-teal-500/50 focus:ring-2 focus:ring-teal-500/20'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login button */}
            <button
              id="login-submit"
              onClick={handleLogin}
              disabled={loading}
              className={`relative mt-2 flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium text-white shadow-lg transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${
                isAdmin
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 shadow-teal-500/20 hover:from-teal-500 hover:to-emerald-500 hover:shadow-teal-500/30'
              }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                `Sign In as ${isAdmin ? 'Administrator' : 'Counselor'}`
              )}
            </button>

            {/* Footer note */}
            <p className="pt-2 text-center text-xs text-zinc-500">
              Access restricted to authorized staff members.
              <br />
              Contact the primary administrator if you need an account.
            </p>
          </div>
        </div>

        {/* Bottom subtle text */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          SafeGuard MU &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
