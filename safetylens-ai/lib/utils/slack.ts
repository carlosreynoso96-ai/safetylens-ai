/**
 * Send a notification to Slack via Incoming Webhook.
 * Silently fails — notifications are best-effort.
 */
export async function notifySlack(text: string): Promise<void> {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!webhookUrl) return

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch {
    // Best-effort — don't break anything if Slack is down
  }
}
