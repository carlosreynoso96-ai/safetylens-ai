'use client'

import Link from 'next/link'
import { Audit } from '@/types/audit'
import { formatDate } from '@/lib/utils/format'
import { Camera, Headphones, ChevronRight } from 'lucide-react'

interface RecentAuditsProps {
  audits: Audit[]
}

export function RecentAudits({ audits }: RecentAuditsProps) {
  if (audits.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Camera className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No audits yet</h3>
        <p className="text-sm text-gray-500 mb-4">
          Start your first safety audit by analyzing photos or using the AI Coach.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/analyze"
            className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Analyze Photos
          </Link>
          <Link
            href="/coach"
            className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Start Coach Walk
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Recent Audits</h3>
        <Link
          href="/audits"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          View All
        </Link>
      </div>
      <div className="divide-y divide-gray-100">
        {audits.map((audit) => (
          <Link
            key={audit.id}
            href={`/audits/${audit.id}`}
            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                  audit.audit_type === 'coach'
                    ? 'bg-purple-50 text-purple-600'
                    : 'bg-orange-50 text-orange-600'
                }`}
              >
                {audit.audit_type === 'coach' ? (
                  <Headphones className="w-4 h-4" />
                ) : (
                  <Camera className="w-4 h-4" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {audit.audit_type === 'coach' ? 'Coach Walk' : 'Photo Analysis'}
                  {audit.inspector_name && ` — ${audit.inspector_name}`}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(audit.audit_date)} · {audit.total_observations}{' '}
                  observations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
    </div>
  )
}
