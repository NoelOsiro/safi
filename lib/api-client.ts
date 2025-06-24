import type { User } from "./types/user.types"

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

interface AuthCheckResponse {
  success: boolean
  user: User | null
  authenticated: boolean
  error?: string
}

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  }

  private getFullUrl(endpoint: string): string {
    const basePath = this.baseUrl || ""
    const baseUrl = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`
    return `${baseUrl}/api${cleanEndpoint}`
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = this.getFullUrl(endpoint)

    const headers = new Headers()
    headers.set("Content-Type", "application/json")

    if (options.headers) {
      Object.entries(options.headers).forEach(([key, value]) => {
        if (value) headers.set(key, String(value))
      })
    }

    const config: RequestInit = {
      ...options,
      headers,
      credentials: "include" as RequestCredentials,
    }

    try {
      const response = await fetch(url, config)

      // Handle different response types
      const contentType = response.headers.get("content-type")

      if (!contentType?.includes("application/json")) {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return {} as T
      }

      const data = await response.json()

      // For auth endpoints, don't throw on 401 - return the response
      if (endpoint.includes("/user/check") && response.status === 401) {
        return data as T
      }

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`)
      }

      return data
    } catch (error) {
      // For auth check, return a consistent failure response
      if (endpoint.includes("/user/check")) {
        return {
          success: false,
          user: null,
          authenticated: false,
          error: error instanceof Error ? error.message : "Auth check failed",
        } as T
      }

      console.error(`API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Auth endpoints
  async checkAuth(): Promise<AuthCheckResponse> {
    try {
      const response = await this.request<AuthCheckResponse>("/user/check")
      return response
    } catch (error) {
      return {
        success: false,
        user: null,
        authenticated: false,
        error: error instanceof Error ? error.message : "Auth check failed",
      }
    }
  }

  async logout(): Promise<{ success: boolean; message?: string }> {
    return this.request("/user/logout", {
      method: "POST",
    })
  }

  // Module endpoints
  async getModules() {
    return this.request<{
      success: boolean
      modules: Array<{
        id: string
        title: string
        description: string
        icon: string
        duration: string
        level: string
        image: string
        progress?: number
        status?: "completed" | "in-progress" | "not-started"
      }>
    }>("/module")
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
    return this.request<{ success: boolean; reviews: Review[] }>(`/reviews?moduleId=${moduleId}`)
  }

  async createReview(
    reviewData: Omit<Review, "id" | "createdAt" | "user"> & { userId: string; userName: string; userAvatar: string },
  ) {
    return this.request<{ success: boolean; review: Review }>("/reviews", {
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
