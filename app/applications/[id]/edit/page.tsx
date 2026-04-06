"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { motion } from "framer-motion"
import { ArrowLeft, Save, Loader2 } from "lucide-react"

type Application = {
  id: string
  company_name: string
  job_title: string
  application_date: string
  application_method: string
  resume_sent: boolean
  cover_letter_sent: boolean
  interview_scheduled: boolean
  interview_type: string | null
  interviewers: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  notes: string | null
  status: "Applied" | "Interviewing" | "Offer" | "Rejected" | "Ghosted"
  job_url: string | null
  salary_range: string | null
  location: string | null
  priority: number | null
}

export default function EditApplicationPage() {
  const params = useParams()
  const router = useRouter()
  const [form, setForm] = useState<Partial<Application>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchApplication() {
      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("id", params.id)
        .single()

      if (error || !data) {
        router.push("/applications")
        return
      }
      setForm(data as Application)
      setLoading(false)
    }
    fetchApplication()
  }, [params.id, router])

  const handleChange = (field: keyof Application, value: unknown) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setSaving(true)
    setError(null)

    const { error } = await supabase
      .from("applications")
      .update(form)
      .eq("id", params.id)

    if (error) {
      setError("Failed to save changes. Please try again.")
      setSaving(false)
    } else {
      router.push(`/applications/${params.id}`)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-green-400">Loading application...</div>
      </div>
    )
  }

  const fieldClass =
    "bg-green-900/20 border-green-300/30 text-white placeholder:text-green-300/30 focus:border-green-400 focus:ring-green-400/20"

  return (
    <div className="container max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href={`/applications/${params.id}`}
          className="flex items-center gap-2 text-sm text-green-400/70 hover:text-green-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Application
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="border border-green-300/30 rounded-lg p-6 bg-green-900/10 space-y-6"
      >
        <h1 className="text-xl font-bold text-white">Edit Application</h1>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-md p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Company + Job */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-green-300/70">Company Name</Label>
            <Input
              className={fieldClass}
              value={form.company_name || ""}
              onChange={(e) => handleChange("company_name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-green-300/70">Job Title</Label>
            <Input
              className={fieldClass}
              value={form.job_title || ""}
              onChange={(e) => handleChange("job_title", e.target.value)}
            />
          </div>
        </div>

        {/* Status + Method */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-green-300/70">Status</Label>
            <Select
              value={form.status || "Applied"}
              onValueChange={(v) => handleChange("status", v)}
            >
              <SelectTrigger className={fieldClass}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-green-950 border-green-300/30 text-white">
                {["Applied", "Interviewing", "Offer", "Rejected", "Ghosted"].map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-green-300/70">Application Method</Label>
            <Input
              className={fieldClass}
              value={form.application_method || ""}
              onChange={(e) => handleChange("application_method", e.target.value)}
            />
          </div>
        </div>

        {/* Date + Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-green-300/70">Application Date</Label>
            <Input
              type="date"
              className={fieldClass}
              value={form.application_date || ""}
              onChange={(e) => handleChange("application_date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-green-300/70">Location</Label>
            <Input
              className={fieldClass}
              value={form.location || ""}
              onChange={(e) => handleChange("location", e.target.value)}
            />
          </div>
        </div>

        {/* Salary + Job URL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-green-300/70">Salary Range</Label>
            <Input
              className={fieldClass}
              placeholder="e.g. $100K - $130K"
              value={form.salary_range || ""}
              onChange={(e) => handleChange("salary_range", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-green-300/70">Job URL</Label>
            <Input
              className={fieldClass}
              placeholder="https://..."
              value={form.job_url || ""}
              onChange={(e) => handleChange("job_url", e.target.value)}
            />
          </div>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <Label className="text-green-300/70">Priority (1–5)</Label>
          <Select
            value={String(form.priority || 3)}
            onValueChange={(v) => handleChange("priority", Number(v))}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-green-950 border-green-300/30 text-white">
              {[1, 2, 3, 4, 5].map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {"★".repeat(n)}{"☆".repeat(5 - n)} ({n})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Checkboxes */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { field: "resume_sent" as const, label: "Resume Sent" },
            { field: "cover_letter_sent" as const, label: "Cover Letter" },
            { field: "interview_scheduled" as const, label: "Interview Scheduled" },
            { field: "follow_up_required" as const, label: "Follow-Up Required" },
          ].map(({ field, label }) => (
            <div key={field} className="flex items-center gap-2">
              <Checkbox
                id={field}
                checked={!!form[field]}
                onCheckedChange={(v) => handleChange(field, v)}
                className="border-green-400 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
              />
              <Label htmlFor={field} className="text-green-300/70 cursor-pointer text-sm">
                {label}
              </Label>
            </div>
          ))}
        </div>

        {/* Interview Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-green-300/70">Interview Type</Label>
            <Input
              className={fieldClass}
              placeholder="e.g. Technical, Behavioral"
              value={form.interview_type || ""}
              onChange={(e) => handleChange("interview_type", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-green-300/70">Interviewers</Label>
            <Input
              className={fieldClass}
              placeholder="Names separated by commas"
              value={form.interviewers || ""}
              onChange={(e) => handleChange("interviewers", e.target.value)}
            />
          </div>
        </div>

        {/* Follow-Up Date */}
        <div className="space-y-2">
          <Label className="text-green-300/70">Follow-Up Date</Label>
          <Input
            type="date"
            className={fieldClass}
            value={form.follow_up_date || ""}
            onChange={(e) => handleChange("follow_up_date", e.target.value)}
          />
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <Label className="text-green-300/70">Notes</Label>
          <Textarea
            className={`${fieldClass} min-h-[100px] resize-none`}
            placeholder="Any notes about this application..."
            value={form.notes || ""}
            onChange={(e) => handleChange("notes", e.target.value)}
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            variant="outline"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            asChild
          >
            <Link href={`/applications/${params.id}`}>Cancel</Link>
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-500 text-white"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
