"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase-client"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [isLoading, setIsLoading] = useState(true)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
      setIsLoading(false)

      // Set up auth state listener
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        setSession(session)
      })

      return () => {
        authListener.subscription.unsubscribe()
      }
    }

    getSession()
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}
