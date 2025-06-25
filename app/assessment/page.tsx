"use client"
import { supabase } from "@/lib/supabase/client"
import { redirect } from "next/navigation"
import AssessmentContent from "./assessment-content"

export default async function AssessmentPage() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  return <AssessmentContent />
}

// The rest of the code remains the same as the existing code block
