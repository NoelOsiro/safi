class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
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
    return this.request("/modules")
  }

  async getModule(id: string) {
    return this.request(`/modules/${id}`)
  }

  // Review endpoints
  async getReviews(moduleId?: string) {
    const query = moduleId ? `?moduleId=${moduleId}` : ""
    return this.request(`/reviews${query}`)
  }

  async createReview(reviewData: any) {
    return this.request("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    })
  }

  // Admin endpoints
  async getAdminStats() {
    return this.request("/admin/stats")
  }

  // User endpoints
  async updateUserProgress(userId: string, progress: any) {
    return this.request("/user/progress", {
      method: "PUT",
      body: JSON.stringify({ userId, progress }),
    })
  }
}

export const apiClient = new ApiClient()
