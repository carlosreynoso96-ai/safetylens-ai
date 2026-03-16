import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Referral Program — Vorsa AI',
  description:
    'Refer a colleague to Vorsa AI and you both get one month free on any paid plan. No limits, no fine print.',
  openGraph: {
    title: 'Share Vorsa AI. Get a Free Month.',
    description:
      'Know a safety manager still spending hours on report writing? Send them Vorsa AI, and you both get one month free.',
    url: 'https://getvorsa.ai/referral',
    siteName: 'Vorsa AI',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Share Vorsa AI. Get a Free Month.',
    description:
      'Refer a colleague to Vorsa AI and you both get one month free on any paid plan.',
  },
}

const steps = [
  {
    number: '1',
    title: 'Share Your Link',
    description:
      'Copy your unique referral link from your Vorsa AI dashboard and send it to a colleague in the industry.',
    icon: (
      <svg
        className="h-7 w-7 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
        />
      </svg>
    ),
  },
  {
    number: '2',
    title: 'They Subscribe',
    description:
      'Your referral signs up for a free 14-day trial using your link. When they choose a paid plan, the referral is confirmed.',
    icon: (
      <svg
        className="h-7 w-7 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
        />
      </svg>
    ),
  },
  {
    number: '3',
    title: 'You Both Win',
    description:
      'One free month is automatically applied to both accounts. No promo codes. No fine print.',
    icon: (
      <svg
        className="h-7 w-7 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
        />
      </svg>
    ),
  },
]

const faqs = [
  {
    q: 'Who can I refer?',
    a: 'Anyone in the construction industry who isn\u2019t already a Vorsa AI user. Safety managers, consultants, superintendents, project managers, company owners \u2014 anyone who does or oversees jobsite safety.',
  },
  {
    q: 'When do I get my free month?',
    a: 'Your free month is applied within 24 hours of your referral subscribing to a paid plan (Starter, Professional, or Coach).',
  },
  {
    q: 'Is there a limit?',
    a: 'No. Refer as many people as you want. Every confirmed referral earns you another free month.',
  },
  {
    q: 'What if my referral cancels?',
    a: 'Your free month is yours to keep regardless. Once it\u2019s credited, it\u2019s credited.',
  },
  {
    q: 'Does this work for any plan?',
    a: 'Yes. Whether you\u2019re on Starter ($29/mo), Professional ($49/mo), or Coach ($89/mo), you get one month of your current plan free per referral.',
  },
]

export default function ReferralPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-orange-50 to-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-sm font-semibold text-orange-700 mb-6">
            Referral Program
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Share Vorsa AI. Get a Free Month.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
            Know a safety manager who&apos;s still spending hours on report
            writing? Send them Vorsa AI, and you both get one month free on any
            plan.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition"
            >
              Get My Referral Link
            </Link>
            <p className="text-sm text-gray-500">
              Already have a Vorsa AI account?{' '}
              <Link
                href="/login"
                className="font-medium text-orange-600 hover:text-orange-500 transition"
              >
                Log in
              </Link>{' '}
              to find your referral link in your dashboard under Settings &gt;
              Referral Program.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            How It Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-gray-600">
            Give a month, get a month. It&apos;s that simple.
          </p>

          <div className="mt-14 grid gap-10 sm:grid-cols-3">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-orange-100">
                  {step.icon}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Share */}
      <section className="bg-gray-50 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Why Share Vorsa AI?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
            Every safety professional you refer is one more person who stops
            wasting hours on paperwork and starts spending that time where it
            matters — on the jobsite, keeping workers safe.
          </p>
          <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
            Plus, there&apos;s no cap on referrals. Refer five people, get five
            free months. Refer ten, get ten.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-gray-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <dl className="mt-10 space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <dt className="text-base font-semibold text-gray-900">
                  {faq.q}
                </dt>
                <dd className="mt-2 text-sm leading-relaxed text-gray-600">
                  {faq.a}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-orange-500 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">
            Ready to start sharing?
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-lg text-orange-100">
            Sign up or log in to get your unique referral link and start earning
            free months today.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/signup"
              className="inline-flex items-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-orange-600 shadow-sm hover:bg-orange-50 transition"
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center rounded-lg border border-white/30 px-6 py-3 text-base font-semibold text-white hover:bg-white/10 transition"
            >
              Log In to Dashboard
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
