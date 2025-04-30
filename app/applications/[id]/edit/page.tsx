"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { supabase, Application } from "@/lib/supabase-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export default function EditApplicationPage() {
  const router = useRouter()
  const { id } = useParams()
  const [application, setApplication] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState<Partial<Application>>({})

  // Fetch existing application
  useEffect(() => {
    async function fetchApp() {
      setLoading(true)
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", id)
        .single()

      if (error) {
        alert("Failed to load application")
        console.error(error)
      } else {
        setApplication(data)
        setForm(data)
      }
      setLoading(false)
    }

    if (id) fetchApp()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const { error } = await supabase
      .from("applications")
      .update(form)
      .eq("id", id)

    if (error) {
      alert("Update failed")
      console.error(error)
    } else {
      router.push("/your-applications")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    )
  }

  if (!application) {
    return <p className="text-center">Application not found</p>
  }

  return (
    <Card className="max-w-2xl mx-auto mt-10 glass-card">
      <CardHeader>
        <CardTitle>Edit Application</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Company Name</Label>
            <Input name="company_name" value={form.company_name || ""} onChange={handleChange} required />
          </div>

          <div>
            <Label>Job Title</Label>
            <Input name="job_title" value={form.job_title || ""} onChange={handleChange} required />
          </div>

          <div>
            <Label>Location</Label>
            <Input name="location" value={form.location || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Status</Label>
            <select name="status" value={form.status || "Applied"} onChange={handleChange} className="w-full border p-2 rounded">
              <option>Applied</option>
              <option>Interviewing</option>
              <option>Offer</option>
              <option>Rejected</option>
            </select>
          </div>

          <div>
            <Label>Application URL</Label>
            <Input name="job_url" value={form.job_url || ""} onChange={handleChange} />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea name="notes" value={form.notes || ""} onChange={handleChange} />
          </div>

          <Button type="submit">Update Application</Button>
        </form>
      </CardContent>
    </Card>
  )
}
