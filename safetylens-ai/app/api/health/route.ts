import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const checks: Record<string, 'ok' | 'error'> = {}
  let healthy = true

  // Check Supabase connectivity
  try {
    const supabase = createAdminClient()
    const { error } = await supabase.from('profiles').select('id', { count: 'exact', head: true })
    checks.database = error ? 'error' : 'ok'
    if (error) healthy = false
  } catch {
    checks.database = 'error'
    healthy = false
  }

  // Check Redis connectivity (optional — don't fail health if Redis env not set)
  if (process.env.UPSTASH_REDIS_REST_URL) {
    try {
      const { getRedis } = await import('@/lib/redis/client')
      const redis = getRedis()
      await redis.ping()
      checks.redis = 'ok'
    } catch {
      checks.redis = 'error'
      healthy = false
    }
  }

  // Check that critical env vars are set
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
  ]
  const missingEnv = requiredEnvVars.filter((key) => !process.env[key])
  checks.env = missingEnv.length === 0 ? 'ok' : 'error'
  if (missingEnv.length > 0) healthy = false

  return NextResponse.json(
    {
      status: healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      checks,
    },
    {
      status: healthy ? 200 : 503,
      headers: { 'Cache-Control': 'no-store' },
    }
  )
}
