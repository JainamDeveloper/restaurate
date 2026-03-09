import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function PATCH(req, { params }) {
  const supabase = await createSupabaseServerClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()
  const user = authData?.user

  if (authError || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const { data, error } = await supabaseAdmin
    .from('menu_items')
    .update(body)
    .eq('id', params.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}

export async function DELETE(req, { params }) {
  const supabase = await createSupabaseServerClient()
  const { data: authData2, error: authError2 } = await supabase.auth.getUser()
  const user = authData2?.user

  if (authError2 || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabaseAdmin
    .from('menu_items')
    .delete()
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
