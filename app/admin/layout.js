import AdminSidebar from '@/components/admin/Sidebar'

export const metadata = {
  title: 'Admin — Restaurate',
}

export default function AdminLayout({ children }) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto bg-slate-900">
        {children}
      </main>
    </div>
  )
}
