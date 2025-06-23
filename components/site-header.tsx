"use client"

import Link from "next/link"
import { Button } from "./ui/button"
import { useSession } from "next-auth/react"
import { usePathname } from "next/navigation"
import { LogIn, UserPlus } from "lucide-react"

export function SiteHeader() {
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Don't show header on the landing page
  if (pathname === "/") return null

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
            {status === 'authenticated' ? (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  asChild
                  className="rounded-full px-3 py-1.5 text-sm font-medium hover:bg-gray-100"
                >
                  <Link href="/profile" className="flex items-center space-x-2">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 text-white text-sm font-medium">
                      {session.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                    </span>
                    <span className="hidden md:inline text-gray-700">
                      {session.user?.name?.split(' ')[0] || 'Profile'}
                    </span>
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  asChild
                  className="rounded-lg border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  <Link href="/auth/signin" className="flex items-center space-x-1.5">
                    <LogIn className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                </Button>
                <Button 
                  size="sm" 
                  asChild 
                  className="rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-700 hover:to-teal-600 shadow-sm hover:shadow-md transition-all"
                >
                  <Link href="/auth/signup" className="flex items-center space-x-1.5">
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
