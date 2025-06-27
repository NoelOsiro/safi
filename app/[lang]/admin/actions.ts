'use server'

import { createClient as createServerClient, getSession } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { Role } from './types'
import { jwtDecode } from 'jwt-decode'

export async function isAdmin(): Promise<boolean> {
  const { session } = await getSession()

  const token = session?.access_token
  if (!token) return false

  try {
    const decoded = jwtDecode<{ user_role?: Role }>(token)
    console.log(decoded.user_role)
    return decoded.user_role === 'admin'
  } catch (err) {
    console.error('JWT decode failed:', err)
    return false
  }
}

export async function fetchUsers() {
  try {
    const supabase = await createServerClient()

    if (!(await isAdmin())) {
      return { error: 'Unauthorized', data: null }
    }

    const { data: users, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Error fetching users:', fetchError)
      return { data: null, error: 'Failed to fetch users' }
    }

    return { data: users, error: null }
  } catch (error) {
    console.error('Unexpected error in fetchUsers:', error)
    return { data: null, error: 'Unexpected server error' }
  }
}


export async function updateUserRole(userId: string, newRole: Role) {
  try {
    const supabase = await createServerClient()

    if (!(await isAdmin())) {
      return { success: false, error: 'Unauthorized' }
    }
    // Step 2 (optional): Update profiles table if you still rely on it for frontend
    await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId)

    // Step 3: (Optional) force JWT refresh (will depend on your app's logic)
    // Not always necessary unless you need the user to immediately see role effects

    revalidatePath('/admin')
    return { success: true, error: null }
  } catch (error) {
    console.error('Unexpected error in updateUserRole:', error)
    return { success: false, error: 'Unexpected server error' }
  }
}

