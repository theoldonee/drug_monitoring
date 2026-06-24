import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'primary_admin') {
          return NextResponse.redirect(`${origin}/admin`)
        } else if (profile?.role === 'counselor') {
          return NextResponse.redirect(`${origin}/review`)
        }
      }
      return NextResponse.redirect(`${origin}/login`)
    }
  }

  // If code exchange fails or no code provided, redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
