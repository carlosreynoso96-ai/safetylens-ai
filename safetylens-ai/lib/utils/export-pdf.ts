import { Observation } from '@/types/audit'

export function generatePDFContent(
  observations: Observation[],
  auditInfo: {
    projectName?: string
    inspectorName?: string
    auditDate: string
    images?: Record<string, string>
  }
): string {
  const images = auditInfo.images || {}

  const cards = observations
    .map((obs, index) => {
      const narrative =
        obs.compliance === 'compliant'
          ? obs.compliant_narrative
          : obs.non_compliant_narrative
      const corrective =
        obs.compliance === 'compliant'
          ? obs.compliant_corrective_action
          : obs.non_compliant_corrective_action
      const complianceLabel = obs.compliance === 'compliant' ? 'POS' : 'NEG'
      const complianceBg =
        obs.compliance === 'compliant' ? '#16a34a' : '#dc2626'
      const severityColor =
        obs.severity === 'Critical'
          ? '#dc2626'
          : obs.severity === 'High'
            ? '#ea580c'
            : obs.severity === 'Medium'
              ? '#ca8a04'
              : '#6b7280'
      const imageDataUrl = images[obs.id]

      return `
        <div class="card">
          <div class="card-header">
            <div class="card-header-left">
              <span class="card-num">#${index + 1}</span>
              <span class="badge" style="background:${complianceBg};">${complianceLabel}</span>
              <span class="category">${obs.category}</span>
            </div>
            <div class="card-header-right">
              <span class="osha">${obs.osha_standard || ''}</span>
              <span class="severity" style="color:${severityColor};border-color:${severityColor};">${obs.severity}</span>
            </div>
          </div>
          <div class="card-body">
            ${imageDataUrl ? `<div class="card-image"><img src="${imageDataUrl}" /></div>` : ''}
            <div class="card-text" ${!imageDataUrl ? 'style="width:100%;"' : ''}>
              <p class="narrative">${narrative || ''}</p>
              ${corrective ? `<div class="corrective"><strong>Corrective Action:</strong> ${corrective}</div>` : ''}
              ${obs.osha_description ? `<div class="osha-desc">${obs.osha_description}</div>` : ''}
            </div>
          </div>
        </div>`
    })
    .join('')

  // Summary stats
  const compliantCount = observations.filter((o) => o.compliance === 'compliant').length
  const nonCompliantCount = observations.filter((o) => o.compliance !== 'compliant').length
  const criticalCount = observations.filter((o) => o.severity === 'Critical').length
  const highCount = observations.filter((o) => o.severity === 'High').length

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>SafetyLens AI - Audit Report</title>
      <style>
        @page {
          size: landscape;
          margin: 0.4in 0.5in;
        }

        * { box-sizing: border-box; }

        body {
          font-family: Arial, Helvetica, sans-serif;
          margin: 0;
          padding: 20px;
          color: #1f2937;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        /* Header */
        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 3px solid #f97316;
          padding-bottom: 12px;
          margin-bottom: 16px;
        }
        .report-header h1 {
          color: #f97316;
          margin: 0 0 4px 0;
          font-size: 22px;
        }
        .meta { color: #4b5563; font-size: 13px; line-height: 1.6; }
        .meta strong { color: #1f2937; }

        /* Summary stats bar */
        .stats-bar {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding: 10px 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 13px;
        }
        .stat { display: flex; align-items: center; gap: 6px; }
        .stat-num { font-weight: 700; font-size: 16px; }
        .stat-label { color: #6b7280; }

        /* Observation cards */
        .card {
          border: 1px solid #d1d5db;
          border-radius: 8px;
          margin-bottom: 12px;
          page-break-inside: avoid;
          overflow: hidden;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
          font-size: 13px;
        }
        .card-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .card-header-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .card-num {
          font-weight: 700;
          color: #374151;
        }
        .badge {
          color: white;
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        .category {
          font-weight: 600;
          color: #374151;
        }
        .osha {
          color: #6b7280;
          font-size: 12px;
        }
        .severity {
          font-weight: 700;
          font-size: 12px;
          padding: 2px 8px;
          border: 1.5px solid;
          border-radius: 4px;
        }

        .card-body {
          display: flex;
          gap: 14px;
          padding: 12px;
        }
        .card-image {
          flex-shrink: 0;
          width: 200px;
        }
        .card-image img {
          width: 100%;
          height: auto;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
          display: block;
        }
        .card-text {
          flex: 1;
          min-width: 0;
        }
        .narrative {
          margin: 0 0 8px 0;
          font-size: 12.5px;
          line-height: 1.5;
          color: #374151;
        }
        .corrective {
          font-size: 12px;
          line-height: 1.5;
          color: #1f2937;
          background: #fef3c7;
          padding: 6px 10px;
          border-radius: 4px;
          border-left: 3px solid #f59e0b;
          margin-bottom: 6px;
        }
        .osha-desc {
          font-size: 11px;
          color: #6b7280;
          font-style: italic;
        }

        /* Footer */
        .report-footer {
          text-align: center;
          color: #9ca3af;
          margin-top: 24px;
          padding-top: 12px;
          border-top: 1px solid #e5e7eb;
          font-size: 11px;
        }

        /* Print-specific overrides */
        @media print {
          body { padding: 0; }
          .card { break-inside: avoid; }
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <div>
          <h1>SafetyLens AI &mdash; Audit Report</h1>
          <div class="meta">
            ${auditInfo.projectName ? `<strong>Project:</strong> ${auditInfo.projectName} &nbsp;&bull;&nbsp; ` : ''}
            ${auditInfo.inspectorName ? `<strong>Inspector:</strong> ${auditInfo.inspectorName} &nbsp;&bull;&nbsp; ` : ''}
            <strong>Date:</strong> ${auditInfo.auditDate}
          </div>
        </div>
        <div class="meta" style="text-align:right;">
          <strong>Total Observations:</strong> ${observations.length}
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat">
          <span class="stat-num">${observations.length}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat">
          <span class="stat-num" style="color:#16a34a;">${compliantCount}</span>
          <span class="stat-label">Positive</span>
        </div>
        <div class="stat">
          <span class="stat-num" style="color:#dc2626;">${nonCompliantCount}</span>
          <span class="stat-label">Negative</span>
        </div>
        ${criticalCount > 0 ? `<div class="stat"><span class="stat-num" style="color:#dc2626;">${criticalCount}</span><span class="stat-label">Critical</span></div>` : ''}
        ${highCount > 0 ? `<div class="stat"><span class="stat-num" style="color:#ea580c;">${highCount}</span><span class="stat-label">High</span></div>` : ''}
      </div>

      ${cards}

      <div class="report-footer">
        Generated by SafetyLens AI &mdash; safetylens.ai
      </div>
    </body>
    </html>
  `
}

export function printPDF(html: string) {
  const printWindow = window.open('', '_blank')
  if (!printWindow) return
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  // Small delay to ensure images load before print dialog opens
  setTimeout(() => printWindow.print(), 500)
}
