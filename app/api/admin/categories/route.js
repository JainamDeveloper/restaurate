import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from('categories')
    .select('*')
    .order('sort_order')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(req) {
  const supabase = await createSupabaseServerClient()
  const { data: _authData, error: _authErr } = await supabase.auth.getUser()
  const user = _authData?.user
  if (_authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('categories')
    .insert({ name: body.name, sort_order: body.sort_order ?? 99, is_active: body.is_active ?? true })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
