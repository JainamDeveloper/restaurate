'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, Check, X, ToggleLeft, ToggleRight, GripVertical } from 'lucide-react'

export default function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading]       = useState(true)
  const [editingId, setEditingId]   = useState(null)
  const [editName, setEditName]     = useState('')
  const [newName, setNewName]       = useState('')
  const [adding, setAdding]         = useState(false)
  const [saving, setSaving]         = useState(false)

  async function load() {
    const res  = await fetch('/api/admin/categories')
    const data = await res.json()
    setCategories(data.data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function saveEdit(id) {
    if (!editName.trim()) return
    setSaving(true)
    await fetch(`/api/admin/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName.trim() }),
    })
    setSaving(false)
    setEditingId(null)
    load()
  }

  async function toggleActive(cat) {
    await fetch(`/api/admin/categories/${cat.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !cat.is_active }),
    })
    load()
  }

  async function deleteCategory(cat) {
    if (!confirm(`Delete "${cat.name}"?`)) return
    const res  = await fetch(`/api/admin/categories/${cat.id}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { alert(data.error); return }
    load()
  }

  async function addCategory() {
    if (!newName.trim()) return
    setSaving(true)
    await fetch('/api/admin/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    setSaving(false)
    setNewName('')
    setAdding(false)
    load()
  }

  return (
    <div className="max-w-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button onClick={() => setAdding(true)}
          className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Category
        </button>
      </div>

      {/* Add new row */}
      <AnimatePresence>
        {adding && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="card p-4 mb-4 flex items-center gap-3">
            <GripVertical size={16} className="text-slate-600" />
            <input autoFocus className="input flex-1 py-2 text-sm" placeholder="Category name…"
              value={newName} onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') addCategory(); if (e.key === 'Escape') setAdding(false) }} />
            <button onClick={addCategory} disabled={saving || !newName.trim()}
              className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center disabled:opacity-40">
              <Check size={15} />
            </button>
            <button onClick={() => { setAdding(false); setNewName('') }}
              className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 flex items-center justify-center">
              <X size={15} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <p className="text-slate-400">Loading…</p>
      ) : categories.length === 0 ? (
        <div className="card p-10 text-center text-slate-500">No categories yet.</div>
      ) : (
        <div className="card overflow-hidden">
          {categories.map((cat, i) => (
            <motion.div key={cat.id} layout
              className={`flex items-center gap-3 px-4 py-3.5 ${i < categories.length - 1 ? 'border-b border-slate-700' : ''}`}>

              <GripVertical size={16} className="text-slate-600 flex-shrink-0" />

              {/* Name / edit */}
              <div className="flex-1 min-w-0">
                {editingId === cat.id ? (
                  <input autoFocus className="input py-1.5 text-sm w-full max-w-xs"
                    value={editName} onChange={e => setEditName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(cat.id); if (e.key === 'Escape') setEditingId(null) }} />
                ) : (
                  <p className="font-medium text-sm">{cat.name}</p>
                )}
              </div>

              {/* Item count badge */}
              <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">
                {cat.item_count ?? '—'} items
              </span>

              {/* Active toggle */}
              <button onClick={() => toggleActive(cat)}
                className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all
                  ${cat.is_active
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-slate-600/50 text-slate-500 border-slate-600'}`}>
                {cat.is_active ? <><ToggleRight size={13} /> Active</> : <><ToggleLeft size={13} /> Hidden</>}
              </button>

              {/* Edit / save / delete */}
              {editingId === cat.id ? (
                <>
                  <button onClick={() => saveEdit(cat.id)} disabled={saving}
                    className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 flex items-center justify-center">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)}
                    className="w-8 h-8 rounded-lg bg-slate-700 text-slate-400 hover:bg-slate-600 flex items-center justify-center">
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingId(cat.id); setEditName(cat.name) }}
                    className="w-8 h-8 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700 flex items-center justify-center transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteCategory(cat)}
                    className="w-8 h-8 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-colors">
                    <Trash2 size={14} />
                  </button>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <p className="text-slate-600 text-xs mt-4">
        Hidden categories won't appear on the customer menu. Categories with items cannot be deleted.
      </p>
    </div>
  )
}
