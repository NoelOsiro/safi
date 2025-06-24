import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Logout error:", error)
    }

    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error: any) {
    console.error("Logout API error:", error)
    return NextResponse.json({
      success: true,
      message: "Logged out",
    })
  }
}
