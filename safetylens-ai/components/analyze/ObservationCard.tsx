'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import clsx from 'clsx'
import { Pencil, Save, X, Trash2 } from 'lucide-react'
import type { Observation } from '@/types/audit'
import { SEVERITY_COLORS, type SeverityLevel } from '@/lib/constants/severity'
import { ComplianceToggle } from './ComplianceToggle'
import { CategorySelect } from './CategorySelect'

interface ObservationCardProps {
  observation: Observation
  index: number
  onUpdate: (id: string, updates: Partial<Observation>) => void
  onDelete: (id: string) => void
}

function ObservationCard({ observation, index, onUpdate, onDelete }: ObservationCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editState, setEditState] = useState({
    compliance: observation.compliance,
    category: observation.category,
    osha_standard: observation.osha_standard || '',
    compliant_narrative: observation.compliant_narrative || '',
    compliant_corrective_action: observation.compliant_corrective_action || '',
    non_compliant_narrative: observation.non_compliant_narrative || '',
    non_compliant_corrective_action: observation.non_compliant_corrective_action || '',
    severity_if_compliant: observation.severity_if_compliant || 'Low',
    severity_if_non_compliant: observation.severity_if_non_compliant || 'High',
  })

  // Derived display values based on compliance
  const compliance = isEditing ? editState.compliance : observation.compliance
  const narrative =
    compliance === 'compliant'
      ? isEditing
        ? editState.compliant_narrative
        : observation.compliant_narrative
      : isEditing
        ? editState.non_compliant_narrative
        : observation.non_compliant_narrative
  const correctiveAction =
    compliance === 'compliant'
      ? isEditing
        ? editState.compliant_corrective_action
        : observation.compliant_corrective_action
      : isEditing
        ? editState.non_compliant_corrective_action
        : observation.non_compliant_corrective_action
  const severity =
    compliance === 'compliant'
      ? isEditing
        ? editState.severity_if_compliant
        : observation.severity_if_compliant || observation.severity
      : isEditing
        ? editState.severity_if_non_compliant
        : observation.severity_if_non_compliant || observation.severity
  const category = isEditing ? editState.category : observation.category
  const oshaStandard = isEditing ? editState.osha_standard : observation.osha_standard

  const severityClasses = SEVERITY_COLORS[severity as SeverityLevel] || SEVERITY_COLORS.Low

  const handleComplianceToggle = useCallback(
    (newCompliance: 'compliant' | 'non_compliant') => {
      if (isEditing) {
        setEditState((prev) => ({ ...prev, compliance: newCompliance }))
      } else {
        // Direct toggle without edit mode: update and persist
        const updatedNarrative =
          newCompliance === 'compliant'
            ? observation.compliant_narrative
            : observation.non_compliant_narrative
        const updatedCorrective =
          newCompliance === 'compliant'
            ? observation.compliant_corrective_action
            : observation.non_compliant_corrective_action
        const updatedSeverity =
          newCompliance === 'compliant'
            ? observation.severity_if_compliant || 'Low'
            : observation.severity_if_non_compliant || 'High'

        onUpdate(observation.id, {
          compliance: newCompliance,
          narrative: updatedNarrative,
          corrective_action: updatedCorrective,
          severity: updatedSeverity as Observation['severity'],
        })
      }
    },
    [isEditing, observation, onUpdate],
  )

  const handleEdit = useCallback(() => {
    setEditState({
      compliance: observation.compliance,
      category: observation.category,
      osha_standard: observation.osha_standard || '',
      compliant_narrative: observation.compliant_narrative || '',
      compliant_corrective_action: observation.compliant_corrective_action || '',
      non_compliant_narrative: observation.non_compliant_narrative || '',
      non_compliant_corrective_action: observation.non_compliant_corrective_action || '',
      severity_if_compliant: observation.severity_if_compliant || 'Low',
      severity_if_non_compliant: observation.severity_if_non_compliant || 'High',
    })
    setIsEditing(true)
  }, [observation])

  const handleCancel = useCallback(() => {
    setIsEditing(false)
  }, [])

  const handleSave = useCallback(() => {
    const currentCompliance = editState.compliance
    const currentNarrative =
      currentCompliance === 'compliant'
        ? editState.compliant_narrative
        : editState.non_compliant_narrative
    const currentCorrective =
      currentCompliance === 'compliant'
        ? editState.compliant_corrective_action
        : editState.non_compliant_corrective_action
    const currentSeverity =
      currentCompliance === 'compliant'
        ? editState.severity_if_compliant
        : editState.severity_if_non_compliant

    onUpdate(observation.id, {
      compliance: currentCompliance,
      category: editState.category,
      osha_standard: editState.osha_standard || null,
      narrative: currentNarrative,
      corrective_action: currentCorrective,
      severity: currentSeverity as Observation['severity'],
      compliant_narrative: editState.compliant_narrative || null,
      compliant_corrective_action: editState.compliant_corrective_action || null,
      non_compliant_narrative: editState.non_compliant_narrative || null,
      non_compliant_corrective_action: editState.non_compliant_corrective_action || null,
      severity_if_compliant: editState.severity_if_compliant,
      severity_if_non_compliant: editState.severity_if_non_compliant,
    })
    setIsEditing(false)
  }, [editState, observation.id, onUpdate])

  const handleDelete = useCallback(() => {
    onDelete(observation.id)
    setShowDeleteConfirm(false)
  }, [observation.id, onDelete])

  return (
    <div
      className={clsx(
        'rounded-xl border bg-white shadow-sm',
        'dark:bg-gray-900 dark:border-gray-700',
        'transition-shadow duration-200',
        isEditing && 'ring-2 ring-[#f97316]/30 border-[#f97316]',
      )}
    >
      <div className="flex gap-4 p-4">
        {/* Photo Thumbnail */}
        {observation.photo_thumbnail_url && (
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
            <Image
              src={observation.photo_thumbnail_url}
              alt={`Observation ${index + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Header Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Observation Number */}
            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-700 dark:bg-gray-800 dark:text-gray-300">
              {index + 1}
            </span>

            {/* Compliance Toggle */}
            <ComplianceToggle
              value={compliance}
              onChange={handleComplianceToggle}
            />

            {/* Category */}
            {isEditing ? (
              <CategorySelect
                value={editState.category}
                onChange={(val) => setEditState((p) => ({ ...p, category: val }))}
                className="w-56"
              />
            ) : (
              <span className="rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {category}
              </span>
            )}

            {/* Severity Badge */}
            <span
              className={clsx(
                'rounded-full px-2.5 py-0.5 text-xs font-medium',
                severityClasses,
              )}
            >
              {severity}
            </span>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Action Buttons */}
            <div className="flex items-center gap-1">
              {isEditing ? (
                <>
                  <button
                    type="button"
                    onClick={handleSave}
                    className="inline-flex items-center gap-1 rounded-md bg-green-600 px-2.5 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-700"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center gap-1 rounded-md bg-gray-100 px-2.5 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
                    aria-label="Edit observation"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(true)}
                    className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
                    aria-label="Delete observation"
                  >
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* OSHA Standard */}
          {isEditing ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                OSHA Standard
              </label>
              <input
                type="text"
                value={editState.osha_standard}
                onChange={(e) =>
                  setEditState((p) => ({ ...p, osha_standard: e.target.value }))
                }
                className={clsx(
                  'block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm',
                  'bg-white dark:bg-gray-900 dark:border-gray-600',
                  'text-gray-900 dark:text-gray-100',
                  'focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30',
                )}
                placeholder="e.g. 1926.501(b)(1)"
              />
            </div>
          ) : (
            oshaStandard && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                <span className="font-medium">OSHA:</span> {oshaStandard}
                {observation.osha_description && ` - ${observation.osha_description}`}
              </p>
            )
          )}

          {/* Narrative */}
          {isEditing ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Narrative ({editState.compliance === 'compliant' ? 'Compliant' : 'Non-Compliant'})
              </label>
              <textarea
                rows={3}
                value={
                  editState.compliance === 'compliant'
                    ? editState.compliant_narrative
                    : editState.non_compliant_narrative
                }
                onChange={(e) => {
                  const field =
                    editState.compliance === 'compliant'
                      ? 'compliant_narrative'
                      : 'non_compliant_narrative'
                  setEditState((p) => ({ ...p, [field]: e.target.value }))
                }}
                className={clsx(
                  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
                  'bg-white dark:bg-gray-900 dark:border-gray-600',
                  'text-gray-900 dark:text-gray-100',
                  'focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30',
                  'resize-y',
                )}
              />
            </div>
          ) : (
            narrative && (
              <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                {narrative}
              </p>
            )
          )}

          {/* Corrective Action */}
          {isEditing ? (
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500 dark:text-gray-400">
                Corrective Action ({editState.compliance === 'compliant' ? 'Compliant' : 'Non-Compliant'})
              </label>
              <textarea
                rows={2}
                value={
                  editState.compliance === 'compliant'
                    ? editState.compliant_corrective_action
                    : editState.non_compliant_corrective_action
                }
                onChange={(e) => {
                  const field =
                    editState.compliance === 'compliant'
                      ? 'compliant_corrective_action'
                      : 'non_compliant_corrective_action'
                  setEditState((p) => ({ ...p, [field]: e.target.value }))
                }}
                className={clsx(
                  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
                  'bg-white dark:bg-gray-900 dark:border-gray-600',
                  'text-gray-900 dark:text-gray-100',
                  'focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30',
                  'resize-y',
                )}
              />
            </div>
          ) : (
            correctiveAction && (
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="mb-0.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                  Corrective Action
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {correctiveAction}
                </p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-red-50 px-4 py-3 dark:border-gray-700 dark:bg-red-900/10">
          <p className="text-sm text-red-700 dark:text-red-400">
            Delete this observation? This cannot be undone.
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-md px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-700"
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { ObservationCard }
