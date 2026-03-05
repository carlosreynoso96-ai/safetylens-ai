'use client'

import { useState, FormEvent } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email.trim()) {
      setError('Email is required.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: resetError } =
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        })

      if (resetError) {
        setError(resetError.message)
        return
      }

      setEmailSent(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="text-center">
        {/* Success icon */}
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 mb-4">
          <svg
            className="h-6 w-6 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          If an account exists for{' '}
          <span className="font-medium text-gray-700">{email}</span>, we&apos;ve
          sent a password reset link. Please check your inbox and follow the
          instructions.
        </p>
        <Link
          href="/login"
          className="text-sm font-semibold text-orange-600 hover:text-orange-500 transition"
        >
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">
        Reset your password
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        Enter the email address associated with your account, and we&apos;ll
        send you a link to reset your password.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition"
            placeholder="you@example.com"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Sending link...
            </span>
          ) : (
            'Send Reset Link'
          )}
        </button>
      </form>

      {/* Back to login link */}
      <p className="mt-6 text-center text-sm text-gray-500">
        <Link
          href="/login"
          className="font-semibold text-orange-600 hover:text-orange-500 transition"
        >
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
