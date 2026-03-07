'use client'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence }       from 'framer-motion'
import {
  ShoppingCart, Search, Plus, Minus, X,
  Clock, Leaf, Flame, Globe, ClipboardList, ChevronRight
} from 'lucide-react'

export default function MenuPage() {
  const [menu, setMenu]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [activeTab, setActiveTab] = useState('all')
  const [cart, setCart]           = useState([])
  const [cartOpen, setCartOpen]   = useState(false)
  const [orderType, setOrderType] = useState('pickup')
  const [tableNum, setTableNum]   = useState('')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes]         = useState('')
  const [placing, setPlacing]     = useState(false)
  const [orderDone, setOrderDone] = useState(null)
  const [ordersOpen, setOrdersOpen] = useState(false)

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(d => { setMenu(d.data || []); setLoading(false) })
  }, [])

  // Flatten all items for search + "All Items" view
  const allItems = useMemo(() => menu.flatMap(c => c.items.map(i => ({ ...i, categoryName: c.name }))), [menu])

  const filteredItems = useMemo(() => {
    const base = activeTab === 'all'
      ? allItems
      : allItems.filter(i => i.category_id === activeTab)
    if (!search.trim()) return base
    const q = search.toLowerCase()
    return base.filter(i => i.name.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q))
  }, [allItems, activeTab, search])

  function addToCart(item) {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id)
      if (ex) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function updateQty(id, delta) {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0))
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0)

  async function placeOrder() {
    if (!customerName.trim()) return alert('Please enter your name')
    if (orderType === 'dine_in' && !tableNum.trim()) return alert('Please enter table number')
    setPlacing(true)
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: orderType, table_number: tableNum || null,
        customer_name: customerName, kitchen_notes: notes || null,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })),
      }),
    })
    const data = await res.json()
    setPlacing(false)
    if (res.ok) { setOrderDone(data.data.order_number); setCart([]); setCartOpen(false) }
    else alert(data.error || 'Failed to place order')
  }

  // ── Order Success Screen ──────────────────────────────────────────────
  if (orderDone) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-lg">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">🎉</span>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Placed!</h2>
        <p className="text-gray-500 mb-3">Your order number</p>
        <p className="text-3xl font-mono font-bold text-amber-500 mb-2">{orderDone}</p>
        <p className="text-gray-400 text-sm mb-6">
          {orderType === 'dine_in' ? `We'll bring it to Table ${tableNum}` : 'Please collect at the counter when ready'}
        </p>
        <button onClick={() => setOrderDone(null)} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all">
          Order More
        </button>
      </motion.div>
    </div>
  )

  // ── Main Menu ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50" style={{ colorScheme: 'light' }}>

      {/* Announcement Banner */}
      <div className="bg-amber-500 text-white text-center text-sm py-2.5 px-4 font-medium">
        🚚 Free delivery on orders over €30 &nbsp;|&nbsp; Use code: <strong>WELCOME10</strong> for 10% off your first order!
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-lg">🍽</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Our Menu</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setOrdersOpen(true)}
              className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 transition-all">
              <ClipboardList size={16} />
              My Orders
            </button>
            <button className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50">
              <Globe size={16} />
              EN
            </button>
            <button onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all">
              <ShoppingCart size={16} />
              Cart
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
            placeholder="Search for dishes..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap flex-shrink-0 transition-all
              ${activeTab === 'all' ? 'bg-amber-500 text-white shadow-sm' : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'}`}
          >
            All Items
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
            <p className="text-gray-500">No items found</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
          >
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
                    {/* Image */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {item.image_url ? (
                        <img src={item.image_url} alt={item.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      {/* Name + Price */}
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900 text-base leading-tight flex-1 pr-2">{item.name}</h3>
                        <span className="font-bold text-amber-500 text-base whitespace-nowrap">€{Number(item.price).toFixed(2)}</span>
                      </div>

                      {/* Badges */}
                      <div className="flex gap-1.5 mb-2 flex-wrap">
                        {item.is_veg && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600 border border-green-200 font-medium">
                            <Leaf size={11} /> Veg
                          </span>
                        )}
                        {item.is_spicy && (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200 font-medium">
                            <Flame size={11} /> Spicy
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {item.description && (
                        <p className="text-gray-500 text-xs leading-relaxed mb-2 line-clamp-2">{item.description}</p>
                      )}

                      {/* Prep time */}
                      {item.prep_time && (
                        <div className="flex items-center gap-1 text-xs text-gray-400 mb-3">
                          <Clock size={12} />
                          <span>Ready in ~{item.prep_time} mins</span>
                        </div>
                      )}

                      {/* Add to cart */}
                      {inCart ? (
                        <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                          <button onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center hover:bg-amber-600 transition-all">
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-amber-600">{inCart.qty} in cart</span>
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
                          <Plus size={16} /> Add to Cart
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

      {/* ── Cart Drawer ───────────────────────────────────────────────── */}
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
              <div className="flex justify-between items-center px-5 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900">Your Order</h2>
                <button onClick={() => setCartOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-12">
                    <ShoppingCart size={40} className="text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400">Your cart is empty</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3 py-2 border-b border-gray-50">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 text-sm">{item.name}</p>
                        <p className="text-amber-500 font-semibold text-sm">€{(item.price * item.qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50">
                          <Minus size={12} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold text-gray-800">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-7 h-7 rounded-lg bg-amber-500 flex items-center justify-center text-white hover:bg-amber-600">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="px-5 py-4 border-t bg-gray-50 space-y-3">
                  {/* Order Type */}
                  <div className="flex gap-2">
                    {['pickup', 'dine_in'].map(t => (
                      <button key={t} onClick={() => setOrderType(t)}
                        className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all
                          ${orderType === t ? 'bg-amber-500 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                        {t === 'pickup' ? '🥡 Pickup' : '🪑 Dine In'}
                      </button>
                    ))}
                  </div>

                  <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                    placeholder="Your name *" value={customerName} onChange={e => setCustomerName(e.target.value)} />

                  {orderType === 'dine_in' && (
                    <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                      placeholder="Table number *" value={tableNum} onChange={e => setTableNum(e.target.value)} />
                  )}

                  <input className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
                    placeholder="Kitchen notes (optional)" value={notes} onChange={e => setNotes(e.target.value)} />

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-gray-600 font-medium">Total</span>
                    <span className="text-xl font-bold text-amber-500">€{totalPrice.toFixed(2)}</span>
                  </div>

                  <button onClick={placeOrder} disabled={placing}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                    {placing ? 'Placing order...' : <><span>Place Order</span><ChevronRight size={16} /></>}
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
