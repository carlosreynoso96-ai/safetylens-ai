'use client'

import { ClipboardList } from 'lucide-react'
import type { Observation } from '@/types/audit'
import { ObservationCard } from './ObservationCard'

interface ObservationListProps {
  observations: Observation[]
  onUpdate: (id: string, updates: Partial<Observation>) => void
  onDelete: (id: string) => void
}

function ObservationList({ observations, onUpdate, onDelete }: ObservationListProps) {
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
          <ClipboardList size={20} className="text-[#f97316]" />
          Observations
          {observations.length > 0 && (
            <span className="ml-1 inline-flex items-center rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
              {observations.length}
            </span>
          )}
        </h2>
      </div>

      {/* List or Empty State */}
      {observations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-12 dark:border-gray-700">
          <ClipboardList
            size={40}
            className="mb-3 text-gray-300 dark:text-gray-600"
          />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No observations yet
          </p>
          <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
            Drop photos above to start the AI analysis
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {observations.map((obs, index) => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              index={index}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { ObservationList }
