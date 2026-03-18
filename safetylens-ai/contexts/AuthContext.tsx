'use client'

import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string, company?: string) => Promise<any>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<any>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Stable client ref — single instance for the entire app
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    let mounted = true
    let initialDone = false

    async function fetchProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!mounted) return

      if (data) {
        setProfile(data)
        return
      }

      // Profile row missing (DB trigger may have failed) — ask server to create it
      if (error) {
        console.warn('[AuthProvider] Profile not found, calling /api/profile/ensure')
        try {
          const res = await fetch('/api/profile/ensure', { method: 'POST' })
          if (res.ok) {
            const { profile: created } = await res.json()
            if (mounted && created) {
              setProfile(created)
              return
            }
          }
        } catch (ensureErr) {
          console.error('[AuthProvider] ensure-profile failed:', ensureErr)
        }
        setProfile(null)
      }
    }

    // Safety timeout: if auth check takes > 10s, release loading
    const safetyTimer = setTimeout(() => {
      if (mounted && loading) {
        console.warn('[AuthProvider] Safety timeout — releasing loading state')
        setLoading(false)
      }
    }, 10_000)

    // Use ONLY onAuthStateChange — do NOT call getSession() separately.
    // onAuthStateChange fires INITIAL_SESSION synchronously on setup,
    // which provides the session from cookies without lock contention.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return

      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        // Fetch profile in background, don't block loading state
        fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }

      // On first event (INITIAL_SESSION), set loading to false
      if (!initialDone) {
        initialDone = true
        setLoading(false)
      }
    })

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabaseRef.current.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
    return data
  }, [])

  const signUp = useCallback(
    async (email: string, password: string, fullName: string, company?: string) => {
      const { data, error } = await supabaseRef.current.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            company: company || null,
          },
        },
      })
      if (error) throw error
      return data
    },
    []
  )

  const signOut = useCallback(async () => {
    const { error } = await supabaseRef.current.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } =
      await supabaseRef.current.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })
    if (error) throw error
    return data
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signIn,
        signUp,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
