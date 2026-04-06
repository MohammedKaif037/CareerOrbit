import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ApplicationsChart } from "@/components/applications-chart"
import { ResponseTimeChart } from "@/components/response-time-chart"
import { SuccessRateChart } from "@/components/success-rate-chart"
import { AiCareerInsights } from "@/components/ai-career-insights"

export default function Analytics() {
  return (
    <div className="container mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Analytics Hub</h1>
        <p className="text-muted-foreground">Visualize your job search journey</p>
      </div>
      <Tabs defaultValue="applications" className="space-y-4">
        <TabsList className="glass-card">
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="response-time">Response Time</TabsTrigger>
          <TabsTrigger value="success-rate">Success Rate</TabsTrigger>
          <TabsTrigger value="ai-insights">✨ AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="applications" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Application Funnel</CardTitle>
              <CardDescription>Track your applications through each stage</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ApplicationsChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="response-time" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Response Time</CardTitle>
              <CardDescription>Average time to hear back from companies</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponseTimeChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success-rate" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>Success Rate by Method</CardTitle>
              <CardDescription>Compare application methods effectiveness</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <SuccessRateChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai-insights" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>AI Career Coach</CardTitle>
              <CardDescription>
                Chat with an AI that knows your real application data and gives personalized advice
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <AiCareerInsights />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
