import { Ratelimit } from '@upstash/ratelimit'
import { getRedis } from '@/lib/redis/client'

interface RateLimitResult {
  success: boolean
  remaining: number
  resetAt: number
}

// Lazily-initialized Upstash rate limiters (shared across requests)
let _analyzeLimiter: Ratelimit | null = null
let _coachLimiter: Ratelimit | null = null
let _generalLimiter: Ratelimit | null = null

function getAnalyzeLimiter(): Ratelimit {
  if (!_analyzeLimiter) {
    _analyzeLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(10, '60 s'),
      prefix: 'rl:analyze',
    })
  }
  return _analyzeLimiter
}

function getCoachLimiter(): Ratelimit {
  if (!_coachLimiter) {
    _coachLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(20, '60 s'),
      prefix: 'rl:coach',
    })
  }
  return _coachLimiter
}

function getGeneralLimiter(): Ratelimit {
  if (!_generalLimiter) {
    _generalLimiter = new Ratelimit({
      redis: getRedis(),
      limiter: Ratelimit.slidingWindow(60, '60 s'),
      prefix: 'rl:general',
    })
  }
  return _generalLimiter
}

/**
 * In-memory fallback for when Redis is unavailable.
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of memoryStore) {
    if (now > entry.resetAt) memoryStore.delete(key)
  }
}, 60_000)

function memoryRateLimit(key: string, maxRequests: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  const entry = memoryStore.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + windowMs
    memoryStore.set(key, { count: 1, resetAt })
    return { success: true, remaining: maxRequests - 1, resetAt }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count, resetAt: entry.resetAt }
}

/**
 * Pre-configured rate limit configs for different API routes
 */
export const API_LIMITS = {
  analyze: { maxRequests: 10, windowSeconds: 60 },
  coach: { maxRequests: 20, windowSeconds: 60 },
  general: { maxRequests: 60, windowSeconds: 60 },
} as const

type LimitType = keyof typeof API_LIMITS

const limiterMap: Record<LimitType, () => Ratelimit> = {
  analyze: getAnalyzeLimiter,
  coach: getCoachLimiter,
  general: getGeneralLimiter,
}

/**
 * Distributed rate limiter backed by Upstash Redis, with in-memory fallback.
 */
export async function rateLimit(key: string, type: LimitType): Promise<RateLimitResult> {
  const config = API_LIMITS[type]

  // Try Redis-based rate limiting first
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const limiter = limiterMap[type]()
      const result = await limiter.limit(key)
      return {
        success: result.success,
        remaining: result.remaining,
        resetAt: result.reset,
      }
    } catch {
      // Fall through to in-memory
    }
  }

  // Fallback: in-memory rate limiting
  return memoryRateLimit(
    `${type}:${key}`,
    config.maxRequests,
    config.windowSeconds * 1000
  )
}
