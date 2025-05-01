"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { AppSidebar } from "@/components/app-sidebar"

export default function AuthenticatedLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      
      const { data, error } = await supabase.auth.getSession()
      
      if (error || !data.session) {
        // Redirect to login if not authenticated
        router.replace("/login")
        return
      }
      
      setIsLoading(false)
    }
    
    // Skip auth check on login and register pages
    if (pathname === "/login" || pathname === "/register") {
      setIsLoading(false)
      return
    }
    
    checkAuth()
  }, [pathname, router])

  // Show nothing while checking authentication
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  // For login and register pages, don't show the sidebar
  if (pathname === "/login" || pathname === "/register") {
    return <>{children}</>
  }

  // For authenticated pages, show the sidebar layout
  return (
    <div className="flex h-screen bg-background text-foreground">
      <AppSidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        {children}
      </main>
    </div>
  )
}
