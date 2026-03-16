'use client'

import { useAuth } from '@/hooks/useAuth'
import { User } from 'lucide-react'

export function DashboardHeader() {
  const { user, profile } = useAuth()
  const userName = profile?.full_name || user?.email || ''

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {getGreeting()}, {userName?.split(' ')[0] || 'there'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  )
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
