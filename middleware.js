import { NextResponse }        from 'next/server'
import { createServerClient }  from '@supabase/ssr'

export async function middleware(req) {
  let res = NextResponse.next({ request: req })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
          res = NextResponse.next({ request: req })
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const path    = req.nextUrl.pathname
  const isAdmin = path.startsWith('/admin')
  const isLogin = path === '/login'

  if (isAdmin && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (isLogin && user) {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
}
