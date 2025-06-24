import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import type { User } from "@/lib/types/user.types"
import { supabase } from "@/lib/supabase/client"

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  signInWithMicrosoft: () => Promise<void>
  signOut: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (userData: Partial<User>) => Promise<void>
  setInitialized: (initialized: boolean) => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      error: null,

      setInitialized: (initialized: boolean) => {
        set({ isInitialized: initialized })
      },

      clearError: () => {
        set({ error: null })
      },

      signInWithMicrosoft: async () => {
        set({ isLoading: true, error: null })

        try {
          const redirectUrl = new URL(window.location.href);
          const next = redirectUrl.searchParams.get('next') || '/dashboard';
          
          const { data, error } = await supabase.auth.signInWithOAuth({
            provider: "azure",
            options: {
              scopes: "email profile offline_access",
              redirectTo: "http://localhost:3000/api/auth/callback",
              queryParams: {
                prompt: "select_account",
              },
            },
          })

          if (error) {
            throw error
          }
        } catch (error: any) {
          console.error("Microsoft sign-in error:", error)
          set({
            error: error.message || "Failed to sign in with Microsoft",
            isLoading: false,
          })
        }
      },

      signOut: async () => {
        try {
          set({ isLoading: true, error: null })

          const { error } = await supabase.auth.signOut()

          if (error) {
            console.error("Sign out error:", error)
          }

          // Clear state regardless of error
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })

          // Clear persisted storage
          if (typeof window !== "undefined") {
            sessionStorage.removeItem("auth-storage")
            window.location.href = "/login"
          }
        } catch (error: any) {
          console.error("Sign out error:", error)

          // Clear state even on error
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          })

          if (typeof window !== "undefined") {
            sessionStorage.removeItem("auth-storage")
            window.location.href = "/login"
          }
        }
      },

      checkAuth: async () => {
        const currentState = get()

        if (currentState.isLoading) {
          return
        }

        set({ isLoading: true, error: null })

        try {
          const {
            data: { session },
            error,
          } = await supabase.auth.getSession()

          if (error) {
            throw error
          }

          if (session?.user) {
            // Get user profile from profiles table
            const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()

            const user: User = {
              id: session.user.id,
              email: session.user.email!,
              name:
                session.user.user_metadata.name ||
                session.user.user_metadata.full_name ||
                session.user.email!.split("@")[0],
              fullName: session.user.user_metadata.full_name || session.user.user_metadata.name,
              avatar:
                session.user.user_metadata.avatar_url ||
                session.user.user_metadata.picture ||
                `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(session.user.email!)}`,
              phone: profile?.phone || "",
              businessType: profile?.business_type || "",
              location: profile?.location || "",
              experience: profile?.experience || "",
              role: profile?.role || "user",
              onboardingCompleted: profile?.onboarding_completed || false,
              progress: profile?.progress || {
                modulesCompleted: 0,
                totalModules: 6,
                assessmentScore: 0,
                certificationReady: 0,
                studyTime: 0,
              },
              created_at: session.user.created_at,
              updated_at: session.user.updated_at,
              email_verified: !!session.user.email_confirmed_at,
            }

            set({
              user,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
              error: null,
            })
          } else {
            set({
              user: null,
              isAuthenticated: false,
              isLoading: false,
              isInitialized: true,
              error: null,
            })
          }
        } catch (error: any) {
          console.error("Auth check error:", error)
          set({
            isAuthenticated: false,
            user: null,
            isLoading: false,
            isInitialized: true,
            error: null,
          })
        }
      },

      updateUser: async (userData: Partial<User>) => {
        const currentState = get()
        if (!currentState.user) return

        try {
          // Update profile in database
          const { error } = await supabase
            .from("profiles")
            .update({
              phone: userData.phone,
              business_type: userData.businessType,
              location: userData.location,
              experience: userData.experience,
              onboarding_completed: userData.onboardingCompleted,
              progress: userData.progress,
              updated_at: new Date().toISOString(),
            })
            .eq("id", currentState.user.id)

          if (error) {
            throw error
          }

          // Update local state
          set((state) => ({
            user: state.user ? { ...state.user, ...userData } : null,
          }))
        } catch (error: any) {
          console.error("Update user error:", error)
          set({ error: error.message })
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          }
        }
        return sessionStorage
      }),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isInitialized = true
          state.isLoading = false
        }
      },
    },
  ),
)

// Initialize auth state when store is created (client-side only)
if (typeof window !== "undefined") {
  // Listen to auth state changes
  supabase.auth.onAuthStateChange((event: string, session: any) => {
    const state = useAuthStore.getState()

    if (event === "SIGNED_IN" && session) {
      state.checkAuth()
    } else if (event === "SIGNED_OUT") {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  })

  // Initialize after a short delay
  setTimeout(() => {
    const state = useAuthStore.getState()
    if (!state.isInitialized) {
      state.setInitialized(true)
    }
    state.checkAuth()
  }, 100)
}
