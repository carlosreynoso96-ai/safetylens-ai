'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Audit } from '@/types/audit'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import { Camera, Headphones, ChevronRight, Search, Filter } from 'lucide-react'

export default function AuditsPage() {
  const { user } = useAuth()
  const supabaseRef = useRef(createClient())
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'analyze' | 'coach'>('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  const fetchAudits = useCallback(async () => {
    if (!user) return
    const supabase = supabaseRef.current

    let query = supabase
      .from('audits')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1)

    if (typeFilter !== 'all') {
      query = query.eq('audit_type', typeFilter)
    }

    const { data, count } = await query

    if (data) {
      setAudits(data as Audit[])
      setTotal(count || 0)
    }
    setLoading(false)
  }, [user, page, typeFilter])

  useEffect(() => {
    fetchAudits()
  }, [fetchAudits])

  const filteredAudits = search
    ? audits.filter(
        (a) =>
          a.inspector_name?.toLowerCase().includes(search.toLowerCase()) ||
          a.audit_type.toLowerCase().includes(search.toLowerCase())
      )
    : audits

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Audit History</h1>
        <Link
          href="/analyze"
          className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          New Audit
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audits..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {(['all', 'analyze', 'coach'] as const).map((type) => (
            <button
              key={type}
              onClick={() => { setTypeFilter(type); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                typeFilter === type
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All' : type === 'analyze' ? 'Photo' : 'Coach'}
            </button>
          ))}
        </div>
      </div>

      {/* Audit List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 h-16 animate-pulse" />
          ))}
        </div>
      ) : filteredAudits.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">No audits found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
          {filteredAudits.map((audit) => (
            <Link
              key={audit.id}
              href={`/audits/${audit.id}`}
              className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    audit.audit_type === 'coach'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-orange-50 text-orange-600'
                  }`}
                >
                  {audit.audit_type === 'coach' ? (
                    <Headphones className="w-5 h-5" />
                  ) : (
                    <Camera className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {audit.audit_type === 'coach' ? 'Coach Walk' : 'Photo Analysis'}
                    {audit.inspector_name && ` — ${audit.inspector_name}`}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(audit.audit_date)} · {audit.total_observations} observations
                    {audit.critical_count > 0 && (
                      <span className="text-red-600 font-medium">
                        {' '}· {audit.critical_count} critical
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                    {audit.compliant_count} POS
                  </span>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full">
                    {audit.non_compliant_count} NEG
                  </span>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    audit.status === 'completed'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {audit.status}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
