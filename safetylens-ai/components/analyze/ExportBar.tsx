'use client'

import { useCallback } from 'react'
import clsx from 'clsx'
import { FileSpreadsheet, FileText } from 'lucide-react'
import type { Observation } from '@/types/audit'
import { generateCSV, downloadCSV } from '@/lib/utils/export-csv'
import { generatePDFContent, printPDF } from '@/lib/utils/export-pdf'

interface ExportBarProps {
  observations: Observation[]
  observationImages?: Record<string, string>
  auditDate: string
  projectName?: string
  inspectorName?: string
}

function ExportBar({
  observations,
  observationImages,
  auditDate,
  projectName,
  inspectorName,
}: ExportBarProps) {
  const isDisabled = observations.length === 0

  const handleExportCSV = useCallback(() => {
    if (isDisabled) return

    const csv = generateCSV(observations, auditDate)
    const dateStr = auditDate.replace(/-/g, '')
    const filename = `safetylens-audit-${dateStr}.csv`
    downloadCSV(csv, filename)
  }, [observations, auditDate, isDisabled])

  const handleExportPDF = useCallback(() => {
    if (isDisabled) return

    const html = generatePDFContent(observations, {
      projectName,
      inspectorName,
      auditDate,
      images: observationImages,
    })
    printPDF(html)
  }, [observations, auditDate, projectName, inspectorName, observationImages, isDisabled])

  return (
    <div
      className={clsx(
        'sticky bottom-0 z-30 flex items-center justify-between gap-4 border-t border-gray-200 bg-white/95 px-6 py-3 backdrop-blur-sm',
        'dark:border-gray-700 dark:bg-gray-900/95',
      )}
    >
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {observations.length === 0
          ? 'No observations to export'
          : `${observations.length} observation${observations.length === 1 ? '' : 's'} ready to export`}
      </p>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={isDisabled}
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/50 focus-visible:ring-offset-2',
            isDisabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600',
          )}
        >
          <FileSpreadsheet size={16} />
          Export CSV
        </button>

        <button
          type="button"
          onClick={handleExportPDF}
          disabled={isDisabled}
          className={clsx(
            'inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f97316]/50 focus-visible:ring-offset-2',
            isDisabled
              ? 'cursor-not-allowed bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500'
              : 'bg-[#f97316] text-white hover:bg-[#ea580c] shadow-sm',
          )}
        >
          <FileText size={16} />
          Export PDF
        </button>
      </div>
    </div>
  )
}

export { ExportBar }
