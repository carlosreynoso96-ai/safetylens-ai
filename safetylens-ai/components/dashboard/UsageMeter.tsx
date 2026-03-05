'use client'

import { useUsage } from '@/hooks/useUsage'

export function UsageMeter() {
  const { usage, loading } = useUsage()

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
        <div className="h-2 bg-gray-200 rounded w-full mb-2" />
        <div className="h-3 bg-gray-200 rounded w-1/3" />
      </div>
    )
  }

  if (!usage) return null

  const isUnlimited = usage.walks_limit === -1
  const percentage = isUnlimited
    ? 0
    : Math.min((usage.walks_used / usage.walks_limit) * 100, 100)
  const isNearLimit = !isUnlimited && percentage >= 80

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Walks This Month</span>
        <span className="text-sm text-gray-500">
          {usage.walks_used}{' '}
          {isUnlimited ? '(unlimited)' : `/ ${usage.walks_limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isNearLimit ? 'bg-red-500' : 'bg-orange-500'
            }`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      )}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span>{usage.photos_analyzed} photos analyzed</span>
        {usage.coach_sessions_limit !== 0 && (
          <span>
            {usage.coach_sessions_used}{' '}
            {usage.coach_sessions_limit === -1
              ? 'coach sessions'
              : `/ ${usage.coach_sessions_limit} coach sessions`}
          </span>
        )}
      </div>
    </div>
  )
}
