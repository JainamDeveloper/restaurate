'use client'
import Link        from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, UtensilsCrossed, FolderOpen, BarChart3, LogOut } from 'lucide-react'

const links = [
  { href: '/admin',            label: 'Dashboard',  Icon: LayoutDashboard },
  { href: '/admin/orders',     label: 'Orders',     Icon: ShoppingBag     },
  { href: '/admin/menu',       label: 'Menu Items', Icon: UtensilsCrossed },
  { href: '/admin/categories', label: 'Categories', Icon: FolderOpen      },
  { href: '/admin/reports',    label: 'Reports',    Icon: BarChart3       },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  async function logout() {
    await fetch('/api/auth/login', { method: 'DELETE' })
    router.push('/login')
  }

  return (
    <aside className="w-60 bg-slate-800 border-r border-slate-700 flex flex-col flex-shrink-0">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🍽️</span>
          <div>
            <h2 className="font-bold text-orange-400 leading-none">Restaurate</h2>
            <p className="text-xs text-slate-500 mt-0.5">Admin Panel</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5">
        {links.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                ${active
                  ? 'bg-orange-500/15 text-orange-400'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-700'}`}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="p-3 border-t border-slate-700">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut size={17} />
          Logout
        </button>
      </div>
    </aside>
  )
}
