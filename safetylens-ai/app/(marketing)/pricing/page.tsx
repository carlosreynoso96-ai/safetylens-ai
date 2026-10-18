import { Metadata } from 'next'
import PricingTable from '@/components/marketing/PricingTable'
import EmailCapture from '@/components/marketing/EmailCapture'

export const metadata: Metadata = {
  title: 'Pricing — Vorsa AI',
  description:
    'Simple, transparent pricing for AI-powered construction safety. Start with a 14-day free trial. No credit card required.',
}

export default function PricingPage() {
  return (
    <>
      {/* Page header */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Plans &amp; Pricing
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
            Choose the plan that fits your team. Every plan includes a 14-day free
            trial with full access — no credit card needed.
          </p>
        </div>
      </section>

      <PricingTable />
      <EmailCapture />
    </>
  )
}
