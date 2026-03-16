export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/client'
import { createAdminClient } from '@/lib/supabase/admin'
import { PLANS } from '@/lib/constants/plans'
import { PlanType } from '@/types/plan'
import Stripe from 'stripe'

// Server-side price ID mapping — env vars are only available server-side
const PRICE_ID_TO_PLAN: Record<string, PlanType> = {
  [process.env.STRIPE_PRICE_STARTER || '']: 'starter',
  [process.env.STRIPE_PRICE_PROFESSIONAL || '']: 'professional',
  [process.env.STRIPE_PRICE_COACH || '']: 'coach',
}

function getPlanFromPriceId(priceId: string): PlanType {
  const plan = PRICE_ID_TO_PLAN[priceId]
  if (plan) return plan

  // Fallback: check PLANS object (may have placeholders in client builds)
  for (const [planKey, planDef] of Object.entries(PLANS)) {
    if (planDef.stripe_price_id === priceId) {
      return planKey as PlanType
    }
  }

  console.error(`[Stripe Webhook] Unknown price ID: ${priceId} — defaulting to free_trial. Check env vars.`)
  return 'free_trial'
}

/**
 * Check if a webhook event has already been processed (idempotency).
 * Returns true if the event was already handled.
 */
async function isEventProcessed(supabase: ReturnType<typeof createAdminClient>, eventId: string): Promise<boolean> {
  const { data } = await supabase
    .from('stripe_webhook_events')
    .select('event_id')
    .eq('event_id', eventId)
    .single()

  return !!data
}

/**
 * Mark a webhook event as processed.
 */
async function markEventProcessed(
  supabase: ReturnType<typeof createAdminClient>,
  eventId: string,
  eventType: string
): Promise<void> {
  await supabase
    .from('stripe_webhook_events')
    .insert({ event_id: eventId, event_type: eventType })
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

  // Idempotency check — skip if already processed
  if (await isEventProcessed(supabase, event.id)) {
    return NextResponse.json({ received: true, skipped: 'duplicate' }, { status: 200 })
  }

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
            .select('id, referred_by')
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

            // If this user was referred, complete the referral and apply credits
            if (profile.referred_by) {
              try {
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
                await fetch(`${appUrl}/api/referrals/complete`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    ...(process.env.INTERNAL_API_SECRET
                      ? { Authorization: `Bearer ${process.env.INTERNAL_API_SECRET}` }
                      : {}),
                  },
                  body: JSON.stringify({ user_id: profile.id }),
                })
              } catch (err) {
                // Non-fatal — log but don't fail the webhook
                console.error('[Webhook] Referral completion failed:', err)
              }
            }
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

    // Mark event as processed
    await markEventProcessed(supabase, event.id, event.type)

    return NextResponse.json({ received: true }, { status: 200 })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
