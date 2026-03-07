import { NextResponse }              from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req) {
  const { email, password } = await req.json()

  const supabase = await createSupabaseServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
  }

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',').map(e => e.trim()).filter(Boolean)
  const role = adminEmails.includes(data.user.email) ? 'admin' : 'customer'

  return NextResponse.json({ success: true, role, name: data.user.user_metadata?.full_name })
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}
