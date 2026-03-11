'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Audit, Observation } from '@/types/audit'
import { formatDate } from '@/lib/utils/format'
import { generateCSV, downloadCSV } from '@/lib/utils/export-csv'
import { generatePDFContent, printPDF } from '@/lib/utils/export-pdf'
import { SEVERITY_COLORS } from '@/lib/constants/severity'
import type { SeverityLevel } from '@/lib/constants/severity'
import {
  ArrowLeft,
  Download,
  FileText,
  Camera,
  Headphones,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Save,
  X,
} from 'lucide-react'

export default function AuditDetailPage() {
  const params = useParams()
  const router = useRouter()
  const auditId = params.id as string

  const [audit, setAudit] = useState<Audit | null>(null)
  const [observations, setObservations] = useState<Observation[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Observation>>({})

  useEffect(() => {
    fetchAudit()
  }, [auditId])

  async function fetchAudit() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: auditData } = await supabase
      .from('audits')
      .select('*')
      .eq('id', auditId)
      .eq('user_id', user.id)
      .single()

    if (!auditData) {
      router.push('/audits')
      return
    }

    setAudit(auditData as Audit)

    const { data: obsData } = await supabase
      .from('observations')
      .select('*')
      .eq('audit_id', auditId)
      .order('sort_order', { ascending: true })

    if (obsData) {
      setObservations(obsData as Observation[])
    }
    setLoading(false)
  }

  // Recalculate audit aggregate counts from current observations
  async function recalcAuditCounts(updatedObs: Observation[]) {
    if (!audit) return
    const supabase = createClient()
    const counts = {
      total_observations: updatedObs.length,
      compliant_count: updatedObs.filter((o) => o.compliance === 'compliant').length,
      non_compliant_count: updatedObs.filter((o) => o.compliance !== 'compliant').length,
      critical_count: updatedObs.filter((o) => o.severity === 'Critical').length,
      updated_at: new Date().toISOString(),
    }
    await supabase.from('audits').update(counts).eq('id', audit.id)
    setAudit((prev) => prev ? { ...prev, ...counts } as Audit : prev)
  }

  async function handleToggleCompliance(obs: Observation) {
    const supabase = createClient()
    const newCompliance = obs.compliance === 'compliant' ? 'non_compliant' : 'compliant'
    const newNarrative =
      newCompliance === 'compliant' ? obs.compliant_narrative : obs.non_compliant_narrative
    const newCorrective =
      newCompliance === 'compliant'
        ? obs.compliant_corrective_action
        : obs.non_compliant_corrective_action
    const newSeverity =
      newCompliance === 'compliant' ? obs.severity_if_compliant : obs.severity_if_non_compliant

    await supabase
      .from('observations')
      .update({
        compliance: newCompliance,
        narrative: newNarrative,
        corrective_action: newCorrective,
        severity: newSeverity || 'Medium',
        updated_at: new Date().toISOString(),
      })
      .eq('id', obs.id)

    const updatedObs = observations.map((o) =>
      o.id === obs.id
        ? {
            ...o,
            compliance: newCompliance as 'compliant' | 'non_compliant',
            narrative: newNarrative,
            corrective_action: newCorrective,
            severity: (newSeverity || 'Medium') as Observation['severity'],
          }
        : o
    )
    setObservations(updatedObs)
    await recalcAuditCounts(updatedObs)
  }

  async function handleSaveEdit(obsId: string) {
    const supabase = createClient()
    await supabase
      .from('observations')
      .update({ ...editData, updated_at: new Date().toISOString() })
      .eq('id', obsId)

    const updatedObs = observations.map((o) => (o.id === obsId ? { ...o, ...editData } as Observation : o))
    setObservations(updatedObs)
    setEditingId(null)
    setEditData({})
    await recalcAuditCounts(updatedObs)
  }

  async function handleDelete(obsId: string) {
    if (!confirm('Delete this observation?')) return
    const supabase = createClient()
    await supabase.from('observations').delete().eq('id', obsId)
    const updatedObs = observations.filter((o) => o.id !== obsId)
    setObservations(updatedObs)
    await recalcAuditCounts(updatedObs)
  }

  function handleExportCSV() {
    if (!audit) return
    const csv = generateCSV(observations, audit.audit_date)
    downloadCSV(csv, `safetylens-audit-${audit.audit_date}.csv`)
  }

  function handleExportPDF() {
    if (!audit) return
    const html = generatePDFContent(observations, {
      inspectorName: audit.inspector_name || undefined,
      auditDate: audit.audit_date,
    })
    printPDF(html)
  }

  async function handleMarkCompleted() {
    if (!audit) return
    const supabase = createClient()
    const { error } = await supabase
      .from('audits')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', audit.id)
    if (!error) {
      setAudit({ ...audit, status: 'completed' } as Audit)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-64 bg-gray-200 rounded" />
      </div>
    )
  }

  if (!audit) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/audits')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              {audit.audit_type === 'coach' ? (
                <Headphones className="w-5 h-5 text-purple-600" />
              ) : (
                <Camera className="w-5 h-5 text-orange-600" />
              )}
              <h1 className="text-xl font-bold text-gray-900">
                {audit.audit_type === 'coach' ? 'Coach Walk' : 'Photo Analysis'}
              </h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  audit.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {audit.status}
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-0.5">
              {formatDate(audit.audit_date)}
              {audit.inspector_name && ` · ${audit.inspector_name}`}
              {` · ${audit.total_observations} observations`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {audit.status === 'draft' && observations.length > 0 && (
            <button
              onClick={handleMarkCompleted}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              Complete
            </button>
          )}
          <button
            onClick={handleExportCSV}
            disabled={observations.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={handleExportPDF}
            disabled={observations.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-gray-900">{audit.total_observations}</p>
          <p className="text-xs text-gray-500">Total</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{audit.compliant_count}</p>
          <p className="text-xs text-gray-500">Compliant</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-red-600">{audit.non_compliant_count}</p>
          <p className="text-xs text-gray-500">Non-Compliant</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 text-center">
          <p className="text-2xl font-bold text-red-700">{audit.critical_count}</p>
          <p className="text-xs text-gray-500">Critical</p>
        </div>
      </div>

      {/* Observations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Observations</h2>
        {observations.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
            No observations recorded.
          </div>
        ) : (
          observations.map((obs, index) => (
            <div
              key={obs.id}
              className="bg-white rounded-xl border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-sm font-medium text-gray-400 mt-0.5">
                    #{index + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Compliance toggle */}
                      <button
                        onClick={() => handleToggleCompliance(obs)}
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium transition-colors ${
                          obs.compliance === 'compliant'
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                      >
                        {obs.compliance === 'compliant' ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {obs.compliance === 'compliant' ? 'POS' : 'NEG'}
                      </button>

                      <span className="text-sm font-medium text-gray-900">
                        {obs.category}
                      </span>

                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          SEVERITY_COLORS[obs.severity as SeverityLevel] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {obs.severity}
                      </span>
                    </div>

                    {obs.osha_standard && (
                      <p className="text-xs text-orange-600 font-medium">
                        {obs.osha_standard}
                        {obs.osha_description && ` — ${obs.osha_description}`}
                      </p>
                    )}

                    {editingId === obs.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editData.narrative ?? obs.narrative ?? ''}
                          onChange={(e) =>
                            setEditData((d) => ({ ...d, narrative: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows={3}
                          placeholder="Narrative..."
                        />
                        <textarea
                          value={
                            editData.corrective_action ?? obs.corrective_action ?? ''
                          }
                          onChange={(e) =>
                            setEditData((d) => ({
                              ...d,
                              corrective_action: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                          rows={2}
                          placeholder="Corrective action..."
                        />
                      </div>
                    ) : (
                      <>
                        <p className="text-sm text-gray-700">{obs.narrative}</p>
                        {obs.corrective_action && (
                          <p className="text-sm text-gray-500">
                            <span className="font-medium">Corrective Action:</span>{' '}
                            {obs.corrective_action}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {editingId === obs.id ? (
                    <>
                      <button
                        onClick={() => handleSaveEdit(obs.id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null)
                          setEditData({})
                        }}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          setEditingId(obs.id)
                          setEditData({
                            narrative: obs.narrative,
                            corrective_action: obs.corrective_action,
                          })
                        }}
                        className="p-1.5 text-gray-500 hover:bg-gray-100 rounded transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(obs.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
