"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { usePathname, useRouter } from "next/navigation"
import { LogIn, UserPlus, Loader2 } from "lucide-react"
import  authService  from "@/lib/services/auth.service"
import { useAuthStore } from "@/lib/stores/auth-store"

export function SiteHeader() {
  const { user, isAuthenticated, isLoading } = useAuthStore()
  console.log(user)
  const pathname = usePathname()
  const router = useRouter()

  // Don't show header on the landing page
  if (pathname === "/") return null
  
  const handleSignOut = async () => {
    try {
      await authService.signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/80 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center flex-shrink-0">
            <Link 
              href="/" 
              className="flex items-center space-x-2 group"
            >
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                Mama Safi
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 ml-10">
            {[
              { name: 'Dashboard', href: '/dashboard' },
              { name: 'Training', href: '/training' },
              { name: 'Assessment', href: '/assessment' },
              { name: 'AI Coach', href: '/chat' },
            ].map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive 
                      ? 'text-emerald-600 bg-emerald-50' 
                      : 'text-gray-700 hover:text-emerald-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                  {isActive && (
                    <span className="block h-0.5 w-6 bg-emerald-500 rounded-full mx-auto mt-1" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center space-x-3">
            {isLoading ? (
              <Button variant="ghost" size="sm" disabled>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Loading...
              </Button>
            ) : isAuthenticated ? (
              <div className="flex items-center space-x-2">
                <Link href="/profile">
                  <Button variant="outline" size="sm">
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleSignOut}
                >
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <LogIn className="h-4 w-4" />
                    Sign in
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="flex items-center gap-1">
                    <UserPlus className="h-4 w-4" />
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
