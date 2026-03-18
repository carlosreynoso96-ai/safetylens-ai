import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/resend/emails'
import { notifySlack } from '@/lib/utils/slack'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') || '/dashboard'

  if (code) {
    const supabase = await createServerSupabaseClient()
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && sessionData?.user) {
      const user = sessionData.user

      // Safety net: ensure profile row exists (the DB trigger may have failed)
      try {
        const admin = createAdminClient()
        const { data: existingProfile } = await admin
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!existingProfile) {
          const fullName = user.user_metadata?.full_name || ''
          const company = user.user_metadata?.company || null
          await admin.from('profiles').insert({
            id: user.id,
            email: user.email!,
            full_name: fullName,
            company,
          })
        }
      } catch (profileErr) {
        console.error('Auth callback: profile safety-net error:', profileErr)
      }

      // Send welcome / first-walk email AFTER email is confirmed (non-blocking)
      const fullName = user.user_metadata?.full_name || ''
      if (user.email && fullName) {
        sendWelcomeEmail(user.email, fullName).catch((err) =>
          console.error('Auth callback: welcome email error:', err),
        )
        notifySlack(`New signup: *${fullName}* (${user.email})`)
      }

      return NextResponse.redirect(new URL(next, origin))
    }

    console.error('Auth callback error:', error)
  }

  // If code is missing or exchange failed, redirect to login with error
  return NextResponse.redirect(new URL('/login?error=auth_callback_failed', origin))
}
