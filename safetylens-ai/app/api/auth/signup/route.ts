import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendConfirmationEmail } from '@/lib/resend/emails'

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name, company } = (await request.json()) as {
      email?: string
      password?: string
      full_name?: string
      company?: string
    }

    if (!email || !password || !full_name) {
      return NextResponse.json(
        { error: 'email, password, and full_name are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      )
    }

    const supabase = createAdminClient()

    // generateLink creates the user (unconfirmed) and returns the confirmation
    // link WITHOUT sending Supabase's default plain-text email.
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'signup',
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: full_name.trim(),
          company: company?.trim() || null,
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://getvorsa.ai'}/auth/callback`,
      },
    })

    if (error) {
      // Supabase returns "User already registered" for existing users
      if (error.message?.includes('already registered') || error.message?.includes('already been registered')) {
        return NextResponse.json(
          { error: 'An account with this email already exists. Please sign in instead.' },
          { status: 409 }
        )
      }
      console.error('[signup] generateLink error:', error.message)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const confirmUrl = data.properties?.action_link
    if (!confirmUrl) {
      console.error('[signup] No action_link returned from generateLink')
      return NextResponse.json(
        { error: 'Failed to generate confirmation link' },
        { status: 500 }
      )
    }

    // Send our styled confirmation email via Resend
    const { error: emailError } = await sendConfirmationEmail(
      email.trim(),
      full_name.trim(),
      confirmUrl,
    )

    if (emailError) {
      console.error('[signup] Resend error:', emailError)
      // User was created but email failed — still return success so they
      // can request a resend later.
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[signup] Unexpected error:', err)
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
