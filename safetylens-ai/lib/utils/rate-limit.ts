/**
 * Simple in-memory rate limiter for API routes.
 * Uses a sliding window approach with per-key tracking.
 */

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (now > entry.resetAt) {
      store.delete(key)
    }
  }
}, 60_000) // every 60s

interface RateLimitOptions {
  /** Maximum number of requests in the window */
  maxRequests: number
  /** Window duration in seconds */
  windowSeconds: number
}

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

export function rateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    // New window
    const resetAt = now + options.windowSeconds * 1000
    store.set(key, { count: 1, resetAt })
    return { success: true, remaining: options.maxRequests - 1, resetAt }
  }

  if (entry.count >= options.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return {
    success: true,
    remaining: options.maxRequests - entry.count,
    resetAt: entry.resetAt,
  }
}

/**
 * Pre-configured rate limiters for different API routes
 */
export const API_LIMITS = {
  /** AI analysis: 10 requests per minute per user */
  analyze: { maxRequests: 10, windowSeconds: 60 },
  /** Coach: 20 messages per minute per user */
  coach: { maxRequests: 20, windowSeconds: 60 },
  /** General API: 60 requests per minute per user */
  general: { maxRequests: 60, windowSeconds: 60 },
} as const
