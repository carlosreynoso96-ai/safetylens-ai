'use client'

import { Users } from 'lucide-react'

export default function TeamPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          Enterprise Feature
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Team management is available on the Enterprise plan. Invite team members,
          manage roles, and collaborate on safety audits.
        </p>
        <a
          href="mailto:sales@safetylens.ai"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium"
        >
          Contact Sales to Learn More
        </a>
      </div>
    </div>
  )
}
