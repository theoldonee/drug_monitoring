'use client'

import { useState } from 'react'
import { addAdmin } from './actions'
import { UserPlus, Loader2, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react'

export function AddAdminForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleAddAdmin = async () => {
    if (!email || !password) {
      setError('Both email and password are required.')
      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    const result = await addAdmin(email, password)

    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(`Admin account created for ${result.email}`)
      setEmail('')
      setPassword('')
    }

    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      handleAddAdmin()
    }
  }

  return (
    <div className="space-y-4">
      {/* Success message */}
      {success && (
        <div className="flex items-start gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <p className="text-sm text-emerald-300">{success}</p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        {/* Email input */}
        <div className="flex-1">
          <label htmlFor="new-admin-email" className="sr-only">
            Email
          </label>
          <input
            id="new-admin-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="new-admin@example.com"
            disabled={loading}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-4 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          />
        </div>

        {/* Password input */}
        <div className="relative flex-1">
          <label htmlFor="new-admin-password" className="sr-only">
            Password
          </label>
          <input
            id="new-admin-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Temporary password"
            disabled={loading}
            className="h-10 w-full rounded-lg border border-white/[0.08] bg-zinc-800/60 px-4 pr-10 text-sm text-zinc-100 placeholder-zinc-500 outline-none transition-all duration-200 focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-3.5 w-3.5" />
            ) : (
              <Eye className="h-3.5 w-3.5" />
            )}
          </button>
        </div>

        {/* Submit button */}
        <button
          id="add-admin-submit"
          onClick={handleAddAdmin}
          disabled={loading}
          className="flex h-10 shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-5 text-sm font-medium text-white shadow-lg shadow-indigo-500/20 transition-all duration-200 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Add Admin
            </>
          )}
        </button>
      </div>
    </div>
  )
}
