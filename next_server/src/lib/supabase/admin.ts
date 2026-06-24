import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client with the service role key.
 * This bypasses RLS and should ONLY be used in server-side code
 * for admin operations (e.g., creating new admin users).
 *
 * Requires SUPABASE_SERVICE_ROLE_KEY env variable (no NEXT_PUBLIC_ prefix).
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'Add SUPABASE_SERVICE_ROLE_KEY to your .env file (without the NEXT_PUBLIC_ prefix).'
    )
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
