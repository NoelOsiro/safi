import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Public paths that don't require authentication
const publicPaths = [
  "/",
  "/login",
  "/signup",
  "/auth",
  "/_next",
  "/favicon.ico",
  "/images",
  "/fonts",
  "/manifest.json",
  "/public",
  "/api/auth/callback",
]

// Protected paths that require authentication
const protectedPaths = ["/dashboard", "/profile", "/training", "/assessment", "/chat", "/admin", "/onboarding"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow public paths and API routes
  if (publicPaths.some((path) => pathname.startsWith(path)) || pathname.startsWith("/api/")) {
    return NextResponse.next()
  }

  // Check if this is a protected path
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  if (!isProtectedPath) {
    return NextResponse.next()
  }

  try {
    const supabase = await createClient()
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      // No valid session - redirect to login
      const loginUrl = new URL("/login", request.url)
      if (pathname !== "/login") {
        loginUrl.searchParams.set("redirect", pathname)
      }
      return NextResponse.redirect(loginUrl)
    }

    // Valid session - allow access
    return NextResponse.next()
  } catch (error) {
    console.error("Middleware error:", error)

    // On error, redirect to login for protected paths
    const loginUrl = new URL("/login", request.url)
    if (pathname !== "/login") {
      loginUrl.searchParams.set("redirect", pathname)
    }
    return NextResponse.redirect(loginUrl)
  }
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
