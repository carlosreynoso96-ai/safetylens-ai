'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Bell, User } from 'lucide-react'

export function DashboardHeader() {
  const [userName, setUserName] = useState('')

  useEffect(() => {
    const supabase = createClient()
    async function fetchUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', user.id)
          .single()
        setUserName(profile?.full_name || profile?.email || '')
      }
    }
    fetchUser()
  }, [])

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          {getGreeting()}, {userName?.split(' ')[0] || 'there'}
        </h2>
      </div>
      <div className="flex items-center gap-4">
        <button
          aria-label="Notifications"
          className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Bell className="w-5 h-5" />
        </button>
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
