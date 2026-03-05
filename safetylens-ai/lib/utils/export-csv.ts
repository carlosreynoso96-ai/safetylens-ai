import { Observation } from '@/types/audit'

export function generateCSV(observations: Observation[], auditDate: string): string {
  const headers = [
    'Item #',
    'Compliance',
    'Category',
    'OSHA Standard',
    'OSHA Description',
    'Narrative',
    'Severity',
    'Corrective Action',
    'Source',
  ]

  const rows = observations.map((obs, index) => {
    const narrative =
      obs.compliance === 'compliant'
        ? obs.compliant_narrative
        : obs.non_compliant_narrative
    const corrective =
      obs.compliance === 'compliant'
        ? obs.compliant_corrective_action
        : obs.non_compliant_corrective_action

    return [
      index + 1,
      obs.compliance === 'compliant' ? 'POS' : 'NEG',
      obs.category,
      obs.osha_standard || '',
      obs.osha_description || '',
      narrative || '',
      obs.severity,
      corrective || '',
      obs.source,
    ]
      .map((field) => `"${String(field).replace(/"/g, '""')}"`)
      .join(',')
  })

  return [headers.join(','), ...rows].join('\n')
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}
