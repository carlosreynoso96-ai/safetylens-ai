'use client'

import Image from 'next/image'
import clsx from 'clsx'
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react'
import type { PhotoQueueItem } from '@/types/audit'

interface PhotoQueueProps {
  items: PhotoQueueItem[]
}

const statusConfig = {
  pending: {
    icon: Clock,
    label: 'Pending',
    iconClass: 'text-gray-400 dark:text-gray-500',
    bgClass: 'bg-gray-50 dark:bg-gray-800/50',
  },
  processing: {
    icon: Loader2,
    label: 'Analyzing...',
    iconClass: 'text-[#f97316] animate-spin',
    bgClass: 'bg-orange-50 dark:bg-orange-900/10',
  },
  complete: {
    icon: CheckCircle,
    label: 'Complete',
    iconClass: 'text-green-500',
    bgClass: 'bg-green-50 dark:bg-green-900/10',
  },
  error: {
    icon: XCircle,
    label: 'Error',
    iconClass: 'text-red-500',
    bgClass: 'bg-red-50 dark:bg-red-900/10',
  },
} as const

function PhotoQueue({ items }: PhotoQueueProps) {
  if (items.length === 0) return null

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Processing Queue ({items.filter((i) => i.status === 'complete').length}/
        {items.length} complete)
      </h3>
      <div className="space-y-2">
        {items.map((item) => {
          const config = statusConfig[item.status]
          const StatusIcon = config.icon

          return (
            <div
              key={item.id}
              className={clsx(
                'flex items-center gap-3 rounded-lg border border-gray-200 p-3',
                'dark:border-gray-700',
                'transition-colors duration-200',
                config.bgClass,
              )}
            >
              {/* Thumbnail */}
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-200 dark:bg-gray-700">
                <Image
                  src={item.preview}
                  alt={item.file.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />
              </div>

              {/* Filename */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">
                  {item.file.name}
                </p>
                {item.status === 'error' && item.error && (
                  <p className="mt-0.5 truncate text-xs text-red-600 dark:text-red-400">
                    {item.error}
                  </p>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex shrink-0 items-center gap-1.5">
                <StatusIcon size={16} className={config.iconClass} />
                <span
                  className={clsx(
                    'text-xs font-medium',
                    item.status === 'complete'
                      ? 'text-green-700 dark:text-green-400'
                      : item.status === 'error'
                        ? 'text-red-700 dark:text-red-400'
                        : item.status === 'processing'
                          ? 'text-orange-700 dark:text-orange-400'
                          : 'text-gray-500 dark:text-gray-400',
                  )}
                >
                  {config.label}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export { PhotoQueue }
