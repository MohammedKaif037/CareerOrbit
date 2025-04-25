import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Calendar } from "lucide-react"
import Link from "next/link"
import { InterviewCalendar } from "@/components/interview-calendar"

export default function Interviews() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Interviews</h1>
          <p className="text-muted-foreground">Manage your upcoming interviews</p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/interviews/new">
            <PlusCircle className="h-5 w-5" />
            Schedule Interview
          </Link>
        </Button>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Interview Calendar
          </CardTitle>
          <CardDescription>View and manage your scheduled interviews</CardDescription>
        </CardHeader>
        <CardContent>
          <InterviewCalendar />
        </CardContent>
      </Card>
    </div>
  )
}
