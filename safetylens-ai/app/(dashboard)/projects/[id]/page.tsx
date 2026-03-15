'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { Project, Audit } from '@/types/audit'
import { formatDate } from '@/lib/utils/format'
import Link from 'next/link'
import {
  ArrowLeft,
  Camera,
  Headphones,
  ChevronRight,
  Edit2,
  Save,
  X,
  MapPin,
} from 'lucide-react'

export default function ProjectDetailPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const projectId = params.id as string
  const supabaseRef = useRef(createClient())

  const [project, setProject] = useState<Project | null>(null)
  const [audits, setAudits] = useState<Audit[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({ name: '', location: '', description: '' })

  useEffect(() => {
    if (user) fetchProject()
  }, [projectId, user])

  async function fetchProject() {
    if (!user) return
    const supabase = supabaseRef.current

    const { data: proj } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single()

    if (!proj) {
      router.push('/projects')
      return
    }

    setProject(proj as Project)
    setEditData({
      name: proj.name,
      location: proj.location || '',
      description: proj.description || '',
    })

    const { data: auditData } = await supabase
      .from('audits')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })

    if (auditData) setAudits(auditData as Audit[])
    setLoading(false)
  }

  async function handleSave() {
    const supabase = supabaseRef.current
    await supabase
      .from('projects')
      .update({
        name: editData.name,
        location: editData.location || null,
        description: editData.description || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', projectId)

    setProject((p) =>
      p
        ? {
            ...p,
            name: editData.name,
            location: editData.location || null,
            description: editData.description || null,
          }
        : null
    )
    setEditing(false)
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!project) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push('/projects')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1">
          {editing ? (
            <div className="space-y-2">
              <input
                type="text"
                value={editData.name}
                onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
                className="text-xl font-bold text-gray-900 border border-gray-300 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData((d) => ({ ...d, location: e.target.value }))}
                placeholder="Location"
                className="text-sm text-gray-500 border border-gray-300 rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <Save className="w-3 h-3" /> Save
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-3 h-3" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
                <button
                  onClick={() => setEditing(true)}
                  className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
              {project.location && (
                <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" />
                  {project.location}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{audits.length}</p>
          <p className="text-xs text-gray-500">Audits</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">
            {audits.reduce((s, a) => s + a.total_observations, 0)}
          </p>
          <p className="text-xs text-gray-500">Observations</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-red-600">
            {audits.reduce((s, a) => s + a.critical_count, 0)}
          </p>
          <p className="text-xs text-gray-500">Critical</p>
        </div>
      </div>

      {/* Audits */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Audits</h2>
          <Link
            href="/analyze"
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            New Audit
          </Link>
        </div>
        {audits.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No audits for this project yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
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
                      {formatDate(audit.audit_date)} · {audit.total_observations} observations
                    </p>
                    <p className="text-xs text-gray-500">
                      {audit.compliant_count} POS · {audit.non_compliant_count} NEG
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
