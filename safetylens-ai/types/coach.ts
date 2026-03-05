export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface CoachObservation {
  compliance: 'compliant' | 'non_compliant'
  category: string
  osha_standard: string
  description: string
  severity: 'Low' | 'Medium' | 'High' | 'Critical'
}

export interface CoachResponse {
  reply: string
  observation?: CoachObservation
}

export interface CoachSession {
  id: string
  audit_id: string
  messages: CoachMessage[]
  area?: string
  trades_active?: string[]
  started_at: string
  ended_at?: string
}
