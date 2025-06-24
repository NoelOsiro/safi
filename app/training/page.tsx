import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle, Clock, Award, ChevronRight, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"
import { getLoggedInUser } from "@/lib/server/appwrite"
import { redirect } from "next/navigation"
import { ErrorMessage } from "@/components/dassboard/ErrorMessage"
import { Module } from "../dashboard/types"
import { mockModules } from "@/lib/mock-data"



interface ApiResponse {
  success: boolean
  modules: Module[]
}

export default async function TrainingPage() {

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


  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[60vh]">
  //       <Loader2 
  //         data-testid="loading-spinner"
  //         className="h-8 w-8 animate-spin text-emerald-600" 
  //       />
  //     </div>
  //   )
  // }

  if (error) {
      return <ErrorMessage message={error} />
    }

  const getStatusBadge = (status?: 'completed' | 'in-progress' | 'not-started') => {
    switch (status) {
      case "completed":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Completed
          </span>
        )
      case "in-progress":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="w-3 h-3 mr-1" /> In Progress
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Started
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Back Button */}
        <Button variant="ghost" size="sm" asChild className="hover:bg-emerald-50 -ml-2 mb-2">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Training Modules</h1>
            <p className="text-slate-600 mt-2">Complete all modules to become food safety certified</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <BookOpen className="w-4 h-4 mr-2" />
              My Progress
            </Button>
          </div>
        </div>

        {/* Progress Summary */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center" data-testid="modules-completed">
                <p className="text-sm font-medium text-slate-500">Modules Completed</p>
                <p className="text-3xl font-bold text-emerald-600 mt-2">2/5</p>
                <Progress value={40} className="h-2 mt-2" data-testid="modules-completed-progress" />
              </div>
              <div className="text-center" data-testid="overall-progress">
                <p className="text-sm font-medium text-slate-500">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">52%</p>
                <Progress value={52} className="h-2 mt-2" data-testid="overall-progress-bar" />
              </div>
              <div className="text-center" data-testid="certification-ready">
                <p className="text-sm font-medium text-slate-500">Certification Ready</p>
                <p className="text-3xl font-bold text-amber-600 mt-2">75%</p>
                <Progress value={75} className="h-2 mt-2" data-testid="certification-progress" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modules List */}
        <div className="space-y-6">
          {modules.map((module) => (
            <Link 
              key={module.id} 
              href={`/training/modules/${module.id}`}
              className="block transition-all duration-300 hover:-translate-y-1"
            >
              <Card className="hover:shadow-lg transition-all duration-300 border-l-4 border-emerald-500 hover:border-emerald-600 hover:bg-white/95">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-6">
                      <div className="bg-emerald-100 p-3.5 rounded-xl transition-all duration-300 group-hover:bg-emerald-200 group-hover:scale-105">
                        <span className="text-2xl">{module.icon}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-slate-800">{module.title}</h3>
                        <p className="text-slate-600 text-sm mt-1">{module.description}</p>
                        <div className="mt-3 flex items-center space-x-4">
                          <span className="text-xs text-slate-500 flex items-center">
                            <Clock className="w-3 h-3 mr-1" />
                            {module.duration}
                          </span>
                          {getStatusBadge(module.status)}
                        </div>
                        {module.status === "in-progress" && (
                          <div className="mt-3 w-full">
                            <Progress value={module.progress} className="h-2" />
                            <p className="text-xs text-right text-slate-500 mt-1">{module.progress}% complete</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center">
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Certification Banner */}
        <Card className="mt-10 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6">
                <Award className="w-12 h-12 text-emerald-100 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-xl">Become Certified</h3>
                  <p className="text-emerald-100 text-sm mt-2 opacity-90">Complete all modules and pass the final assessment to get certified</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                className="bg-white/10 hover:bg-white/20 border-white/20 hover:scale-105 transition-transform duration-200"
              >
                View Certification Requirements
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
