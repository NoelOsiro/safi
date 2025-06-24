
import { redirect } from 'next/navigation';
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import { WelcomeHeader } from "../../components/dassboard/WelcomeHeader"
import { ProgressCards } from "../../components/dassboard/ProgressCards"
import { ModuleCard } from "../../components/dassboard/ModuleCard"
import { QuickActions } from "../../components/dassboard/QuickActions"
import { ErrorMessage } from "../../components/dassboard/ErrorMessage"
import type { Module, ApiResponse } from "./types"
import { getLoggedInUser } from "@/lib/server/appwrite"
import { mockModules } from '@/lib/mock-data';


export default async function DashboardPage() {
  const { user, error: authError } = await getLoggedInUser()
  if (authError || !user) {
    redirect('/login')
  }

  let modules: Module[] = [];
  let error: string | null = null;

  try { 
    const response = {
          success: true,
          modules: mockModules,
        }
    if (!response.success) {
      throw new Error('Failed to fetch modules');
    }
    
    if (Array.isArray(response.modules)) {
      // Add mock progress and status for now - in a real app, this would come from the user's progress
      modules = response.modules.map((module, index: number) => ({
        ...module,
        progress: index === 0 || index === 1 ? 100 : index === 2 ? 60 : 0,
        status: (index <= 1 ? 'completed' : index === 2 ? 'in-progress' : 'not-started') as 'completed' | 'in-progress' | 'not-started'
      }));
    } else {
      throw new Error('Invalid response format');
    }
  } catch (err) {
    console.error('Failed to fetch modules:', err);
    error = 'Failed to load training modules. Please try again later.';
  }

  if (error) {
    return <ErrorMessage message={error} />
  }

  const completedModules = modules.filter(module => module.status === 'completed').length
  const totalModules = modules.length
  const overallProgress = Math.round(modules.reduce((acc, module) => acc + (module.progress || 0), 0) / totalModules)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* User Welcome */}
        <WelcomeHeader user={user} />
        
        {/* Progress Overview */}
        <ProgressCards 
          overallProgress={overallProgress}
          completedModules={completedModules}
          totalModules={totalModules}
        />

        {/* Training Modules */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Training Modules</h2>
            <Badge variant="secondary">{totalModules} Modules Available</Badge>
          </div>

          <div className="grid gap-6">
            {modules.map((module) => (
              <ModuleCard 
                key={module.id} 
                module={module} 
                href={`/training/modules/${module.id}`}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions />
      </div>
    </div>
  )
}
