"use client"
//TODO impl
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { MapPin, Video } from "lucide-react"
import { Application } from "@/lib/supabase-client"

export default function ScheduleInterviewPage() {
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [form, setForm] = useState({
    application_id: "",
    event_type: "video",
    scheduled_date: "",
    scheduled_time: "",
    duration_minutes: 60,
    meeting_url: "",
    location: "",
    interviewers: "",
    notes: "",
  })

  useEffect(() => {
    async function fetchApplications() {
      const { data, error } = await supabase
        .from("applications")
        .select("id, company_name, job_title")
      if (data) setApplications(data)
    }
    fetchApplications()
  }, [])

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleEventTypeChange = (value: string) => {
    setForm({ ...form, event_type: value })
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    const { data: userData } = await supabase.auth.getUser()
    if (!userData?.user?.id) return alert("User not logged in")

    const datetime = new Date(`${form.scheduled_date}T${form.scheduled_time}`)

    const { error } = await supabase.from("interview_events").insert({
      application_id: form.application_id,
      event_type: form.event_type,
      scheduled_time: datetime.toISOString(),
      duration_minutes: Number(form.duration_minutes),
      meeting_url: form.meeting_url || null,
      location: form.location || null,
      notes: form.notes || null,
      interviewers: form.interviewers.split(",").map(i => i.trim()).filter(i => i),
      user_id: userData.user.id,
    })

    if (error) {
      console.error(error)
      alert(`Failed to schedule interview: ${error.message}`)
    } else {
      router.push("/interviews")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10 glass-card cosmic-glow-blue">
      <CardHeader>
        <CardTitle className="text-2xl">Schedule Interview</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label className="text-lg">Application</Label>
            <select 
              name="application_id" 
              className="w-full p-2 mt-1 border rounded bg-background glass-card"
              onChange={handleChange} 
              required
            >
              <option value="">Select application</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.company_name} - {app.job_title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-lg">Date</Label>
              <Input 
                type="date" 
                name="scheduled_date" 
                onChange={handleChange} 
                className="mt-1" 
                required 
              />
            </div>
            <div>
              <Label className="text-lg">Time</Label>
              <Input 
                type="time" 
                name="scheduled_time" 
                onChange={handleChange} 
                className="mt-1" 
                required 
              />
            </div>
          </div>

          <div>
            <Label className="text-lg">Duration (minutes)</Label>
            <Input 
              type="number" 
              name="duration_minutes" 
              value={form.duration_minutes} 
              onChange={handleChange} 
              className="mt-1" 
            />
          </div>

          <div className="space-y-2">
            <Label className="text-lg">Interview Type</Label>
            <RadioGroup 
              value={form.event_type} 
              onValueChange={handleEventTypeChange}
              className="grid grid-cols-2 gap-4 mt-2"
            >
              <Label 
                htmlFor="video" 
                className={`flex items-center gap-2 p-4 rounded-md border cursor-pointer transition-all ${
                  form.event_type === "video" 
                    ? "bg-primary/20 border-primary" 
                    : "bg-background/50 border-input"
                }`}
              >
                <RadioGroupItem value="video" id="video" className="sr-only" />
                <Video className={`w-5 h-5 ${form.event_type === "video" ? "text-primary" : ""}`} />
                <div>
                  <p className="font-medium">Video Interview</p>
                  <p className="text-sm text-muted-foreground">Remote interview via video call</p>
                </div>
              </Label>
              
              <Label 
                htmlFor="onsite" 
                className={`flex items-center gap-2 p-4 rounded-md border cursor-pointer transition-all ${
                  form.event_type === "onsite" 
                    ? "bg-primary/20 border-primary" 
                    : "bg-background/50 border-input"
                }`}
              >
                <RadioGroupItem value="onsite" id="onsite" className="sr-only" />
                <MapPin className={`w-5 h-5 ${form.event_type === "onsite" ? "text-primary" : ""}`} />
                <div>
                  <p className="font-medium">On-site Interview</p>
                  <p className="text-sm text-muted-foreground">In-person at company location</p>
                </div>
              </Label>
            </RadioGroup>
          </div>

          {form.event_type === "video" ? (
            <div>
              <Label className="text-lg">Meeting Link</Label>
              <Input 
                name="meeting_url" 
                value={form.meeting_url} 
                onChange={handleChange} 
                placeholder="https://zoom.us/j/123456789"
                className="mt-1" 
              />
            </div>
          ) : (
            <div>
              <Label className="text-lg">Location</Label>
              <Input 
                name="location" 
                value={form.location} 
                onChange={handleChange} 
                placeholder="123 Company St, City, State"
                className="mt-1" 
              />
            </div>
          )}

          <div>
            <Label className="text-lg">Interviewers (comma-separated)</Label>
            <Textarea 
              name="interviewers" 
              value={form.interviewers} 
              onChange={handleChange} 
              placeholder="John Doe, Jane Smith"
              className="mt-1" 
            />
          </div>

          <div>
            <Label className="text-lg">Notes</Label>
            <Textarea 
              name="notes" 
              value={form.notes} 
              onChange={handleChange} 
              placeholder="Preparation notes, questions to ask, etc."
              className="mt-1" 
              rows={4}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full mt-6 text-lg py-6"
          >
            Schedule Interview
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
