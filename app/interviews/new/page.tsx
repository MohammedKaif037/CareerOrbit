"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
      notes: form.notes || null,
      interviewers: form.interviewers.split(",").map(i => i.trim()),
      user_id: userData.user.id,
    })

    if (error) {
      console.error(error)
      alert("Failed to schedule interview")
    } else {
      router.push("/interviews")
    }
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10 glass-card">
      <CardHeader>
        <CardTitle>Schedule Interview</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Application</Label>
            <select name="application_id" className="w-full p-2 border rounded" onChange={handleChange} required>
              <option value="">Select</option>
              {applications.map(app => (
                <option key={app.id} value={app.id}>
                  {app.company_name} - {app.job_title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date</Label>
              <Input type="date" name="scheduled_date" onChange={handleChange} required />
            </div>
            <div>
              <Label>Time</Label>
              <Input type="time" name="scheduled_time" onChange={handleChange} required />
            </div>
          </div>

          <div>
            <Label>Duration (minutes)</Label>
            <Input type="number" name="duration_minutes" value={form.duration_minutes} onChange={handleChange} />
          </div>

          <div>
            <Label>Type</Label>
            <select name="event_type" value={form.event_type} onChange={handleChange}>
              <option value="video">Video</option>
              <option value="onsite">On-site</option>
            </select>
          </div>

          <div>
            <Label>Meeting Link (if video)</Label>
            <Input name="meeting_url" value={form.meeting_url} onChange={handleChange} />
          </div>

          <div>
            <Label>Interviewers (comma-separated)</Label>
            <Textarea name="interviewers" value={form.interviewers} onChange={handleChange} />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea name="notes" value={form.notes} onChange={handleChange} />
          </div>

          <Button type="submit">Schedule</Button>
        </form>
      </CardContent>
    </Card>
  )
}
