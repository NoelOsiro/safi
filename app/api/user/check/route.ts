import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError || !session?.user) {
      return NextResponse.json(
        {
          success: false,
          user: null,
          authenticated: false,
          error: "Not authenticated",
        },
        { status: 401 },
      )
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

    const user = {
      id: session.user.id,
      email: session.user.email!,
      name:
        session.user.user_metadata.name || session.user.user_metadata.full_name || session.user.email!.split("@")[0],
      fullName: session.user.user_metadata.full_name || session.user.user_metadata.name,
      avatar:
        session.user.user_metadata.avatar_url ||
        session.user.user_metadata.picture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email!)}`,
      phone: profile?.phone || "",
      businessType: profile?.business_type || "",
      location: profile?.location || "",
      experience: profile?.experience || "",
      role: profile?.role || "user",
      onboardingCompleted: profile?.onboarding_completed || false,
      progress: profile?.progress || {
        modulesCompleted: 0,
        totalModules: 6,
        assessmentScore: 0,
        certificationReady: 0,
        studyTime: 0,
      },
      created_at: session.user.created_at,
      updated_at: session.user.updated_at,
      email_verified: !!session.user.email_confirmed_at,
    }

    return NextResponse.json({
      success: true,
      user,
      authenticated: true,
    })
  } catch (error: any) {
    console.error("Auth check API error:", error)
    return NextResponse.json(
      {
        success: false,
        user: null,
        authenticated: false,
        error: "Authentication check failed",
      },
      { status: 500 },
    )
  }
}
