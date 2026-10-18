import Anthropic from '@anthropic-ai/sdk'

let _anthropic: Anthropic | null = null

export function getAnthropicClient(): Anthropic {
  if (!_anthropic) {
    const apiKey = process.env.VORSA_ANTHROPIC_KEY || process.env.SAFETYLENS_ANTHROPIC_KEY || process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      throw new Error('VORSA_ANTHROPIC_KEY is not set in environment variables')
    }
    _anthropic = new Anthropic({ apiKey })
  }
  return _anthropic
}

// Keep backward compat
export const anthropic = new Proxy({} as Anthropic, {
  get(_, prop) {
    return (getAnthropicClient() as Record<string | symbol, unknown>)[prop]
  },
})
