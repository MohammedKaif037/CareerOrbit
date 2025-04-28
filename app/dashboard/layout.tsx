"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        // Redirect to login if not authenticated
        window.location.href = "/login"
        return
      }

      setIsAuthenticated(true)
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null // Will redirect in the useEffect
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
          <div className="absolute inset-0 z-0">
            <StarField />
          </div>
          <div className="relative z-10 h-full">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  )
}

function StarField() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {Array.from({ length: 100 }).map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.2,
          }}
        />
      ))}
    </div>
  )
}
