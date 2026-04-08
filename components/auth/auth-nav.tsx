'use client'

import Link from 'next/link'
import { useAuth } from '@/components/auth/auth-provider'

export function AuthNav() {
  const { user, loading, isConfigured, signOut } = useAuth()

  if (!isConfigured) {
    return (
      <span className="text-xs text-amber-400/80">
        Auth not configured
      </span>
    )
  }

  if (loading) {
    return <span className="text-xs text-white/40">Loading...</span>
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:block max-w-44 truncate text-xs text-white/45">
          {user.email}
        </span>
        <button
          onClick={signOut}
          className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80 transition-colors hover:border-white/20 hover:bg-white/5"
        >
          Sign out
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/agents/auth"
        className="rounded-lg border border-white/10 px-3 py-2 text-xs text-white/80 transition-colors hover:border-white/20 hover:bg-white/5"
      >
        Log in
      </Link>
      <Link
        href="/agents/auth?mode=signup"
        className="rounded-lg bg-blue-600 px-3 py-2 text-xs text-white transition-colors hover:bg-blue-500"
      >
        Sign up
      </Link>
    </div>
  )
}
