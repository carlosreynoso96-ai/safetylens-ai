'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!password.trim()) {
      setError('Password is required.')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      setSuccess(true)
      // Redirect to dashboard after a short delay
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Password Updated
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Your password has been updated successfully. Redirecting to dashboard...
        </p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Set New Password
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            New Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-[#f97316] focus:outline-none focus:ring-2 focus:ring-[#f97316]/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#f97316] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#ea580c] focus:outline-none focus:ring-2 focus:ring-[#f97316]/50 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Updating...' : 'Update Password'}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-[#f97316] hover:text-[#ea580c]"
          >
            Back to login
          </Link>
        </div>
      </form>
    </div>
  )
}
