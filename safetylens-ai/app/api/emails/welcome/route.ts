import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/resend/emails'

export async function POST(request: NextRequest) {
  try {
    const { email, full_name } = (await request.json()) as {
      email?: string
      full_name?: string
    }

    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'email and full_name are required' },
        { status: 400 }
      )
    }

    // Verify the user actually exists in Supabase auth
    const supabase = createAdminClient()
    const { data: users, error: listError } =
      await supabase.auth.admin.listUsers()

    if (listError) {
      console.error('[welcome-email] Failed to list users:', listError.message)
      return NextResponse.json(
        { error: 'Failed to verify user' },
        { status: 500 }
      )
    }

    const userExists = users.users.some(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (!userExists) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { error: sendError } = await sendWelcomeEmail(email, full_name)

    if (sendError) {
      console.error('[welcome-email] Resend error:', sendError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[welcome-email] Unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
