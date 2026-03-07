import { NextResponse }    from 'next/server'
import { supabaseAdmin }   from '@/lib/supabase'

export async function GET() {
  const [{ data: categories, error: catErr }, { data: items, error: itemErr }] =
    await Promise.all([
      supabaseAdmin
        .from('categories')
        .select('*')
        .eq('is_active', true)
        .order('sort_order'),
      supabaseAdmin
        .from('menu_items')
        .select('*, categories(id, name)')
        .eq('is_available', true)
        .order('sort_order'),
    ])

  if (catErr || itemErr) {
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }

  // Group items under their category
  const menu = categories.map(cat => ({
    ...cat,
    items: items.filter(item => item.category_id === cat.id),
  }))

  return NextResponse.json({ data: menu })
}
