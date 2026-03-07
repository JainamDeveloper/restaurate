'use client'
import { useEffect, useState } from 'react'
import { useRouter }            from 'next/navigation'
import { motion }               from 'framer-motion'
import { Clock, Truck, UtensilsCrossed, Star, ChevronRight, MapPin, Phone } from 'lucide-react'
import CustomerHeader           from '@/components/customer/CustomerHeader'

const HERO = 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=1600&fit=crop'

export default function HomePage() {
  const router  = useRouter()
  const [lang, setLang]         = useState('en')
  const [featured, setFeatured] = useState([])

  useEffect(() => {
    const l = localStorage.getItem('restaurate_lang')
    if (l === 'de' || l === 'en') setLang(l)
    fetch('/api/menu').then(r => r.json()).then(d => {
      const all = (d.data || []).flatMap(c => c.items)
      setFeatured(all.filter(i => i.image_url).slice(0, 4))
    })
  }, [])

  function toggleLang() {
    const next = lang === 'en' ? 'de' : 'en'
    setLang(next)
    localStorage.setItem('restaurate_lang', next)
  }

  const tx = {
    en: {
      badge: 'Now Open', tagline: 'Authentic German Cuisine',
      sub: 'Fresh ingredients · Traditional recipes · Delivered to your table',
      cta: 'Order Now', menu: 'View Menu',
      f1t: 'Online Ordering', f1d: 'Order online for pickup, dine-in or delivery.',
      f2t: 'Fast Delivery',   f2d: 'Free delivery on orders over €30 within 5 km.',
      f3t: 'Opening Hours',   f3d: 'Mon–Wed & Fri 11–22 · Thu Closed · Sat–Sun 11–23',
      f4t: 'Top Rated',       f4d: 'Loved by locals. Authentic flavours every time.',
      promo: 'Free Delivery on Orders over €30',
      promoSub: 'Use code WELCOME10 for 10% off your first order!',
      featured: 'Featured Dishes', viewAll: 'View all',
      addCart: 'Add to Cart',
      addr: 'Musterstraße 1, 80331 München', phone: '+49 89 123456',
      copy: '© 2025 Restaurate. All rights reserved.',
    },
    de: {
      badge: 'Jetzt geöffnet', tagline: 'Authentische Deutsche Küche',
      sub: 'Frische Zutaten · Traditionelle Rezepte · Direkt an Ihren Tisch',
      cta: 'Jetzt Bestellen', menu: 'Speisekarte',
      f1t: 'Online Bestellen', f1d: 'Online bestellen zur Abholung, Tisch oder Lieferung.',
      f2t: 'Schnelle Lieferung', f2d: 'Kostenlose Lieferung ab €30 innerhalb von 5 km.',
      f3t: 'Öffnungszeiten',    f3d: 'Mo–Mi & Fr 11–22 · Do Geschlossen · Sa–So 11–23',
      f4t: 'Top Bewertet',      f4d: 'Von Einheimischen geliebt. Authentische Aromen.',
      promo: 'Kostenlose Lieferung ab €30',
      promoSub: 'Code WELCOME10 für 10% Rabatt auf Ihre erste Bestellung!',
      featured: 'Empfohlene Gerichte', viewAll: 'Alle ansehen',
      addCart: 'In den Warenkorb',
      addr: 'Musterstraße 1, 80331 München', phone: '+49 89 123456',
      copy: '© 2025 Restaurate. Alle Rechte vorbehalten.',
    },
  }[lang]

  const features = [
    { icon: <UtensilsCrossed size={26} />, title: tx.f1t, desc: tx.f1d, cls: 'bg-amber-50 text-amber-600' },
    { icon: <Truck           size={26} />, title: tx.f2t, desc: tx.f2d, cls: 'bg-blue-50  text-blue-600'  },
    { icon: <Clock           size={26} />, title: tx.f3t, desc: tx.f3d, cls: 'bg-green-50 text-green-600' },
    { icon: <Star            size={26} />, title: tx.f4t, desc: tx.f4d, cls: 'bg-rose-50  text-rose-600'  },
  ]

  return (
    <div className="min-h-screen bg-gray-50" style={{ colorScheme: 'light' }}>
      <CustomerHeader lang={lang} onLangToggle={toggleLang} />

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative h-[85vh] min-h-[480px] max-h-[720px] overflow-hidden">
        <img src={HERO} alt="Food" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-transparent" />
        <div className="relative z-10 h-full flex flex-col justify-center max-w-7xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}
            className="max-w-xl">
            <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {tx.badge}
            </span>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight">{tx.tagline}</h1>
            <p className="text-gray-300 text-lg mb-8 leading-relaxed">{tx.sub}</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={() => router.push('/menu')}
                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg shadow-amber-500/30 transition-all active:scale-95">
                {tx.cta} <ChevronRight size={16} />
              </button>
              <button onClick={() => router.push('/menu')}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all">
                {tx.menu}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.cls}`}>{f.icon}</div>
              <h3 className="font-bold text-gray-900 mb-1.5">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Promo Banner ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 pb-10">
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
          className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-500 p-8 md:p-10">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-amber-100 text-sm font-medium mb-1">{lang === 'de' ? 'Sonderangebot' : 'Special Offer'}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1.5">{tx.promo}</h2>
              <p className="text-amber-100 text-sm">{tx.promoSub}</p>
            </div>
            <button onClick={() => router.push('/menu')}
              className="flex-shrink-0 bg-white text-amber-600 font-bold px-7 py-3.5 rounded-xl hover:bg-amber-50 transition-all text-sm shadow-lg">
              {tx.cta}
            </button>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 pointer-events-none" />
        </motion.div>
      </section>

      {/* ── Featured Dishes ───────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">{tx.featured}</h2>
            <button onClick={() => router.push('/menu')}
              className="flex items-center gap-1 text-amber-500 hover:text-amber-600 font-semibold text-sm">
              {tx.viewAll} <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {featured.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-44 overflow-hidden bg-gray-100">
                  <img src={item.image_url} alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-gray-900 text-sm leading-tight flex-1 pr-2">{item.name}</h3>
                    <span className="font-bold text-amber-500 text-sm">€{Number(item.price).toFixed(2)}</span>
                  </div>
                  <button onClick={() => router.push('/menu')}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold py-2 rounded-xl transition-all">
                    {tx.addCart}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🍽</span>
            </div>
            <span className="font-bold text-gray-900">Restaurate</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1.5"><MapPin size={14} /> {tx.addr}</span>
            <span className="flex items-center gap-1.5"><Phone size={14} /> {tx.phone}</span>
          </div>
          <p className="text-xs text-gray-400">{tx.copy}</p>
        </div>
      </footer>
    </div>
  )
}
