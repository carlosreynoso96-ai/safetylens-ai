import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { cacheGet, cacheSet, cacheDel, CACHE_TTL } from '@/lib/redis/cache'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const projectId = searchParams.get('project_id')

    const offset = (page - 1) * limit

    let query = supabase
      .from('audits')
      .select('*, projects(name)', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    // Check cache for default queries (no project filter)
    const cacheKey = `audits:${user.id}:${page}:${limit}`
    if (!projectId) {
      const cached = await cacheGet(cacheKey)
      if (cached) {
        return NextResponse.json(cached, {
          headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' },
        })
      }
    }

    const { data: audits, error, count } = await query

    if (error) {
      console.error('Error fetching audits:', error)
      return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
    }

    const response = {
      audits,
      pagination: {
        page,
        limit,
        total: count || 0,
        total_pages: Math.ceil((count || 0) / limit),
      },
    }

    // Cache the result
    if (!projectId) {
      await cacheSet(cacheKey, response, CACHE_TTL.AUDITS)
    }

    return NextResponse.json(response, {
      headers: { 'Cache-Control': 'private, max-age=30, stale-while-revalidate=60' },
    })
  } catch (error) {
    console.error('Audits GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { project_id, audit_type, inspector_name } = await request.json()

    if (!audit_type) {
      return NextResponse.json(
        { error: 'Missing required field: audit_type' },
        { status: 400 }
      )
    }

    // Create the audit
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .insert({
        user_id: user.id,
        project_id: project_id || null,
        audit_type,
        inspector_name: inspector_name || null,
        status: 'draft',
        total_observations: 0,
        compliant_count: 0,
        non_compliant_count: 0,
        critical_count: 0,
      })
      .select()
      .single()

    if (auditError) {
      console.error('Error creating audit:', auditError)
      return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 })
    }

    // Increment walks_used_this_month in profiles
    const { data: profile } = await supabase
      .from('profiles')
      .select('walks_used_this_month')
      .eq('id', user.id)
      .single()

    if (profile) {
      await supabase
        .from('profiles')
        .update({
          walks_used_this_month: (profile.walks_used_this_month || 0) + 1,
        })
        .eq('id', user.id)
    }

    // Invalidate cached audit list and usage
    await Promise.all([
      cacheDel(`audits:${user.id}:1:20`),
      cacheDel(`usage:${user.id}`),
    ])

    return NextResponse.json({ audit }, { status: 201 })
  } catch (error) {
    console.error('Audits POST error:', error)
    return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 })
  }
}
