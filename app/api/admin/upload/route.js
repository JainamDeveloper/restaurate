import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function POST(req) {
  const supabase = await createSupabaseServerClient()
  const { data: _authData, error: _authErr } = await supabase.auth.getUser()
  const user = _authData?.user
  if (_authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file     = formData.get('file')
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext      = file.name.split('.').pop().toLowerCase()
  const allowed  = ['jpg', 'jpeg', 'png', 'webp', 'avif']
  if (!allowed.includes(ext)) return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer   = await file.arrayBuffer()

  // Ensure bucket exists
  await supabaseAdmin.storage.createBucket('menu-images', { public: true }).catch(() => {})

  const { data, error } = await supabaseAdmin.storage
    .from('menu-images')
    .upload(fileName, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('menu-images')
    .getPublicUrl(data.path)

  return NextResponse.json({ url: publicUrl })
}
