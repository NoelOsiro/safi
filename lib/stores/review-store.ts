import { create } from "zustand"
import { Review } from "../api-client"



interface ReviewState {
  reviews: Review[]
  isLoading: boolean
  setReviews: (reviews: Review[]) => void
  addReview: (review: Omit<Review, "id" | "date" | "helpful" | "notHelpful">) => void
  setLoading: (loading: boolean) => void
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reviews: [],
  isLoading: false,

  setReviews: (reviews) => set({ reviews }),

  addReview: (reviewData) => {
    const newReview: Review = {
      ...reviewData,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      helpful: 0,
      notHelpful: 0,
    }
    set({ reviews: [...get().reviews, newReview] })
  },

  setLoading: (loading) => set({ isLoading: loading }),
}))
