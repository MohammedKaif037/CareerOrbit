import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AiCareerInsights } from "@/components/ai-career-insights"
import { FollowUpDrafter } from "@/components/follow-up-drafter"

export default function Analytics() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics Hub</h1>
        <p className="text-muted-foreground">Visualize your job search journey</p>
      </div>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>✨ AI Career Coach</CardTitle>
          <CardDescription>
            Chat with an AI that knows your real application data and gives personalized advice
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <AiCareerInsights />
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>📬 Follow-Up Email Drafter</CardTitle>
          <CardDescription>
            AI-drafted follow-up emails for your pending applications — find HR contacts and send with one click
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FollowUpDrafter />
        </CardContent>
      </Card>
    </div>
  )
}
