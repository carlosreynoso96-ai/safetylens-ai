import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { generateCSV } from '@/lib/utils/export-csv'
import { generatePDFContent } from '@/lib/utils/export-pdf'

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
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'csv'

    if (!['csv', 'pdf'].includes(format)) {
      return NextResponse.json(
        { error: 'Invalid format. Use "csv" or "pdf".' },
        { status: 400 }
      )
    }

    // Verify ownership and get audit details
    const { data: audit, error: auditError } = await supabase
      .from('audits')
      .select('*, projects(name)')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (auditError || !audit) {
      return NextResponse.json({ error: 'Audit not found' }, { status: 404 })
    }

    // Get observations
    const { data: observations, error: obsError } = await supabase
      .from('observations')
      .select('*')
      .eq('audit_id', id)
      .order('sort_order', { ascending: true })

    if (obsError) {
      console.error('Error fetching observations:', obsError)
      return NextResponse.json({ error: 'Failed to fetch observations' }, { status: 500 })
    }

    const auditDate = new Date(audit.created_at).toLocaleDateString()
    const projectName = (audit.projects as { name: string } | null)?.name

    if (format === 'csv') {
      const csv = generateCSV(observations || [], auditDate)
      const filename = `vorsa-audit-${id.slice(0, 8)}-${auditDate.replace(/\//g, '-')}.csv`

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      })
    }

    // PDF format - return HTML for client-side printing
    const html = generatePDFContent(observations || [], {
      projectName: projectName || undefined,
      inspectorName: audit.inspector_name || undefined,
      auditDate,
    })

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json({ error: 'Failed to export audit' }, { status: 500 })
  }
}
