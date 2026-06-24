'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'

/**
 * Add a new admin user. Only callable by existing admins.
 * Creates a Supabase auth user and a profiles entry with role='admin'.
 */
export async function addAdmin(email: string, password: string) {
  // Verify the caller is an admin
  await requireAdmin()

  if (!email || !password) {
    return { error: 'Email and password are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  try {
    const adminSupabase = createAdminClient()

    // Create the auth user (auto-confirmed so they can log in immediately)
    const { data: userData, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })

    if (createError) {
      return { error: createError.message }
    }

    if (!userData.user) {
      return { error: 'Failed to create user.' }
    }

    // Insert profile with admin role
    const { error: profileError } = await adminSupabase
      .from('profiles')
      .insert({
        id: userData.user.id,
        email: userData.user.email,
        role: 'admin',
      })

    if (profileError) {
      // Clean up: delete the auth user if profile creation fails
      await adminSupabase.auth.admin.deleteUser(userData.user.id)
      return { error: `Profile creation failed: ${profileError.message}` }
    }

    return { success: true, email: userData.user.email }
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Fetch all admin profiles. Only callable by admins.
 */
export async function getAdmins() {
  await requireAdmin()

  try {
    const adminSupabase = createAdminClient()

    const { data, error } = await adminSupabase
      .from('profiles')
      .select('id, email, role, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: true })

    if (error) {
      return { error: error.message, admins: [] }
    }

    return { admins: data ?? [] }
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : 'An unexpected error occurred.',
      admins: [],
    }
  }
}

/**
 * Remove an admin (set role to 'user'). Only the master admin can do this.
 * Cannot remove yourself.
 */
export async function removeAdmin(adminId: string) {
  const { user } = await requireAdmin()

  if (user.id === adminId) {
    return { error: 'You cannot remove yourself.' }
  }

  try {
    const adminSupabase = createAdminClient()

    const { error } = await adminSupabase
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', adminId)

    if (error) {
      return { error: error.message }
    }

    return { success: true }
  } catch (err) {
    return {
      error:
        err instanceof Error ? err.message : 'An unexpected error occurred.',
    }
  }
}

/**
 * Get the current admin's profile info.
 */
export async function getMyProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data } = await supabase
    .from('profiles')
    .select('id, email, role, created_at')
    .eq('id', user.id)
    .single()

  return data
}
