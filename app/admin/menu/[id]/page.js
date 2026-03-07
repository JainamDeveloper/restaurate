'use client'
import { useEffect, useState } from 'react'
import { useParams }           from 'next/navigation'
import MenuItemForm            from '@/components/admin/MenuItemForm'

export default function EditMenuItemPage() {
  const { id }        = useParams()
  const [item, setItem]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(d => {
        const all  = (d.data || []).flatMap(c => c.items)
        const found = all.find(i => String(i.id) === String(id))
        setItem(found || null)
        setLoading(false)
      })
  }, [id])

  if (loading) return <p className="text-slate-400">Loading…</p>
  if (!item)   return <p className="text-red-400">Item not found.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit: {item.name}</h1>
      <MenuItemForm item={item} />
    </div>
  )
}
