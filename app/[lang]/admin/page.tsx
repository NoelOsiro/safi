import { createClient as createServerClient, getUser } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminContent } from './AdminContent'
import { fetchUsers } from './actions'
import { Role, User } from './types'

export default async function AdminPage() {
  const { user, error } = await getUser();
  
  if (!user || error) {
    redirect('/login')
  }

  // Verify user is admin
  const { data: userData, error: userError } = await (await createServerClient())
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userError || userData.role !== 'admin') {
    redirect('/not-admin')
  }

  // Fetch users data
  let users: User[] = []
  try {
    const { data, error } = await fetchUsers()
    if (error) {
      console.error('Error fetching users:', error)
    } else if (data) {
      users = data
    }
  } catch (error) {
    console.error('Unexpected error:', error)
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <AdminContent 
      initialUsers={users} 
      currentUserRole={userData.role as Role} 
    />
  )
}
