'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project } from '@/types/audit'
import { Headphones } from 'lucide-react'

interface WalkStartScreenProps {
  onStart: (projectId: string | null, inspectorName: string) => void
}

export function WalkStartScreen({ onStart }: WalkStartScreenProps) {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [inspectorName, setInspectorName] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('name')

      if (data) setProjects(data as Project[])

      // Pre-fill inspector name from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single()

      if (profile?.full_name) setInspectorName(profile.full_name)
      setLoading(false)
    }
    fetchProjects()
  }, [])

  function handleStart() {
    onStart(selectedProject || null, inspectorName)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse space-y-4 w-full max-w-md">
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center h-full p-4">
      <div className="w-full max-w-md space-y-6 text-center">
        <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto">
          <Headphones className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Start Safety Walk</h2>
          <p className="text-sm text-gray-500 mt-1">
            Your AI safety coach will guide you through a live jobsite walk.
          </p>
        </div>

        <div className="space-y-4 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project (optional)
            </label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
            >
              <option value="">No project selected</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inspector Name
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              placeholder="Your name"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        <button
          onClick={handleStart}
          className="w-full py-3 bg-orange-500 text-white rounded-xl text-sm font-semibold hover:bg-orange-600 transition-colors shadow-lg shadow-orange-200"
        >
          Begin Safety Walk
        </button>
      </div>
    </div>
  )
}
