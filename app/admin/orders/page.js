'use client'
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence }           from 'framer-motion'

const STATUS_FLOW  = ['new', 'preparing', 'ready', 'completed']
const STATUS_LABEL = { new: 'New', preparing: 'Preparing', ready: 'Ready', completed: 'Completed' }
const STATUS_COLOR = {
  new:       'badge-new',
  preparing: 'badge-preparing',
  ready:     'badge-ready',
  completed: 'badge-completed',
}

export default function OrdersPage() {
  const [orders, setOrders]   = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  const fetchOrders = useCallback(async () => {
    const res  = await fetch('/api/orders')
    const data = await res.json()
    setOrders(data.data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchOrders()
    // Poll every 10 seconds for live updates
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  async function updateStatus(orderId, status) {
    setUpdating(orderId)
    await fetch(`/api/orders/${orderId}/status`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    })
    await fetchOrders()
    setUpdating(null)
  }

  function nextStatus(current) {
    const idx = STATUS_FLOW.indexOf(current)
    return idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  const active    = orders.filter(o => o.status !== 'completed')
  const completed = orders.filter(o => o.status === 'completed').slice(0, 5)

  if (loading) {
    return <div className="text-slate-400">Loading orders...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Live Orders</h1>
        <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1.5 rounded-full">
          Auto-refreshes every 10s
        </span>
      </div>

      {/* Kanban columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {['new', 'preparing', 'ready'].map(status => {
          const colOrders = active.filter(o => o.status === status)
          return (
            <div key={status} className="card p-4">
              <div className="flex items-center gap-2 mb-4">
                <span className={STATUS_COLOR[status] + ' badge'}>{STATUS_LABEL[status]}</span>
                <span className="text-slate-500 text-sm">({colOrders.length})</span>
              </div>

              <AnimatePresence>
                {colOrders.length === 0 && (
                  <p className="text-slate-600 text-sm text-center py-6">No orders</p>
                )}
                {colOrders.map(order => (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-700/50 border border-slate-600 rounded-xl p-4 mb-3"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-mono font-bold text-orange-400 text-sm">
                          #{order.order_number}
                        </p>
                        <p className="text-slate-300 text-sm">{order.customer_name}</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-600 px-2 py-1 rounded">
                        {order.type === 'dine_in' ? `Table ${order.table_number}` : 'Pickup'}
                      </span>
                    </div>

                    {/* Items */}
                    <ul className="text-sm text-slate-300 mb-3 space-y-1">
                      {order.order_items?.map((item, i) => (
                        <li key={i} className="flex justify-between">
                          <span>{item.quantity}× {item.item_name}</span>
                          <span className="text-slate-400">€{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>

                    {order.kitchen_notes && (
                      <p className="text-xs bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 px-2 py-1.5 rounded mb-3">
                        📝 {order.kitchen_notes}
                      </p>
                    )}

                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">€{order.total}</span>
                      {nextStatus(status) && (
                        <button
                          onClick={() => updateStatus(order.id, nextStatus(status))}
                          disabled={updating === order.id}
                          className="text-xs btn-primary py-1.5 px-3 disabled:opacity-50"
                        >
                          {updating === order.id ? '...' : `→ ${STATUS_LABEL[nextStatus(status)]}`}
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )
        })}
      </div>

      {/* Recent completed */}
      {completed.length > 0 && (
        <div className="card p-4">
          <h2 className="font-semibold mb-3 text-slate-400">Recently Completed</h2>
          <div className="space-y-2">
            {completed.map(order => (
              <div key={order.id} className="flex justify-between text-sm text-slate-500 py-2 border-b border-slate-700 last:border-0">
                <span className="font-mono">#{order.order_number}</span>
                <span>{order.customer_name}</span>
                <span>€{order.total}</span>
                <span className="badge-completed badge">Completed</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
