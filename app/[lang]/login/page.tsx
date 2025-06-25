import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "./login-form"

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If user is already authenticated, redirect to dashboard
  if (session) {
    redirect("/dashboard")
  }

  return <LoginForm />
}
