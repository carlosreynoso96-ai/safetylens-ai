import Anthropic from '@anthropic-ai/sdk'

let _anthropic: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    // Use SAFETYLENS_ANTHROPIC_KEY to avoid collision with Claude Code's env
    const apiKey = process.env.SAFETYLENS_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('SAFETYLENS_ANTHROPIC_KEY is not set in environment variables')
    }
    _anthropic = new Anthropic({
      apiKey,
      maxRetries: 3,    // Auto-retry 429, 500, 502, 503
      timeout: 60_000,  // 60-second timeout per request
    })
  }
  return _anthropic
}

// Keep backward compat
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    return (getAnthropicClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})
