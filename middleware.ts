import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

// Define protected routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/admin',
  '/assessment',
  '/chat',
  '/onboarding',
  '/training/*',
  // Add other protected routes here
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // If it's not a protected route, continue
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  // Get the token from the request
  const token = await getToken({ req: request })
  
  // If there's no token, redirect to sign-in
  if (!token) {
    const signInUrl = new URL('/auth/signin', request.url)
    signInUrl.searchParams.set('callbackUrl', encodeURI(request.url))
    return NextResponse.redirect(signInUrl)
  }

  // User is authenticated, continue to the page
  return NextResponse.next()
}

// Configure which routes the middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/).*)',
  ],
}
