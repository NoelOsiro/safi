"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Play, MessageCircle, Camera, ArrowRight } from "lucide-react"
import Image from "next/image"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useRouter } from "next/navigation"

export default function OnboardingPage() {
  const router = useRouter()
  const { user, isAuthenticated, needsOnboarding, completeOnboarding } = useAuthStore()
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    if (!isAuthenticated || !needsOnboarding) {
      router.push("/dashboard")
      return
    }
  }, [isAuthenticated, needsOnboarding, router])

  const steps = [
    {
      title: "Welcome to Mama Safi!",
      subtitle: "Your AI-powered food safety coach",
      content: "We're excited to help you master food safety and get certified. Let's start your journey!",
      image: "https://picsum.photos/400/300?random=1",
      action: "Get Started",
    },
    {
      title: "Meet Your AI Coach",
      subtitle: "Available 24/7 in your language",
      content:
        "Our AI coach speaks English, Kiswahili, and Sheng. Ask questions anytime and get personalized guidance for your food business.",
      image: "https://picsum.photos/400/300?random=2",
      action: "Continue",
    },
    {
      title: "Learn Through Modules",
      subtitle: "5 comprehensive training modules",
      content:
        "From basic hygiene to certification prep, our modules are designed specifically for Kenyan food vendors and kitchens.",
      image: "https://picsum.photos/400/300?random=3",
      action: "Continue",
    },
    {
      title: "Assess Your Kitchen",
      subtitle: "AI-powered photo analysis",
      content:
        "Upload photos of your kitchen and get instant feedback on food safety practices. Our AI will help you identify areas for improvement.",
      image: "https://picsum.photos/400/300?random=4",
      action: "Continue",
    },
    {
      title: "Get Certified",
      subtitle: "Pass your health inspection",
      content:
        "Practice with mock tests and real scenarios. We'll prepare you to pass your certification on the first try!",
      image: "https://picsum.photos/400/300?random=5",
      action: "Start Learning",
    },
  ]

  const currentStepData = steps[currentStep]
  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
      router.push("/dashboard")
    }
  }

  const handleSkip = () => {
    completeOnboarding()
    router.push("/dashboard")
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-emerald-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <span className="font-bold text-emerald-800">MAMA SAFI</span>
          </div>
          <Button variant="ghost" onClick={handleSkip} className="text-slate-600">
            Skip Tour
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Welcome Message */}
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Karibu, {user.fullName.split(" ")[0]}! 👋</h1>
          <p className="text-slate-600">
            Welcome to your food safety journey. Let's get you started with a quick tour.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Onboarding Progress</span>
            <Badge variant="secondary">
              {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Content Side */}
          <div className="animate-fade-in-left">
            <div className="mb-6">
              <h2 className="text-4xl font-bold text-slate-800 mb-3">{currentStepData.title}</h2>
              <p className="text-xl text-emerald-600 font-medium mb-4">{currentStepData.subtitle}</p>
              <p className="text-lg text-slate-600 leading-relaxed">{currentStepData.content}</p>
            </div>

            {/* Feature Highlights */}
            {currentStep === 0 && (
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700">Learn in your preferred language</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700">Get personalized AI coaching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-emerald-600" />
                  <span className="text-slate-700">Prepare for certification</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <Button
                onClick={handleNext}
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
              >
                {currentStepData.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              {currentStep > 0 && (
                <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                  Previous
                </Button>
              )}
            </div>
          </div>

          {/* Image Side */}
          <div className="animate-fade-in-right">
            <Card className="overflow-hidden shadow-2xl border-0">
              <CardContent className="p-0">
                <div className="relative">
                  <Image
                    src={currentStepData.image || "/placeholder.svg"}
                    alt={currentStepData.title}
                    width={400}
                    height={300}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions Preview */}
        {currentStep === steps.length - 1 && (
          <div className="mt-12 animate-fade-in-up">
            <h3 className="text-2xl font-bold text-slate-800 text-center mb-8">What you can do next:</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <MessageCircle className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-slate-800 mb-2">Chat with AI Coach</h4>
                  <p className="text-sm text-slate-600">Get instant answers to your food safety questions</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Play className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-slate-800 mb-2">Start Module 1</h4>
                  <p className="text-sm text-slate-600">Begin with food safety basics</p>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <CardContent className="p-6 text-center">
                  <Camera className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h4 className="font-semibold text-slate-800 mb-2">Assess Kitchen</h4>
                  <p className="text-sm text-slate-600">Upload photos for AI analysis</p>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Step Indicators */}
        <div className="flex justify-center mt-12 space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentStep ? "bg-emerald-600 scale-125" : "bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
