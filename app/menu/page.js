'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Plus, Minus, X, ChevronRight } from 'lucide-react'

export default function MenuPage() {
  const [menu, setMenu]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [activeTab, setActiveTab] = useState(null)
  const [cart, setCart]         = useState([])
  const [cartOpen, setCartOpen] = useState(false)
  const [orderType, setOrderType] = useState('pickup')
  const [tableNum, setTableNum] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [notes, setNotes]       = useState('')
  const [placing, setPlacing]   = useState(false)
  const [orderDone, setOrderDone] = useState(null)

  useEffect(() => {
    fetch('/api/menu')
      .then(r => r.json())
      .then(d => {
        const data = d.data || []
        setMenu(data)
        if (data.length) setActiveTab(data[0].id)
        setLoading(false)
      })
  }, [])

  function addToCart(item) {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id)
      if (existing) return prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
      return [...prev, { ...item, qty: 1 }]
    })
  }

  function updateQty(id, delta) {
    setCart(prev => prev
      .map(i => i.id === id ? { ...i, qty: i.qty + delta } : i)
      .filter(i => i.qty > 0)
    )
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0)
  const totalPrice = cart.reduce((s, i) => s + i.price * i.qty, 0)

  async function placeOrder() {
    if (!customerName.trim()) return alert('Please enter your name')
    if (orderType === 'dine_in' && !tableNum.trim()) return alert('Please enter table number')

    setPlacing(true)
    const res = await fetch('/api/orders', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type:           orderType,
        table_number:   tableNum || null,
        customer_name:  customerName,
        kitchen_notes:  notes || null,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })),
      }),
    })
    const data = await res.json()
    setPlacing(false)

    if (res.ok) {
      setOrderDone(data.data.order_number)
      setCart([])
      setCartOpen(false)
    } else {
      alert(data.error || 'Failed to place order')
    }
  }

  const activeCategory = menu.find(c => c.id === activeTab)

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-400">Loading menu...</div>
    </div>
  )

  if (orderDone) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="card p-8 text-center max-w-sm w-full"
      >
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold mb-2">Order Placed!</h2>
        <p className="text-slate-400 mb-4">Your order number is</p>
        <p className="text-3xl font-mono font-bold text-orange-400 mb-6">{orderDone}</p>
        <p className="text-slate-400 text-sm mb-6">
          {orderType === 'dine_in' ? `We'll bring it to Table ${tableNum}` : 'Please collect at the counter'}
        </p>
        <button onClick={() => setOrderDone(null)} className="btn-primary w-full">
          Order More
        </button>
      </motion.div>
    </div>
  )

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur border-b border-slate-700 px-4 py-3">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-orange-400 text-lg">Restaurate</span>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="relative btn-primary py-2 px-4 flex items-center gap-2"
          >
            <ShoppingCart size={18} />
            <span>Cart</span>
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {menu.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0
                ${activeTab === cat.id
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Items */}
        <AnimatePresence mode="wait">
          {activeCategory && (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {activeCategory.items.map(item => {
                const inCart = cart.find(i => i.id === item.id)
                return (
                  <div key={item.id} className="card p-4 flex items-center gap-4">
                    {item.image_url && (
                      <img src={item.image_url} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold">{item.name}</h3>
                      {item.description && (
                        <p className="text-slate-400 text-sm mt-0.5 line-clamp-2">{item.description}</p>
                      )}
                      <p className="text-orange-400 font-bold mt-1">€{Number(item.price).toFixed(2)}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {inCart ? (
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQty(item.id, -1)}
                            className="w-7 h-7 rounded-full bg-slate-600 flex items-center justify-center hover:bg-slate-500">
                            <Minus size={14} />
                          </button>
                          <span className="w-5 text-center font-bold">{inCart.qty}</span>
                          <button onClick={() => updateQty(item.id, 1)}
                            className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600">
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => addToCart(item)}
                          className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center hover:bg-orange-600 transition-all active:scale-90">
                          <Plus size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Cart Drawer */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-50"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-sm bg-slate-800 z-50 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-700">
                <h2 className="text-lg font-bold">Your Order</h2>
                <button onClick={() => setCartOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {cart.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">Cart is empty</p>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <p className="text-orange-400 text-sm">€{(item.price * item.qty).toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateQty(item.id, -1)}
                          className="w-6 h-6 rounded-full bg-slate-600 flex items-center justify-center">
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}
                          className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="p-4 border-t border-slate-700 space-y-3">
                  {/* Order type */}
                  <div className="flex gap-2">
                    {['pickup','dine_in'].map(t => (
                      <button key={t} onClick={() => setOrderType(t)}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all
                          ${orderType === t ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        {t === 'pickup' ? 'Pickup' : 'Dine In'}
                      </button>
                    ))}
                  </div>

                  <input className="input text-sm" placeholder="Your name *"
                    value={customerName} onChange={e => setCustomerName(e.target.value)} />

                  {orderType === 'dine_in' && (
                    <input className="input text-sm" placeholder="Table number *"
                      value={tableNum} onChange={e => setTableNum(e.target.value)} />
                  )}

                  <input className="input text-sm" placeholder="Notes for kitchen (optional)"
                    value={notes} onChange={e => setNotes(e.target.value)} />

                  <div className="flex justify-between items-center font-bold">
                    <span>Total</span>
                    <span className="text-orange-400 text-lg">€{totalPrice.toFixed(2)}</span>
                  </div>

                  <button onClick={placeOrder} disabled={placing}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
                    {placing ? 'Placing...' : <><span>Place Order</span><ChevronRight size={16} /></>}
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
