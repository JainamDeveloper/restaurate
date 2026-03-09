import { NextResponse }       from 'next/server'
import { createServerClient } from '@supabase/ssr'

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

  const path       = req.nextUrl.pathname
  const isAdmin    = path.startsWith('/admin')
  const isLogin    = path === '/login'
  const isRegister = path === '/register'
  const isCustomer = path === '/menu' || path.startsWith('/checkout')

  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',').map(e => e.trim()).filter(Boolean)
  const isAdminUser = user && adminEmails.includes(user.email)

  // Protect /admin: must be logged in AND be an admin email
  if (isAdmin && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isAdmin && user && !isAdminUser) {
    return NextResponse.redirect(new URL('/menu', req.url))
  }

  // Protect /menu and /checkout: must be logged in as a customer
  if (isCustomer && !user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Redirect logged-in users away from /login and /register
  if ((isLogin || isRegister) && user) {
    return NextResponse.redirect(new URL(isAdminUser ? '/admin' : '/menu', req.url))
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*', '/login', '/register', '/menu', '/checkout/:path*'],
}
