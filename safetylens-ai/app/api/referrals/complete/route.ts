import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { stripe } from '@/lib/stripe/client'

/**
 * POST /api/referrals/complete
 * Called internally (from Stripe webhook) when a referred user upgrades.
 * Marks the referral as completed and applies 1 free month to both
 * referrer and referee via Stripe subscription credits.
 */
export async function POST(request: NextRequest) {
  try {
    // Auth: only callable from internal routes (webhook)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INTERNAL_API_SECRET
    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { user_id } = (await request.json()) as { user_id?: string }
    if (!user_id) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 })
    }

    const admin = createAdminClient()

    // Find pending referral for this user
    const { data: referral } = await admin
      .from('referrals')
      .select('id, referrer_id, referee_id, status')
      .eq('referee_id', user_id)
      .eq('status', 'pending')
      .single()

    if (!referral) {
      return NextResponse.json({ success: true, message: 'No pending referral' })
    }

    // Get both users' Stripe customer IDs
    const { data: profiles } = await admin
      .from('profiles')
      .select('id, stripe_customer_id')
      .in('id', [referral.referrer_id, referral.referee_id])

    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, message: 'Profiles not found' })
    }

    const referrerProfile = profiles.find((p) => p.id === referral.referrer_id)
    const refereeProfile = profiles.find((p) => p.id === referral.referee_id)

    // Apply credit to both users' Stripe subscriptions
    const creditsApplied: string[] = []

    for (const profile of [referrerProfile, refereeProfile]) {
      if (!profile?.stripe_customer_id) continue

      try {
        // Find the customer's active subscription
        const subscriptions = await stripe.subscriptions.list({
          customer: profile.stripe_customer_id,
          status: 'active',
          limit: 1,
        })

        const subscription = subscriptions.data[0]
        if (!subscription) continue

        // Get the subscription's monthly price
        const priceAmount = subscription.items.data[0]?.price?.unit_amount
        if (!priceAmount) continue

        // Apply a one-time credit (invoice credit) equal to 1 month
        await stripe.customers.createBalanceTransaction(
          profile.stripe_customer_id,
          {
            amount: -priceAmount, // negative = credit
            currency: 'usd',
            description: `Referral reward: 1 month free (referral ${referral.id})`,
          }
        )

        creditsApplied.push(profile.id)
      } catch (err) {
        // Log but don't fail — partial credit is better than none
        console.error(
          `[Referral] Failed to apply credit for ${profile.id}:`,
          err
        )
      }
    }

    // Mark referral as completed (or rewarded if credits were applied)
    await admin
      .from('referrals')
      .update({
        status: creditsApplied.length > 0 ? 'rewarded' : 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', referral.id)

    console.log(
      `[Referral Completed] ID: ${referral.id} | Referrer: ${referral.referrer_id} | ` +
        `Referee: ${referral.referee_id} | Credits applied to: ${creditsApplied.join(', ') || 'none'}`
    )

    return NextResponse.json({
      success: true,
      referral_id: referral.id,
      credits_applied: creditsApplied,
    })
  } catch (error) {
    console.error('Referral complete error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
