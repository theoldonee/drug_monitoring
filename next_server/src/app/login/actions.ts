'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/auth'

export async function login(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Get the authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Authentication failed. Please try again.' }
  }

  // Fetch role from profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = profile?.role as UserRole | undefined

  if (!role || (role !== 'primary_admin' && role !== 'counselor')) {
    // Sign out users without staff roles
    await supabase.auth.signOut()
    return { error: 'Access denied. Staff privileges required.' }
  }

  // Redirect based on role
  if (role === 'primary_admin') {
    redirect('/admin')
  } else {
    redirect('/review')
  }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
