import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/admin(.*)',
  '/jobs/create(.*)',
  '/jobs/applications(.*)',
  '/jobs/bookmarks(.*)',
  '/billing(.*)',
  '/link-dashboard(.*)',
  '/job-dashboard(.*)',
  '/job-admin(.*)'
])

const isAdminRoute = createRouteMatcher([
  '/admin(.*)',
  '/dashboard(.*)',
  '/link-dashboard(.*)',
  '/job-admin(.*)'
])

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/resumes(.*)',
  '/editor(.*)',
  '/vacancies(.*)',
  '/job-home(.*)',
  '/linkedin-analyzer(.*)',
  '/linkedin-analyzer-demo(.*)',
  '/supportus(.*)',
  '/termsandconditions(.*)',
  '/api/webhooks(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth()

  // Allow public routes
  if (isPublicRoute(req)) {
    return NextResponse.next()
  }

  // Redirect unauthenticated users to sign-in for protected routes
  if (isProtectedRoute(req) && !userId) {
    const signInUrl = new URL('/sign-in', req.url)
    signInUrl.searchParams.set('redirect_url', req.url)
    return NextResponse.redirect(signInUrl)
  }

  // Check admin access using Clerk metadata
  if (isAdminRoute(req) && userId) {
    // Check if user is admin from public metadata or custom claims
    const metadata = sessionClaims?.metadata as { isAdmin?: boolean } | undefined
    const publicMetadata = sessionClaims?.publicMetadata as { isAdmin?: boolean } | undefined
    const isAdmin = metadata?.isAdmin === true || publicMetadata?.isAdmin === true

    if (!isAdmin) {
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}