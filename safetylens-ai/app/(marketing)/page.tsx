import { Metadata } from 'next'
import Hero from '@/components/marketing/Hero'
import Features from '@/components/marketing/Features'
import BeforeAfter from '@/components/marketing/BeforeAfter'
import CoachDemo from '@/components/marketing/CoachDemo'
import PricingTable from '@/components/marketing/PricingTable'
import EmailCapture from '@/components/marketing/EmailCapture'

export const metadata: Metadata = {
  title: 'Vorsa AI — AI-Powered Safety Audits for Construction',
  description:
    'Turn jobsite photos into OSHA-cited safety reports in seconds. Walk with an AI safety coach who guides you in real time. Start your free trial today.',
}

export default function MarketingPage() {
  return (
    <>
      <Hero />
      <Features />
      <BeforeAfter />
      <CoachDemo />
      <PricingTable />
      <EmailCapture />
    </>
  )
}
