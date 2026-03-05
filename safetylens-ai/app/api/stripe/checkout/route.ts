import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createCheckoutSession, getOrCreateCustomer } from '@/lib/stripe/helpers'
import { PlanType } from '@/types/plan'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan } = await request.json() as { plan: PlanType }

    if (!['starter', 'professional', 'coach'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Get or create profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id, email, full_name')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get or create Stripe customer
    let customerId = profile.stripe_customer_id

    if (!customerId) {
      const customer = await getOrCreateCustomer(
        user.id,
        profile.email,
        profile.full_name || undefined
      )
      customerId = customer.id

      // Save customer ID to profile
      await supabase
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id)
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await createCheckoutSession(
      customerId,
      plan,
      `${appUrl}/dashboard?checkout=success`,
      `${appUrl}/settings/billing?checkout=canceled`
    )

    return NextResponse.json({ checkout_url: session.url })
  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
