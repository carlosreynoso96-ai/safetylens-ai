'use client'

import { Sidebar } from '@/components/dashboard/Sidebar'
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import AuthGuard from '@/components/layout/AuthGuard'
import { AuthProvider } from '@/contexts/AuthContext'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthProvider>
      <AuthGuard>
        <div className="min-h-screen bg-gray-50">
          <Sidebar />
          <div className="lg:ml-64 transition-all duration-200">
            <DashboardHeader />
            <main className="p-6">{children}</main>
          </div>
        </div>
      </AuthGuard>
    </AuthProvider>
  )
}
