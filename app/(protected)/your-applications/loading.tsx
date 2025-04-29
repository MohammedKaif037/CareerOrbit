import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Table2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Your Applications</h1>
          <p className="text-muted-foreground">Track and manage all your job applications in one place</p>
        </div>
        <Skeleton className="h-10 w-40" />
      </div>

      <Card className="glass-card cosmic-glow-green">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Table2 className="h-5 w-5 text-green-400" />
                Applications Spreadsheet
              </CardTitle>
              <CardDescription>View and edit your applications in a familiar spreadsheet format</CardDescription>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-10" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
