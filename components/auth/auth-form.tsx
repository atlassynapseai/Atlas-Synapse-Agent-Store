'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { AtlasLogo } from '@/components/brand/atlas-logo'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type AuthMode = 'login' | 'signup'

export function AuthForm({
  mode,
  nextPath = '/',
}: {
  mode: AuthMode
  nextPath?: string
}) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const isLogin = mode === 'login'
  const configured = isSupabaseConfigured()
  const loginHref = nextPath ? `/agents/auth?next=${encodeURIComponent(nextPath)}` : '/agents/auth'
  const signupHref = nextPath
    ? `/agents/auth?mode=signup&next=${encodeURIComponent(nextPath)}`
    : '/agents/auth?mode=signup'

  async function handleOAuth(provider: 'google' | 'github') {
    setError(null)
    setMessage(null)

    if (!configured) {
      setError('Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local or Vercel.')
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError('Supabase auth is unavailable.')
      return
    }

    setSubmitting(true)

    const redirectBase = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${redirectBase}/agents/auth/callback?next=${encodeURIComponent(nextPath)}`,
      },
    })

    if (error) {
      setError(error.message)
      setSubmitting(false)
    }
  }

  async function handlePasswordReset() {
    setError(null)
    setMessage(null)

    if (!email.trim()) {
      setError('Enter your email first to receive a reset link.')
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError('Supabase auth is unavailable.')
      return
    }

    setSubmitting(true)

    const redirectBase = typeof window !== 'undefined' ? window.location.origin : ''
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${redirectBase}/agents/auth?next=${encodeURIComponent(nextPath)}`,
    })

    if (error) {
      setError(error.message)
    } else {
      setMessage('Password reset link sent. Check your inbox.')
    }

    setSubmitting(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)

    if (!configured) {
      setError('Supabase auth is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local or Vercel.')
      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Email and password are required.')
      return
    }

    const supabase = createClient()
    if (!supabase) {
      setError('Supabase auth is unavailable.')
      return
    }

    setSubmitting(true)

    const result = isLogin
      ? await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })
      : await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo:
            typeof window !== 'undefined'
              ? `${window.location.origin}/agents/auth/callback?next=${encodeURIComponent(nextPath)}`
              : undefined,
        },
      })

    if (result.error) {
      setError(result.error.message)
      setSubmitting(false)
      return
    }

    if (!isLogin && !result.data.session) {
      setMessage('Account created. Check your inbox to confirm your email, then log in.')
      setSubmitting(false)
      return
    }

    router.replace(nextPath)
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#08122d_0%,_#030816_45%,_#01040e_100%)] text-white">
      <header className="border-b border-cyan-500/10 bg-[#020817]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <AtlasLogo href="/agents" className="rounded-full border border-cyan-400/30 bg-[#06112a] px-4 py-2 shadow-[0_0_24px_rgba(59,130,246,0.12)]" />

          <div className="flex items-center gap-3">
            <Link
              href={loginHref}
              className="rounded-full border border-slate-700 bg-[#081229] px-5 py-2 text-sm font-medium text-slate-100 transition-colors hover:border-sky-400/40"
            >
              Login
            </Link>
            <Link
              href="/agents"
              className="hidden rounded-full bg-gradient-to-r from-violet-500 to-sky-400 px-5 py-2 text-sm font-semibold text-slate-950 shadow-[0_10px_30px_rgba(56,189,248,0.25)] sm:inline-flex"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-[28px] border border-cyan-500/15 bg-[linear-gradient(180deg,rgba(7,17,40,0.98)_0%,rgba(4,10,24,0.98)_100%)] p-6 shadow-[0_0_60px_rgba(37,99,235,0.18)] sm:p-8">
          <div className="mb-6 flex rounded-2xl border border-slate-700 bg-[#0a1430] p-1">
            <Link
              href={loginHref}
              className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all ${isLogin
                  ? 'bg-gradient-to-r from-violet-500 to-sky-400 text-white shadow-[0_8px_24px_rgba(96,165,250,0.25)]'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Sign In
            </Link>
            <Link
              href={signupHref}
              className={`flex-1 rounded-xl px-4 py-3 text-center text-sm font-semibold transition-all ${!isLogin
                  ? 'bg-gradient-to-r from-violet-500 to-sky-400 text-white shadow-[0_8px_24px_rgba(96,165,250,0.25)]'
                  : 'text-slate-400 hover:text-white'
                }`}
            >
              Create Account
            </Link>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleOAuth('google')}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-[#101b35] px-4 py-3 text-sm font-medium text-slate-100 transition-colors hover:border-sky-400/40 hover:bg-[#122141] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path fill="#EA4335" d="M12 10.2v3.9h5.4c-.24 1.26-.96 2.33-2.04 3.05l3.3 2.56c1.92-1.77 3.03-4.38 3.03-7.49 0-.72-.06-1.41-.19-2.07H12z" />
                <path fill="#34A853" d="M12 21.5c2.7 0 4.97-.9 6.63-2.44l-3.3-2.56c-.91.61-2.08.97-3.33.97-2.56 0-4.73-1.73-5.5-4.05l-3.42 2.64A10 10 0 0 0 12 21.5z" />
                <path fill="#4A90E2" d="M6.5 13.42A5.98 5.98 0 0 1 6.2 12c0-.49.09-.97.25-1.42L3.03 7.94A10 10 0 0 0 2 12c0 1.62.39 3.15 1.08 4.49l3.42-2.64z" />
                <path fill="#FBBC05" d="M12 6.53c1.47 0 2.8.51 3.84 1.52l2.88-2.88C16.96 3.54 14.7 2.5 12 2.5a10 10 0 0 0-8.97 5.44l3.42 2.64C7.27 8.26 9.44 6.53 12 6.53z" />
              </svg>
              Continue with Google
            </button>
            <button
              type="button"
              onClick={() => handleOAuth('github')}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-700 bg-[#101b35] px-4 py-3 text-sm font-medium text-slate-100 transition-colors hover:border-sky-400/40 hover:bg-[#122141] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current text-white" aria-hidden="true">
                <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.42-4.04-1.42-.55-1.38-1.33-1.74-1.33-1.74-1.09-.74.08-.73.08-.73 1.2.09 1.83 1.24 1.83 1.24 1.08 1.84 2.82 1.31 3.51 1 .11-.78.42-1.31.77-1.61-2.66-.3-5.47-1.33-5.47-5.9 0-1.3.46-2.36 1.22-3.19-.12-.3-.53-1.53.12-3.18 0 0 1-.32 3.3 1.22a11.3 11.3 0 0 1 6 0c2.3-1.54 3.3-1.22 3.3-1.22.65 1.65.24 2.88.12 3.18.76.83 1.22 1.89 1.22 3.19 0 4.58-2.82 5.59-5.5 5.89.43.37.82 1.1.82 2.23v3.3c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z" />
              </svg>
              Continue with GitHub
            </button>
          </div>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs text-slate-500">or continue with email</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email *</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@company.com"
                className="w-full rounded-2xl border border-slate-700 bg-[#101b35] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-slate-200">Password *</label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={handlePasswordReset}
                    className="text-xs font-medium text-cyan-300 hover:text-cyan-200"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <input
                id="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full rounded-2xl border border-slate-700 bg-[#101b35] px-4 py-3 text-sm text-white placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none"
              />
            </div>

            {error && (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-sky-400 px-4 py-3 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (isLogin ? 'Signing in...' : 'Creating account...') : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

        </div>
      </div>
    </div>
  )
}
