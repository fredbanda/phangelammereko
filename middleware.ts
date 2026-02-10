import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Define route matchers
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
  const url = req.nextUrl.clone()

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

  // Check admin access for admin routes
  if (isAdminRoute(req) && userId) {
    try {
      // Get user email from session claims
      const userEmail = sessionClaims?.email as string
      
      if (!userEmail) {
        return NextResponse.redirect(new URL('/', req.url))
      }

      // Check if user is admin by calling the API
      const adminCheckUrl = new URL('/api/admin/checkout', req.url)
      const response = await fetch(adminCheckUrl.toString(), {
        headers: {
          'x-user-email': userEmail,
        },
      })

      if (!response.ok) {
        return NextResponse.redirect(new URL('/', req.url))
      }

      const data = await response.json()
      
      if (!data.isAdmin) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}