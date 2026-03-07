'use client'
import { useEffect, useState }      from 'react'
import { motion, AnimatePresence }  from 'framer-motion'
import { X }                        from 'lucide-react'
import { OPENING_HOURS }            from '@/lib/opening-hours'

export default function OpeningHoursModal({ open, onClose, lang = 'en' }) {
  const [hours, setHours] = useState(OPENING_HOURS)

  useEffect(() => {
    if (!open) return
    fetch('/api/settings/opening-hours')
      .then(r => r.json())
      .then(d => { if (d.data) setHours(d.data) })
      .catch(() => {})
  }, [open])

  const today    = new Date().getDay()
  const map      = [6, 0, 1, 2, 3, 4, 5]
  const todayIdx = map[today]

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-amber-500">
                {lang === 'de' ? 'Öffnungszeiten' : 'Opening Hours'}
              </h2>
              <button onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {hours.map((h, i) => {
                const isToday = i === todayIdx
                return (
                  <div key={h.day}
                    className={`rounded-xl overflow-hidden border-2 ${isToday ? 'border-amber-400 shadow-md' : 'border-gray-100'}`}>
                    <div className={`px-3 py-2 text-center text-sm font-semibold text-white ${h.closed ? 'bg-gray-400' : 'bg-amber-500'}`}>
                      {lang === 'de' ? h.de : h.day}
                      {isToday && <span className="ml-1.5 text-xs bg-white/30 px-1.5 py-0.5 rounded-full">Today</span>}
                    </div>
                    <div className="px-3 py-3 text-center bg-white">
                      {h.closed ? (
                        <p className="text-sm text-gray-400 font-medium">{lang === 'de' ? 'Geschlossen' : 'Closed'}</p>
                      ) : (
                        <>
                          <p className="text-xs text-gray-400 mb-0.5">{lang === 'de' ? 'Öffnungszeiten' : 'Opening Hours'}</p>
                          <p className="text-sm font-semibold text-gray-800">{h.open} – {h.close} Uhr</p>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="text-center text-xs text-gray-400 mt-5">
              {lang === 'de' ? '* Zeiten können an Feiertagen variieren' : '* Hours may vary on public holidays'}
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
