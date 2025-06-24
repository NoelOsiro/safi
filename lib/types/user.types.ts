export interface Progress {
  modulesCompleted?: number
  totalModules?: number
  assessmentScore?: number
  certificationReady?: number
  studyTime?: number
}

export interface User {
  id: string
  email: string
  name: string
  fullName?: string
  avatar?: string
  phone?: string
  businessType?: string
  location?: string
  experience?: string
  role?: "admin" | "user"
  onboardingCompleted?: boolean
  progress?: Progress
  created_at?: string
  updated_at?: string
  email_verified?: boolean
}

export interface AuthUser {
  id: string
  email: string
  user_metadata: {
    name?: string
    full_name?: string
    avatar_url?: string
    picture?: string
  }
  app_metadata: {
    provider?: string
    providers?: string[]
  }
  created_at: string
  updated_at: string
  email_confirmed_at?: string
}

export function mapSupabaseUserToUser(authUser: AuthUser, profile?: any): User {
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.user_metadata.name || authUser.user_metadata.full_name || authUser.email.split("@")[0],
    fullName: authUser.user_metadata.full_name || authUser.user_metadata.name,
    avatar:
      authUser.user_metadata.avatar_url ||
      authUser.user_metadata.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(authUser.email)}`,
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
    created_at: authUser.created_at,
    updated_at: authUser.updated_at,
    email_verified: !!authUser.email_confirmed_at,
  }
}
