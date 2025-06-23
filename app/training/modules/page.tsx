"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  ArrowLeft,
  Play,
  Pause,
  Volume2,
  ArrowRight,
  CheckCircle,
  Star,
  MessageCircle,
  ThumbsUp,
  ThumbsDown,
  Send,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useAuthStore } from "@/lib/stores/auth-store"
import { useModuleStore } from "@/lib/stores/module-store"
import { useReviewStore } from "@/lib/stores/review-store"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

export default function Module1Page() {
  const router = useRouter()
  const { user, isAuthenticated, needsOnboarding } = useAuthStore()
  const { currentModule, currentSlide, setCurrentModule, setCurrentSlide, nextSlide, previousSlide } = useModuleStore()
  const { reviews, setReviews, addReview, isLoading: reviewsLoading } = useReviewStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isLoadingModule, setIsLoadingModule] = useState(true)

  useEffect(() => {
    // Check authentication and onboarding status
    if (!isAuthenticated) {
      router.push("/auth/signup")
      return
    }

    if (needsOnboarding) {
      router.push("/onboarding")
      return
    }

    loadModuleData()
  }, [isAuthenticated, needsOnboarding, router])

  const loadModuleData = async () => {
    try {
      setIsLoadingModule(true)

      // Load module data
      const moduleResponse = await apiClient.getModule("1")
      if (moduleResponse.success) {
        setCurrentModule(moduleResponse.module)
      }

      // Load reviews
      const reviewsResponse = await apiClient.getReviews("1")
      if (reviewsResponse.success) {
        setReviews(reviewsResponse.reviews)
      }
    } catch (error) {
      console.error("Failed to load module data:", error)
    } finally {
      setIsLoadingModule(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setUserRating(rating)
  }

  const handleSubmitReview = async () => {
    if (userRating === 0 || !user) return

    setIsSubmittingReview(true)
    try {
      // Data for the API call
      const apiReviewData = {
        moduleId: "1",
        userId: user.id,
        date: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0,
        rating: userRating,
        comment: userReview,
        userName: user.fullName,
        userAvatar: user.avatar || `https://picsum.photos/40/40?random=${user.id}`
      };

      const response = await apiClient.createReview(apiReviewData);
      
      if (response.success) {
        // Data for the store update (matches the Review type)
        const storeReviewData = {
          moduleId: "1",
          userId: user.id,
          rating: userRating,
          comment: userReview,
          user: {
            fullName: user.fullName,
            username: user.username,
            avatar: user.avatar || `https://picsum.photos/40/40?random=${user.id}`
          },
          createdAt: new Date().toISOString()
        };
        addReview(storeReviewData)
        setShowReview(false)
        setUserRating(0)
        setUserReview("")
      }
    } catch (error) {
      console.error("Failed to submit review:", error)
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  if (isLoadingModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading module...</p>
        </div>
      </div>
    )
  }

  if (!currentModule) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-600">Module not found</p>
          <Button asChild className="mt-4">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  const totalSlides = currentModule.slides.length
  const moduleProgress = (currentSlide / totalSlides) * 100
  const currentSlideData = currentModule.slides[currentSlide - 1]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Enhanced Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-emerald-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" asChild className="hover:bg-emerald-50 transition-colors">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
            <div className="text-center">
              <h1 className="font-bold text-xl text-slate-800">MODULE 1</h1>
              <p className="text-sm text-slate-600">{currentModule.title}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 shadow-sm animate-pulse">
                AI Enhanced
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Enhanced Progress Indicator */}
        <div className="mb-8 animate-fade-in-up">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-slate-800">Module Progress</span>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-slate-600">
                {currentSlide} of {totalSlides}
              </span>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                {Math.round(moduleProgress)}% Complete
              </Badge>
            </div>
          </div>
          <Progress value={moduleProgress} className="h-3 bg-gray-200" />
        </div>

        {/* Enhanced Video/Content Player */}
        <Card className="mb-8 shadow-2xl border-0 overflow-hidden animate-fade-in-up delay-100">
          <CardContent className="p-0">
            {/* Video Player Area with Image */}
            <div className="relative">
              <Image
                src={currentSlideData.image || "/placeholder.svg"}
                alt={currentSlideData.title}
                width={600}
                height={400}
                className="w-full h-64 md:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-center justify-center">
                <div className="text-center">
                  <Button
                    size="lg"
                    onClick={togglePlay}
                    className="rounded-full w-20 h-20 bg-white/90 hover:bg-white text-emerald-600 shadow-2xl transform hover:scale-110 transition-all duration-300"
                  >
                    {isPlaying ? <Pause className="h-10 w-10" /> : <Play className="h-10 w-10 ml-1" />}
                  </Button>
                  <p className="mt-4 text-white font-medium text-lg drop-shadow-lg">
                    {isPlaying ? "Playing lesson..." : "Tap to play lesson"}
                  </p>
                </div>
              </div>

              {/* Audio Controls */}
              <div className="absolute bottom-4 right-4">
                <Button variant="ghost" size="sm" className="bg-white/80 hover:bg-white backdrop-blur-sm">
                  <Volume2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Slide Counter */}
              <div className="absolute top-4 left-4">
                <Badge className="bg-black/50 text-white backdrop-blur-sm">
                  Slide {currentSlide}/{totalSlides}
                </Badge>
              </div>
            </div>

            {/* Enhanced Content Area */}
            <div className="p-8 bg-gradient-to-br from-white to-emerald-50">
              <h2 className="text-3xl font-bold mb-4 text-slate-800">{currentSlideData.title}</h2>
              <p className="text-lg text-slate-700 mb-6 leading-relaxed">{currentSlideData.content}</p>

              {/* Enhanced Key Points */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-slate-900">Key Learning Points:</h3>
                <div className="grid md:grid-cols-2 gap-3">
                  {currentSlideData.keyPoints.map((point: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start p-3 bg-white rounded-lg shadow-sm border border-emerald-100 hover:shadow-md transition-shadow"
                    >
                      <CheckCircle className="h-5 w-5 text-emerald-600 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Navigation Controls */}
        <div className="flex justify-between items-center mb-8 animate-fade-in-up delay-200">
          <Button
            variant="outline"
            onClick={previousSlide}
            disabled={currentSlide === 1}
            className="flex-1 mr-4 h-12 text-lg hover:bg-emerald-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Previous
          </Button>

          {currentSlide < totalSlides ? (
            <Button
              onClick={nextSlide}
              className="flex-1 h-12 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg transform hover:scale-105 transition-all"
            >
              Next Slide
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          ) : (
            <Button
              asChild
              className="flex-1 h-12 text-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg transform hover:scale-105 transition-all"
            >
              <Link href="/assessment">
                Complete Module
                <CheckCircle className="h-5 w-5 ml-2" />
              </Link>
            </Button>
          )}
        </div>

        {/* Enhanced Quick Actions */}
        <div className="grid md:grid-cols-2 gap-6 mb-8 animate-fade-in-up delay-300">
          <Card className="border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <MessageCircle className="h-12 w-12 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
              <p className="text-sm text-slate-600 mb-4">Ask our AI coach any questions about this module</p>
              <Button asChild variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-50">
                <Link href="/chat?module=1">Ask AI Coach</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
            <CardContent className="p-6 text-center">
              <CheckCircle className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
              <h3 className="font-semibold text-emerald-800 mb-2">Ready to Test?</h3>
              <p className="text-sm text-slate-600 mb-4">Take the assessment to check your understanding</p>
              <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                <Link href="/assessment">Take Assessment</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Review Section */}
        <Card className="mb-8 animate-fade-in-up delay-400">
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800">Module Reviews</h3>
              <div className="flex items-center space-x-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="h-5 w-5 text-amber-400 fill-current" />
                  ))}
                </div>
                <span className="text-slate-600">
                  {currentModule.averageRating} ({currentModule.totalReviews} reviews)
                </span>
              </div>
            </div>

            {/* Add Review Button */}
            {!showReview && (
              <Button
                onClick={() => setShowReview(true)}
                variant="outline"
                className="mb-6 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              >
                <Star className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            )}

            {/* Review Form */}
            {showReview && (
              <div className="mb-6 p-6 bg-emerald-50 rounded-lg border border-emerald-200">
                <h4 className="font-semibold text-emerald-800 mb-4">Share Your Experience</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button key={star} onClick={() => handleRatingClick(star)} className="focus:outline-none">
                          <Star
                            className={`h-8 w-8 transition-colors ${
                              star <= userRating ? "text-amber-400 fill-current" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Your Review</label>
                    <Textarea
                      value={userReview}
                      onChange={(e) => setUserReview(e.target.value)}
                      placeholder="Share your thoughts about this module..."
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button
                      onClick={handleSubmitReview}
                      disabled={userRating === 0 || isSubmittingReview}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {isSubmittingReview ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Submit Review
                        </>
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setShowReview(false)}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Existing Reviews */}
            {reviewsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
                <p className="text-slate-600">Loading reviews...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-emerald-100 text-emerald-700">
                          {review.user.username.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-semibold text-slate-800">{review.user.username}</h5>
                          <span className="text-sm text-slate-500">{new Date(review.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center mb-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? "text-amber-400 fill-current" : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-slate-700">{review.comment}</p>
                        <div className="flex items-center space-x-4 mt-3">
                          <button className="flex items-center space-x-1 text-slate-500 hover:text-emerald-600 transition-colors">
                            <ThumbsUp className="h-4 w-4" />
                            <span className="text-sm">Helpful ({review.helpful})</span>
                          </button>
                          <button className="flex items-center space-x-1 text-slate-500 hover:text-red-600 transition-colors">
                            <ThumbsDown className="h-4 w-4" />
                            <span className="text-sm">Not helpful ({review.notHelpful})</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Module Navigation */}
        <Card className="animate-fade-in-up delay-500">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4 text-slate-800">Course Progress</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {[1, 2, 3, 4, 5].map((moduleNum) => (
                <div
                  key={moduleNum}
                  className={`flex items-center p-3 rounded-lg border transition-all ${
                    moduleNum === 1
                      ? "bg-emerald-50 border-emerald-200"
                      : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {moduleNum === 1 ? (
                    <CheckCircle className="h-5 w-5 text-emerald-600 mr-2" />
                  ) : (
                    <div className="h-5 w-5 border-2 border-gray-300 rounded-full mr-2"></div>
                  )}
                  <span className={`text-sm ${moduleNum === 1 ? "text-emerald-800 font-medium" : "text-gray-600"}`}>
                    Module {moduleNum}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
