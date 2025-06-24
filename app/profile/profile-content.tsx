"use client"

import { ProfileHeader } from "../../components/profile/ProfileHeader"
import { ProfileForm } from "../../components/profile/ProfileForm"
import { ProfileProgress } from "../../components/profile/ProfileProgress"
import { ExperienceBadge } from "../../components/profile/ExperienceBadge"
import type { User } from "@/lib/types/user.types"

interface ProfileContentProps {
  user: User
}

export default function ProfileContent({ user }: ProfileContentProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            <ProfileHeader user={user} />
            <ExperienceBadge experience={user.experience || ""} />
            <ProfileProgress progress={user.progress} />
          </div>

          {/* Right Column - Profile Form */}
          <div className="lg:col-span-2">
            <ProfileForm user={user} />
          </div>
        </div>
      </div>
    </div>
  )
}
