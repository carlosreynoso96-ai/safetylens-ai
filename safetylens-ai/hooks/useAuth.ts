'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Stable client ref — avoids re-creating on every render
  const supabaseRef = useRef(createClient())

  useEffect(() => {
    const supabase = supabaseRef.current
    let mounted = true

    async function fetchProfile(userId: string) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!mounted) return
      if (error) {
        console.error('Error fetching profile:', error.message)
        setProfile(null)
        return
      }
      setProfile(data)
    }

    async function getInitialSession() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!mounted) return

        const currentUser = session?.user ?? null
        setUser(currentUser)

        if (currentUser) {
          await fetchProfile(currentUser.id)
        }
      } catch (error) {
        console.error('Error getting session:', error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    // Safety timeout: if auth check takes > 10 s, release loading to avoid infinite spinner
    const safetyTimer = setTimeout(() => {
      if (mounted) {
        setLoading(false)
      }
    }, 10_000)

    getInitialSession()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return
      const currentUser = session?.user ?? null
      setUser(currentUser)

      if (currentUser) {
        await fetchProfile(currentUser.id)
      } else {
        setProfile(null)
      }

      setLoading(false)
    })

    return () => {
      mounted = false
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, []) // No external deps — supabaseRef is stable, everything is local

  const signIn = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabaseRef.current.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw error
    }

    return data
  }, [])

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      fullName: string,
      company?: string
    ) => {
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

      if (error) {
        throw error
      }

      return data
    },
    []
  )

  const signOut = useCallback(async () => {
    const { error } = await supabaseRef.current.auth.signOut()

    if (error) {
      throw error
    }

    setUser(null)
    setProfile(null)
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { data, error } =
      await supabaseRef.current.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      })

    if (error) {
      throw error
    }

    return data
  }, [])

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  }
}
