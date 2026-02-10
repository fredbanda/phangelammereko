import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/jobs(.*)',
  '/billing(.*)',
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/job-admin(.*)',
  '/link-dashboard(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Public access
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Must be logged in
  if (!userId && isProtectedRoute(req)) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Admin only
  if (isAdminRoute(req)) {
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)'],
}
