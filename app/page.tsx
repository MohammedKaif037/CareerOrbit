"use client"

import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          // If authenticated, redirect to dashboard
          window.location.href = "/protected/dashboard"
        } else {
          // If not authenticated, redirect to login
          window.location.href = "/login"
        }
      } catch (error) {
        console.error("Auth check error:", error)
        window.location.href = "/login"
      }
    }

    checkAuth()
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-semibold">Loading...</h2>
      </div>
    </div>
  )
}
