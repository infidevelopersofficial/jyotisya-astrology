import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";
import { addSecurityHeaders } from "./lib/security/headers";

// Middleware automatically runs on Edge Runtime in Next.js 14
// No need to explicitly declare runtime here

// Routes that don't require onboarding (public or auth)
const PUBLIC_ROUTES = ["/", "/auth", "/onboarding", "/shop"];

/**
 * Check if a path is public or auth-related
 */
function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function middleware(request: NextRequest) {
    try {
      
  const { pathname } = request.nextUrl;

  // Redirect test/debug pages to home in production
  const isTestPage =
    pathname.startsWith("/astrology-test") ||
    pathname.startsWith("/auth-test") ||
    pathname.startsWith("/sentry-test");

  if (isTestPage && process.env.NODE_ENV === "production") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Update Supabase session
  let response = NextResponse.next({ request });

  // Skip onboarding check for API routes and public routes
  if (pathname.startsWith("/api") || isPublicRoute(pathname)) {
    response = addSecurityHeaders(response, request);
    return response;
  }

  // For protected routes, onboarding check is handled in the page components
  // This avoids circular dependencies and fetch calls in middleware
  // Pages will redirect to /onboarding if needed using client-side logic

  // Add security headers
  response = addSecurityHeaders(response, request);

  return response;
        } catch (error: unknown) {
          // Silently fail if middleware errors - allows app to load even if Sentry or other services fail
          console.error('[Middleware Error]:', error);
          return NextResponse.next({ request });
        }
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
    "/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
