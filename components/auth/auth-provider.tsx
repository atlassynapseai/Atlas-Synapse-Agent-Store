'use client'

import type { Session, User } from '@supabase/supabase-js'
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

type AuthContextValue = {
  user: User | null
  session: Session | null
  loading: boolean
  isConfigured: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({
  children,
  initialSession = null,
}: {
  children: React.ReactNode
  initialSession?: Session | null
}) {
  const configured = isSupabaseConfigured()
  const [session, setSession] = useState<Session | null>(initialSession)
  const [loading, setLoading] = useState(configured && !initialSession)

  useEffect(() => {
    if (!configured) {
      return
    }

    const supabase = createClient()
    if (!supabase) {
      return
    }

    let mounted = true

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return
      setSession(data.session)
      setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [configured])

  async function signOut() {
    const supabase = createClient()
    if (!supabase) return

    await supabase.auth.signOut()
    window.location.href = '/agents/auth'
  }

  const value = useMemo(
    () => ({
      user: session?.user ?? null,
      session,
      loading,
      isConfigured: configured,
      signOut,
    }),
    [configured, loading, session]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }

  return context
}
