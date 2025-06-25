import { getUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ErrorMessage } from "../../../components/dassboard/ErrorMessage"
import type { Module } from "./types"
import { mockModules } from "@/lib/mock-data"
import DashboardContent from "./dashboard-content"

export default async function DashboardPage({
  params,
}: {
  params: { lang: string }
}) {
  const { user } = await getUser()
  const { lang } = params

  if (!user) {
    redirect(`/${lang}/login?redirect=/${lang}/dashboard`)
  }

  let modules: Module[] = []
  let error: string | null = null

  try {
    // In a real app, you would fetch this from your API
    const response = {
      success: true,
      modules: mockModules,
    }

    if (Array.isArray(response.modules)) {
      modules = response.modules.map((module, index: number) => ({
        ...module,
        progress: index === 0 || index === 1 ? 100 : index === 2 ? 60 : 0,
        status: (index <= 1 ? "completed" : index === 2 ? "in-progress" : "not-started") as
          | "completed"
          | "in-progress"
          | "not-started",
      }))
    } else {
      throw new Error("Invalid response format")
    }
  } catch (err) {
    console.error("Failed to fetch modules:", err)
    error = "Failed to load training modules. Please try again later."
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  const completedModules = modules.filter((module) => module.status === "completed").length
  const totalModules = modules.length
  const overallProgress = Math.round(modules.reduce((acc, module) => acc + (module.progress || 0), 0) / totalModules)

  return (
    <DashboardContent
      user={user}
      overallProgress={overallProgress}
      completedModules={completedModules}
      totalModules={totalModules}
      modules={modules}
    />
  )
}
