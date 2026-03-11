import { Metadata } from 'next'
import { Mail, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Contact — Vorsa AI',
}

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Contact Us</h1>
        <p className="mt-3 text-lg text-gray-600">
          Have questions about Vorsa AI? We&apos;d love to hear from you.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-2">
        {/* Email */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Mail className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Email</h2>
          <p className="mt-1 text-sm text-gray-500">
            For general inquiries and support
          </p>
          <a
            href="mailto:support@getvorsa.ai"
            className="mt-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-500 transition"
          >
            support@getvorsa.ai
          </a>
        </div>

        {/* Sales */}
        <div className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
            <Building2 className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-gray-900">Sales</h2>
          <p className="mt-1 text-sm text-gray-500">
            Enterprise plans and custom solutions
          </p>
          <a
            href="mailto:sales@getvorsa.ai"
            className="mt-3 inline-block text-sm font-medium text-orange-600 hover:text-orange-500 transition"
          >
            sales@getvorsa.ai
          </a>
        </div>
      </div>

      <div className="mt-12 rounded-xl border border-gray-200 bg-gray-50 p-6 text-center">
        <p className="text-sm text-gray-500">
          OSO Construction Tech &middot; Built by construction professionals, for
          construction professionals.
        </p>
      </div>
    </div>
  )
}
