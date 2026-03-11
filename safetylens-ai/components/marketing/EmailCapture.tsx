import Link from 'next/link'
import { ArrowRight, ShieldCheck } from 'lucide-react'

export default function EmailCapture() {
  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 px-6 py-16 shadow-2xl shadow-orange-500/20 sm:px-16 sm:py-20">
          {/* Decorative elements */}
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-orange-400/30 blur-2xl" />

          <div className="relative text-center">
            {/* Icon */}
            <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-white backdrop-blur-sm">
              <ShieldCheck className="h-7 w-7" />
            </div>

            {/* Headline */}
            <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Ready to Transform Your Safety Program?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-orange-100">
              Join construction teams already using Vorsa to run faster, smarter
              safety walks with AI-powered analysis and coaching.
            </p>

            {/* CTA */}
            <div className="mt-10">
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 text-base font-bold text-orange-600 shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Your 14-Day Free Trial
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>

            {/* Trust line */}
            <p className="mt-4 text-sm font-medium text-orange-100/80">
              No credit card required &middot; Set up in under 2 minutes
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
