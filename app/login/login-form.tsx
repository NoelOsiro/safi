"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { useAuthStore } from "@/lib/stores/auth-store"

export default function LoginForm() {
  const router = useRouter()
  const { isLoading, error, signInWithMicrosoft, clearError } = useAuthStore()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleMicrosoftLogin = useCallback(async () => {
    try {
      setIsSigningIn(true)
      clearError()
      await signInWithMicrosoft();
    } catch (error) {
      console.error("Microsoft login error:", error)
      setIsSigningIn(false)
    }
  }, [signInWithMicrosoft])

  if (isLoading || isSigningIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-8 p-8 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p className="mt-2 text-gray-600">Sign in to your account to continue</p>
        </div>

        {error && <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>}

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleMicrosoftLogin}
            disabled={isSigningIn}
            className="w-full flex items-center justify-center gap-2 bg-[#2F2F2F] hover:bg-[#1F1F1F] text-white"
          >
            {isSigningIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              "Sign in with Microsoft"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
