export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'
import Stripe from 'stripe'

function getPlanFromPriceId(priceId: string): PlanType {
  for (const [planKey, planDef] of Object.entries(PLANS)) {
    if (planDef.stripe_price_id === priceId) {
      return planKey as PlanType
    }
  }
  return 'free_trial'
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    console.error('Webhook signature verification failed:', message)
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = session.customer as string
        const plan = (session.metadata?.plan as PlanType) || 'starter'

        if (customerId) {
          // Find user by stripe_customer_id
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            await supabase
              .from('profiles')
              .update({
                plan,
                plan_status: 'active',
                stripe_customer_id: customerId,
              })
              .eq('id', profile.id)
          }
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string
        const priceId = subscription.items.data[0]?.price?.id

        if (customerId && priceId) {
          const plan = getPlanFromPriceId(priceId)

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            await supabase
              .from('profiles')
              .update({
                plan,
                plan_status: subscription.status === 'active' ? 'active' : 'past_due',
              })
              .eq('id', profile.id)
          }
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        if (customerId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            await supabase
              .from('profiles')
              .update({
                plan: 'free_trial',
                plan_status: 'canceled',
              })
              .eq('id', profile.id)
          }
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        if (customerId) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile) {
            await supabase
              .from('profiles')
              .update({
                plan_status: 'past_due',
              })
              .eq('id', profile.id)
          }
        }
        break
      }
    }

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
