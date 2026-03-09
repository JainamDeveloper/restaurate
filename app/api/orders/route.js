import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// POST /api/orders — place order (requires login)
export async function POST(req) {
  const supabase = await createSupabaseServerClient()
  const { data: authData } = await supabase.auth.getUser()
  if (!authData?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { type, table_number, customer_name, customer_phone, kitchen_notes, items } = body

  if (!type || !items?.length || !customer_name?.trim()) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  if (!['dine_in', 'pickup', 'delivery'].includes(type)) {
    return NextResponse.json({ error: 'Invalid order type' }, { status: 400 })
  }

  const total        = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const order_number = `ORD-${Date.now()}`

  // Insert order
  const { data: order, error: orderErr } = await supabaseAdmin
    .from('orders')
    .insert({
      order_number,
      type,
      table_number:   table_number  || null,
      customer_name:  customer_name.trim(),
      customer_phone: customer_phone || null,
      kitchen_notes:  kitchen_notes  || null,
      status:         'new',
      total:          Math.round(total * 100) / 100,
    })
    .select()
    .single()

  if (orderErr) {
    console.error('Order insert error:', orderErr)
    return NextResponse.json({ error: 'Failed to place order' }, { status: 500 })
  }

  // Insert order items
  const orderItems = items.map(item => ({
    order_id:  order.id,
    item_name: item.name,
    price:     item.price,
    quantity:  item.quantity,
    notes:     item.notes || null,
    subtotal:  Math.round(item.price * item.quantity * 100) / 100,
  }))

  const { error: itemsErr } = await supabaseAdmin.from('order_items').insert(orderItems)

  if (itemsErr) {
    console.error('Order items insert error:', itemsErr)
    return NextResponse.json({ error: 'Failed to save order items' }, { status: 500 })
  }

  return NextResponse.json(
    { data: { order_number: order.order_number, id: order.id } },
    { status: 201 }
  )
}

// GET /api/orders — admin only
export async function GET(req) {
  const supabase = await createSupabaseServerClient()
  const { data: authData2 } = await supabase.auth.getUser()
  const user = authData2?.user

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const status           = searchParams.get('status')

  let query = supabaseAdmin
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false })

  if (status) query = query.eq('status', status)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data })
}
