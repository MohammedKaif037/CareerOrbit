'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter, AlertCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { ApplicationList } from "@/components/application-list"
import { Input } from "@/components/ui/input"
import { supabase, Application } from "@/lib/supabase-client"
import { useAuth } from '@/lib/auth-context';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function Applications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApplications = async () => {
      if (!user) return; // only fetch if user is available
      
      try {
        setIsLoading(true);
        setError(null); // Clear any previous errors
        
        // Direct query instead of using the helper function to ensure we get the data correctly
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('user_id', user.id)
          .order('application_date', { ascending: false });
        
        if (error) {
          throw new Error(error.message);
        }
        
        // Make sure data is an array before setting it
        setApplications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching applications:", err);
        setError(err instanceof Error ? err.message : "Failed to load applications");
        setApplications([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchApplications();
    
    // Set up real-time subscription for updates
    if (user) {
      const subscription = supabase
        .channel('applications-list-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'applications',
            filter: `user_id=eq.${user.id}`,
          },
          async () => {
            // Refresh the applications list when changes occur
            fetchApplications();
          }
        )
        .subscribe();
      
      // Cleanup subscription when component unmounts
      return () => {
        supabase.removeChannel(subscription);
      };
    }
  }, [user]);

  // Show loading state while fetching user
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Filter applications based on search term
  const filteredApplications = applications.filter((app) =>
    app.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.job_title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Applications</h1>
          <p className="text-muted-foreground">Manage your job applications</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/applications/new">
            <PlusCircle className="h-5 w-5" />
            New Application
          </Link>
        </Button>
      </div>
      
      {/* Display errors if any */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Browse and manage your job applications</CardDescription>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search applications..."
                className="pl-8 bg-background/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ApplicationList applications={filteredApplications} isLoading={isLoading} />
        </CardContent>
      </Card>
    </div>
  )
}
