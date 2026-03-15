import { getRedis } from './client'

/**
 * Get a value from Redis cache. Returns null if not found or Redis is unavailable.
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const redis = getRedis()
    const value = await redis.get<T>(key)
    return value
  } catch {
    // Cache miss on error — fall through to source of truth
    return null
  }
}

/**
 * Set a value in Redis cache with a TTL in seconds.
 */
export async function cacheSet<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    const redis = getRedis()
    await redis.set(key, value, { ex: ttlSeconds })
  } catch {
    // Silently fail — cache is best-effort
  }
}

/**
 * Delete a cached key (use after mutations).
 */
export async function cacheDel(key: string): Promise<void> {
  try {
    const redis = getRedis()
    await redis.del(key)
  } catch {
    // Silently fail
  }
}

/**
 * Delete all keys matching a prefix pattern.
 */
export async function cacheDelPrefix(prefix: string): Promise<void> {
  try {
    const redis = getRedis()
    let cursor: string | number = 0
    do {
      const result = await redis.scan(cursor, { match: `${prefix}*`, count: 100 })
      const [nextCursor, keys]: [string | number, string[]] = result as [string | number, string[]]
      cursor = nextCursor
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } while (cursor !== 0 && cursor !== '0')
  } catch {
    // Silently fail
  }
}

// Cache TTL constants (seconds)
export const CACHE_TTL = {
  /** User profile/plan info — 60 seconds */
  PROFILE: 60,
  /** Usage stats — 30 seconds */
  USAGE: 30,
  /** Audit list — 30 seconds */
  AUDITS: 30,
} as const
