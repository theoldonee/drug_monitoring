'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { login } from './actions'
import { Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react'

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-600/5 blur-[80px]" />
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

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Top accent bar */}
        <div className="mx-auto mb-0 h-1 w-24 rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-900/80 shadow-2xl shadow-black/40 backdrop-blur-xl">
          {/* Header */}
          <div className="px-8 pb-2 pt-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-1 ring-indigo-500/30">
              <Shield className="h-7 w-7 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              Admin Portal
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Drug Monitoring System — Authorized personnel only
            </p>
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
                placeholder="admin@example.com"
                autoComplete="email"
                disabled={loading}
                className="h-11 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
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
                  className="h-11 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-4 pr-11 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
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
              className="relative mt-2 flex h-11 w-full items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Sign In'
              )}
            </button>

            {/* Footer note */}
            <p className="pt-2 text-center text-xs text-zinc-500">
              Access restricted to authorized administrators.
              <br />
              Contact the master admin if you need an account.
            </p>
          </div>
        </div>

        {/* Bottom subtle text */}
        <p className="mt-6 text-center text-xs text-zinc-600">
          Drug Monitoring System &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
