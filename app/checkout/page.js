'use client'
import { useEffect, useState } from 'react'
import { motion }               from 'framer-motion'
import { useRouter }            from 'next/navigation'
import { ArrowLeft, Globe, ShoppingBag, CreditCard, Truck, CheckCircle2 } from 'lucide-react'
import { translations }         from '@/lib/i18n'

const TAX_RATE     = 0.07
const DELIVERY_FEE = 2.50

export default function CheckoutPage() {
  const router = useRouter()
  const [cart, setCart]           = useState([])
  const [orderType, setOrderType] = useState('pickup')
  const [lang, setLang]           = useState('en')
  const [orderDone, setOrderDone] = useState(null)
  const [placing, setPlacing]     = useState(false)

  const [name, setName]             = useState('')
  const [phone, setPhone]           = useState('')
  const [tableNum, setTableNum]     = useState('')
  const [address, setAddress]       = useState('')
  const [payment, setPayment]       = useState('cod')
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
    if (!phone.trim())                                 return alert(t.pleaseEnterPhone)
    if (orderType === 'dine_in'  && !tableNum.trim()) return alert(t.pleaseEnterTable)
    if (orderType === 'delivery' && !address.trim())  return alert(t.pleaseEnterAddress)

    setPlacing(true)
    const notes = [
      phone      && `Phone: ${phone}`,
      address    && `Address: ${address}`,
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

  // ── Order Success ─────────────────────────────────────────────────────
  if (orderDone) return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-lg p-8 text-center max-w-sm w-full border border-gray-200">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.orderPlaced}</h2>
        <p className="text-gray-500 mb-3">{t.yourOrderNumber}</p>
        <p className="text-3xl font-mono font-bold text-amber-500 mb-2">{orderDone.number}</p>
        <p className="text-gray-400 text-sm mb-6">
          {orderDone.type === 'dine_in' ? t.bringToTable(orderDone.table) : t.collectAtCounter}
        </p>
        <button onClick={() => router.push('/menu')}
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 rounded-lg transition-all">
          {t.orderMore}
        </button>
      </motion.div>
    </div>
  )

  // ── Empty cart guard ──────────────────────────────────────────────────
  if (!cart.length) return (
    <div className="min-h-screen bg-[#f3f4f6] flex items-center justify-center p-4" style={{ colorScheme: 'light' }}>
      <div className="text-center">
        <ShoppingBag size={48} className="text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 mb-4">{t.cartIsEmpty}</p>
        <button onClick={() => router.push('/menu')}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-3 rounded-lg transition-all">
          {t.backToMenu}
        </button>
      </div>
    </div>
  )

  const inputCls = 'w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent bg-white'
  const labelCls = 'block text-sm text-gray-700 mb-1.5'

  return (
    <div className="min-h-screen bg-[#f3f4f6]" style={{ colorScheme: 'light' }}>

      {/* Top nav — same width as content */}
      <div className="max-w-[780px] mx-auto px-5 pt-5 pb-1 flex items-center justify-between">
        <button onClick={() => router.push('/menu')}
          className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors">
          <ArrowLeft size={16} />
          {t.backToMenu}
        </button>
        <button onClick={toggleLang}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all">
          <Globe size={14} />
          {lang.toUpperCase()}
        </button>
      </div>

      {/* Page title */}
      <div className="max-w-[780px] mx-auto px-5 pt-5 pb-5">
        <h1 className="text-[2.6rem] font-bold text-gray-900 leading-none">{t.checkout}</h1>
      </div>

      {/* Two-column layout */}
      <div className="max-w-[780px] mx-auto px-5 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_300px] gap-4 items-start">

          {/* ── Left: Your Details ─────────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-5">{t.yourDetails}</h2>

            <div className="space-y-4">
              <div>
                <label className={labelCls}>{t.nameOptional}</label>
                <input className={inputCls} placeholder={t.enterName}
                  value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>{t.phoneRequired}</label>
                <input className={inputCls} placeholder={t.enterPhone} type="tel"
                  value={phone} onChange={e => setPhone(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>{t.tableRequired}</label>
                <input className={inputCls} placeholder={t.enterTable}
                  value={tableNum} onChange={e => setTableNum(e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>{t.deliveryAddressRequired}</label>
                <textarea rows={3} className={`${inputCls} resize-none`} placeholder={t.enterAddress}
                  value={address} onChange={e => setAddress(e.target.value)} />
              </div>

              {/* Payment Method */}
              <div>
                <label className={labelCls}>{t.paymentMethod}</label>
                <div className="space-y-2 mt-1">
                  <label className="flex items-center gap-3 px-4 py-3 rounded-md border border-gray-300 bg-white cursor-pointer">
                    <input type="radio" name="payment" value="cod" checked={payment === 'cod'}
                      onChange={() => setPayment('cod')} className="accent-amber-500 w-4 h-4" />
                    <Truck size={15} className="text-gray-500" />
                    <span className="text-sm text-gray-800">{t.cashOnDelivery}</span>
                  </label>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-md border border-gray-200 bg-white cursor-not-allowed opacity-50">
                    <input type="radio" name="payment" disabled className="w-4 h-4" />
                    <CreditCard size={15} className="text-gray-400" />
                    <span className="text-sm text-gray-500">{t.onlinePayment}</span>
                  </label>
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className={labelCls}>{t.specialRequests}</label>
                <textarea rows={3} className={`${inputCls} resize-none`} placeholder={t.specialPlaceholder}
                  value={specialReq} onChange={e => setSpecialReq(e.target.value)} />
              </div>
            </div>
          </div>

          {/* ── Right: Order Summary ───────────────────────────────────── */}
          <div className="bg-white rounded-lg border border-gray-200 p-5 sticky top-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">{t.orderSummary}</h2>

            {/* Items */}
            <div className="space-y-3 mb-4">
              {cart.map(item => (
                <div key={item.id} className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 leading-snug">{item.name}</p>
                    <p className="text-xs text-gray-400">€{Number(item.price).toFixed(2)} × {item.qty}</p>
                  </div>
                  <span className="text-sm text-gray-700 font-medium whitespace-nowrap">
                    €{(item.price * item.qty).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Pricing */}
            <div className="border-t border-gray-100 pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t.subtotal}</span><span>€{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t.tax}</span><span>€{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t.deliveryFee}</span><span>€{deliveryFee.toFixed(2)}</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-200">
              <span className="text-base font-bold text-gray-900">{t.total}</span>
              <span className="text-xl font-bold text-amber-500">€{total.toFixed(2)}</span>
            </div>

            {/* CTA */}
            <button onClick={placeOrder} disabled={placing}
              className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-semibold py-3.5 rounded-lg transition-all flex items-center justify-center gap-2 text-sm">
              <ShoppingBag size={16} />
              {placing ? t.placingOrder : t.placeOrderCOD}
            </button>
            <p className="text-center text-xs text-gray-400 mt-2">{t.payOnDelivery}</p>
          </div>

        </div>
      </div>
    </div>
  )
}
