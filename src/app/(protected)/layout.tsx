"use client"

import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push('/sign-in')
      return
    }

    if (user?.primaryEmailAddress?.emailAddress) {
      checkAdminStatus(user.primaryEmailAddress.emailAddress)
    }
  }, [user, isLoaded, router])

  const checkAdminStatus = async (email: string) => {
    try {
      const response = await fetch('/api/admin/checkout', {
        headers: {
          'x-user-email': email,
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setIsAdmin(data.isAdmin || false)
      }
    } catch (error) {
      console.error('Error checking admin status:', error)
      setIsAdmin(false)
    } finally {
      setLoading(false)
    }
  }

  // Show loading while checking authentication
  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Redirect if not authenticated
  if (!user) {
    return null
  }

  // Check if current route requires admin access
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
  const isAdminRoute = currentPath.startsWith('/admin') || 
                      currentPath.startsWith('/dashboard') || 
                      currentPath.startsWith('/link-dashboard') ||
                      currentPath.startsWith('/job-admin')

  // Redirect non-admin users from admin routes
  if (isAdminRoute && !isAdmin) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen">
      {children}
    </div>
  )
}