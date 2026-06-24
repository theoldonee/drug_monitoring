'use client'

import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { login } from './actions'
import { Shield, Eye, EyeOff, Loader2, AlertCircle, Users, ChevronLeft } from 'lucide-react'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useLanguage } from '@/lib/i18n'

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

  const { t } = useLanguage()
  const searchParams = useSearchParams()
  const callbackError = searchParams.get('error')

  const handleLogin = async () => {
    if (!email || !password) {
      setError(t('login.emailPasswordRequired'))
      return
    }

    setLoading(true)
    setError(null)

    const result = await login(email, password)

    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleLogin()
    }
  }

  const isAdmin = portal === 'admin'

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--sg-slate)]">
      {/* Background gradient effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -left-40 -top-40 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-700 ${isAdmin ? 'bg-indigo-600/10' : 'bg-[var(--sg-lagoon)]/10'}`} />
        <div className={`absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full blur-[120px] transition-colors duration-700 ${isAdmin ? 'bg-violet-600/10' : 'bg-[var(--sg-coral)]/5'}`} />
        <div className={`absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[80px] transition-colors duration-700 ${isAdmin ? 'bg-blue-600/5' : 'bg-[var(--sg-lagoon)]/5'}`} />
      </div>

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Header bar controls */}
      <div className="absolute top-6 left-6 right-6 z-20 flex justify-between items-center">
        <Link
          href="/"
          className="flex items-center gap-1 text-sm text-[var(--sg-mist-dim)] hover:text-[var(--sg-mist)] transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          {t('login.backToReport')}
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md px-4">
        {/* Top accent bar */}
        <div className={`mx-auto mb-0 h-[3px] w-24 rounded-full transition-all duration-700 ${isAdmin ? 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500' : 'bg-[var(--sg-lagoon)]'}`} />

        <div className="overflow-hidden rounded-2xl border border-[var(--sg-line)] bg-[var(--sg-surface)]/80 shadow-2xl shadow-black/40 backdrop-blur-xl mt-4">
          {/* Header */}
          <div className="px-8 pb-2 pt-10 text-center">
            <div className={`mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl ring-1 transition-colors duration-500 ${isAdmin ? 'bg-gradient-to-br from-indigo-500/20 to-violet-500/20 ring-indigo-500/30' : 'bg-[var(--sg-lagoon-dim)] ring-[var(--sg-lagoon)]/30'}`}>
              {isAdmin ? (
                <Shield className="h-7 w-7 text-indigo-400" />
              ) : (
                <Users className="h-7 w-7 text-[var(--sg-lagoon)]" />
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-50">
              {isAdmin ? t('login.adminPortal') : t('login.counselorPortal')}
            </h1>
            <p className="mt-2 text-sm text-[var(--sg-mist)]">
              {t('login.authorizedOnly')}
            </p>
          </div>

          {/* Portal toggle */}
          <div className="mx-8 mt-4 flex rounded-xl bg-[var(--sg-slate)]/60 p-1 border border-[var(--sg-line)]">
            <button
              id="portal-counselor-tab"
              onClick={() => { setPortal('counselor'); setError(null) }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                !isAdmin
                  ? 'bg-[var(--sg-lagoon)] text-[var(--sg-slate)] shadow-lg shadow-[var(--sg-lagoon-glow)]'
                  : 'text-[var(--sg-mist-dim)] hover:text-[var(--sg-mist)]'
              }`}
            >
              {t('login.counselor')}
            </button>
            <button
              id="portal-admin-tab"
              onClick={() => { setPortal('admin'); setError(null) }}
              className={`flex-1 rounded-lg py-2.5 text-sm font-medium transition-all duration-300 ${
                isAdmin
                  ? 'bg-gradient-to-r from-indigo-600/80 to-violet-600/80 text-white shadow-lg shadow-indigo-500/20'
                  : 'text-[var(--sg-mist-dim)] hover:text-[var(--sg-mist)]'
              }`}
            >
              {t('login.administrator')}
            </button>
          </div>

          {/* Body */}
          <div className="space-y-5 px-8 pb-10 pt-6">
            {/* Error display */}
            {(error || callbackError) && (
              <div className="flex items-start gap-3 rounded-lg border border-[var(--sg-coral)]/20 bg-[var(--sg-coral-dim)] px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--sg-coral)]" />
                <p className="text-sm text-red-300">
                  {error ||
                    (callbackError === 'auth_callback_failed'
                      ? t('login.authFailed')
                      : t('login.genericError'))}
                </p>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-2">
              <label
                htmlFor="login-email"
                className="sg-label block"
              >
                {t('login.email')}
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
                className={`h-11 w-full rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 disabled:opacity-50 ${isAdmin ? 'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20' : 'focus:border-[var(--sg-lagoon)] focus:ring-2 focus:ring-[var(--sg-lagoon-glow)]'}`}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="login-password"
                className="sg-label block"
              >
                {t('login.password')}
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
                  className={`h-11 w-full rounded-lg border border-[var(--sg-line-strong)] bg-[var(--sg-slate)]/60 px-4 pr-11 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 disabled:opacity-50 ${isAdmin ? 'focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20' : 'focus:border-[var(--sg-lagoon)] focus:ring-2 focus:ring-[var(--sg-lagoon-glow)]'}`}
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
              className={`relative mt-2 flex h-11 w-full items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 text-white ${
                isAdmin
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 hover:from-indigo-500 hover:to-violet-500 hover:shadow-indigo-500/30'
                  : 'bg-[var(--sg-lagoon)] !text-[var(--sg-slate)] font-bold shadow-lg shadow-[var(--sg-lagoon-glow)] hover:opacity-90'
              }`}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t('login.signInAs', { role: isAdmin ? t('login.administrator') : t('login.counselor') })
              )}
            </button>

            {/* Footer note */}
            <p className="pt-2 text-center text-xs text-[var(--sg-mist-dim)]">
              {t('login.accessRestricted')}
              <br />
              {t('login.contactAdmin')}
            </p>
          </div>
        </div>

        {/* Bottom subtle text */}
        <p className="mt-6 text-center text-xs text-[var(--sg-mist-dim)]">
          SafeGuard MU &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
