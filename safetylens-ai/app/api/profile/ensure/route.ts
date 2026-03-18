import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * POST /api/profile/ensure
 * If the authenticated user has no profile row (e.g. the DB trigger failed),
 * create one from their auth metadata. Returns the profile either way.
 */
export async function POST() {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = createAdminClient()

    // Check if profile already exists
    const { data: existing } = await admin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (existing) {
      return NextResponse.json({ profile: existing })
    }

    // Create the missing profile from auth metadata
    const { data: created, error: insertError } = await admin
      .from('profiles')
      .insert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata?.full_name || null,
        company: user.user_metadata?.company || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error('[ensure-profile] Insert error:', insertError)
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 })
    }

    return NextResponse.json({ profile: created }, { status: 201 })
  } catch (err) {
    console.error('[ensure-profile] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
