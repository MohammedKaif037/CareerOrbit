import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle, Search, Filter } from "lucide-react"
import Link from "next/link"
import { ApplicationList } from "@/components/application-list"
import { Input } from "@/components/ui/input"

export default function Applications() {
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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>All Applications</CardTitle>
          <CardDescription>Browse and manage your job applications</CardDescription>

          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Search applications..." className="pl-8 bg-background/50" />
            </div>
            <Button variant="outline" size="icon" className="shrink-0">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filter</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ApplicationList />
        </CardContent>
      </Card>
    </div>
  )
}
