"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

import type { Review } from "@/lib/api-client";

// Define the exact type that the API expects for creating a review

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
import { useRouter, useParams } from "next/navigation"


type CreateReviewInput = {
    moduleId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    rating: number;
    comment: string;
    createdAt: string;
    date: string;
    helpful: number;
    notHelpful: number;
  };

export default function ModulePage() {
  const router = useRouter()
  const { id } = useParams()
  const { user, isAuthenticated, needsOnboarding } = useAuthStore()
  const { currentModule, currentSlide, setCurrentModule, setCurrentSlide, nextSlide, previousSlide } = useModuleStore()
  const { reviews, setReviews, addReview, isLoading: reviewsLoading } = useReviewStore()

  const [isPlaying, setIsPlaying] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [isLoadingModule, setIsLoadingModule] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

    if (id) {
      loadModuleData(id as string)
    }
  }, [isAuthenticated, needsOnboarding, router, id])

  const loadModuleData = async (moduleId: string) => {
    try {
      setIsLoadingModule(true)
      setError(null)

      // Load module data
      const moduleResponse = await apiClient.getModule(moduleId)
      if (moduleResponse.success) {
        setCurrentModule(moduleResponse.module)
      } else {
        setError("Failed to load module data")
      }

      // Load reviews
      const reviewsResponse = await apiClient.getReviews(moduleId)
      if (reviewsResponse.success) {
        // Transform the API response to match the expected Review type
        const transformedReviews = reviewsResponse.reviews.map(review => ({
          ...review,
          userName: review.user?.username,
          userAvatar: review.user?.avatar,
          date: review.createdAt,
          helpful: 0,        // Default value
          notHelpful: 0      // Default value
        }))
        setReviews(transformedReviews)
      }
    } catch (error) {
      console.error("Failed to load module data:", error)
      setError("An error occurred while loading the module")
    } finally {
      setIsLoadingModule(false)
    }
  }

  const handleRatingClick = (rating: number) => {
    setUserRating(rating)
  }

  const handleSubmitReview = async () => {
    if (userRating === 0 || !user || !id) return;
  
    // Ensure id is a string (take the first element if it's an array)
    const moduleId = Array.isArray(id) ? id[0] : id;
  
    setIsSubmittingReview(true);
    try {
      // Create the review data with the correct type
      const reviewData: CreateReviewInput = {
        moduleId,
        userId: user.id,
        userName: user.username,
        userAvatar: user.avatar || `https://picsum.photos/40/40?random=${user.id}`,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
        helpful: 0,
        notHelpful: 0,
        rating: userRating,
        comment: userReview
      };
  
      const response = await apiClient.createReview(reviewData);
      if (response.success) {
        addReview(response.review);
        setUserRating(0);
        setUserReview("");
        setShowReview(false);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmittingReview(false);
    }
  };

  if (isLoadingModule) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center my-12">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => router.push('/training')}>Back to Training</Button>
      </div>
    )
  }

  if (!currentModule) {
    return (
      <div className="text-center my-12">
        <p className="mb-4">Module not found</p>
        <Button onClick={() => router.push('/training')}>Back to Training</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/training" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Training
        </Link>
      </Button>

      <h1 className="text-3xl font-bold mb-2">{currentModule.title}</h1>
      <p className="text-gray-600 mb-8">{currentModule.description}</p>

      {/* Module content will be rendered here */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        {currentModule?.slides?.[currentSlide - 1] ? (
          <div>
            <h2 className="text-2xl font-semibold mb-4">{currentModule.slides[currentSlide - 1].title}</h2>
            <div className="prose max-w-none">
              <p>{currentModule.slides[currentSlide - 1].content}</p>
              {currentModule.slides[currentSlide - 1].keyPoints && currentModule.slides[currentSlide - 1].keyPoints!.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {currentModule.slides[currentSlide - 1].keyPoints!.map((point: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {currentModule.slides[currentSlide - 1].image && (
              <div className="mt-6">
                <Image
                  src={currentModule.slides[currentSlide - 1].image}
                  alt={currentModule.slides[currentSlide - 1].title}
                  width={800}
                  height={450}
                  className="rounded-lg w-full h-auto"
                />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Select a slide to begin</p>
          </div>
        )}
      </div>

      {/* Navigation controls */}
      <div className="flex justify-between items-center mb-12">
        <Button
          variant="outline"
          onClick={previousSlide}
          disabled={!currentModule.slides || currentSlide <= 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <span className="text-sm text-gray-500">
            {currentModule.slides ? currentSlide : 0} / {currentModule.slides?.length || 0}
          </span>
        </div>
        
        <Button
          variant="outline"
          onClick={nextSlide}
          disabled={!currentModule.slides || 
                   !currentSlide || 
                   currentSlide >= currentModule.slides.length}
        >
          Next
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Reviews section */}
      <div className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Reviews</h2>
          <Button variant="outline" onClick={() => setShowReview(!showReview)}>
            <MessageCircle className="h-4 w-4 mr-2" />
            {showReview ? 'Cancel' : 'Write a Review'}
          </Button>
        </div>

        {showReview && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-4">
                <p className="font-medium mb-2">Your Rating</p>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingClick(star)}
                      className={`text-2xl ${star <= userRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <Textarea
                placeholder="Share your thoughts about this module..."
                className="mb-4"
                rows={4}
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReview(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleSubmitReview}
                  disabled={isSubmittingReview || userRating === 0}
                >
                  {isSubmittingReview ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Review'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {reviewsLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>
                          {review.user?.username ? review.user.username.charAt(0).toUpperCase() : 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{review.user?.username || 'Anonymous'}</p>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-700">{review.comment}</p>
                  <div className="flex justify-end mt-4 space-x-2">
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      {review.helpful || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                      <ThumbsDown className="h-4 w-4 mr-1" />
                      {review.notHelpful || 0}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <MessageCircle className="h-12 w-12 mx-auto text-gray-300 mb-2" />
            <h3 className="text-lg font-medium text-gray-700">No reviews yet</h3>
            <p className="text-gray-500 mt-1">Be the first to share your thoughts about this module!</p>
          </div>
        )}
      </div>
    </div>
  )
}
