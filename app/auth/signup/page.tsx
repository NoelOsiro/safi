"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, User, MapPin, Briefcase, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuthStore } from "@/lib/stores/auth-store"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function SignUpPage() {
  const router = useRouter()
  const login = useAuthStore((state) => state.login)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    businessType: "",
    location: "",
    experience: "",
    agreeToTerms: false,
  })

  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    setError("")

    try {
      const response = await apiClient.signup(formData)

      if (response.success) {
        login(response.user)
        router.push("/onboarding")
      }
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const renderStep1 = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-6">
        <User className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
        <p className="text-slate-600">Tell us about yourself</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            value={formData.fullName}
            onChange={(e) => handleInputChange("fullName", e.target.value)}
            placeholder="Enter your full name"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="email">Email Address *</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            placeholder="your.email@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
            placeholder="+254 700 000 000"
            className="mt-1"
          />
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-6">
        <Briefcase className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-slate-800">Business Information</h2>
        <p className="text-slate-600">Help us understand your food business</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="businessType">Business Type *</Label>
          <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your business type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="street-vendor">Street Food Vendor</SelectItem>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="school-kitchen">School Kitchen</SelectItem>
              <SelectItem value="catering">Catering Service</SelectItem>
              <SelectItem value="hotel">Hotel/Lodge</SelectItem>
              <SelectItem value="home-based">Home-based Food Business</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location (County) *</Label>
          <Select value={formData.location} onValueChange={(value) => handleInputChange("location", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select your county" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nairobi">Nairobi</SelectItem>
              <SelectItem value="mombasa">Mombasa</SelectItem>
              <SelectItem value="kisumu">Kisumu</SelectItem>
              <SelectItem value="eldoret">Uasin Gishu (Eldoret)</SelectItem>
              <SelectItem value="machakos">Machakos</SelectItem>
              <SelectItem value="nakuru">Nakuru</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="experience">Experience Level</Label>
          <Select value={formData.experience} onValueChange={(value) => handleInputChange("experience", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="How long have you been in food business?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">Just starting (0-6 months)</SelectItem>
              <SelectItem value="beginner">Beginner (6 months - 2 years)</SelectItem>
              <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
              <SelectItem value="experienced">Experienced (5+ years)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6 animate-fade-in-up">
      <div className="text-center mb-6">
        <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
        <h2 className="text-2xl font-bold text-slate-800">Almost Done!</h2>
        <p className="text-slate-600">Review your information and agree to our terms</p>
      </div>

      <div className="bg-emerald-50 rounded-lg p-4 space-y-2">
        <h3 className="font-semibold text-emerald-800">Your Information:</h3>
        <p className="text-sm text-emerald-700">
          <strong>Name:</strong> {formData.fullName}
        </p>
        <p className="text-sm text-emerald-700">
          <strong>Email:</strong> {formData.email}
        </p>
        <p className="text-sm text-emerald-700">
          <strong>Business:</strong> {formData.businessType}
        </p>
        <p className="text-sm text-emerald-700">
          <strong>Location:</strong> {formData.location}
        </p>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={formData.agreeToTerms}
          onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked as boolean)}
        />
        <Label htmlFor="terms" className="text-sm leading-relaxed">
          I agree to the{" "}
          <Link href="/terms" className="text-emerald-600 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-emerald-600 hover:underline">
            Privacy Policy
          </Link>
          . I understand that Mama Safi will help me learn food safety practices and prepare for certification.
        </Label>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-emerald-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </Button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">MS</span>
            </div>
            <span className="font-bold text-emerald-800">MAMA SAFI</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-slate-800">Join Mama Safi</h1>
            <Badge variant="secondary">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
          <div className="flex space-x-2">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  step <= currentStep ? "bg-emerald-500" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <Card className="shadow-xl border-0">
          <CardContent className="p-8">
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1 || isLoading}
                className="flex-1 mr-3"
              >
                Previous
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  onClick={handleNext}
                  disabled={
                    isLoading ||
                    (currentStep === 1 && (!formData.fullName || !formData.email || !formData.phone)) ||
                    (currentStep === 2 && (!formData.businessType || !formData.location))
                  }
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.agreeToTerms || isLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Benefits Section */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white/80 rounded-lg">
            <div className="text-2xl mb-2">🎓</div>
            <h3 className="font-semibold text-slate-800">Learn</h3>
            <p className="text-sm text-slate-600">5 comprehensive modules</p>
          </div>
          <div className="text-center p-4 bg-white/80 rounded-lg">
            <div className="text-2xl mb-2">📱</div>
            <h3 className="font-semibold text-slate-800">Practice</h3>
            <p className="text-sm text-slate-600">AI-powered assessments</p>
          </div>
          <div className="text-center p-4 bg-white/80 rounded-lg">
            <div className="text-2xl mb-2">🏆</div>
            <h3 className="font-semibold text-slate-800">Certify</h3>
            <p className="text-sm text-slate-600">Get ready for inspection</p>
          </div>
        </div>
      </div>
    </div>
  )
}
