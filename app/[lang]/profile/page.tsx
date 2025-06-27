
import type { ProfileFormData } from "@/lib/types/profile.types";
import type { User } from "@/lib/types/user.types";
import { createClient, getUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileContent } from "./profile-content";

// Utility function to get user initials
export const getUserInitials = (name?: string, email?: string): string => {
  if (name) {
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  return email ? email[0].toUpperCase() : "U";
};

export default async function ProfilePage() {
  const { user } = await getUser();

  if (!user) {
    return redirect("/login"); // ⬅️ Important: stop execution
  }

  let profile = null;
  try {
    const result = await (await createClient())
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = result.data;
  } catch (error) {
    profile = {}; // fallback to empty
  }

  const profileUser = {
    id: user.id,
    email: user.email!,
    name:
      user.user_metadata?.name ||
      user.user_metadata?.full_name ||
      user.email!.split("@")[0],
    fullName:
      user.user_metadata?.full_name || user.user_metadata?.name,
    avatar:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        user.email!
      )}`,
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
  };

  return <ProfileContent user={profileUser} />;
}
