import { NextResponse } from "next/server"
import Negotiator from "negotiator"
import { match } from "@formatjs/intl-localematcher"
import type { NextRequest } from "next/server"

const publicPaths = ["/", "/login", "/signup", "/auth", "/favicon.ico", "/manifest.json", "/images", "/fonts", "/public"]
const protectedPaths = ["/dashboard", "/profile", "/training", "/assessment", "/chat", "/admin", "/onboarding"]
const supportedLocales = ["en", "sw"]
const defaultLocale = "en"

function getPreferredLocale(request: NextRequest): string {
  const headers = Object.fromEntries(request.headers.entries())
  const languages = new Negotiator({ headers }).languages()
  return match(languages, supportedLocales, defaultLocale)
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const hasLocalePrefix = supportedLocales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!hasLocalePrefix) {
    const locale = getPreferredLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|css|js)$).*)',
  ],
}
