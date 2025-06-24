'use client';

import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button"
import authService from "@/lib/services/auth.service"
import { User } from "@/lib/types/user.types"

interface WelcomeHeaderProps {
  user: User | null
}

export function WelcomeHeader({ user }: WelcomeHeaderProps) {
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      // Use router.push instead of redirect in client components
      router.push('/login')
      router.refresh() // Ensure the page updates with the new auth state
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-muted-foreground">Track your learning progress and access your courses</p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}
