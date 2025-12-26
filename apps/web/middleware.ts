import type { NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'
import { addSecurityHeaders } from './lib/security/headers'

// Routes that don't require onboarding (public or auth)
const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/onboarding',
  '/shop',
]

/**
 * Check if a path is public or auth-related
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route =>
    pathname === route || pathname.startsWith(`${route}/`)
  )
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Update Supabase session
  let response = await updateSession(request)

  // Skip onboarding check for API routes and public routes
  if (pathname.startsWith('/api') || isPublicRoute(pathname)) {
    response = addSecurityHeaders(response, request)
    return response
  }

  // For protected routes, onboarding check is handled in the page components
  // This avoids circular dependencies and fetch calls in middleware
  // Pages will redirect to /onboarding if needed using client-side logic

  // Add security headers
  response = addSecurityHeaders(response, request)

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
