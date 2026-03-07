'use client'
import { useState, useEffect } from 'react'
import { useRouter }           from 'next/navigation'
import { Upload, X, Save, Loader2, Trash2 } from 'lucide-react'

export default function MenuItemForm({ item }) {
  const router = useRouter()
  const isEdit = !!item

  const [name,        setName]        = useState(item?.name        ?? '')
  const [categoryId,  setCategoryId]  = useState(item?.category_id ?? '')
  const [price,       setPrice]       = useState(item?.price       ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [isVeg,       setIsVeg]       = useState(item?.is_veg      ?? false)
  const [isSpicy,     setIsSpicy]     = useState(item?.is_spicy    ?? false)
  const [prepTime,    setPrepTime]    = useState(item?.prep_time   ?? '')
  const [isAvailable, setIsAvailable] = useState(item?.is_available ?? true)
  const [imageUrl,    setImageUrl]    = useState(item?.image_url   ?? '')
  const [preview,     setPreview]     = useState(item?.image_url   ?? '')
  const [categories,  setCategories]  = useState([])
  const [uploading,   setUploading]   = useState(false)
  const [saving,      setSaving]      = useState(false)
  const [deleting,    setDeleting]    = useState(false)

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(d => setCategories((d.data || []).map(c => ({ id: c.id, name: c.name }))))
  }, [])

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res  = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) { setImageUrl(data.url); setPreview(data.url) }
    else alert(data.error || 'Upload failed')
  }

  async function handleSave() {
    if (!name.trim())  return alert('Name is required')
    if (!categoryId)   return alert('Please select a category')
    if (!price)        return alert('Price is required')

    setSaving(true)
    const body = {
      name, category_id: categoryId, price: parseFloat(price),
      description: description || null,
      is_veg: isVeg, is_spicy: isSpicy,
      prep_time: prepTime ? parseInt(prepTime) : null,
      is_available: isAvailable,
      image_url: imageUrl || null,
    }

    const res  = await fetch(
      isEdit ? `/api/admin/menu-items/${item.id}` : '/api/admin/menu-items',
      { method: isEdit ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }
    )
    const data = await res.json()
    setSaving(false)
    if (res.ok) router.push('/admin/menu')
    else alert(data.error || 'Save failed')
  }

  async function handleDelete() {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    setDeleting(true)
    await fetch(`/api/admin/menu-items/${item.id}`, { method: 'DELETE' })
    router.push('/admin/menu')
  }

  return (
    <div className="max-w-2xl space-y-6">

      {/* Image Upload Card */}
      <div className="card p-5">
        <p className="text-sm text-slate-400 mb-3 font-medium">Product Image</p>

        {preview ? (
          <div className="relative w-full h-56 rounded-xl overflow-hidden mb-4">
            <img src={preview} alt="preview" className="w-full h-full object-cover" />
            <button
              onClick={() => { setImageUrl(''); setPreview('') }}
              className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-all"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <label className="block w-full h-48 border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-xl flex flex-col items-center justify-center mb-4 text-slate-500 cursor-pointer transition-colors group">
            <Upload size={30} className="mb-2 text-slate-600 group-hover:text-slate-400 transition-colors" />
            <p className="text-sm">Click to upload image</p>
            <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP up to 5 MB</p>
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        )}

        <label className="btn-secondary text-sm cursor-pointer inline-flex items-center gap-2 py-2 px-4">
          {uploading
            ? <><Loader2 size={14} className="animate-spin" /> Uploading...</>
            : <><Upload size={14} /> {preview ? 'Change Image' : 'Upload Image'}</>}
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
        </label>
      </div>

      {/* Fields Card */}
      <div className="card p-6 space-y-5">

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Name *</label>
            <input className="input" placeholder="e.g. Schnitzel"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm text-slate-400 mb-1.5">Price (€) *</label>
            <input className="input" type="number" step="0.01" min="0" placeholder="0.00"
              value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Category *</label>
          <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)}>
            <option value="">Select category…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Description</label>
          <textarea className="input resize-none h-24" placeholder="Short description shown on menu card…"
            value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm text-slate-400 mb-1.5">Prep Time (minutes)</label>
          <input className="input" type="number" min="1" placeholder="e.g. 15"
            value={prepTime} onChange={e => setPrepTime(e.target.value)} />
        </div>

        <div className="flex flex-wrap gap-6 pt-1">
          {[
            { label: 'Vegetarian', checked: isVeg,       set: setIsVeg,       accent: 'accent-green-500' },
            { label: 'Spicy',      checked: isSpicy,     set: setIsSpicy,     accent: 'accent-red-500'   },
            { label: 'Available',  checked: isAvailable, set: setIsAvailable, accent: 'accent-orange-500'},
          ].map(({ label, checked, set, accent }) => (
            <label key={label} className="flex items-center gap-2.5 cursor-pointer select-none">
              <input type="checkbox" checked={checked} onChange={e => set(e.target.checked)}
                className={`w-4 h-4 ${accent}`} />
              <span className="text-sm text-slate-300">{label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button onClick={handleSave} disabled={saving || uploading}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Item'}
        </button>
        <button onClick={() => router.push('/admin/menu')} className="btn-secondary">
          Cancel
        </button>
        {isEdit && (
          <button onClick={handleDelete} disabled={deleting}
            className="ml-auto flex items-center gap-2 text-red-400 hover:text-red-300 text-sm disabled:opacity-50 transition-colors">
            <Trash2 size={15} />
            {deleting ? 'Deleting…' : 'Delete Item'}
          </button>
        )}
      </div>
    </div>
  )
}
