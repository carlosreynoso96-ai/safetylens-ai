'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import { compressImage, fileToBase64 } from '@/lib/utils/compress-image'
import type { Observation, Project, PhotoQueueItem } from '@/types/audit'
import { useRouter } from 'next/navigation'
import { PhotoDropZone } from '@/components/analyze/PhotoDropZone'
import { PhotoQueue } from '@/components/analyze/PhotoQueue'
import { ObservationList } from '@/components/analyze/ObservationList'
import { ExportBar } from '@/components/analyze/ExportBar'
import { AuditHeader } from '@/components/analyze/AuditHeader'
import { CheckCircle } from 'lucide-react'

const FETCH_TIMEOUT_MS = 90_000 // 90 seconds — generous for AI vision calls
const MAX_RETRIES = 2
const CONCURRENCY = 2 // Keep under rate limit (10 req/60s)

export default function AnalyzePage() {
  const { user, profile } = useAuth()
  const router = useRouter()
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

  // Track blob URLs for cleanup
  const blobUrlsRef = useRef<Set<string>>(new Set())

  // Store base64 image data for PDF export (observationId -> data URL)
  const observationImagesRef = useRef<Record<string, string>>({})

  // Set inspector name once profile loads
  useEffect(() => {
    if (profile?.full_name && !inspectorName) {
      setInspectorName(profile.full_name)
    }
  }, [profile, inspectorName])

  // Clean up all blob URLs on unmount
  useEffect(() => {
    const urls = blobUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

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

  // Create audit via centralized API (handles walk counting & validation server-side)
  const createAudit = useCallback(async (): Promise<string | null> => {
    try {
      const res = await fetch('/api/audits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          project_id: projectId || null,
          audit_type: 'analyze',
          inspector_name: inspectorName || null,
        }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Failed to create audit' }))
        const msg = errData.error || `Failed to create audit (HTTP ${res.status})`
        console.error('Error creating audit:', msg)
        throw new Error(msg)
      }

      const { audit } = await res.json()
      if (!audit?.id) throw new Error('No audit ID returned')
      return audit.id
    } catch (err) {
      console.error('Error creating audit:', err)
      throw err
    }
  }, [projectId, inspectorName])

  // Fetch with timeout using AbortController
  const fetchWithTimeout = useCallback(
    async (url: string, options: RequestInit, timeoutMs: number = FETCH_TIMEOUT_MS): Promise<Response> => {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })
        return response
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          throw new Error('Request timed out. The image may be too complex — please try again.')
        }
        // Handle mobile network errors with a clearer message
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          throw new Error('Network error — check your connection and try again.')
        }
        throw err
      } finally {
        clearTimeout(timeoutId)
      }
    },
    [],
  )

  // Process a single photo (with retry for transient errors)
  const processPhoto = useCallback(
    async (item: PhotoQueueItem, currentAuditId: string) => {
      // Mark as processing
      setQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'processing' as const } : q)),
      )

      let lastError = ''

      for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
          // Compress the image
          const compressed = await compressImage(item.file)
          const base64 = await fileToBase64(compressed)

          // Determine media type
          const mediaType = compressed.type || 'image/jpeg'

          // Call the API with timeout
          const res = await fetchWithTimeout('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image_base64: base64,
              audit_id: currentAuditId,
              media_type: mediaType,
            }),
          })

          if (!res.ok) {
            const errData = await res.json().catch(() => ({ error: 'Analysis failed', retryable: false }))

            // Don't retry non-retryable errors (403 plan limits, 401 auth, 400 bad request)
            if (res.status === 403 || res.status === 401 || res.status === 400) {
              throw new Error(errData.error || `HTTP ${res.status}`)
            }

            // Retry transient errors (429, 500, 502, 503, 504)
            if (attempt < MAX_RETRIES && (errData.retryable || res.status >= 500 || res.status === 429)) {
              lastError = errData.error || `HTTP ${res.status}`
              // Respect Retry-After header for rate limits, otherwise use exponential backoff
              const retryAfter = res.headers.get('Retry-After')
              const delay = retryAfter ? parseInt(retryAfter, 10) * 1000 : (attempt + 1) * 5000
              await new Promise((resolve) => setTimeout(resolve, delay))
              continue
            }

            throw new Error(errData.error || `HTTP ${res.status}`)
          }

          const data = await res.json()
          const observation = data.observation as Observation

          // Store base64 image for PDF export
          observationImagesRef.current[observation.id] = `data:${mediaType};base64,${base64}`

          // Mark as complete and revoke blob URL to free memory
          setQueue((prev) =>
            prev.map((q) => {
              if (q.id === item.id) {
                URL.revokeObjectURL(q.preview)
                blobUrlsRef.current.delete(q.preview)
                return { ...q, status: 'complete' as const }
              }
              return q
            }),
          )

          // Add to observations
          setObservations((prev) => [...prev, observation])
          return // Success — exit retry loop

        } catch (err) {
          lastError = err instanceof Error ? err.message : 'Unknown error'

          // If this was our last attempt, or it's a non-retryable error, fail
          if (attempt >= MAX_RETRIES || lastError.includes('limit') || lastError.includes('Unauthorized') || lastError.includes('expired')) {
            break
          }

          // Wait before retrying
          const delay = (attempt + 1) * 3000
          await new Promise((resolve) => setTimeout(resolve, delay))
        }
      }

      // All attempts failed — revoke blob URL to free memory
      setQueue((prev) =>
        prev.map((q) => {
          if (q.id === item.id) {
            URL.revokeObjectURL(q.preview)
            blobUrlsRef.current.delete(q.preview)
            return { ...q, status: 'error' as const, error: lastError }
          }
          return q
        }),
      )
    },
    [fetchWithTimeout],
  )

  // Process the pending queue with N concurrent workers
  const processPendingQueue = useCallback(async () => {
    if (isProcessingRef.current) return
    isProcessingRef.current = true

    try {
      // Ensure we have an audit
      let currentAuditId = auditId
      if (!currentAuditId) {
        try {
          currentAuditId = await createAudit()
        } catch (auditErr) {
          const errMsg = auditErr instanceof Error ? auditErr.message : 'Failed to create audit'
          setQueue((prev) =>
            prev.map((q) =>
              q.status === 'pending'
                ? { ...q, status: 'error' as const, error: errMsg }
                : q,
            ),
          )
          isProcessingRef.current = false
          return
        }
        if (!currentAuditId) {
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

      // Worker function — each pulls items from the shared queue until empty
      const worker = async () => {
        while (pendingQueueRef.current.length > 0) {
          const item = pendingQueueRef.current.shift()
          if (!item) break
          await processPhoto(item, currentAuditId)
        }
      }

      // Launch N workers concurrently
      const workers = Array.from({ length: CONCURRENCY }, () => worker())
      await Promise.all(workers)
    } finally {
      isProcessingRef.current = false
    }
  }, [auditId, createAudit, processPhoto])

  // Handle files selected from the drop zone
  const handleFilesSelected = useCallback(
    (files: File[]) => {
      const newItems: PhotoQueueItem[] = files.map((file) => {
        const blobUrl = URL.createObjectURL(file)
        blobUrlsRef.current.add(blobUrl)
        return {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          file,
          preview: blobUrl,
          status: 'pending' as const,
        }
      })

      setQueue((prev) => [...prev, ...newItems])
      pendingQueueRef.current.push(...newItems)

      // Kick off processing
      processPendingQueue()
    },
    [processPendingQueue],
  )

  // Handle observation update (with optimistic rollback)
  const handleObservationUpdate = useCallback(
    async (id: string, updates: Partial<Observation>) => {
      // Capture previous state for rollback
      let previousObservation: Observation | undefined

      setObservations((prev) =>
        prev.map((obs) => {
          if (obs.id === id) {
            previousObservation = obs
            return { ...obs, ...updates }
          }
          return obs
        }),
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
        // Revert optimistic update
        if (previousObservation) {
          setObservations((prev) =>
            prev.map((obs) => (obs.id === id ? previousObservation! : obs)),
          )
        }
      }
    },
    [supabase],
  )

  // Handle observation delete (with optimistic rollback)
  const handleObservationDelete = useCallback(
    async (id: string) => {
      // Capture previous state for rollback
      let deletedObservation: Observation | undefined
      let deletedIndex = -1

      setObservations((prev) => {
        deletedIndex = prev.findIndex((obs) => obs.id === id)
        if (deletedIndex !== -1) {
          deletedObservation = prev[deletedIndex]
        }
        return prev.filter((obs) => obs.id !== id)
      })

      // Persist to Supabase
      const { error } = await supabase
        .from('observations')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting observation:', error)
        // Revert optimistic delete — re-insert at original position
        if (deletedObservation) {
          setObservations((prev) => {
            const updated = [...prev]
            updated.splice(deletedIndex, 0, deletedObservation!)
            return updated
          })
        }
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

  // Audit status
  const [auditStatus, setAuditStatus] = useState<'draft' | 'completed'>('draft')

  // Derived: is the queue fully done?
  const isQueueDone = queue.length > 0 && pendingQueueRef.current.length === 0
    && queue.every((q) => q.status === 'complete' || q.status === 'error')
  const hasObservations = observations.length > 0

  // Complete / finalize the audit
  const handleCompleteAudit = useCallback(async () => {
    if (!auditId) return
    const { error } = await supabase
      .from('audits')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', auditId)
    if (!error) {
      setAuditStatus('completed')
    }
  }, [auditId, supabase])

  // Navigate to the saved audit detail page
  const handleViewAudit = useCallback(() => {
    if (auditId) router.push(`/audits/${auditId}`)
  }, [auditId, router])

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
      <PhotoDropZone
        onFilesSelected={handleFilesSelected}
        currentQueueCount={queue.length}
      />

      {/* Processing Queue */}
      <PhotoQueue items={queue} />

      {/* Observations List */}
      <ObservationList
        observations={observations}
        onUpdate={handleObservationUpdate}
        onDelete={handleObservationDelete}
      />

      {/* Complete Audit Banner */}
      {auditId && hasObservations && isQueueDone && auditStatus === 'draft' && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div>
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              All photos processed — {observations.length} observation{observations.length === 1 ? '' : 's'} ready
            </p>
            <p className="mt-0.5 text-xs text-green-600 dark:text-green-400">
              Finalize this audit to mark it as complete, or keep adding photos.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCompleteAudit}
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-700 transition-colors"
          >
            <CheckCircle size={16} />
            Complete Audit
          </button>
        </div>
      )}

      {/* Completed confirmation */}
      {auditStatus === 'completed' && (
        <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-900/20">
          <div className="flex items-center gap-2">
            <CheckCircle size={20} className="text-green-600" />
            <p className="text-sm font-medium text-green-800 dark:text-green-300">
              Audit completed successfully
            </p>
          </div>
          <button
            type="button"
            onClick={handleViewAudit}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600"
          >
            View Audit
          </button>
        </div>
      )}

      {/* Export Bar (sticky footer) */}
      <ExportBar
        observations={observations}
        observationImages={observationImagesRef.current}
        auditDate={auditDate}
        projectName={projectName}
        inspectorName={inspectorName}
      />
    </div>
  )
}
