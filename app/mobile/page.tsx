"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MessageCircle, BookOpen, Camera, Award, Send, Menu } from "lucide-react"
import Link from "next/link"

export default function MobilePage() {
  const [currentView, setCurrentView] = useState("home")
  const [message, setMessage] = useState("")

  const renderHomeView = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">MS</span>
          </div>
          <div>
            <h1 className="font-bold text-lg">MAMA SAFI</h1>
            <Badge className="bg-green-100 text-green-800 text-xs">AI</Badge>
          </div>
        </div>
        <Button variant="ghost" size="sm">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* AI Coach Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-green-800">AI COACH</h2>
              <p className="text-sm text-green-600">Ready to help you learn</p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-600" />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button
          onClick={() => setCurrentView("module1")}
          className="w-full justify-start h-auto p-4 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
          variant="outline"
        >
          <BookOpen className="h-5 w-5 mr-3 text-blue-600" />
          <div className="text-left">
            <div className="font-medium">Learn about food safety</div>
            <div className="text-sm text-gray-500">Start with Module 1</div>
          </div>
        </Button>

        <Button
          onClick={() => setCurrentView("assessment")}
          className="w-full justify-start h-auto p-4 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
          variant="outline"
        >
          <Camera className="h-5 w-5 mr-3 text-purple-600" />
          <div className="text-left">
            <div className="font-medium">Assess your kitchen</div>
            <div className="text-sm text-gray-500">Upload photos for AI review</div>
          </div>
        </Button>

        <Button
          onClick={() => setCurrentView("certification")}
          className="w-full justify-start h-auto p-4 bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
          variant="outline"
        >
          <Award className="h-5 w-5 mr-3 text-orange-600" />
          <div className="text-left">
            <div className="font-medium">Prepare for certification</div>
            <div className="text-sm text-gray-500">Get ready for inspection</div>
          </div>
        </Button>
      </div>

      {/* Message Input */}
      <div className="mt-6">
        <div className="flex space-x-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button size="icon" className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )

  const renderModule1View = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold">MODULE 1</h1>
        <p className="text-gray-600">Introduction to Food Safety</p>
      </div>

      {/* Video Player */}
      <Card>
        <CardContent className="p-0">
          <div className="bg-gradient-to-br from-green-100 to-blue-100 aspect-video rounded-t-lg flex items-center justify-center">
            <Button size="lg" className="rounded-full w-16 h-16 bg-white/90 hover:bg-white text-green-600">
              <div className="w-0 h-0 border-l-[12px] border-l-green-600 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent ml-1"></div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      <div className="flex items-center justify-between">
        <div className="flex-1 bg-gray-200 rounded-full h-2 mr-4">
          <div className="bg-green-600 h-2 rounded-full" style={{ width: "25%" }}></div>
        </div>
        <span className="text-sm text-gray-600">1 of 4</span>
      </div>

      {/* Navigation */}
      <Button onClick={() => setCurrentView("assessment")} className="w-full bg-green-600 hover:bg-green-700">
        Next
      </Button>

      <Button onClick={() => setCurrentView("home")} variant="outline" className="w-full">
        Back to Home
      </Button>
    </div>
  )

  const renderAssessmentView = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold">AI SELF-ASSESSMENT</h1>
        <h2 className="text-lg font-bold">CHECKLIST</h2>
      </div>

      {/* Photo Upload */}
      <div>
        <p className="font-medium mb-3">Upload photos</p>
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"
            >
              <div className="text-gray-400 text-2xl">×</div>
            </div>
          ))}
        </div>
      </div>

      {/* Question */}
      <Card>
        <CardContent className="p-4">
          <p className="font-medium mb-4">Do you separate raw and cooked foods?</p>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="border-green-200 text-green-700">
              Yes
            </Button>
            <Button variant="outline">No</Button>
          </div>
        </CardContent>
      </Card>

      {/* Score */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-blue-900">Hygiene Score: 75</p>
              <p className="text-sm text-blue-700">Tips to improve</p>
            </div>
            <Button size="sm" variant="outline" className="border-blue-200 text-blue-700">
              View
            </Button>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => setCurrentView("certification")} className="w-full bg-green-600 hover:bg-green-700">
        Continue to Certification
      </Button>

      <Button onClick={() => setCurrentView("home")} variant="outline" className="w-full">
        Back to Home
      </Button>
    </div>
  )

  const renderCertificationView = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-lg font-bold">CERTIFICATION</h1>
        <h2 className="text-lg font-bold">REQUIREMENTS</h2>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-start">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
            <p className="text-gray-700">Required documents</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
            <p className="text-gray-700">What health inspectors look for</p>
          </div>
          <div className="flex items-start">
            <div className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3"></div>
            <p className="text-gray-700">How to pass your first inspection</p>
          </div>
        </CardContent>
      </Card>

      <Button className="w-full bg-green-600 hover:bg-green-700">Start</Button>

      <Button onClick={() => setCurrentView("home")} variant="outline" className="w-full">
        Back to Home
      </Button>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Container */}
      <div className="max-w-sm mx-auto bg-white min-h-screen">
        {/* Status Bar */}
        <div className="h-6 bg-gray-100 flex items-center justify-center">
          <div className="w-16 h-1 bg-gray-400 rounded-full"></div>
        </div>

        {/* Content */}
        <div className="p-4 pb-8">
          {currentView === "home" && renderHomeView()}
          {currentView === "module1" && renderModule1View()}
          {currentView === "assessment" && renderAssessmentView()}
          {currentView === "certification" && renderCertificationView()}
        </div>
      </div>

      {/* Desktop Notice */}
      <div className="fixed bottom-4 right-4 max-w-sm">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <p className="text-sm text-blue-800 mb-2">
              <strong>Mobile Preview</strong>
            </p>
            <p className="text-xs text-blue-700">
              This shows how MAMA SAFI looks on mobile devices.
              <Link href="/" className="underline ml-1">
                View full site
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
