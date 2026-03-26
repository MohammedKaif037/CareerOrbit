"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"
import Link from "next/link"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { motion } from "framer-motion"
import {
  ArrowLeft,
  Edit,
  Trash2,
  ExternalLink,
  Star,
  CalendarClock,
  CheckCircle,
  Clock,
  XCircle,
  MapPin,
  DollarSign,
  User,
  FileText,
  Briefcase,
  Bell,
} from "lucide-react"

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
  status: "Applied" | "Interviewing" | "Offer" | "Rejected"
  job_url: string | null
  salary_range: string | null
  location: string | null
  priority: number | null
}

const statusConfig = {
  Applied: { icon: Clock, color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  Interviewing: { icon: CalendarClock, color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
  Offer: { icon: CheckCircle, color: "bg-green-500/20 text-green-400 border-green-500/30" },
  Rejected: { icon: XCircle, color: "bg-red-500/20 text-red-400 border-red-500/30" },
}

export default function ApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [app, setApp] = useState<Application | null>(null)
  const [loading, setLoading] = useState(true)

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
      setApp(data as Application)
      setLoading(false)
    }
    fetchApplication()
  }, [params.id, router])

  const handleDelete = async () => {
    if (!app) return
    if (!confirm("Are you sure you want to delete this application?")) return

    const { error } = await supabase.from("applications").delete().eq("id", app.id)
    if (error) {
      alert("Failed to delete application.")
    } else {
      router.push("/applications")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-green-400">Loading application...</div>
      </div>
    )
  }

  if (!app) return null

  const StatusIcon = statusConfig[app.status]?.icon || Clock
  const statusColor = statusConfig[app.status]?.color || ""

  const getPriorityStars = (priority: number | null) => {
    if (!priority) return null
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${i < priority ? "text-yellow-400 fill-yellow-400" : "text-gray-600"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      {/* Back + Actions */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/applications"
          className="flex items-center gap-2 text-sm text-green-400/70 hover:text-green-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Applications
        </Link>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            asChild
          >
            <Link href={`/applications/${app.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Header Card */}
        <div className="border border-green-300/30 rounded-lg p-6 bg-green-900/10">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{app.company_name}</h1>
              <p className="text-green-300/70 mt-1 text-lg">{app.job_title}</p>
              <div className="flex flex-wrap gap-3 mt-3">
                <Badge className={`${statusColor} flex items-center gap-1`}>
                  <StatusIcon className="h-3 w-3" />
                  {app.status}
                </Badge>
                {app.location && (
                  <span className="flex items-center gap-1 text-sm text-green-300/60">
                    <MapPin className="h-3 w-3" />
                    {app.location}
                  </span>
                )}
                {app.salary_range && (
                  <span className="flex items-center gap-1 text-sm text-green-300/60">
                    <DollarSign className="h-3 w-3" />
                    {app.salary_range}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              {getPriorityStars(app.priority)}
              {app.job_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                  onClick={() => window.open(app.job_url!, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Job Posting
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Application Info */}
          <div className="border border-green-300/30 rounded-lg p-5 bg-green-900/10">
            <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Briefcase className="h-4 w-4" /> Application Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-green-300/60">Applied Date</span>
                <span className="text-white">
                  {app.application_date
                    ? format(new Date(app.application_date), "MMM d, yyyy")
                    : "-"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-300/60">Method</span>
                <span className="text-white">{app.application_method || "-"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-300/60">Resume Sent</span>
                <Checkbox
                  checked={app.resume_sent}
                  disabled
                  className={app.resume_sent ? "bg-green-500 border-green-500" : ""}
                />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-300/60">Cover Letter Sent</span>
                <Checkbox
                  checked={app.cover_letter_sent}
                  disabled
                  className={app.cover_letter_sent ? "bg-green-500 border-green-500" : ""}
                />
              </div>
            </div>
          </div>

          {/* Interview Info */}
          <div className="border border-green-300/30 rounded-lg p-5 bg-green-900/10">
            <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Interview Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-300/60">Scheduled</span>
                <Checkbox
                  checked={app.interview_scheduled}
                  disabled
                  className={app.interview_scheduled ? "bg-green-500 border-green-500" : ""}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-green-300/60">Type</span>
                <span className="text-white">{app.interview_type || "-"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-300/60">Interviewers</span>
                <span className="text-white text-right max-w-[60%]">{app.interviewers || "-"}</span>
              </div>
            </div>
          </div>

          {/* Follow-Up */}
          <div className="border border-green-300/30 rounded-lg p-5 bg-green-900/10">
            <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Bell className="h-4 w-4" /> Follow-Up
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-green-300/60">Required</span>
                <Checkbox
                  checked={app.follow_up_required}
                  disabled
                  className={app.follow_up_required ? "bg-green-500 border-green-500" : ""}
                />
              </div>
              <div className="flex justify-between">
                <span className="text-green-300/60">Follow-Up Date</span>
                <span className="text-white">
                  {app.follow_up_date
                    ? format(new Date(app.follow_up_date), "MMM d, yyyy")
                    : "-"}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border border-green-300/30 rounded-lg p-5 bg-green-900/10">
            <h2 className="text-sm font-semibold text-green-400 uppercase tracking-wide mb-4 flex items-center gap-2">
              <FileText className="h-4 w-4" /> Notes
            </h2>
            <p className="text-sm text-green-300/70 whitespace-pre-wrap">
              {app.notes || "No notes added."}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
