
import { createClient, getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import AssessmentContent from "./assessment-content"

export default async function AssessmentPage() {
  const { user, error } = await getUser();

  if (!user || error) {
    redirect("/login")
  }

  return <AssessmentContent />
}

// The rest of the code remains the same as the existing code block
