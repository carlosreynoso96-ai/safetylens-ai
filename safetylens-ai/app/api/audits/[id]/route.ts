import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get audit and verify ownership
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*, projects(name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (auditError || !audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    // Get all observations for this audit
    const { data: observations, error: obsError } = await supabase
      .from('observations')
      .select('*')
      .eq('audit_id', id)
      .order('sort_order', { ascending: true })

    if (obsError) {
      console.error('Error fetching observations:', obsError)
      return NextResponse.json({ error: 'Failed to fetch observations' }, { status: 500 })
    }

    return NextResponse.json({ audit, observations })
  } catch (error) {
    console.error('Audit GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch audit' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const updates = await request.json()

    // Verify ownership first
    const { data: existing } = await supabase
      .from('audits')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    // Update audit
    const { data: audit, error: updateError } = await supabase
      .from('audits')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating audit:', updateError)
      return NextResponse.json({ error: 'Failed to update audit' }, { status: 500 })
    }

    return NextResponse.json({ audit })
  } catch (error) {
    console.error('Audit PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update audit' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createServerSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Verify ownership first
    const { data: existing } = await supabase
      .from('audits')
      .select('id')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    // Delete observations first (cascade)
    await supabase
      .from('observations')
      .delete()
      .eq('audit_id', id)

    // Delete the audit
    const { error: deleteError } = await supabase
      .from('audits')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (deleteError) {
      console.error('Error deleting audit:', deleteError)
      return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Audit DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete audit' }, { status: 500 })
  }
}
