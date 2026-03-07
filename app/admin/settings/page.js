'use client'
import { useEffect, useState } from 'react'
import { Save, Loader2, AlertCircle } from 'lucide-react'

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
const DAYS_DE = ['Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag','Sonntag']

export default function SettingsPage() {
  const [hours,   setHours]   = useState(null)
  const [saving,  setSaving]  = useState(false)
  const [saved,   setSaved]   = useState(false)
  const [dbError, setDbError] = useState(false)

  useEffect(() => {
    fetch('/api/settings/opening-hours')
      .then(r => r.json())
      .then(d => setHours(d.data || []))
  }, [])

  function updateDay(i, field, val) {
    setHours(prev => prev.map((h, idx) => idx === i ? { ...h, [field]: val } : h))
  }

  async function handleSave() {
    setSaving(true)
    setSaved(false)
    const res = await fetch('/api/admin/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'opening_hours', value: hours }),
    })
    setSaving(false)
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000) }
    else {
      const d = await res.json()
      if (d.error?.includes('schema cache') || d.error?.includes('does not exist')) {
        setDbError(true)
      } else {
        alert(d.error || 'Save failed')
      }
    }
  }

  if (!hours) return <p className="text-slate-400">Loading…</p>

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Opening Hours</h1>
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Changes'}
        </button>
      </div>

      {dbError && (
        <div className="card p-4 mb-6 border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 flex gap-3 items-start">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold mb-1">Database table not set up yet.</p>
            <p>Run this in your <strong>Supabase SQL Editor</strong> to enable saving:</p>
            <pre className="bg-black/30 rounded p-2 mt-2 text-xs overflow-x-auto">{`create table if not exists restaurant_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz default now()
);`}</pre>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        {hours.map((h, i) => (
          <div key={h.day}
            className={`flex items-center gap-4 p-4 ${i < hours.length - 1 ? 'border-b border-slate-700' : ''}`}>

            {/* Day name */}
            <div className="w-28 flex-shrink-0">
              <p className="font-medium text-sm">{DAYS[i]}</p>
              <p className="text-xs text-slate-500">{DAYS_DE[i]}</p>
            </div>

            {/* Closed toggle */}
            <label className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <div className="relative">
                <input type="checkbox" className="sr-only" checked={!!h.closed}
                  onChange={e => updateDay(i, 'closed', e.target.checked)} />
                <div className={`w-10 h-5 rounded-full transition-colors ${h.closed ? 'bg-red-500/60' : 'bg-green-500/60'}`} />
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${h.closed ? 'left-0.5' : 'left-5'}`} />
              </div>
              <span className={`text-xs font-medium ${h.closed ? 'text-red-400' : 'text-green-400'}`}>
                {h.closed ? 'Closed' : 'Open'}
              </span>
            </label>

            {/* Time inputs */}
            <div className={`flex items-center gap-2 flex-1 ${h.closed ? 'opacity-30 pointer-events-none' : ''}`}>
              <input
                type="time" value={h.open || '11:00'}
                onChange={e => updateDay(i, 'open', e.target.value)}
                className="input py-1.5 text-sm w-32"
              />
              <span className="text-slate-500 text-sm">–</span>
              <input
                type="time" value={h.close || '22:00'}
                onChange={e => updateDay(i, 'close', e.target.value)}
                className="input py-1.5 text-sm w-32"
              />
              <span className="text-slate-500 text-xs">Uhr</span>
            </div>
          </div>
        ))}
      </div>

      <p className="text-slate-500 text-xs mt-4">
        Changes are reflected immediately on the customer-facing menu and home page.
      </p>
    </div>
  )
}
