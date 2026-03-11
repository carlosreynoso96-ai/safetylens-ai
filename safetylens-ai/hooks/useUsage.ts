'use client'

import { useCallback, useEffect, useState } from 'react'
import { UserUsage } from '@/types/plan'

export function useUsage() {
  const [usage, setUsage] = useState<UserUsage | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchUsage = useCallback(async () => {
    try {
      setError(null)
      const res = await fetch('/api/usage')
      if (!res.ok) {
        throw new Error('Failed to fetch usage')
      }
      const data = await res.json()
      setUsage(data)
    } catch (err) {
      console.error('Error fetching usage:', err)
      setError('Failed to load usage data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage])

  return { usage, loading, error, refetch: fetchUsage }
}
