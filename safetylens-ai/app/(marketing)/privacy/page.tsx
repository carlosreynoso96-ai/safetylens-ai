import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy — Vorsa AI',
}

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: March 11, 2026</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-gray-600">
        <section>
          <h2 className="text-lg font-semibold text-gray-900">1. Introduction</h2>
          <p className="mt-2">
            OSO Construction Tech (&quot;we,&quot; &quot;us,&quot; or &quot;Vorsa AI&quot;) operates the
            Vorsa AI platform at getvorsa.ai. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use our
            service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">2. Information We Collect</h2>
          <p className="mt-2">We collect information you provide directly:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Account Information:</strong> Name, email address, company
              name, and job title when you create an account.
            </li>
            <li>
              <strong>Jobsite Photos:</strong> Photos you upload for AI-powered
              safety analysis.
            </li>
            <li>
              <strong>Audit Data:</strong> Observations, reports, and project
              information generated through the platform.
            </li>
            <li>
              <strong>Payment Information:</strong> Billing details processed
              securely through Stripe. We never store your full credit card number.
            </li>
            <li>
              <strong>Usage Data:</strong> How you interact with our platform,
              including pages visited and features used.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">3. How We Use Your Information</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>To provide AI-powered safety analysis of your jobsite photos.</li>
            <li>To generate safety audit reports with OSHA standard citations.</li>
            <li>To operate the AI Safety Coach feature for guided safety walks.</li>
            <li>To process payments and manage your subscription.</li>
            <li>To send transactional emails (account confirmation, password resets).</li>
            <li>To improve and optimize our platform and AI models.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">4. Third-Party Services</h2>
          <p className="mt-2">We use trusted third-party services to operate our platform:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>
              <strong>Supabase:</strong> Authentication and database hosting.
            </li>
            <li>
              <strong>Stripe:</strong> Secure payment processing.
            </li>
            <li>
              <strong>Anthropic (Claude):</strong> AI-powered image analysis and
              safety coaching. Photos are sent to Anthropic for analysis and are
              subject to{' '}
              <a
                href="https://www.anthropic.com/privacy"
                className="text-orange-600 hover:text-orange-500 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Anthropic&apos;s Privacy Policy
              </a>
              .
            </li>
            <li>
              <strong>Vercel:</strong> Application hosting and delivery.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">5. Data Retention</h2>
          <p className="mt-2">
            We retain your account information and audit data for as long as your
            account is active. Uploaded photos are processed for analysis and stored
            to enable report generation. You may request deletion of your data at
            any time by contacting us.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">6. Data Security</h2>
          <p className="mt-2">
            We implement industry-standard security measures including encryption in
            transit (TLS), secure authentication, and access controls. However, no
            method of transmission over the Internet is 100% secure.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">7. Cookies</h2>
          <p className="mt-2">
            We use essential cookies for authentication and session management. We
            may use analytics cookies to understand how our platform is used. You
            can control cookie preferences through your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">8. Your Rights</h2>
          <p className="mt-2">Depending on your location, you may have the right to:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Access the personal data we hold about you.</li>
            <li>Request correction of inaccurate data.</li>
            <li>Request deletion of your data.</li>
            <li>Export your data in a portable format.</li>
            <li>Opt out of marketing communications.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">9. Changes to This Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. We will notify you
            of material changes by posting the updated policy on this page and
            updating the &quot;Last updated&quot; date.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-gray-900">10. Contact Us</h2>
          <p className="mt-2">
            If you have questions about this Privacy Policy, please contact us at{' '}
            <a
              href="mailto:support@getvorsa.ai"
              className="text-orange-600 hover:text-orange-500 underline"
            >
              support@getvorsa.ai
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
