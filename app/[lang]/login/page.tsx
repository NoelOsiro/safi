import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LoginForm from "./login-form"

export default async function LoginPage() {
  const { user } = await getUser();

  // If user is already authenticated, redirect to dashboard
  if (user) {
    redirect("/dashboard")
  }

  return <LoginForm />
}
