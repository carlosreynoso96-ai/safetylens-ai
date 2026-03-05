'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { compressImage, fileToBase64 } from '@/lib/utils/compress-image'
import type { Observation, Project, PhotoQueueItem } from '@/types/audit'
import { PhotoDropZone } from '@/components/analyze/PhotoDropZone'
import { PhotoQueue } from '@/components/analyze/PhotoQueue'
import { ObservationList } from '@/components/analyze/ObservationList'
import { ExportBar } from '@/components/analyze/ExportBar'
import { AuditHeader } from '@/components/analyze/AuditHeader'

const DELAY_BETWEEN_CALLS_MS = 1500

export default function AnalyzePage() {
  const { user, profile } = useAuth()
  const supabase = createClient()

  // Audit state
  const [auditId, setAuditId] = useState<string | null>(null)
  const [auditDate] = useState(() => new Date().toISOString().split('T')[0])
  const [projectId, setProjectId] = useState<string | null>(null)
  const [inspectorName, setInspectorName] = useState(profile?.full_name || '')
  const [projects, setProjects] = useState<Project[]>([])

  // Photo queue & observations
  const [queue, setQueue] = useState<PhotoQueueItem[]>([])
  const [observations, setObservations] = useState<Observation[]>([])

  // Processing lock to prevent concurrent processing runs
  const isProcessingRef = useRef(false)
  const pendingQueueRef = useRef<PhotoQueueItem[]>([])

  // Set inspector name once profile loads
  useEffect(() => {
    if (profile?.full_name && !inspectorName) {
      setInspectorName(profile.full_name)
    }
  }, [profile, inspectorName])

  // Fetch user's projects
  useEffect(() => {
    if (!user) return

    async function fetchProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true)
        .order('name')

      if (!error && data) {
        setProjects(data)
      }
    }

    fetchProjects()
  }, [user, supabase])

  // Create audit in Supabase (called once on first photo drop)
  const createAudit = useCallback(async (): Promise<string | null> => {
    if (!user) return null

    const { data, error } = await supabase
      .from('audits')
      .insert({
        user_id: user.id,
        project_id: projectId,
        audit_type: 'analyze',
        inspector_name: inspectorName || null,
        audit_date: auditDate,
        status: 'draft',
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating audit:', error)
      return null
    }

    return data.id
  }, [user, supabase, projectId, inspectorName, auditDate])

  // Process a single photo
  const processPhoto = useCallback(
    async (item: PhotoQueueItem, currentAuditId: string) => {
      // Mark as processing
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'processing' as const } : q)),
      )

      try {
        // Compress the image
        const compressed = await compressImage(item.file)
        const base64 = await fileToBase64(compressed)

        // Determine media type
        const mediaType = compressed.type || 'image/jpeg'

        // Call the API
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image_base64: base64,
            audit_id: currentAuditId,
            media_type: mediaType,
          }),
        })

        if (!res.ok) {
          const errData = await res.json().catch(() => ({ error: 'Analysis failed' }))
          throw new Error(errData.error || `HTTP ${res.status}`)
        }

        const data = await res.json()
        const observation = data.observation as Observation

        // Mark as complete
        setQueue((prev) =>
          prev.map((q) => (q.id === item.id ? { ...q, status: 'complete' as const } : q)),
        )

        // Add to observations
        setObservations((prev) => [...prev, observation])
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? { ...q, status: 'error' as const, error: message }
              : q,
          ),
        )
      }
    },
    [],
  )

  // Process the pending queue sequentially
  const processPendingQueue = useCallback(async () => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      // Ensure we have an audit
      let currentAuditId = auditId
      if (!currentAuditId) {
        currentAuditId = await createAudit()
        if (!currentAuditId) {
          // Mark all pending as error
          setQueue((prev) =>
            prev.map((q) =>
              q.status === 'pending'
                ? { ...q, status: 'error' as const, error: 'Failed to create audit' }
                : q,
            ),
          )
          isProcessingRef.current = false
          return
        }
        setAuditId(currentAuditId)
      }

      // Process each pending item
      while (pendingQueueRef.current.length > 0) {
        const item = pendingQueueRef.current.shift()!
        await processPhoto(item, currentAuditId)

        // Delay between calls to avoid rate limiting
        if (pendingQueueRef.current.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, DELAY_BETWEEN_CALLS_MS))
        }
      }
    } finally {
      isProcessingRef.current = false
    }
  }, [auditId, createAudit, processPhoto])

  // Handle files selected from the drop zone
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newItems: PhotoQueueItem[] = files.map((file) => ({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        file,
        preview: URL.createObjectURL(file),
        status: 'pending' as const,
      }))

      setQueue((prev) => [...prev, ...newItems])
      pendingQueueRef.current.push(...newItems)

      // Kick off processing
      processPendingQueue()
    },
    [processPendingQueue],
  )

  // Handle observation update
  const handleObservationUpdate = useCallback(
    async (id: string, updates: Partial<Observation>) => {
      // Optimistic update
      setObservations((prev) =>
        prev.map((obs) => (obs.id === id ? { ...obs, ...updates } : obs)),
      )

      // Persist to Supabase
      const { error } = await supabase
        .from('observations')
        .update({
          compliance: updates.compliance,
          category: updates.category,
          osha_standard: updates.osha_standard,
          narrative: updates.narrative,
          severity: updates.severity,
          corrective_action: updates.corrective_action,
          compliant_narrative: updates.compliant_narrative,
          compliant_corrective_action: updates.compliant_corrective_action,
          non_compliant_narrative: updates.non_compliant_narrative,
          non_compliant_corrective_action: updates.non_compliant_corrective_action,
          severity_if_compliant: updates.severity_if_compliant,
          severity_if_non_compliant: updates.severity_if_non_compliant,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)

      if (error) {
        console.error('Error updating observation:', error)
        // TODO: revert optimistic update or show toast
      }
    },
    [supabase],
  )

  // Handle observation delete
  const handleObservationDelete = useCallback(
    async (id: string) => {
      // Optimistic delete
      setObservations((prev) => prev.filter((obs) => obs.id !== id))

      // Persist to Supabase
      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting observation:', error)
        // TODO: revert optimistic delete or show toast
      }
    },
    [supabase],
  )

  // Update audit metadata when header fields change
  const handleProjectChange = useCallback(
    async (newProjectId: string | null) => {
      setProjectId(newProjectId)
      if (auditId) {
        await supabase
          .from('audits')
          .update({ project_id: newProjectId, updated_at: new Date().toISOString() })
          .eq('id', auditId)
      }
    },
    [auditId, supabase],
  )

  const handleInspectorNameChange = useCallback(
    async (name: string) => {
      setInspectorName(name)
      if (auditId) {
        await supabase
          .from('audits')
          .update({ inspector_name: name || null, updated_at: new Date().toISOString() })
          .eq('id', auditId)
      }
    },
    [auditId, supabase],
  )

  // Resolve project name for export
  const projectName = projects.find((p) => p.id === projectId)?.name

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Photo Analysis
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload jobsite photos for AI-powered safety observation analysis
        </p>
      </div>

      {/* Audit Header */}
      <AuditHeader
        projectId={projectId}
        projects={projects}
        inspectorName={inspectorName}
        auditDate={auditDate}
        onProjectChange={handleProjectChange}
        onInspectorNameChange={handleInspectorNameChange}
      />

      {/* Photo Drop Zone */}
      <PhotoDropZone onFilesSelected={handleFilesSelected} />

      {/* Processing Queue */}
      <PhotoQueue items={queue} />

      {/* Observations List */}
      <ObservationList
        observations={observations}
        onUpdate={handleObservationUpdate}
        onDelete={handleObservationDelete}
      />

      {/* Export Bar (sticky footer) */}
      <ExportBar
        observations={observations}
        auditDate={auditDate}
        projectName={projectName}
        inspectorName={inspectorName}
      />
    </div>
  )
}
