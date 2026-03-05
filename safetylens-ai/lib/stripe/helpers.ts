import { stripe } from './client'
import { PlanType } from '@/types/plan'
import { PLANS } from '@/lib/constants/plans'

export async function createCheckoutSession(
  customerId: string,
  plan: PlanType,
  successUrl: string,
  cancelUrl: string
) {
  const planDef = PLANS[plan]
  if (!planDef.stripe_price_id) {
    throw new Error(`No Stripe price ID for plan: ${plan}`)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price: planDef.stripe_price_id,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      plan,
    },
  })

  return session
}

export async function createCustomerPortalSession(
  customerId: string,
  returnUrl: string
) {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })

  return session
}

export async function getOrCreateCustomer(
  userId: string,
  email: string,
  name?: string
) {
  const customers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (customers.data.length > 0) {
    return customers.data[0]
  }

  const customer = await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      supabase_user_id: userId,
    },
  })

  return customer
}
