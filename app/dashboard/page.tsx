"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Briefcase, Calendar, CheckCircle, Table2, Loader2 } from "lucide-react"
import Link from "next/link"
import { ApplicationsGalaxy } from "@/components/applications-galaxy"
import { StatusSummary } from "@/components/status-summary"
import { RecentActivity } from "@/components/recent-activity"
import { supabase } from "@/lib/supabase-client"

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    interviews: 0,
    offers: 0,
  })
  const [upcomingInterviews, setUpcomingInterviews] = useState(0)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserAndStats() {
      try {
        const { data: userData } = await supabase.auth.getUser()

        if (userData?.user) {
          setUserId(userData.user.id)
          
          // Get application stats
          const { data: statsData, error: statsError } = await supabase.rpc("get_application_stats", {
            user_id: userData.user.id,
          })

          if (statsData && !statsError) {
            setStats({
              total: statsData.total || 0,
              interviews: statsData.interviewing || 0,
              offers: statsData.offer || 0,
            })
          }
          
          // Get upcoming interviews count
          await fetchUpcomingInterviews(userData.user.id)
        }
      } catch (error) {
        console.error("Error loading user and stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadUserAndStats()
  }, [])
  
  // Function to fetch upcoming interviews
  async function fetchUpcomingInterviews(userId) {
    try {
      const now = new Date().toISOString()
      
      const { data, error } = await supabase
        .from("interview_events")
        .select("id")
        .eq("user_id", userId)
        .gte("scheduled_time", now)
        
      if (error) {
        console.error("Error fetching upcoming interviews:", error)
        return
      }
      
      setUpcomingInterviews(data?.length || 0)
    } catch (error) {
      console.error("Error in fetchUpcomingInterviews:", error)
    }
  }

  // Set up real-time subscription for updates
  useEffect(() => {
    if (!userId) return

    // Subscribe to applications changes
    const applicationsSubscription = supabase
      .channel('applications-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'applications',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Refresh stats when data changes
          const { data: statsData } = await supabase.rpc("get_application_stats", {
            user_id: userId,
          })
          
          if (statsData) {
            setStats({
              total: statsData.total || 0,
              interviews: statsData.interviewing || 0,
              offers: statsData.offer || 0,
            })
          }
        }
      )
      .subscribe()
      
    // Subscribe to interview events changes
    const interviewsSubscription = supabase
      .channel('interviews-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'interview_events',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Refresh upcoming interviews count when interview data changes
          await fetchUpcomingInterviews(userId)
        }
      )
      .subscribe()

    // Cleanup subscriptions when component unmounts
    return () => {
      supabase.removeChannel(applicationsSubscription)
      supabase.removeChannel(interviewsSubscription)
    }
  }, [userId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground">Track your job applications journey through the cosmos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
  <Button variant="outline" asChild className="gap-2 w-full sm:w-auto">
    <Link href="/your-applications">
      <Table2 className="h-5 w-5" />
      View Spreadsheet
    </Link>
  </Button>
  <Button asChild size="lg" className="gap-2 w-full sm:w-auto">
    <Link href="/applications/new">
      <PlusCircle className="h-5 w-5" />
      Launch New Application
    </Link>
  </Button>
</div>

      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass-card cosmic-glow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-primary" />
              Total Applications
            </CardTitle>
            <CardDescription>Your cosmic journey so far</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card className="glass-card cosmic-glow-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-yellow-400" />
              Upcoming Interviews
            </CardTitle>
            <CardDescription>Your next missions</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{upcomingInterviews}</p>
          </CardContent>
        </Card>
        <Card className="glass-card cosmic-glow-green">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Offers Received
            </CardTitle>
            <CardDescription>Successful landings</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{stats.offers}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="glass-card col-span-1 lg:col-span-2 min-h-[400px]">
          <CardHeader>
            <CardTitle>Applications Galaxy</CardTitle>
            <CardDescription>Visualize your applications in cosmic space</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ApplicationsGalaxy userId={userId} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Application Status</CardTitle>
              <CardDescription>Your journey progress</CardDescription>
            </CardHeader>
            <CardContent>
              <StatusSummary />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest cosmic events</CardDescription>
            </CardHeader>
            <CardContent>
              <RecentActivity />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
