import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req) {
  const { email, password, name } = await req.json()

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
  }
  if (password.length < 6) {
    return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 })
  }

  // Create user with auto-confirmed email (no verification email needed)
  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name || '' },
  })

  if (createError) {
    const msg = createError.message.includes('already registered')
      ? 'An account with this email already exists'
      : createError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  // Sign in immediately after registration
  const supabase = await createSupabaseServerClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

  if (signInError) {
    return NextResponse.json({ error: 'Account created but sign-in failed. Please log in.' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
