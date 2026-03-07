import AdminSidebar from '@/components/admin/Sidebar'

export const metadata = {
  title: 'Admin — Restaurate',
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100 admin-scroll" style={{ colorScheme: 'dark' }}>
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">
        {children}
      </main>
    </div>
  )
}
