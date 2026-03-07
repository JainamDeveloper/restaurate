import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const today     = new Date().toISOString().split('T')[0]
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()

  const [
    { data: todayOrders },
    { data: monthOrders },
    { data: pendingOrders },
    { data: topItems },
  ] = await Promise.all([
    // Today completed orders
    supabaseAdmin
      .from('orders')
      .select('total')
      .eq('status', 'completed')
      .gte('created_at', today),

    // This month completed orders
    supabaseAdmin
      .from('orders')
      .select('total')
      .eq('status', 'completed')
      .gte('created_at', monthStart),

    // Active (non-completed) orders count
    supabaseAdmin
      .from('orders')
      .select('id', { count: 'exact', head: true })
      .in('status', ['new', 'preparing', 'ready']),

    // Top items by quantity sold
    supabaseAdmin
      .from('order_items')
      .select('item_name, quantity')
      .limit(100),
  ])

  // Aggregate top items
  const itemMap = {}
  topItems?.forEach(row => {
    itemMap[row.item_name] = (itemMap[row.item_name] || 0) + row.quantity
  })
  const top_items = Object.entries(itemMap)
    .map(([item_name, total_qty]) => ({ item_name, total_qty }))
    .sort((a, b) => b.total_qty - a.total_qty)
    .slice(0, 5)

  return NextResponse.json({
    today_revenue:  todayOrders?.reduce((s, o) => s + Number(o.total), 0) ?? 0,
    month_revenue:  monthOrders?.reduce((s, o) => s + Number(o.total), 0) ?? 0,
    today_orders:   todayOrders?.length ?? 0,
    pending_orders: pendingOrders?.length ?? 0,
    top_items,
  })
}
