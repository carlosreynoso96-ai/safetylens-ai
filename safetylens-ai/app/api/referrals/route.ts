import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateReferralCode } from '@/lib/utils/referral'

/**
 * GET /api/referrals
 * Returns the current user's referral code (auto-generates if missing)
 * and their referral stats.
 */
export async function GET() {
  try {
    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Fetch profile
    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('referral_code, full_name')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      )
    }

    let referralCode = profile.referral_code

    // Auto-generate referral code if the user doesn't have one
    if (!referralCode) {
      const name = profile.full_name || user.email || 'USER'
      referralCode = generateReferralCode(name)

      // Attempt to save — if there's a unique constraint collision, retry once
      const { error: updateError } = await admin
        .from('profiles')
        .update({ referral_code: referralCode })
        .eq('id', user.id)

      if (updateError) {
        // Retry with a new code on collision
        referralCode = generateReferralCode(name)
        await admin
          .from('profiles')
          .update({ referral_code: referralCode })
          .eq('id', user.id)
      }
    }

    // Fetch referral stats
    const { data: referrals } = await admin
      .from('referrals')
      .select('status')
      .eq('referrer_id', user.id)

    const stats = {
      total: referrals?.length ?? 0,
      completed: referrals?.filter((r) => r.status === 'completed').length ?? 0,
      pending: referrals?.filter((r) => r.status === 'pending').length ?? 0,
    }

    return NextResponse.json({
      referral_code: referralCode,
      stats,
    })
  } catch (error) {
    console.error('Referral GET error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/referrals
 * Called when a new user signs up with a referral code.
 * Accepts { referral_code, referee_email } in the body.
 * Links the referee to the referrer and creates a referral record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { referral_code } = body as { referral_code?: string }

    if (!referral_code || typeof referral_code !== 'string') {
      return NextResponse.json(
        { error: 'referral_code is required' },
        { status: 400 }
      )
    }

    const supabase = await createServerSupabaseClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Find the referrer by their referral code
    const { data: referrer, error: referrerError } = await admin
      .from('profiles')
      .select('id')
      .eq('referral_code', referral_code.trim().toUpperCase())
      .single()

    if (referrerError || !referrer) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 404 }
      )
    }

    // Don't allow self-referral
    if (referrer.id === user.id) {
      return NextResponse.json(
        { error: 'Cannot use your own referral code' },
        { status: 400 }
      )
    }

    // Check if user was already referred
    const { data: existingProfile } = await admin
      .from('profiles')
      .select('referred_by')
      .eq('id', user.id)
      .single()

    if (existingProfile?.referred_by) {
      return NextResponse.json(
        { error: 'User already has a referrer' },
        { status: 409 }
      )
    }

    // Link referee to referrer
    await admin
      .from('profiles')
      .update({ referred_by: referrer.id })
      .eq('id', user.id)

    // Create referral record
    const { error: insertError } = await admin.from('referrals').insert({
      referrer_id: referrer.id,
      referral_code: referral_code.trim().toUpperCase(),
      referee_id: user.id,
      status: 'pending',
    })

    if (insertError) {
      console.error('Referral insert error:', insertError)
      return NextResponse.json(
        { error: 'Failed to create referral record' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Referral POST error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
