import { Database } from './database'

export type Audit = Database['public']['Tables']['audits']['Row']
export type AuditInsert = Database['public']['Tables']['audits']['Insert']
export type AuditUpdate = Database['public']['Tables']['audits']['Update']

export type Observation = Database['public']['Tables']['observations']['Row']
export type ObservationInsert = Database['public']['Tables']['observations']['Insert']
export type ObservationUpdate = Database['public']['Tables']['observations']['Update']

export type Project = Database['public']['Tables']['projects']['Row']
export type ProjectInsert = Database['public']['Tables']['projects']['Insert']
export type ProjectUpdate = Database['public']['Tables']['projects']['Update']

export interface AnalysisResult {
  best_guess: 'compliant' | 'non_compliant'
  category: string
  osha_standard: string
  osha_description: string
  severity_if_compliant: string
  severity_if_non_compliant: string
  compliant_narrative: string
  compliant_corrective_action: string
  non_compliant_narrative: string
  non_compliant_corrective_action: string
  inspection_items: string[]
}

export interface PhotoQueueItem {
  id: string
  file: File
  preview: string
  status: 'pending' | 'processing' | 'complete' | 'error'
  result?: AnalysisResult
  error?: string
}
