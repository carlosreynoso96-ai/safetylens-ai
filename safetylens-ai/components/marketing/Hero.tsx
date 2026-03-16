'use client'

import Link from 'next/link'
import { ArrowRight, Play, ShieldCheck, Layers, Headphones } from 'lucide-react'

const stats = [
  { icon: ShieldCheck, label: '500+ OSHA Standards', description: 'Referenced automatically' },
  { icon: Layers, label: '57 Safety Categories', description: 'Comprehensive coverage' },
  { icon: Headphones, label: 'Real-Time AI Coach', description: 'Voice-guided walks' },
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-orange-50 via-orange-50/50 to-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-orange-100/40 blur-3xl" />
        <div className="absolute top-20 -left-20 h-[300px] w-[300px] rounded-full bg-orange-200/20 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 pb-20 pt-20 sm:px-6 sm:pb-28 sm:pt-28 lg:px-8 lg:pb-32 lg:pt-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-1.5 text-sm font-medium text-orange-700 shadow-sm backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
            Now with AI Safety Coach
          </div>

          {/* Headline */}
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            AI-Powered Safety Audits{' '}
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              for Construction
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-600 sm:text-xl sm:leading-relaxed">
            Turn jobsite photos into OSHA-cited safety reports in seconds. Or walk
            with an AI safety coach who guides you in real time.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex items-center gap-2 rounded-xl bg-orange-500 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/25 transition-all hover:bg-orange-600 hover:shadow-xl hover:shadow-orange-500/30 active:scale-[0.98]"
            >
              Start Free Trial
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => document.getElementById('coach')?.scrollIntoView({ behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 shadow-sm transition-all hover:border-orange-200 hover:text-orange-600 hover:shadow-md"
            >
              <Play className="h-4 w-4 fill-current" />
              Watch Demo
            </button>
          </div>

          {/* No credit card */}
          <p className="mt-4 text-sm text-gray-500">
            14-day free trial &middot; No credit card required
          </p>
        </div>

        {/* Stats bar */}
        <div className="mx-auto mt-16 max-w-3xl sm:mt-20">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:gap-6">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:border-orange-100 hover:shadow-md"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-500 transition-colors group-hover:bg-orange-100">
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900">{stat.label}</p>
                  <p className="mt-0.5 text-sm text-gray-500">{stat.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
