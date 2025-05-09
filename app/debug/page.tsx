"use client"
//TODO impl
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase-client"

export default function DebugPage() {
  const [sessionData, setSessionData] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkAuth() {
      try {
        const { data: sessionResponse } = await supabase.auth.getSession()
        setSessionData(sessionResponse)

        const { data: userResponse } = await supabase.auth.getUser()
        setUserData(userResponse)
      } catch (error) {
        console.error("Auth check error:", error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.reload()
  }

  if (loading) {
    return <div className="p-8">Loading auth data...</div>
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Status</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              <strong>Is Authenticated:</strong> {sessionData?.session ? "Yes" : "No"}
            </p>

            {sessionData?.session && (
              <Button onClick={handleSignOut} variant="destructive">
                Sign Out
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Session Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(sessionData, null, 2)}</pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Data</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96">{JSON.stringify(userData, null, 2)}</pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
