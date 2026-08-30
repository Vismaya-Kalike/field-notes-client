import { createClient } from '@supabase/supabase-js'

/**
 * Server-only Supabase client. Bypasses Row Level Security, so it must never be
 * imported from a client component — SUPABASE_SECRET_KEY is not a NEXT_PUBLIC_ var,
 * so any such import fails loudly at module load rather than leaking the key.
 *
 * API routes use this rather than the publishable client. Writes made with the
 * publishable key are silently dropped by RLS: PostgREST answers a blocked update
 * with 200 and an empty array, so the failure never surfaces as an error.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'Missing Supabase server environment variables (NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SECRET_KEY)'
  )
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})
