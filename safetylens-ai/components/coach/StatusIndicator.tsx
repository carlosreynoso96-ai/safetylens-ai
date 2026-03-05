'use client'

import { Mic, Volume2, Circle } from 'lucide-react'

type Status = 'ready' | 'listening' | 'speaking' | 'processing'

interface StatusIndicatorProps {
  status: Status
}

const statusConfig: Record<Status, { label: string; color: string; icon: typeof Mic }> = {
  ready: { label: 'Ready', color: 'bg-green-100 text-green-700', icon: Circle },
  listening: { label: 'Listening...', color: 'bg-red-100 text-red-700', icon: Mic },
  speaking: { label: 'Speaking...', color: 'bg-blue-100 text-blue-700', icon: Volume2 },
  processing: { label: 'Thinking...', color: 'bg-yellow-100 text-yellow-700', icon: Circle },
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.color}`}
    >
      <Icon className={`w-3 h-3 ${status === 'listening' ? 'animate-pulse' : ''}`} />
      {config.label}
    </span>
  )
}
