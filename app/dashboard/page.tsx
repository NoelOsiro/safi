"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, BookOpen, CheckCircle, Clock, Award, TrendingUp, Loader2 } from "lucide-react"
import Link from "next/link"
import { apiClient } from "@/lib/api-client"

interface Module {
  id: string
  title: string
  description: string
  icon: string
  duration: string
  level: string
  image: string
  progress?: number
  status?: 'completed' | 'in-progress' | 'not-started'
}

interface ApiResponse {
  success: boolean
  modules: Module[]
}

export default function DashboardPage() {
  const [modules, setModules] = useState<Module[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await apiClient.getModules() as ApiResponse
        if (response?.success && Array.isArray(response.modules)) {
          // Add mock progress and status for now - in a real app, this would come from the user's progress
          const modulesWithProgress = response.modules.map((module: Module, index: number) => ({
            ...module,
            progress: index === 0 || index === 1 ? 100 : index === 2 ? 60 : 0,
            status: (index <= 1 ? 'completed' : index === 2 ? 'in-progress' : 'not-started') as 'completed' | 'in-progress' | 'not-started'
          }))
          setModules(modulesWithProgress)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (err) {
        console.error('Failed to fetch modules:', err)
        setError('Failed to load training modules. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchModules()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center my-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  const completedModules = modules.filter(module => module.status === 'completed').length
  const overallProgress = Math.round(modules.reduce((acc, module) => acc + (module.progress || 0), 0) / modules.length)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Training Dashboard</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button asChild variant="outline">
              <Link href="/assessment">Take Assessment</Link>
            </Button>
            <Button asChild className="bg-green-600 hover:bg-green-700">
              <Link href="/chat">AI Coach</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <Progress value={overallProgress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Modules Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2/5</div>
              <p className="text-xs text-muted-foreground">3 modules remaining</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.5h</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Certification Ready</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">75%</div>
              <p className="text-xs text-muted-foreground">Almost there!</p>
            </CardContent>
          </Card>
        </div>

        {/* Training Modules */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Training Modules</h2>
            <Badge variant="secondary">5 Modules Available</Badge>
          </div>

          <div className="grid gap-6">
            {modules.map((module) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="text-3xl">{module.icon}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Module {module.id}: {module.title}
                        </CardTitle>
                        <CardDescription className="mt-1">{module.description}</CardDescription>
                        <div className="flex items-center space-x-4 mt-3">
                          <Badge
                            variant={
                              module.status === "completed"
                                ? "default"
                                : module.status === "in-progress"
                                  ? "secondary"
                                  : "outline"
                            }
                            className={
                              module.status === "completed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : module.status === "in-progress"
                                  ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                  : ""
                            }
                          >
                            {module.status === "completed"
                              ? "Completed"
                              : module.status === "in-progress"
                                ? "In Progress"
                                : "Not Started"}
                          </Badge>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {module.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{module.progress}%</div>
                      <Progress value={module.progress} className="w-20 mt-1" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      {module.status === "completed" && (
                        <Button variant="outline" size="sm">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Review
                        </Button>
                      )}
                      {module.status === "in-progress" && (
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Continue
                        </Button>
                      )}
                      {module.status === "not-started" && (
                        <Button size="sm" variant="outline">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Start Module
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/chat?module=${module.id}`}>Ask AI Coach</Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-green-200">
            <CardHeader>
              <CardTitle className="text-green-800">Ready for Assessment?</CardTitle>
              <CardDescription>Test your knowledge with our comprehensive food safety assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-green-600 hover:bg-green-700">
                <Link href="/assessment">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Take Assessment
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-800">Need Help?</CardTitle>
              <CardDescription>Chat with Mama Safi AI Coach for personalized guidance</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/chat">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Chat with AI Coach
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
