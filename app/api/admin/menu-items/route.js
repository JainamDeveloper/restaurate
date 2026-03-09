import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const [{ data: categories, error: catErr }, { data: items, error: itemErr }] =
    await Promise.all([
      supabaseAdmin.from('categories').select('*').eq('is_active', true).order('sort_order'),
      supabaseAdmin.from('menu_items').select('*, categories(id, name)').order('sort_order'),
    ])

  if (catErr || itemErr) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }

  const menu = categories.map(cat => ({
    ...cat,
    items: items.filter(item => item.category_id === cat.id),
  }))

  return NextResponse.json({ data: menu })
}

export async function POST(req) {
  const supabase = await createSupabaseServerClient()
  const { data: _authData, error: _authErr } = await supabase.auth.getUser()
  const user = _authData?.user
  if (_authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .insert(body)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data }, { status: 201 })
}
