'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context'; // Make sure this provides `user` and `isLoading`
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Briefcase, Calendar, CheckCircle, Table2 } from "lucide-react"
import Link from "next/link"
import { ApplicationsGalaxy } from "@/components/applications-galaxy"
import { StatusSummary } from "@/components/status-summary"
import { RecentActivity } from "@/components/recent-activity"

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

useEffect(() => {
  if (!isLoading && user === null) {
    // If auth is not ready and user is null, delay a bit before redirect
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 1000); // wait 1 second

    return () => clearTimeout(timeout);
  }
}, [user, isLoading, router]);


  if (isLoading || !user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Mission Control</h1>
          <p className="text-muted-foreground">Track your job applications journey through the cosmos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild className="gap-2">
            <Link href="/your-applications">
              <Table2 className="h-5 w-5" />
              View Spreadsheet
            </Link>
          </Button>
          <Button asChild size="lg" className="gap-2">
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
            <p className="text-4xl font-bold">42</p>
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
            <p className="text-4xl font-bold">3</p>
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
            <p className="text-4xl font-bold">2</p>
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
            <ApplicationsGalaxy />
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
