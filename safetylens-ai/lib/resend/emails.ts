import { resend } from './client'

const FROM = 'Vorsa AI <noreply@getvorsa.ai>'
const BASE_URL = 'https://getvorsa.ai'
const BRAND_COLOR = '#f97316'

// ---------------------------------------------------------------------------
// Shared layout helpers
// ---------------------------------------------------------------------------

function layout(body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f9fafb;">
    <tr><td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
        <!-- Header -->
        <tr>
          <td style="background-color:${BRAND_COLOR};padding:24px 32px;">
            <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Vorsa AI</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 32px;border-top:1px solid #e5e7eb;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
              Vorsa AI by OSO Construction Tech<br/>
              <a href="mailto:support@getvorsa.ai?subject=Unsubscribe" style="color:#9ca3af;text-decoration:underline;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function ctaButton(text: string, href: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0;">
  <tr><td style="border-radius:6px;background-color:${BRAND_COLOR};">
    <a href="${href}" target="_blank" style="display:inline-block;padding:12px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">${text}</a>
  </td></tr>
</table>`
}

function greeting(name: string): string {
  const first = name.split(' ')[0]
  return `<p style="margin:0 0 16px;font-size:16px;color:#111827;line-height:1.6;">Hi ${first},</p>`
}

// ---------------------------------------------------------------------------
// Email 1 — Welcome (Day 0)
// ---------------------------------------------------------------------------

export async function sendWelcomeEmail(to: string, fullName: string) {
  const html = layout(`
    ${greeting(fullName)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Welcome to <strong>Vorsa AI</strong> — the fastest way to run AI&#8209;powered safety walks on your construction sites. Your 14&#8209;day free trial is now active.
    </p>
    <p style="margin:0 0 8px;font-size:15px;color:#374151;line-height:1.6;font-weight:600;">
      Get started in 3 simple steps:
    </p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">
      <tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;">
          <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background-color:${BRAND_COLOR};color:#fff;font-size:14px;font-weight:700;text-align:center;line-height:28px;">1</span>
        </td>
        <td style="padding:8px 0;font-size:14px;color:#374151;line-height:1.5;">
          <strong>Create a project</strong> — name it after your jobsite so everything stays organized.
        </td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;">
          <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background-color:${BRAND_COLOR};color:#fff;font-size:14px;font-weight:700;text-align:center;line-height:28px;">2</span>
        </td>
        <td style="padding:8px 0;font-size:14px;color:#374151;line-height:1.5;">
          <strong>Upload a photo or start the AI Coach</strong> — our AI instantly identifies hazards and suggests corrective actions.
        </td>
      </tr>
      <tr>
        <td style="padding:8px 12px 8px 0;vertical-align:top;">
          <span style="display:inline-block;width:28px;height:28px;border-radius:50%;background-color:${BRAND_COLOR};color:#fff;font-size:14px;font-weight:700;text-align:center;line-height:28px;">3</span>
        </td>
        <td style="padding:8px 0;font-size:14px;color:#374151;line-height:1.5;">
          <strong>Export your report</strong> — download a professional PDF or CSV to share with your team.
        </td>
      </tr>
    </table>
    ${ctaButton('Go to your Dashboard', `${BASE_URL}/dashboard`)}
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
      If you have any questions, just reply to this email or reach out at <a href="mailto:support@getvorsa.ai" style="color:${BRAND_COLOR};text-decoration:none;">support@getvorsa.ai</a>.
    </p>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: "Welcome to Vorsa AI \u2014 here\u2019s how to run your first safety walk",
    html,
  })
}

// ---------------------------------------------------------------------------
// Email 2 — Day 3 nudge
// ---------------------------------------------------------------------------

export async function sendDay3Email(to: string, fullName: string) {
  const html = layout(`
    ${greeting(fullName)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Have you tried the <strong>AI Safety Coach</strong> yet? It's one of the most powerful features in Vorsa AI and we don't want you to miss it during your trial.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      The Safety Coach guides you through a <strong>voice&#8209;powered walk</strong> of your jobsite. Just open it on your phone, tap start, and it will:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8;">
      <li>Walk you through each area step by step</li>
      <li>Ask targeted safety questions using AI</li>
      <li>Capture photos and notes hands&#8209;free</li>
      <li>Generate a complete audit report when you're done</li>
    </ul>
    ${ctaButton('Try the AI Safety Coach', `${BASE_URL}/coach`)}
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
      Your free trial is still active — make the most of it!
    </p>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Have you tried the AI Safety Coach?',
    html,
  })
}

// ---------------------------------------------------------------------------
// Email 3 — Day 10 (trial ends in 4 days)
// ---------------------------------------------------------------------------

export async function sendDay10Email(to: string, fullName: string) {
  const html = layout(`
    ${greeting(fullName)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Just a heads&#8209;up: your <strong>Vorsa AI free trial ends in 4 days</strong>.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      When your trial expires you'll lose access to:
    </p>
    <ul style="margin:0 0 20px;padding-left:20px;font-size:14px;color:#374151;line-height:1.8;">
      <li>AI&#8209;powered photo analysis</li>
      <li>The AI Safety Coach</li>
      <li>PDF &amp; CSV report exports</li>
      <li>All projects and audit history</li>
    </ul>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Upgrade now to keep everything running — plans start at just <strong>$49/month</strong>.
    </p>
    ${ctaButton('View Plans & Upgrade', `${BASE_URL}/pricing`)}
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
      Questions? Reply to this email and we'll help you out.
    </p>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Vorsa trial ends in 4 days',
    html,
  })
}

// ---------------------------------------------------------------------------
// Email 4 — Trial expired
// ---------------------------------------------------------------------------

export async function sendTrialExpiredEmail(to: string, fullName: string) {
  const html = layout(`
    ${greeting(fullName)}
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Your <strong>Vorsa AI free trial has ended</strong>. Your account is now on the free plan and premium features have been disabled.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      The good news? <strong>All of your data is safe.</strong> Your projects, audits, and reports are still saved and will be waiting for you if you decide to upgrade.
    </p>
    <p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.6;">
      Upgrade today and pick up right where you left off — no setup required.
    </p>
    ${ctaButton('Upgrade Now', `${BASE_URL}/pricing`)}
    <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.5;">
      If you have any feedback about your trial experience, we'd love to hear it. Just reply to this email.
    </p>
  `)

  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Your Vorsa AI trial has ended',
    html,
  })
}
