"use client"

import { CalendarClock, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { Application } from "@/lib/supabase-client"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

type ApplicationListProps = {
  applications: Application[]
  isLoading: boolean
}

export function ApplicationList({ applications, isLoading }: ApplicationListProps) {
  // Status badge configurations
  const statusConfig = {
    "Applied": {
      icon: Clock,
      variant: "default" as const,
      color: "bg-blue-500/20 text-blue-500",
    },
    "Interviewing": {
      icon: CalendarClock,
      variant: "outline" as const,
      color: "bg-yellow-500/20 text-yellow-500",
    },
    "Offer": {
      icon: CheckCircle,
      variant: "outline" as const,
      color: "bg-green-500/20 text-green-500",
    },
    "Rejected": {
      icon: XCircle, 
      variant: "outline" as const,
      color: "bg-red-500/20 text-red-500",
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Empty state
  if (!applications || applications.length === 0) {
    return (
      <div className="flex justify-center items-center flex-col py-12 text-center">
        <p className="text-lg mb-2">No applications found</p>
        <p className="text-muted-foreground mb-4">
          Start your job search journey by adding your first application.
        </p>
        <Link href="/applications/new" className="text-primary hover:underline">
          Add your first application
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {applications.map((application) => {
        const StatusIcon = application.status && statusConfig[application.status]?.icon || Clock;
        const badgeColor = application.status && statusConfig[application.status]?.color || "";
        
        return (
          <Link 
            key={application.id} 
            href={`/applications/${application.id}`}
            className="block"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-md bg-background/50 hover:bg-background/80 transition-colors border border-border/50">
              <div className="mb-2 sm:mb-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{application.company_name}</h3>
                  <Badge className={badgeColor}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {application.status}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm mt-1">{application.job_title}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {application.application_date && format(new Date(application.application_date), "MMM d, yyyy")}
                </div>
                <div className="text-sm">
                  {application.location}
                </div>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
