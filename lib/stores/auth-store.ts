import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  fullName: string
  email: string
  phone: string
  businessType: string
  location: string
  experience: string
  avatar?: string
  onboardingCompleted: boolean
  progress: {
    modulesCompleted: number
    totalModules: number
    assessmentScore: number
    certificationReady: number
    studyTime: number
  }
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  needsOnboarding: boolean
  login: (userData: any) => void
  logout: () => void
  completeOnboarding: () => void
  updateProgress: (progress: Partial<User["progress"]>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      needsOnboarding: false,

      login: (userData) => {
        set({
          user: userData,
          isAuthenticated: true,
          needsOnboarding: !userData.onboardingCompleted,
        })
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          needsOnboarding: false,
        })
      },

      completeOnboarding: () => {
        const { user } = get()
        if (user) {
          set({
            user: { ...user, onboardingCompleted: true },
            needsOnboarding: false,
          })
        }
      },

      updateProgress: (progress) => {
        const { user } = get()
        if (user) {
          set({
            user: {
              ...user,
              progress: { ...user.progress, ...progress },
            },
          })
        }
      },
    }),
    {
      name: "auth-storage",
    },
  ),
)
