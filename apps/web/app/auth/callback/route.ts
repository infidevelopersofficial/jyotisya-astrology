import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// Allowlist of safe redirect paths
const SAFE_REDIRECTS = [
  '/',
  '/dashboard',
  '/profile',
  '/settings',
  '/consultations',
  '/shop',
  '/my-kundlis',
  '/orders',
  '/favorites'
]

/**
 * Validates and sanitizes redirect path to prevent open redirect attacks
 */
function getSafeRedirect(path: string | null): string {
  if (!path || path === '') return '/'

  // Remove any protocol and domain to get just the path
  const normalizedPath = path.replace(/^https?:\/\/[^\/]+/, '')

  // Ensure path starts with /
  const cleanPath = normalizedPath.startsWith('/') ? normalizedPath : `/${normalizedPath}`

  // Check if path matches or is a subpath of allowed redirects
  const isSafe = SAFE_REDIRECTS.some(safePath =>
    cleanPath === safePath || cleanPath.startsWith(`${safePath}/`)
  )

  return isSafe ? cleanPath : '/'
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')

  if (!code) {
    console.error('OAuth callback: Missing code parameter')
    return NextResponse.redirect(`${origin}/auth/error?message=missing_code`)
  }

  try {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('OAuth callback error:', error.message)
      return NextResponse.redirect(`${origin}/auth/error?message=auth_failed`)
    }

    if (data.session) {
      // Get safe redirect path
      const safePath = getSafeRedirect(next)

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${safePath}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${safePath}`)
      } else {
        return NextResponse.redirect(`${origin}${safePath}`)
      }
    }
  } catch (err) {
    console.error('OAuth callback exception:', err)
    return NextResponse.redirect(`${origin}/auth/error?message=server_error`)
  }

  // Fallback error redirect
  return NextResponse.redirect(`${origin}/auth/error?message=unknown_error`)
}
