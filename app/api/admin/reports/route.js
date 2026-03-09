import { NextResponse }              from 'next/server'
import { supabaseAdmin }             from '@/lib/supabase'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = await createSupabaseServerClient()
  const { data: _authData, error: _authErr } = await supabase.auth.getUser()
  const user = _authData?.user
  if (_authErr || !user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now        = new Date()
  const today      = now.toISOString().split('T')[0]
  const weekStart  = new Date(now); weekStart.setDate(now.getDate() - 6); const weekStartISO = weekStart.toISOString().split('T')[0]
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const yearStart  = new Date(now.getFullYear(), 0, 1).toISOString()

  const [
    { data: allOrders },
    { data: allItems },
  ] = await Promise.all([
    supabaseAdmin.from('orders').select('id, total, status, type, created_at').order('created_at', { ascending: false }),
    supabaseAdmin.from('order_items').select('item_name, quantity, price'),
  ])

  const orders = allOrders || []
  const items  = allItems  || []

  const completed = orders.filter(o => o.status === 'completed')

  function revenue(list) { return list.reduce((s, o) => s + Number(o.total), 0) }

  // Revenue periods
  const todayCompleted  = completed.filter(o => o.created_at.startsWith(today))
  const weekCompleted   = completed.filter(o => o.created_at >= weekStartISO)
  const monthCompleted  = completed.filter(o => o.created_at >= monthStart)
  const yearCompleted   = completed.filter(o => o.created_at >= yearStart)

  // Last 7 days breakdown
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now); d.setDate(now.getDate() - (6 - i))
    const dateStr = d.toISOString().split('T')[0]
    const dayOrders = completed.filter(o => o.created_at.startsWith(dateStr))
    return {
      date:    dateStr,
      label:   d.toLocaleDateString('en-DE', { weekday: 'short', day: 'numeric' }),
      revenue: revenue(dayOrders),
      orders:  dayOrders.length,
    }
  })

  // Orders by type
  const byType = ['pickup', 'dine_in', 'delivery'].map(t => ({
    type:  t,
    count: orders.filter(o => o.type === t).length,
  }))

  // Orders by status
  const byStatus = ['new', 'preparing', 'ready', 'completed', 'cancelled'].map(s => ({
    status: s,
    count:  orders.filter(o => o.status === s).length,
  }))

  // Top items
  const itemMap = {}
  items.forEach(row => {
    if (!itemMap[row.item_name]) itemMap[row.item_name] = { qty: 0, revenue: 0 }
    itemMap[row.item_name].qty     += row.quantity
    itemMap[row.item_name].revenue += Number(row.price) * row.quantity
  })
  const topItems = Object.entries(itemMap)
    .map(([name, v]) => ({ name, qty: v.qty, revenue: v.revenue }))
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 8)

  // Recent completed orders
  const recentOrders = completed.slice(0, 10).map(o => ({
    id:         o.id,
    total:      o.total,
    type:       o.type,
    created_at: o.created_at,
  }))

  return NextResponse.json({
    summary: {
      today_revenue: revenue(todayCompleted),   today_orders:  todayCompleted.length,
      week_revenue:  revenue(weekCompleted),    week_orders:   weekCompleted.length,
      month_revenue: revenue(monthCompleted),   month_orders:  monthCompleted.length,
      year_revenue:  revenue(yearCompleted),    year_orders:   yearCompleted.length,
      total_orders:  orders.length,
    },
    last7,
    byType,
    byStatus,
    topItems,
    recentOrders,
  })
}
