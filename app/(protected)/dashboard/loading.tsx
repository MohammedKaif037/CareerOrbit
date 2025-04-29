import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
        <h2 className="text-2xl font-semibold">Loading your dashboard...</h2>
        <p className="text-muted-foreground mt-2">Preparing your cosmic journey</p>
      </div>
    </div>
  )
}
