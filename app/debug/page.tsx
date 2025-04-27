"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"

export default function DebugPage() {
  const [session, setSession] = useState<any>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkSession() {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.error("Error getting session:", error)
        }
        setSession(data.session)

        const { data: userData } = await supabase.auth.getUser()
        setUser(userData.user)
      } catch (err) {
        console.error("Unexpected error:", err)
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
            <CardDescription>Current authentication state</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-2">
              <strong>Authenticated:</strong> {session ? "Yes" : "No"}
            </p>
            {session && (
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Details</CardTitle>
            <CardDescription>Current session information</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(session, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Details</CardTitle>
            <CardDescription>Current user information</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(user, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
