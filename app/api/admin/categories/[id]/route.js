import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

async function authCheck() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function PATCH(req, { params }) {
  if (!await authCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabaseAdmin
    .from('categories')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(req, { params }) {
  if (!await authCheck()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check if category has items
  const { count } = await supabaseAdmin
    .from('menu_items')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', params.id)

  if (count > 0) {
    return NextResponse.json(
      { error: `Cannot delete — ${count} menu item(s) use this category. Reassign them first.` },
      { status: 400 }
    )
  }

  const { error } = await supabaseAdmin.from('categories').delete().eq('id', params.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
