import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function PATCH(req) {
  const supabase = await createSupabaseServerClient()
  const { data: _authData, error: _authErr } = await supabase.auth.getUser()
  const user = _authData?.user
  if (_authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { key, value } = await req.json()

  const { error } = await supabaseAdmin
    .from('restaurant_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
