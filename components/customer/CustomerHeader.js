'use client'
import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { usePathname }         from 'next/navigation'
import { Globe, Clock, Menu, X as XIcon } from 'lucide-react'
import OpeningHoursModal       from './OpeningHoursModal'
import { getTodayStatus }      from '@/lib/opening-hours'

export default function CustomerHeader({ lang = 'en', onLangToggle }) {
  const pathname    = usePathname()
  const [hoursOpen, setHoursOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [status, setStatus]       = useState(null)

  useEffect(() => { setStatus(getTodayStatus()) }, [])

  const navLinks = [
    { href: '/',      label: lang === 'de' ? 'Start'         : 'Home'          },
    { href: '/menu',  label: lang === 'de' ? 'Speisekarte'   : 'Menu'          },
  ]

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🍽</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 leading-none text-base">Restaurate</p>
              {status && (
                <p className={`text-xs font-medium leading-none mt-0.5 ${status.open ? 'text-green-500' : 'text-red-400'}`}>
                  {status.label}
                </p>
              )}
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${pathname === href ? 'text-amber-600 bg-amber-50' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                {label}
              </Link>
            ))}
            <button onClick={() => setHoursOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              <Clock size={14} />
              {lang === 'de' ? 'Öffnungszeiten' : 'Opening Hours'}
            </button>
            <div className="w-px h-5 bg-gray-200 mx-1" />
            <Link href="/login"
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors">
              {lang === 'de' ? 'Anmelden' : 'Login'}
            </Link>
            <button onClick={onLangToggle}
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all ml-1">
              <Globe size={14} />
              {lang === 'en' ? 'EN' : 'DE'}
            </button>
          </nav>

          {/* Mobile right */}
          <div className="flex md:hidden items-center gap-2">
            <button onClick={onLangToggle}
              className="flex items-center gap-1 px-2.5 py-1.5 border border-gray-200 rounded-lg text-xs font-semibold text-gray-600">
              <Globe size={13} /> {lang.toUpperCase()}
            </button>
            <button onClick={() => setMobileOpen(p => !p)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              {mobileOpen ? <XIcon size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
            {navLinks.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                  ${pathname === href ? 'text-amber-600 bg-amber-50' : 'text-gray-600 hover:bg-gray-50'}`}>
                {label}
              </Link>
            ))}
            <button onClick={() => { setHoursOpen(true); setMobileOpen(false) }}
              className="w-full text-left flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              <Clock size={14} /> {lang === 'de' ? 'Öffnungszeiten' : 'Opening Hours'}
            </button>
            <Link href="/login" onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50">
              {lang === 'de' ? 'Anmelden' : 'Login'}
            </Link>
          </div>
        )}
      </header>

      <OpeningHoursModal open={hoursOpen} onClose={() => setHoursOpen(false)} lang={lang} />
    </>
  )
}
