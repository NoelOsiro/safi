"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, User, Briefcase, MapPin, AlertCircle } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"

type FormData = {
  phone: string
  businessType: string
  location: string
  experience: string
  agreeToTerms: boolean
}

function SignUpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, isAuthenticated, isLoading } = useAuthStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 2
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")

  const [formData, setFormData] = useState<FormData>({
    phone: "",
    businessType: "",
    location: "",
    experience: "",
    agreeToTerms: false,
  })

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((step) => step + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((step) => step - 1)
    }
  }

  const handleAzureSignIn = async () => {
    setError("")
    try {
      // await signInWithMicrosoft()
    } catch (error) {
      setError("Failed to sign in with Azure AD")
    }
  }

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      return handleAzureSignIn()
    }

    if (currentStep < totalSteps) {
      return handleNext()
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          name: user?.name,
          email: user?.email,
          avatar: user?.avatar,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to complete signup")
      }

      if (data.success) {
        router.push(data.user.onboardingCompleted ? "/dashboard" : "/onboarding")
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete signup")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderAuthStep = () => (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 px-6 pt-8 pb-4">
        <CardTitle className="text-2xl font-bold text-center text-gray-900">
          Create your account
        </CardTitle>
        <CardDescription className="text-center text-gray-600">
          Sign up with your email to get started
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 px-6 pb-8 pt-2">
        <Button
          onClick={handleAzureSignIn}
          disabled={isLoading}
          className="w-full bg-[#0078D4] hover:bg-[#106EBE] text-white py-2 h-auto text-base"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Signing in...
            </>
          ) : (
            <span className="flex items-center justify-center">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 21 21" fill="currentColor">
                <path d="M0 3.5h9v15H0z" fill="#f3f3f3"/>
                <path d="M15.3 10.2c0-2.9-1.2-4.9-3-6.3l-2.4 2.4c.8.6 1.3 1.6 1.3 3 0 1.3-.5 2.3-1.3 3l2.4 2.4c1.8-1.4 3-3.5 3-6.4z" fill="#f3f3f3"/>
                <path d="M21 10.2c0 2.9-1.2 5.8-3 7.1l-2.4-2.4c.8-.6 1.3-1.7 1.3-3 0-1.3-.5-2.4-1.3-3l2.4-2.4c1.8 1.3 3 4.2 3 7.1z" fill="#f3f3f3"/>
              </svg>
              Sign in with Microsoft
            </span>
          )}
        </Button>
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <a href="/auth/signin" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </p>
      </CardContent>
    </Card>
  )

  const renderProfileStep = () => (
    <Card className="w-full shadow-lg">
      <CardHeader className="space-y-1 px-6 pt-8 pb-4">
        <CardTitle className="text-2xl font-bold text-gray-900">
          Complete your profile
        </CardTitle>
        <CardDescription className="text-gray-600">
          Tell us more about yourself
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex items-center space-x-4">
            <img
              className="h-12 w-12 rounded-full"
              src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || "User"}&background=10B981&color=fff`}
              alt="User avatar"
            />
            <div>
              <p className="font-medium">{user?.name || "User"}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              placeholder="+254 700 123 456"
              className="mt-1"
              required
            />
          </div>

          {currentStep === 2 && (
            <>
              <div>
                <Label htmlFor="businessType">Business Type *</Label>
                <Select
                  value={formData.businessType}
                  onValueChange={(value) => handleInputChange("businessType", value)}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="street-vendor">Street Vendor</SelectItem>
                    <SelectItem value="restaurant">Restaurant</SelectItem>
                    <SelectItem value="catering">Catering Service</SelectItem>
                    <SelectItem value="school-kitchen">School Kitchen</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) => handleInputChange("location", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nairobi">Nairobi</SelectItem>
                    <SelectItem value="mombasa">Mombasa</SelectItem>
                    <SelectItem value="kisumu">Kisumu</SelectItem>
                    <SelectItem value="nakuru">Nakuru</SelectItem>
                    <SelectItem value="eldoret">Eldoret</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="experience">Experience Level</Label>
                <Select
                  value={formData.experience}
                  onValueChange={(value) => handleInputChange("experience", value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select your experience level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner (0-1 year)</SelectItem>
                    <SelectItem value="intermediate">Intermediate (1-3 years)</SelectItem>
                    <SelectItem value="experienced">Experienced (3+ years)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-start space-x-2 pt-2">
                <Checkbox
                  id="terms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) => handleInputChange("agreeToTerms", !!checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <label
                    htmlFor="terms"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    I agree to the{" "}
                    <a href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
              </div>
            </>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 rounded-md">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {currentStep === 2 ? (
              <Button variant="outline" onClick={handlePrevious} disabled={isSubmitting}>
                Back
              </Button>
            ) : (
              <div />
            )}
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || (currentStep === 1 && !formData.phone) || (currentStep === 2 && !formData.agreeToTerms)}
              className="ml-auto bg-emerald-600 hover:bg-emerald-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {currentStep === 2 ? "Completing..." : "Continue"}
                </>
              ) : currentStep === 2 ? (
                "Complete Sign Up"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  // Render loading state
  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your session...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, show auth step
  if (status !== "authenticated") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md">
          {renderAuthStep()}
        </div>
      </div>
    )
  }

  // Show the profile completion form for authenticated users
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Progress Indicator */}
        <div className="space-y-2 text-center">
          <div className="flex justify-center space-x-2">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i + 1 <= currentStep ? "bg-primary w-6" : "bg-gray-200 w-2"
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
        </div>

        {/* Form Content */}
        <div className="space-y-6">
          {currentStep === 1 && renderProfileStep()}
          {currentStep === 2 && renderProfileStep()}
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
