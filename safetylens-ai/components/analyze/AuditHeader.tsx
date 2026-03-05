'use client'

import clsx from 'clsx'
import { CalendarDays, HardHat, FolderOpen } from 'lucide-react'
import type { Project } from '@/types/audit'

interface AuditHeaderProps {
  projectId: string | null
  projects: Project[]
  inspectorName: string
  auditDate: string
  onProjectChange: (projectId: string | null) => void
  onInspectorNameChange: (name: string) => void
}

function AuditHeader({
  projectId,
  projects,
  inspectorName,
  auditDate,
  onProjectChange,
  onInspectorNameChange,
}: AuditHeaderProps) {
  return (
    <div
      className={clsx(
        'rounded-xl border border-gray-200 bg-white p-4 shadow-sm',
        'dark:border-gray-700 dark:bg-gray-900',
      )}
    >
      <div className="flex flex-wrap items-end gap-4">
        {/* Project Selector */}
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <FolderOpen size={12} />
            Project
          </label>
          <select
            value={projectId || ''}
            onChange={(e) => onProjectChange(e.target.value || null)}
            className={clsx(
              'block w-full appearance-none rounded-lg border border-gray-300 px-3 py-2 pr-8 text-sm',
              'bg-white dark:bg-gray-900 dark:border-gray-600',
              'text-gray-900 dark:text-gray-100',
              'focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30',
            )}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Inspector Name */}
        <div className="min-w-[200px] flex-1">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <HardHat size={12} />
            Inspector
          </label>
          <input
            type="text"
            value={inspectorName}
            onChange={(e) => onInspectorNameChange(e.target.value)}
            placeholder="Inspector name"
            className={clsx(
              'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm',
              'bg-white dark:bg-gray-900 dark:border-gray-600',
              'text-gray-900 dark:text-gray-100',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/30',
            )}
          />
        </div>

        {/* Audit Date */}
        <div className="shrink-0">
          <label className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
            <CalendarDays size={12} />
            Date
          </label>
          <div
            className={clsx(
              'flex items-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm',
              'text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300',
            )}
          >
            {new Date(auditDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export { AuditHeader }
