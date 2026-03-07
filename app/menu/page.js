'use client'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence }       from 'framer-motion'
import { useRouter }                     from 'next/navigation'
import {
  ShoppingCart, Search, Plus, Minus, X,
  Clock, Leaf, Flame, Globe, ClipboardList, Trash2
} from 'lucide-react'
import { translations } from '@/lib/i18n'

export default function MenuPage() {
  const router = useRouter()
  const [menu, setMenu]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [cart, setCart]           = useState([])
  const [cartLoaded, setCartLoaded] = useState(false)
  const [cartOpen, setCartOpen]   = useState(false)
  const [orderType, setOrderType] = useState('pickup')
  const [lang, setLang]           = useState('en')

  const t = translations[lang]

  // Load persisted cart + language from localStorage
  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('restaurate_cart') || '[]')
      const savedLang = localStorage.getItem('restaurate_lang')
      if (savedCart.length) setCart(savedCart)
      if (savedLang === 'de' || savedLang === 'en') setLang(savedLang)
      const savedType = localStorage.getItem('restaurate_order_type')
      if (savedType) setOrderType(savedType)
    } catch {}
    setCartLoaded(true)
  }, [])

  // Persist cart to localStorage
  useEffect(() => {
    if (!cartLoaded) return
    localStorage.setItem('restaurate_cart', JSON.stringify(cart))
  }, [cart, cartLoaded])

  // Persist order type
  useEffect(() => {
    localStorage.setItem('restaurate_order_type', orderType)
  }, [orderType])

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(d => { setMenu(d.data || []); setLoading(false) })
  }, [])

  const allItems = useMemo(
    () => menu.flatMap(c => c.items.map(i => ({ ...i, categoryName: c.name }))),
    [menu]
  )

  const filteredItems = useMemo(() => {
    const base = activeTab === 'all'
      ? allItems
      : allItems.filter(i => i.category_id === activeTab)
    if (!search.trim()) return base
    const q = search.toLowerCase()
    return base.filter(i =>
      i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)
    )
  }, [allItems, activeTab, search])

  function addToCart(item) {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id)
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function updateQty(id, delta) {
    setCart(prev =>
      prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0)
    )
  }

  function removeFromCart(id) {
    setCart(prev => prev.filter(i => i.id !== id))
  }

  function toggleLang() {
    const next = lang === 'en' ? 'de' : 'en'
    setLang(next)
    localStorage.setItem('restaurate_lang', next)
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const subtotal   = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const tax        = subtotal * 0.07
  const deliveryFee = orderType === 'delivery' ? 2.50 : 0
  const total      = subtotal + tax + deliveryFee

  function goToCheckout() {
    setCartOpen(false)
    router.push('/checkout')
  }

  // ── Main Menu ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50" style={{ colorScheme: 'light' }}>

      {/* Announcement Banner */}
      <div className="bg-amber-500 text-white text-center text-sm py-2.5 px-4 font-medium">
        {t.banner}
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🍽</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t.ourMenu}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all">
              <ClipboardList size={16} />
              {t.myOrders}
            </button>
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
            >
              <Globe size={15} />
              <span>{lang === 'en' ? 'EN' : 'DE'}</span>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400">{lang === 'en' ? 'DE' : 'EN'}</span>
            </button>
            {/* Cart Button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            >
              <ShoppingCart size={16} />
              {t.cart}
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">

        {/* Search */}
        <div className="relative mb-6">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all
              ${activeTab === 'all' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'}`}
          >
            {t.allItems}
          </button>
          {menu.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all
                ${activeTab === cat.id ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-full" />
                  <div className="h-10 bg-gray-200 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-gray-500">{t.noItemsFound}</p>
          </div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {filteredItems.map(item => {
                const inCart = cart.find(i => i.id === item.id)
                return (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-100"
                  >
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                      )}
                    </div>

                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 pr-2">{item.name}</h3>
                        <span className="font-bold text-amber-500 text-base whitespace-nowrap">€{Number(item.price).toFixed(2)}</span>
                      </div>

                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        {item.is_veg && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium">
                            <Leaf size={11} /> {t.veg}
                          </span>
                        )}
                        {item.is_spicy && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 font-medium">
                            <Flame size={11} /> {t.spicy}
                          </span>
                        )}
                      </div>

                      {item.description && (
                        <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">{item.description}</p>
                      )}

                      {item.prep_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                          <Clock size={12} />
                          <span>{t.readyIn(item.prep_time)}</span>
                        </div>
                      )}

                      {inCart ? (
                        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <button onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-all">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-amber-600 text-sm">{t.inCart(inCart.qty)}</span>
                          <button onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-all">
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-semibold py-2.5 rounded-xl text-sm transition-all"
                        >
                          <Plus size={16} /> {t.addToCart}
                        </button>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Cart Drawer ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-50" onClick={() => setCartOpen(false)} />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl"
            >
              {/* Cart Header */}
              <div className="flex justify-between items-center px-5 py-4 border-b">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={20} className="text-amber-500" />
                  <h2 className="text-lg font-bold text-gray-900">{t.yourCart}</h2>
                  {totalItems > 0 && (
                    <span className="bg-amber-100 text-amber-600 text-xs font-bold px-2 py-0.5 rounded-full">
                      {totalItems}
                    </span>
                  )}
                </div>
                <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Order Type Tabs */}
              <div className="px-5 pt-4 pb-2 flex gap-2">
                {[
                  { key: 'pickup',   label: t.pickup },
                  { key: 'dine_in',  label: t.dineIn },
                  { key: 'delivery', label: t.delivery },
                ].map(({ key, label }) => (
                  <button key={key} onClick={() => setOrderType(key)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all
                      ${orderType === key ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    {label}
                  </button>
                ))}
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={44} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 text-sm">{t.cartEmpty}</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-3 border-b border-gray-50">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-400">€{Number(item.price).toFixed(2)} × {item.qty}</p>
                        <p className="text-amber-500 font-bold text-sm">€{(item.price * item.qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white hover:bg-amber-600">
                          <Plus size={12} />
                        </button>
                        <button onClick={() => removeFromCart(item.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 ml-1">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Cart Footer */}
              {cart.length > 0 && (
                <div className="px-5 py-4 border-t bg-gray-50 space-y-2.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{t.subtotal}</span>
                    <span>€{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{t.tax}</span>
                    <span>€{tax.toFixed(2)}</span>
                  </div>
                  {orderType === 'delivery' && (
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>{t.deliveryFee}</span>
                      <span>€{deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center pt-1 border-t border-gray-200">
                    <span className="font-bold text-gray-800">{t.total}</span>
                    <span className="text-xl font-bold text-amber-500">€{total.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={goToCheckout}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    {t.proceedToCheckout} →
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
