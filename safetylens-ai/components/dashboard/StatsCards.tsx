'use client'

import { ClipboardList, Camera, AlertTriangle, CheckCircle } from 'lucide-react'

interface StatsCardsProps {
  totalAudits: number
  totalObservations: number
  compliantCount: number
  criticalCount: number
}

export function StatsCards({
  totalAudits,
  totalObservations,
  compliantCount,
  criticalCount,
}: StatsCardsProps) {
  const stats = [
    {
      label: 'Total Audits',
      value: totalAudits,
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Observations',
      value: totalObservations,
      icon: Camera,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
    },
    {
      label: 'Compliant',
      value: compliantCount,
      icon: CheckCircle,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      label: 'Critical Issues',
      value: criticalCount,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-white rounded-xl border border-gray-200 p-4"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 ${stat.bg} rounded-lg flex items-center justify-center`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500">{stat.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
