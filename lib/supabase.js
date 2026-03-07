import { createClient } from '@supabase/supabase-js'

const url     = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const svcKey  = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !anonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

// Browser-safe public client
export const supabase = createClient(url, anonKey)

// Server-side admin client — never import in client components
export const supabaseAdmin = createClient(url, svcKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
