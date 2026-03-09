'use client'
import { useEffect, useState } from 'react'
import { motion }              from 'framer-motion'
import { Pencil, ToggleLeft, ToggleRight, Plus, Trash2 } from 'lucide-react'
import Link                    from 'next/link'

export default function MenuPage() {
  const [menu, setMenu]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')

  async function loadMenu() {
    const res  = await fetch('/api/admin/menu-items')
    const data = await res.json()
    setMenu(data.data || [])
    setLoading(false)
  }

  useEffect(() => { loadMenu() }, [])

  async function toggleItem(itemId, currentVal) {
    await fetch(`/api/admin/menu-items/${itemId}`, {
      method:  'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ is_available: !currentVal }),
    })
    loadMenu()
  }

  async function deleteItem(itemId) {
    if (!confirm('Delete this item?')) return
    await fetch(`/api/admin/menu-items/${itemId}`, { method: 'DELETE' })
    loadMenu()
  }

  const filtered = menu.map(cat => ({
    ...cat,
    items: cat.items.filter(i =>
      i.name.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Items</h1>
        <Link href="/admin/menu/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Item
        </Link>
      </div>

      <input
        type="search"
        placeholder="Search items..."
        className="input mb-6 max-w-sm"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {loading ? (
        <p className="text-slate-400">Loading...</p>
      ) : (
        filtered.map((cat, ci) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ci * 0.05 }}
            className="mb-6"
          >
            <h2 className="text-xs uppercase tracking-widest text-slate-500 mb-2 font-semibold">
              {cat.name}
            </h2>
            <div className="card overflow-hidden">
              {cat.items.map((item, i) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-4 p-4 ${i < cat.items.length - 1 ? 'border-b border-slate-700' : ''}`}
                >
                  {item.image && (
                    <img src={item.image} alt={item.name}
                         className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.name}</p>
                    <p className="text-orange-400 text-sm font-semibold">€{Number(item.price).toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleItem(item.id, item.is_available)}
                      className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all
                        ${item.is_available
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-slate-600/50 text-slate-500 border-slate-600'}`}
                    >
                      {item.is_available
                        ? <><ToggleRight size={14} /> Available</>
                        : <><ToggleLeft  size={14} /> Disabled</>}
                    </button>
                    <Link href={`/admin/menu/${item.id}`}
                          className="text-slate-400 hover:text-white transition-colors">
                      <Pencil size={15} />
                    </Link>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="text-slate-400 hover:text-red-400 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))
      )}
    </div>
  )
}
