'use client'
import { useEffect, useState } from 'react'
import { motion }               from 'framer-motion'
import { useRouter }            from 'next/navigation'
import { ArrowLeft, Globe, ShoppingBag, CreditCard, Truck, CheckCircle2 } from 'lucide-react'
import { translations }         from '@/lib/i18n'

const TAX_RATE    = 0.07
const DELIVERY_FEE = 2.50

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart]           = useState([])
  const [orderType, setOrderType] = useState('pickup')
  const [lang, setLang]           = useState('en')
  const [orderDone, setOrderDone] = useState(null)
  const [placing, setPlacing]     = useState(false)

  // Form fields
  const [name, setName]           = useState('')
  const [phone, setPhone]         = useState('')
  const [tableNum, setTableNum]   = useState('')
  const [address, setAddress]     = useState('')
  const [payment, setPayment]     = useState('cod')
  const [specialReq, setSpecialReq] = useState('')

  const t = translations[lang]

  useEffect(() => {
    try {
      const savedCart = JSON.parse(localStorage.getItem('restaurate_cart') || '[]')
      const savedType = localStorage.getItem('restaurate_order_type') || 'pickup'
      const savedLang = localStorage.getItem('restaurate_lang')
      setCart(savedCart)
      setOrderType(savedType)
      if (savedLang === 'de' || savedLang === 'en') setLang(savedLang)
    } catch {}
  }, [])

  function toggleLang() {
    const next = lang === 'en' ? 'de' : 'en'
    setLang(next)
    localStorage.setItem('restaurate_lang', next)
  }

  const subtotal    = cart.reduce((s, i) => s + i.price * i.qty, 0)
  const tax         = subtotal * TAX_RATE
  const deliveryFee = orderType === 'delivery' ? DELIVERY_FEE : 0
  const total       = subtotal + tax + deliveryFee

  async function placeOrder() {
    if (!phone.trim()) return alert(t.pleaseEnterPhone)
    if (orderType === 'dine_in' && !tableNum.trim()) return alert(t.pleaseEnterTable)
    if (orderType === 'delivery' && !address.trim()) return alert(t.pleaseEnterAddress)

    setPlacing(true)
    const notes = [
      phone   && `Phone: ${phone}`,
      address && `Address: ${address}`,
      specialReq && `Note: ${specialReq}`,
    ].filter(Boolean).join('\n')

    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: orderType,
        table_number: tableNum || null,
        customer_name: name || 'Guest',
        kitchen_notes: notes || null,
        items: cart.map(i => ({ id: i.id, name: i.name, price: i.price, quantity: i.qty })),
      }),
    })
    const data = await res.json()
    setPlacing(false)
    if (res.ok) {
      localStorage.setItem('restaurate_cart', '[]')
      setOrderDone({ number: data.data.order_number, type: orderType, table: tableNum })
    } else {
      alert(data.error || 'Failed to place order')
    }
  }

  // ── Order Success ───────────────────────────────────────────────────────
  if (orderDone) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 text-center max-w-sm w-full shadow-lg"
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.orderPlaced}</h2>
        <p className="text-gray-500 mb-3">{t.yourOrderNumber}</p>
        <p className="text-3xl font-mono font-bold text-amber-500 mb-2">{orderDone.number}</p>
        <p className="text-gray-400 text-sm mb-6">
          {orderDone.type === 'dine_in'
            ? t.bringToTable(orderDone.table)
            : t.collectAtCounter}
        </p>
        <button
          onClick={() => router.push('/menu')}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-xl transition-all"
        >
          {t.orderMore}
        </button>
      </motion.div>
    </div>
  )

  // ── Empty cart guard ────────────────────────────────────────────────────
  if (!cart.length) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
      <div className="text-center">
        <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{t.cartIsEmpty}</p>
        <button
          onClick={() => router.push('/menu')}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-xl transition-all"
        >
          {t.backToMenu}
        </button>
      </div>
    </div>
  )

  const inputCls = 'w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all bg-white'

  return (
    <div className="min-h-screen bg-gray-50" style={{ colorScheme: 'light' }}>

      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/menu')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            {t.backToMenu}
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-all"
          >
            <Globe size={15} />
            <span>{lang === 'en' ? 'EN' : 'DE'}</span>
            <span className="text-gray-300">|</span>
            <span className="text-gray-400">{lang === 'en' ? 'DE' : 'EN'}</span>
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t.checkout}</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left: Your Details ────────────────────────────────────── */}
          <div className="lg:col-span-3 space-y-5">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-5">{t.yourDetails}</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.nameOptional}</label>
                  <input className={inputCls} placeholder={t.enterName}
                    value={name} onChange={e => setName(e.target.value)} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.phoneRequired}</label>
                  <input className={inputCls} placeholder={t.enterPhone} type="tel"
                    value={phone} onChange={e => setPhone(e.target.value)} />
                </div>

                {orderType === 'dine_in' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.tableRequired}</label>
                    <input className={inputCls} placeholder={t.enterTable}
                      value={tableNum} onChange={e => setTableNum(e.target.value)} />
                  </div>
                )}

                {orderType === 'delivery' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">{t.deliveryAddressRequired}</label>
                    <textarea className={`${inputCls} resize-none h-24`} placeholder={t.enterAddress}
                      value={address} onChange={e => setAddress(e.target.value)} />
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t.paymentMethod}</h2>
              <div className="space-y-3">
                <label className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                  ${payment === 'cod' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <input type="radio" value="cod" checked={payment === 'cod'}
                    onChange={() => setPayment('cod')} className="accent-amber-500" />
                  <Truck size={18} className="text-gray-500" />
                  <span className="text-sm font-medium text-gray-800">{t.cashOnDelivery}</span>
                </label>
                <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 cursor-not-allowed opacity-50">
                  <input type="radio" disabled className="accent-amber-500" />
                  <CreditCard size={18} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-500">{t.onlinePayment}</span>
                </label>
              </div>
            </div>

            {/* Special Requests */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">{t.specialRequests}</h2>
              <textarea
                className={`${inputCls} resize-none h-28`}
                placeholder={t.specialPlaceholder}
                value={specialReq}
                onChange={e => setSpecialReq(e.target.value)}
              />
            </div>
          </div>

          {/* ── Right: Order Summary ──────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-5">{t.orderSummary}</h2>

              <div className="space-y-3 mb-5">
                {cart.map(item => (
                  <div key={item.id} className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">€{Number(item.price).toFixed(2)} × {item.qty}</p>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                      €{(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2">
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
              </div>

              <div className="border-t border-gray-200 mt-3 pt-4 flex justify-between items-center mb-5">
                <span className="text-base font-bold text-gray-900">{t.total}</span>
                <span className="text-2xl font-bold text-amber-500">€{total.toFixed(2)}</span>
              </div>

              <button
                onClick={placeOrder}
                disabled={placing}
                className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag size={18} />
                {placing ? t.placingOrder : t.placeOrderCOD}
              </button>
              <p className="text-center text-xs text-gray-400 mt-3">{t.payOnDelivery}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
