'use client'
import { useEffect, useState } from 'react'
import { motion }              from 'framer-motion'

export default function DashboardPage() {
  const [stats, setStats]     = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res  = await fetch('/api/admin/analytics')
        const data = await res.json()
        setStats(data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const cards = [
    { label: "Today's Revenue",  value: `€${stats?.today_revenue?.toFixed(2) ?? '0.00'}`, color: 'text-green-400',  icon: '💰' },
    { label: 'Monthly Revenue',  value: `€${stats?.month_revenue?.toFixed(2) ?? '0.00'}`, color: 'text-blue-400',   icon: '📈' },
    { label: "Today's Orders",   value: stats?.today_orders  ?? 0,                         color: 'text-orange-400', icon: '🧾' },
    { label: 'Pending Orders',   value: stats?.pending_orders ?? 0,                        color: 'text-red-400',    icon: '⏳' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{card.icon}</span>
              {loading && <span className="text-slate-500 text-xs">loading...</span>}
            </div>
            <p className={`text-3xl font-bold ${card.color}`}>{card.value}</p>
            <p className="text-slate-400 text-sm mt-1">{card.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Top items */}
      <div className="card p-6">
        <h2 className="font-semibold mb-4">Top Selling Items</h2>
        {loading ? (
          <div className="text-slate-400 text-sm">Loading...</div>
        ) : stats?.top_items?.length ? (
          <div className="space-y-3">
            {stats.top_items.map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <span className="text-slate-500 text-sm w-5">{i + 1}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{item.item_name}</p>
                  <div className="h-1.5 bg-slate-700 rounded-full mt-1.5">
                    <div
                      className="h-full bg-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(item.total_qty / stats.top_items[0].total_qty) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-slate-400 text-sm">{item.total_qty} sold</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">No orders yet.</p>
        )}
      </div>
    </div>
  )
}
