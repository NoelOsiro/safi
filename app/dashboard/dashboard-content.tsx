"use client"

import { Badge } from "@/components/ui/badge"
import { WelcomeHeader } from "../../components/dassboard/WelcomeHeader"
import { ProgressCards } from "../../components/dassboard/ProgressCards"
import { ModuleCard } from "../../components/dassboard/ModuleCard"
import { QuickActions } from "../../components/dassboard/QuickActions"
import type { Module } from "./types"
import type { User } from "@supabase/supabase-js"

interface DashboardContentProps {
  user: User
  overallProgress: number
  completedModules: number
  totalModules: number
  modules: Module[]
}

export default function DashboardContent({
  user,
  overallProgress,
  completedModules,
  totalModules,
  modules,
}: DashboardContentProps) {
  // Transform Supabase user to our User type
  const transformedUser = {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.name || user.user_metadata?.full_name || user.email!.split("@")[0],
    fullName: user.user_metadata?.full_name || user.user_metadata?.name,
    avatar:
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.email!)}`,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <WelcomeHeader user={transformedUser} />
        <ProgressCards
          overallProgress={overallProgress}
          completedModules={completedModules}
          totalModules={totalModules}
        />
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Training Modules</h2>
            <Badge variant="secondary">{totalModules} Modules Available</Badge>
          </div>
          <div className="grid gap-6">
            {modules.map((module) => (
              <ModuleCard key={module.id} module={module} href={`/training/modules/${module.id}`} />
            ))}
          </div>
        </div>
        <QuickActions />
      </div>
    </div>
  )
}
