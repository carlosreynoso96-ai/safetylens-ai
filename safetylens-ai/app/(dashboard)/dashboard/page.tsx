'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Audit } from '@/types/audit'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { RecentAudits } from '@/components/dashboard/RecentAudits'
import { UsageMeter } from '@/components/dashboard/UsageMeter'
import Link from 'next/link'
import { Camera, Headphones, AlertTriangle, RefreshCw } from 'lucide-react'

export default function DashboardPage() {
  const [audits, setAudits] = useState<Audit[]>([])
  const [stats, setStats] = useState({
    totalAudits: 0,
    totalObservations: 0,
    compliantCount: 0,
    criticalCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setError(null)
      setLoading(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch recent audits
      const { data: auditData, error: auditErr } = await supabase
        .from('audits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5)

      if (auditErr) throw auditErr

      if (auditData) {
        setAudits(auditData as Audit[])
      }

      // Calculate stats from all audits
      const { data: allAudits, error: statsErr } = await supabase
        .from('audits')
        .select('total_observations, compliant_count, critical_count')
        .eq('user_id', user.id)

      if (statsErr) throw statsErr

      if (allAudits) {
        setStats({
          totalAudits: allAudits.length,
          totalObservations: allAudits.reduce((sum, a) => sum + a.total_observations, 0),
          compliantCount: allAudits.reduce((sum, a) => sum + a.compliant_count, 0),
          criticalCount: allAudits.reduce((sum, a) => sum + a.critical_count, 0),
        })
      }
    } catch (err) {
      console.error('Dashboard fetch error:', err)
      setError('Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-20" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 h-64" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <div className="bg-white rounded-xl border border-red-200 p-8 max-w-md w-full text-center">
          <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex gap-3">
        <Link
          href="/analyze"
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          <Camera className="w-4 h-4" />
          New Audit Walk
        </Link>
        <Link
          href="/coach"
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          <Headphones className="w-4 h-4" />
          Start Coach Session
        </Link>
      </div>

      {/* Stats */}
      <StatsCards {...stats} />

      {/* Usage + Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentAudits audits={audits} />
        </div>
        <div>
          <UsageMeter />
        </div>
      </div>
    </div>
  )
}
