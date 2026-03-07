import { NextResponse }              from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req) {
  const { email, password } = await req.json()

  const supabase = await createSupabaseServerClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  return NextResponse.json({ success: true, user: data.user })
}

export async function DELETE() {
  const supabase = await createSupabaseServerClient()
  await supabase.auth.signOut()
  return NextResponse.json({ success: true })
}
