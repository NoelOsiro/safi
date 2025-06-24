// app/auth/login/route.ts
import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "azure",
    options: {
      scopes: "email profile offline_access",
      redirectTo: `${process.env.NEXTAUTH_URL}/api/auth/callback`, // set this in .env
    },
  })

  if (error) {
    return NextResponse.redirect("/auth/error")
  }

  return NextResponse.redirect(data.url)
}
