// components/application-list.tsx
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Application } from "@/lib/supabase-client"
import { ExternalLink, MoreHorizontal } from "lucide-react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface ApplicationListProps {
  applications: Application[];
  isLoading: boolean;
}

export function ApplicationList({ applications, isLoading }: ApplicationListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse h-24 bg-secondary/50 rounded-lg" />
        ))}
      </div>
    )
  }

  if (applications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No applications found</h3>
        <p className="text-muted-foreground mb-4">Start tracking your job applications!</p>
        <Button asChild>
          <Link href="/applications/new">Add Your First Application</Link>
        </Button>
      </div>
    )
  }

  const getStatusColor = (status: Application['status']) => {
    switch (status) {
      case 'Applied':
        return 'bg-blue-500/20 text-blue-500';
      case 'Interviewing':
        return 'bg-yellow-500/20 text-yellow-500';
      case 'Offer':
        return 'bg-green-500/20 text-green-500';
      case 'Rejected':
        return 'bg-red-500/20 text-red-500';
      case 'Archived':
        return 'bg-gray-500/20 text-gray-500';
      default:
        return 'bg-blue-500/20 text-blue-500';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {applications.map((application) => (
        <Card key={application.id} className="flex flex-col sm:flex-row p-4 bg-secondary/30 border-none hover:bg-secondary/40 transition-colors">
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{application.company_name}</h3>
              <Badge className={`${getStatusColor(application.status)} self-start sm:self-auto`}>
                {application.status}
              </Badge>
            </div>
            <p className="text-muted-foreground mb-2">{application.job_title}</p>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>Applied {formatDistanceToNow(new Date(application.application_date), { addSuffix: true })}</span>
              {application.location && (
                <>
                  <span className="mx-2">•</span>
                  <span>{application.location}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            {application.job_url && (
              <Button variant="outline" size="icon" asChild>
                <a href={application.job_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            )}
            <Button variant="outline" size="icon" asChild>
              <Link href={`/applications/${application.id}`}>
                <MoreHorizontal className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
