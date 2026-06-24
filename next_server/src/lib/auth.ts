import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Get the current authenticated user. Returns null if not authenticated.
 * Uses supabase.auth.getUser() (not getSession) for security.
 */
export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

/**
 * Look up a user's role from the profiles table.
 */
export async function getUserRole(userId: string): Promise<string | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  if (error || !data) {
    return null
  }

  return data.role as string
}

/**
 * Require the current user to be authenticated.
 * Redirects to /login if not. Use in Server Components / Server Actions.
 */
export async function requireAuth() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  return user
}

/**
 * Require the current user to be an authenticated admin.
 * Redirects to /login if not authenticated, or / if not admin.
 */
export async function requireAdmin() {
  const user = await requireAuth()
  const role = await getUserRole(user.id)

  if (role !== 'admin') {
    redirect('/')
  }

  return { user, role }
}
