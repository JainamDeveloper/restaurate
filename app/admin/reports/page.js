'use client'
import { useEffect, useState } from 'react'
import { motion }              from 'framer-motion'
import { TrendingUp, ShoppingBag, Calendar, Euro } from 'lucide-react'

const TYPE_LABELS   = { pickup: 'Pickup', dine_in: 'Dine In', delivery: 'Delivery' }
const STATUS_COLORS = {
  new:       'bg-red-500',
  preparing: 'bg-yellow-500',
  ready:     'bg-blue-500',
  completed: 'bg-green-500',
  cancelled: 'bg-slate-500',
}

export default function ReportsPage() {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [period,  setPeriod]  = useState('week') // today | week | month | year

  useEffect(() => {
    fetch('/api/admin/reports')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return <p className="text-slate-400">Loading reports…</p>
  if (!data)   return <p className="text-red-400">Failed to load reports.</p>

  const { summary, last7, byType, byStatus, topItems, recentOrders } = data

  const periodMap = {
    today: { revenue: summary.today_revenue, orders: summary.today_orders,  label: "Today" },
    week:  { revenue: summary.week_revenue,  orders: summary.week_orders,   label: "This Week" },
    month: { revenue: summary.month_revenue, orders: summary.month_orders,  label: "This Month" },
    year:  { revenue: summary.year_revenue,  orders: summary.year_orders,   label: "This Year"  },
  }
  const sel = periodMap[period]

  const maxRevenue = Math.max(...last7.map(d => d.revenue), 1)
  const maxQty     = Math.max(...topItems.map(i => i.qty), 1)
  const totalByType = byType.reduce((s, t) => s + t.count, 0) || 1
  const totalStatus = byStatus.reduce((s, t) => s + t.count, 0) || 1

  const summaryCards = [
    { label: 'Revenue',       value: `€${sel.revenue.toFixed(2)}`, icon: <Euro size={20} />,        color: 'text-green-400' },
    { label: 'Orders',        value: sel.orders,                   icon: <ShoppingBag size={20} />, color: 'text-orange-400' },
    { label: 'Total (all)',   value: summary.total_orders,         icon: <Calendar size={20} />,    color: 'text-blue-400'  },
    { label: 'Year Revenue',  value: `€${summary.year_revenue.toFixed(2)}`, icon: <TrendingUp size={20} />, color: 'text-purple-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports</h1>
        {/* Period selector */}
        <div className="flex gap-1 bg-slate-800 p-1 rounded-xl">
          {Object.entries(periodMap).map(([key, { label }]) => (
            <button key={key} onClick={() => setPeriod(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${period === key ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-slate-700 flex items-center justify-center ${c.color}`}>
                {c.icon}
              </div>
            </div>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-slate-400 text-xs mt-1">{c.label} · {sel.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart (last 7 days) */}
      <div className="card p-6">
        <h2 className="font-semibold mb-5 text-sm text-slate-300">Revenue — Last 7 Days</h2>
        <div className="flex items-end gap-2 h-36">
          {last7.map((d, i) => (
            <div key={d.date} className="flex-1 flex flex-col items-center gap-1.5">
              <span className="text-xs text-slate-500">
                {d.revenue > 0 ? `€${d.revenue.toFixed(0)}` : ''}
              </span>
              <motion.div
                initial={{ height: 0 }} animate={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
                transition={{ delay: i * 0.05, duration: 0.5 }}
                className="w-full bg-orange-500 rounded-t-md min-h-[3px]"
                style={{ height: `${(d.revenue / maxRevenue) * 100}%` }}
              />
              <span className="text-xs text-slate-500 whitespace-nowrap">{d.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Top Selling Items */}
        <div className="card p-6">
          <h2 className="font-semibold mb-4 text-sm text-slate-300">Top Selling Items</h2>
          {topItems.length === 0 ? (
            <p className="text-slate-500 text-sm">No orders yet.</p>
          ) : (
            <div className="space-y-3">
              {topItems.map((item, i) => (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-slate-600 text-xs w-4 text-right">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium truncate">{item.name}</span>
                      <span className="text-slate-400 flex-shrink-0 ml-2">{item.qty} sold</span>
                    </div>
                    <div className="h-1.5 bg-slate-700 rounded-full">
                      <motion.div initial={{ width: 0 }}
                        animate={{ width: `${(item.qty / maxQty) * 100}%` }}
                        transition={{ delay: i * 0.05, duration: 0.5 }}
                        className="h-full bg-orange-500 rounded-full" />
                    </div>
                  </div>
                  <span className="text-xs text-slate-500 w-16 text-right">€{item.revenue.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Orders by Type + Status */}
        <div className="space-y-6">
          {/* By Type */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4 text-sm text-slate-300">Orders by Type</h2>
            <div className="space-y-2.5">
              {byType.map(t => (
                <div key={t.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">{TYPE_LABELS[t.type] || t.type}</span>
                    <span className="text-slate-400">{t.count}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full">
                    <motion.div initial={{ width: 0 }}
                      animate={{ width: `${(t.count / totalByType) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-blue-500 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Status */}
          <div className="card p-6">
            <h2 className="font-semibold mb-4 text-sm text-slate-300">Orders by Status</h2>
            <div className="flex flex-wrap gap-2">
              {byStatus.filter(s => s.count > 0).map(s => (
                <div key={s.status} className="flex items-center gap-2 bg-slate-700/50 px-3 py-1.5 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${STATUS_COLORS[s.status]}`} />
                  <span className="text-sm capitalize text-slate-300">{s.status}</span>
                  <span className="text-sm font-bold text-white">{s.count}</span>
                </div>
              ))}
              {byStatus.every(s => s.count === 0) && (
                <p className="text-slate-500 text-sm">No orders yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Completed Orders */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4 text-sm text-slate-300">Recent Completed Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-slate-500 text-sm">No completed orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-slate-500 text-xs border-b border-slate-700">
                  <th className="text-left pb-2 font-medium">Order ID</th>
                  <th className="text-left pb-2 font-medium">Type</th>
                  <th className="text-left pb-2 font-medium">Date</th>
                  <th className="text-right pb-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recentOrders.map(o => (
                  <tr key={o.id} className="text-slate-300">
                    <td className="py-2.5 font-mono text-xs text-slate-500">{o.id.slice(0, 8)}…</td>
                    <td className="py-2.5 capitalize">{TYPE_LABELS[o.type] || o.type}</td>
                    <td className="py-2.5 text-slate-400">
                      {new Date(o.created_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="py-2.5 text-right text-orange-400 font-semibold">€{Number(o.total).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
