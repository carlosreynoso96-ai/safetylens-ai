import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/referrals/complete
 * Called when a referred user upgrades to a paid plan.
 * Accepts { user_id } — the ID of the user who just subscribed.
 * Updates the referral to 'completed' and logs the completion.
 * The actual reward (1 month free for both) can be applied manually
 * or via a future Stripe integration.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify the request comes from an internal source (webhook or server)
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.INTERNAL_API_SECRET

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { user_id } = body as { user_id?: string }

    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    const admin = createAdminClient()

    // Check if this user has a pending referral
    const { data: referral, error: fetchError } = await admin
      .from('referrals')
      .select('id, referrer_id, referee_id, status')
      .eq('referee_id', user_id)
      .eq('status', 'pending')
      .single()

    if (fetchError || !referral) {
      // No pending referral for this user — not an error, just nothing to do
      return NextResponse.json({
        success: true,
        message: 'No pending referral found for this user',
      })
    }

    // Update referral status to completed
    const { error: updateError } = await admin
      .from('referrals')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', referral.id)

    if (updateError) {
      console.error('Referral completion update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update referral status' },
        { status: 500 }
      )
    }

    // Log the completion for manual reward processing
    console.log(
      `[Referral Completed] Referral ID: ${referral.id} | ` +
        `Referrer: ${referral.referrer_id} | Referee: ${referral.referee_id} | ` +
        `Completed at: ${new Date().toISOString()}`
    )

    // TODO: Future Stripe integration
    // - Create a 100%-off, 1-month coupon via Stripe API
    // - Apply coupon to referrer's subscription
    // - Apply coupon to referee's subscription
    // - Update referral status to 'rewarded'

    return NextResponse.json({
      success: true,
      referral_id: referral.id,
      referrer_id: referral.referrer_id,
      referee_id: referral.referee_id,
      message: 'Referral marked as completed. Reward pending manual application.',
    })
  } catch (error) {
    console.error('Referral complete error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
