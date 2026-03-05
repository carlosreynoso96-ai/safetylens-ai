export const SEVERITY_LEVELS = ['Low', 'Medium', 'High', 'Critical'] as const

export type SeverityLevel = (typeof SEVERITY_LEVELS)[number]

export const SEVERITY_COLORS: Record<SeverityLevel, string> = {
  Low: 'bg-green-100 text-green-800',
  Medium: 'bg-yellow-100 text-yellow-800',
  High: 'bg-orange-100 text-orange-800',
  Critical: 'bg-red-100 text-red-800',
}
