'use client'

import { CoachObservation } from '@/types/coach'
import { SEVERITY_COLORS } from '@/lib/constants/severity'
import type { SeverityLevel } from '@/lib/constants/severity'
import { CheckCircle, XCircle, ClipboardList } from 'lucide-react'

interface ObservationLogProps {
  observations: CoachObservation[]
}

export function ObservationLog({ observations }: ObservationLogProps) {
  if (observations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-400">
        <ClipboardList className="w-8 h-8 mx-auto mb-2 text-gray-300" />
        <p className="text-xs">
          Observations will appear here as they&apos;re logged during the walk.
        </p>
      </div>
    )
  }

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-700">
          Observations ({observations.length})
        </h4>
      </div>
      {observations.map((obs, index) => (
        <div
          key={index}
          className="bg-white rounded-lg border border-gray-200 p-3 space-y-1.5"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">#{index + 1}</span>
            <span
              className={`flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full ${
                obs.compliance === 'compliant'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {obs.compliance === 'compliant' ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <XCircle className="w-3 h-3" />
              )}
              {obs.compliance === 'compliant' ? 'POS' : 'NEG'}
            </span>
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                SEVERITY_COLORS[obs.severity as SeverityLevel] || 'bg-gray-100 text-gray-700'
              }`}
            >
              {obs.severity}
            </span>
          </div>
          <p className="text-xs font-medium text-gray-900">{obs.category}</p>
          <p className="text-xs text-gray-600">{obs.description}</p>
          {obs.osha_standard && (
            <p className="text-xs text-orange-600">{obs.osha_standard}</p>
          )}
        </div>
      ))}
    </div>
  )
}
