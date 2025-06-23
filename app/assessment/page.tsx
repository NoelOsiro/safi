"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Camera, CheckCircle, AlertCircle, Upload } from "lucide-react"
import Link from "next/link"

export default function AssessmentPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [uploadedImages, setUploadedImages] = useState<string[]>([])

  const assessmentSteps = [
    {
      type: "photo",
      title: "Kitchen Photo Assessment",
      description: "Upload photos of your kitchen areas for AI analysis",
      questions: [
        { id: "storage", label: "Food Storage Area", required: true },
        { id: "worktop", label: "Work Surface/Preparation Area", required: true },
        { id: "cooking", label: "Cooking Area", required: true },
      ],
    },
    {
      type: "quiz",
      title: "Hygiene Practices",
      description: "Answer questions about your current hygiene practices",
      questions: [
        {
          id: "handwashing",
          question: "How often do you wash your hands while preparing food?",
          options: [
            "Before starting and after handling raw food",
            "Only when they look dirty",
            "Once at the beginning",
            "I don't always remember",
          ],
        },
        {
          id: "separation",
          question: "Do you separate raw and cooked foods during storage?",
          options: ["Always", "Sometimes", "Rarely", "Never"],
        },
        {
          id: "temperature",
          question: "How do you check if food is cooked properly?",
          options: [
            "Use a food thermometer",
            "Check color and texture",
            "Taste a small amount",
            "Cook for the usual time",
          ],
        },
      ],
    },
    {
      type: "checklist",
      title: "Safety Checklist",
      description: "Self-assessment of your current practices",
      questions: [
        "I have proper ventilation in my cooking area",
        "I store cleaning chemicals away from food",
        "I have a first aid kit accessible",
        "I regularly clean and sanitize surfaces",
        "I check expiry dates before using ingredients",
        "I have proper waste disposal systems",
        "I keep pets away from food preparation areas",
        "I wear clean clothes/apron while cooking",
      ],
    },
  ]

  const currentStepData = assessmentSteps[currentStep]
  const progress = ((currentStep + 1) / assessmentSteps.length) * 100

  const handleNext = () => {
    if (currentStep < assessmentSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }))
  }

  const renderPhotoStep = () => (
    <div className="space-y-6">
      {currentStepData.questions.map((question) => (
        <Card
          key={question.id}
          className="border-dashed border-2 border-gray-300 hover:border-green-400 transition-colors"
        >
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Camera className="h-5 w-5 mr-2 text-green-600" />
              {question.label}
              {question.required && (
                <Badge variant="destructive" className="ml-2">
                  Required
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600 text-center mb-4">Click to upload or drag and drop your photo here</p>
              <Button variant="outline">
                <Camera className="h-4 w-4 mr-2" />
                Upload Photo
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
          <div>
            <h4 className="font-medium text-blue-900">Photo Tips</h4>
            <p className="text-sm text-blue-700 mt-1">
              Take clear, well-lit photos showing the entire area. Our AI will analyze cleanliness, organization, and
              safety practices.
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderQuizStep = () => (
    <div className="space-y-6">
      {currentStepData.questions.map((question, index) => (
        <Card key={question.id}>
          <CardHeader>
            <CardTitle className="text-lg">
              Question {index + 1}: {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup
              value={answers[question.id] || ""}
              onValueChange={(value) => handleAnswerChange(question.id, value)}
            >
              {question.options?.map((option, optionIndex) => (
                <div key={optionIndex} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`${question.id}-${optionIndex}`} />
                  <Label htmlFor={`${question.id}-${optionIndex}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  const renderChecklistStep = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Safety Practices Checklist</CardTitle>
          <CardDescription>Check all practices that apply to your current food handling routine</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentStepData.questions.map((item, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                id={`checklist-${index}`}
                className="h-4 w-4 text-green-600 rounded border-gray-300"
                onChange={(e) => handleAnswerChange(`checklist-${index}`, e.target.checked.toString())}
              />
              <Label htmlFor={`checklist-${index}`} className="flex-1 cursor-pointer">
                {item}
              </Label>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )

  if (currentStep >= assessmentSteps.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Assessment Complete!</CardTitle>
            <CardDescription>Your food safety assessment has been submitted for AI analysis</CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="font-semibold text-green-900 mb-2">Preliminary Score</h3>
              <div className="text-3xl font-bold text-green-700 mb-2">78/100</div>
              <p className="text-green-700 text-sm">Good foundation! Some areas need improvement.</p>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold">Next Steps:</h4>
              <ul className="text-left space-y-2 text-sm">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Complete Module 3: Food Handling & Storage
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Review hygiene practices with AI Coach
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  Take mock certification test
                </li>
              </ul>
            </div>

            <div className="flex space-x-4">
              <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                <Link href="/dashboard">View Dashboard</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/chat">Chat with AI Coach</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Dashboard
              </Link>
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Food Safety Assessment</h1>
          </div>
          <Badge variant="secondary">
            Step {currentStep + 1} of {assessmentSteps.length}
          </Badge>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Assessment Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Current Step */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">{currentStepData.title}</CardTitle>
            <CardDescription>{currentStepData.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStepData.type === "photo" && renderPhotoStep()}
            {currentStepData.type === "quiz" && renderQuizStep()}
            {currentStepData.type === "checklist" && renderChecklistStep()}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
            {currentStep === assessmentSteps.length - 1 ? "Complete Assessment" : "Next Step"}
          </Button>
        </div>
      </div>
    </div>
  )
}
