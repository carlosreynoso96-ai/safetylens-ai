'use client'

// Re-export useAuth from the centralized AuthContext.
// All auth state (user, profile, loading) comes from a SINGLE AuthProvider
// instance, avoiding multiple getSession() calls on the Supabase singleton.
export { useAuth } from '@/contexts/AuthContext'
