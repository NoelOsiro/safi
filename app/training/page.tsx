import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import TrainingContent from "./training-content"
import type { Module } from "../dashboard/types"

interface ApiResponse {
  success: boolean
  modules: Module[]
}

export default async function TrainingPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return <TrainingContent />
}
