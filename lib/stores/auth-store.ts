import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { User } from "@/lib/types/user.types"
import { client, account } from '@/lib/appwrite';
import { OAuthProvider } from "node-appwrite";
import { apiClient } from "../api-client";

// Helper function to safely get storage
const getStorage = () => {
  // Only access sessionStorage in browser environment
  if (typeof window === 'undefined') {
    return {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      getState: () => ({}),
      setState: () => {}
    };
  }
  return sessionStorage;
};

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (redirectUrl?: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
  updateUser: (userId: string, userData: Partial<User>) => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (redirectUrl = '') => {
        set({ isLoading: true, error: null })
        try {
          account.createOAuth2Token(
            OAuthProvider.Microsoft,
            `${redirectUrl}/api/auth/callback`,
            `${redirectUrl}/login`,
            
          )
          // Client-side flow will handle the rest
        } catch (error) {
          console.error('Login error:', error)
          set({ 
            error: error instanceof Error ? error.message : 'Failed to sign in',
            isLoading: false 
          })
        }
      },

      logout: async () => {
        try {
          // Clear the local state first to prevent any race conditions
          set({
            user: null,
            isAuthenticated: false,
            isLoading: true,
            error: null,
          });
          
          // Call the logout API
          await apiClient.logout();
          
          // Force a hard refresh to clear any cached data and ensure clean state
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        } catch (error) {
          console.error('Logout error:', error);
          // Even if logout API fails, clear the local state
          set({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: 'Failed to log out. Please try again.',
          });
          
          // Still redirect to login page
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      },

      checkAuth: async () => {
        set({ isLoading: true })
        try {
          // First check if there's an existing session
          try {
            const { user, success } = await apiClient.checkAuth()
            if (success && user) {
              set({
                user,
                isAuthenticated: true,
                isLoading: false,
                error: null,
              })
              return
            }
            if (!success || !user) {
              set({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
              })
              return
            }
          } catch (error) {
            // If we get a 401 or similar, it means no valid session exists
            console.log('No active session found')
            }
          
          // If we get here, either no user was returned or there was an error
          set({ 
            isAuthenticated: false, 
            user: null,
            error: null,
            isLoading: false 
          })
        } catch (error) {
          console.error('Auth check error:', error)
          set({ 
            isAuthenticated: false, 
            user: null,
            error: 'Failed to check authentication status',
            isLoading: false
          })
        }
      },

      updateUser: async (userId: string, userData: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        }));
      },
    }),
    {
      name: 'auth-storage',
      skipHydration: true, // Skip initial hydration to prevent SSR issues
      storage: createJSONStorage(() => getStorage()),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

// Initialize auth state when store is created
if (typeof window !== 'undefined') {
  useAuthStore.getState().checkAuth()
  
  // Listen to auth state changes
  client.subscribe('account', (response) => {
    if (response.events.includes('users.*.sessions.*.create')) {
      // User signed in
      useAuthStore.getState().checkAuth()
    } else if (response.events.includes('users.*.sessions.*.delete')) {
      // User signed out
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      })
    }
  })
}
