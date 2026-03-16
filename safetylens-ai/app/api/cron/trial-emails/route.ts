import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  sendDay3Email,
  sendDay10Email,
  sendTrialExpiredEmail,
} from '@/lib/resend/emails'

export const dynamic = 'force-dynamic'

interface Profile {
  id: string
  email: string
  full_name: string
  created_at: string
  trial_ends_at: string
  plan: string
  plan_status: string
}

export async function GET(request: NextRequest) {
  // Authenticate with CRON_SECRET
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const results = { day3: 0, day10: 0, expired: 0, errors: 0 }

  // ------------------------------------------------------------------
  // Helper: build ISO strings for a +-12 h window around a target date
  // ------------------------------------------------------------------
  function windowAround(target: Date): { from: string; to: string } {
    const from = new Date(target.getTime() - 12 * 60 * 60 * 1000)
    const to = new Date(target.getTime() + 12 * 60 * 60 * 1000)
    return { from: from.toISOString(), to: to.toISOString() }
  }

  // ------------------------------------------------------------------
  // Day 3 emails — users created ~3 days ago
  // ------------------------------------------------------------------
  try {
    const day3Target = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)
    const day3Window = windowAround(day3Target)

    const { data: day3Users, error: day3Error } = await supabase
      .from('profiles')
      .select('id, email, full_name, created_at')
      .eq('plan', 'free_trial')
      .eq('plan_status', 'trialing')
      .gte('created_at', day3Window.from)
      .lte('created_at', day3Window.to)
      .returns<Profile[]>()

    if (day3Error) {
      console.error('[cron/trial-emails] Day 3 query error:', day3Error.message)
    } else if (day3Users) {
      for (const user of day3Users) {
        try {
          await sendDay3Email(user.email, user.full_name)
          results.day3++
        } catch (err) {
          console.error(`[cron/trial-emails] Day 3 send failed for ${user.email}:`, err)
          results.errors++
        }
      }
    }
  } catch (err) {
    console.error('[cron/trial-emails] Day 3 block error:', err)
  }

  // ------------------------------------------------------------------
  // Day 10 emails — trial_ends_at is ~4 days from now
  // ------------------------------------------------------------------
  try {
    const day10Target = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000)
    const day10Window = windowAround(day10Target)

    const { data: day10Users, error: day10Error } = await supabase
      .from('profiles')
      .select('id, email, full_name, trial_ends_at')
      .eq('plan', 'free_trial')
      .eq('plan_status', 'trialing')
      .gte('trial_ends_at', day10Window.from)
      .lte('trial_ends_at', day10Window.to)
      .returns<Profile[]>()

    if (day10Error) {
      console.error('[cron/trial-emails] Day 10 query error:', day10Error.message)
    } else if (day10Users) {
      for (const user of day10Users) {
        try {
          await sendDay10Email(user.email, user.full_name)
          results.day10++
        } catch (err) {
          console.error(`[cron/trial-emails] Day 10 send failed for ${user.email}:`, err)
          results.errors++
        }
      }
    }
  } catch (err) {
    console.error('[cron/trial-emails] Day 10 block error:', err)
  }

  // ------------------------------------------------------------------
  // Trial expired emails — trial_ends_at has passed, still 'trialing'
  // ------------------------------------------------------------------
  try {
    const { data: expiredUsers, error: expiredError } = await supabase
      .from('profiles')
      .select('id, email, full_name, trial_ends_at')
      .eq('plan', 'free_trial')
      .eq('plan_status', 'trialing')
      .lt('trial_ends_at', now.toISOString())
      .returns<Profile[]>()

    if (expiredError) {
      console.error('[cron/trial-emails] Expired query error:', expiredError.message)
    } else if (expiredUsers) {
      for (const user of expiredUsers) {
        try {
          await sendTrialExpiredEmail(user.email, user.full_name)
          results.expired++

          // Update the user's plan_status so they don't get emailed again
          await supabase
            .from('profiles')
            .update({ plan_status: 'expired' })
            .eq('id', user.id)
        } catch (err) {
          console.error(`[cron/trial-emails] Expired send failed for ${user.email}:`, err)
          results.errors++
        }
      }
    }
  } catch (err) {
    console.error('[cron/trial-emails] Expired block error:', err)
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    results,
  })
}
