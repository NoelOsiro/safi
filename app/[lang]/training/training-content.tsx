"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Clock, Users, Award, BookOpen, Play, CheckCircle } from "lucide-react"
import Link from "next/link"
import { mockModules } from "@/lib/mock-data"

export default function TrainingContent() {
  const [modules] = useState(
    mockModules.map((module, index) => ({
      ...module,
      progress: index === 0 || index === 1 ? 100 : index === 2 ? 60 : 0,
      status: (index <= 1 ? "completed" : index === 2 ? "in-progress" : "not-started") as
        | "completed"
        | "in-progress"
        | "not-started",
    })),
  )

  const completedModules = modules.filter((m) => m.status === "completed").length
  const overallProgress = Math.round(modules.reduce((acc, module) => acc + module.progress, 0) / modules.length)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Food Safety Training</h1>
          <p className="text-gray-600">Master essential food safety practices for your business</p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-600" />
              Training Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div 
                  data-testid="overall-progress"
                  className="text-2xl font-bold text-emerald-600" 
                  role="progressbar" 
                  aria-valuenow={overallProgress} 
                  aria-valuemin={0} 
                  aria-valuemax={100}
                >
                  {overallProgress}%
                </div>
                <div className="text-sm text-gray-600">Overall Progress</div>
                <Progress value={overallProgress} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {completedModules}/{modules.length}
                </div>
                <div className="text-sm text-gray-600">Modules Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {modules.reduce((acc, m) => acc + Number(m.duration || 0), 0)} min
                </div>
                <div className="text-sm text-gray-600">Total Study Time</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Training Modules */}
        <div className="grid gap-6">
          {modules.map((module) => (
            <Card key={module.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <CardTitle className="text-xl">{module.title}</CardTitle>
                      <Badge
                        role="status"
                        variant={
                          module.status === "completed"
                            ? "default"
                            : module.status === "in-progress"
                              ? "secondary"
                              : "outline"
                        }
                        className={
                          module.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : module.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                        }
                      >
                        {module.status === "completed"
                          ? "Completed"
                          : module.status === "in-progress"
                            ? "In Progress"
                            : "Not Started"}
                      </Badge>
                    </div>
                    <CardDescription className="text-base">{module.description}</CardDescription>
                  </div>
                  {module.status === "completed" && <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Module Stats */}
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {module.duration} min
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      {module.slides?.length || 0} lessons
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {module.level}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {module.progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{module.progress}%</span>
                      </div>
                      <Progress value={module.progress} />
                    </div>
                  )}

                  {/* Action Button */}
                  <div className="flex justify-between items-center pt-2">
                    <div className="text-sm text-gray-600">
                      {module.status === "completed"
                        ? "Review completed module"
                        : module.status === "in-progress"
                          ? "Continue learning"
                          : "Start your learning journey"}
                    </div>
                    <Link href={`/training/modules/${module.id}`}>
                      <Button
                        variant={module.status === "completed" ? "outline" : "default"}
                        className="flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {module.status === "completed"
                          ? "Review"
                          : module.status === "in-progress"
                            ? "Continue"
                            : "Start"}
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
