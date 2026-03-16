'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { getReferralUrl } from '@/lib/utils/referral'
import { Gift, Copy, Check, Users, Clock, UserCheck } from 'lucide-react'

interface ReferralStats {
  total: number
  completed: number
  pending: number
}

export default function ReferralSettingsPage() {
  const { user } = useAuth()
  const [referralCode, setReferralCode] = useState<string | null>(null)
  const [stats, setStats] = useState<ReferralStats>({
    total: 0,
    completed: 0,
    pending: 0,
  })
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchReferralData = useCallback(async () => {
    try {
      const res = await fetch('/api/referrals')
      if (!res.ok) {
        throw new Error('Failed to fetch referral data')
      }
      const data = await res.json()
      setReferralCode(data.referral_code)
      setStats(data.stats)
    } catch {
      setError('Failed to load referral data. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (user) {
      fetchReferralData()
    }
  }, [user, fetchReferralData])

  async function handleCopy() {
    if (!referralCode) return
    const url = getReferralUrl(referralCode)
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = url
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="h-48 bg-gray-200 rounded" />
        <div className="h-32 bg-gray-200 rounded" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Referral Program
        </h1>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      </div>
    )
  }

  const referralUrl = referralCode ? getReferralUrl(referralCode) : ''

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>

      {/* Referral Link Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Your Referral Link</h2>
            <p className="text-sm text-gray-500">
              Share this link with colleagues. When they subscribe, you both get
              1 month free.
            </p>
          </div>
        </div>

        {/* Code display */}
        <div className="mb-3">
          <label className="block text-xs font-medium text-gray-500 mb-1">
            Referral Code
          </label>
          <p className="text-lg font-mono font-bold text-gray-900">
            {referralCode}
          </p>
        </div>

        {/* URL + Copy */}
        <div className="flex items-stretch gap-2">
          <div className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 font-mono truncate select-all">
            {referralUrl}
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-50">
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500 mt-0.5">Total Referrals</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
            <UserCheck className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
          <p className="text-xs text-gray-500 mt-0.5">Completed</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-50">
            <Clock className="w-5 h-5 text-yellow-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-0.5">Pending</p>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl bg-orange-50 border border-orange-200 p-5">
        <h3 className="text-sm font-semibold text-orange-900 mb-2">
          How it works
        </h3>
        <ul className="text-sm text-orange-800 space-y-1.5">
          <li>
            1. Share your unique referral link with colleagues in the
            construction industry.
          </li>
          <li>
            2. When they sign up and subscribe to any paid plan, the referral is
            confirmed.
          </li>
          <li>
            3. You both receive one free month on your current plan. No limit on
            referrals.
          </li>
        </ul>
      </div>
    </div>
  )
}
