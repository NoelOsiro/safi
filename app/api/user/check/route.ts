import { createClient, getUser } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const { user } = await getUser()
    if (!user) {
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

    const { data: profile } = await (await createClient()).from("profiles").select("*").eq("id", user.id).single()

    const userData = {
      id: user.id,
      email: user.email!,
      name:
        user.user_metadata.name || user.user_metadata.full_name || user.email!.split("@")[0],
      fullName: user.user_metadata.full_name || user.user_metadata.name,
      avatar:
        user.user_metadata.avatar_url ||
        user.user_metadata.picture ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email!)}`,
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
      created_at: user.created_at,
      updated_at: user.updated_at,
      email_verified: !!user.email_confirmed_at,
    }

    return NextResponse.json({
      success: true,
      user: userData,
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
