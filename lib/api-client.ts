import { User } from "./types/user.types"

export interface Review {
  id: string
  userId: string
  moduleId: string
  date: string
  helpful: number
  notHelpful: number
  rating: number
  comment: string
  createdAt: string
  user?: {
    fullName: string
    username: string
    avatar: string
  }
}

interface CreateReviewResponse {
  success: boolean
  review: Review
}

interface ReviewsResponse {
  success: boolean
  reviews: Review[]
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private getFullUrl(endpoint: string): string {
    // If baseUrl is not set, use a relative URL
    const basePath = this.baseUrl || ''
    const baseUrl = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${baseUrl}/api${cleanEndpoint}`
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(endpoint)
    
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')
    
    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value) headers.set(key, String(value))
      })
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include' as RequestCredentials
    }

    const response = await fetch(url, config)

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "API request failed")
    }

    return response.json()
  }

  // Auth endpoints
  async signup(userData: {
    fullName: string
    email: string
    phone: string
    businessType: string
    location: string
    experience: string
    agreeToTerms: boolean
  }): Promise<{
    success: boolean
    user: {
      id: string
      fullName: string
      email: string
      phone: string
      businessType: string
      location: string
      experience: string
      avatar: string
      onboardingCompleted: boolean
      progress: {
        modulesCompleted: number
        totalModules: number
        assessmentScore: number
        certificationReady: number
        studyTime: number
      }
    }
  }> {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { email: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    })
  }

  // Module endpoints
  async getModules() {
    return this.request<{
      success: boolean;
      modules: Array<{
        id: string;
        title: string;
        description: string;
        icon: string;
        duration: string;
        level: string;
        image: string;
        progress?: number;
        status?: 'completed' | 'in-progress' | 'not-started';
      }>;
    }>("/module");
  }


  async getModule(id: string) {
    return this.request<{
      success: boolean
      module: {
        id: string
        title: string
        description: string
        icon: string
        duration: string
        level: string
        image: string
        slides: Array<{
          id: string
          title: string
          content: string
          keyPoints: string[]
          image: string
        }>
        averageRating: number
        totalReviews: number
      }
    }>(`/module/${id}`)
  }

  // Review endpoints
  async getReviews(moduleId: string): Promise<{ success: boolean; reviews: Review[] }> {
    const response = await this.request<{ success: boolean; reviews: Review[] }>(`/reviews?moduleId=${moduleId}`);
    return response;
  }

  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'user'> & { userId: string; userName: string; userAvatar: string }): Promise<CreateReviewResponse> {
    return this.request<CreateReviewResponse>('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request("/admin/stats");
  }

  // User endpoints
  async updateUserProgress(userId: string, progress: any) {
    return this.request("/user/progress", {
      method: "PUT",
      body: JSON.stringify({ userId, progress }),
    });
  }

  async checkAuth(): Promise<{ success: boolean; user: User }> {
    return this.request("/user/check");
  }
}

export const apiClient = new ApiClient();
