import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes requiring authentication
const PROTECTED_PREFIXES = [
  '/dashboard',
  '/read',
  '/journey',
  '/trails',
  '/library',
  '/profile',
  '/onboarding',
]

// Auth routes — authenticated users should not see these
const AUTH_PREFIXES = ['/auth']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Refresh the Supabase session (always — keeps tokens alive)
  const { supabaseResponse, user } = await updateSession(request)

  // 2. Protected route: redirect unauthenticated users to login
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Auth routes: redirect authenticated users to dashboard
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => pathname.startsWith(prefix))
  if (isAuthRoute && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  // 4. Root: redirect authenticated users to dashboard
  if (pathname === '/' && user) {
    const dashboardUrl = request.nextUrl.clone()
    dashboardUrl.pathname = '/dashboard'
    return NextResponse.redirect(dashboardUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths EXCEPT:
     * - _next/static  (Next.js static assets)
     * - _next/image   (Next.js image optimization)
     * - favicon.ico
     * - public folder image/media assets
     * - api/webhooks  (Stripe webhooks must not be auth-gated)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|api/webhooks|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4)$).*)',
  ],
}
