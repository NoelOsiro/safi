import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TrainingContent from "./training-content"
import type { Module } from "../dashboard/types"

interface ApiResponse {
  success: boolean
  modules: Module[]
}

export default async function TrainingPage() {
  const { user, error: userError } = await getUser();
  
  if (!user || userError) {
    redirect('/login')
  }

  // Verify user is admin
  const { data: userData } = await (await createClient())
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userData || userData.role !== 'admin') {
    redirect('/')
  }

  return <TrainingContent />
}
