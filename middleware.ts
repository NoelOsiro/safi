import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import  authService  from './lib/services/auth.service'

// Public paths that don't require authentication
const publicPaths = [
  '/',
  '/login',
  '/api/auth',
  '/_next',
  '/favicon.ico',
  '/images',
  '/fonts',
  '/manifest.json',
  '/api/public',
  '/profile'
]

// Paths that should redirect to dashboard if user is authenticated
const authPaths = ['/login', '/signup']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  try {
    // Check for existing session
    const session = await authService.getCurrentUser()
    
    // If user is on an auth page but already logged in, redirect to dashboard
    if (authPaths.some(path => pathname.startsWith(path))) {
      if (session) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
      return NextResponse.next()
    }

    // If no session and trying to access protected route, redirect to login
    if (!session) {
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Add user to request headers for API routes
    const requestHeaders = new Headers(request.headers)
    requestHeaders.set('x-user-id', session.userId)

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  } catch (error) {
    console.error('Authentication error:', error)
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (auth routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
