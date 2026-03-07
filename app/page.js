import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-xl">
        <div className="text-6xl mb-6">🍽️</div>
        <h1 className="text-4xl font-bold mb-4">
          <span className="text-orange-500">Restaurate</span>
        </h1>
        <p className="text-slate-400 mb-10 text-lg">
          Restaurant ordering &amp; management system
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link href="/menu" className="btn-primary">
            View Menu
          </Link>
          <Link href="/admin" className="btn-secondary">
            Admin Panel
          </Link>
        </div>
      </div>
    </main>
  )
}
