"use client"

import { generateFollowUpAction } from "@/app/actions/gemini";
import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { motion, AnimatePresence } from "framer-motion"
import {
  Mail, Loader2, Copy, CheckCheck, Search,
  ChevronDown, ChevronUp, Sparkles, ExternalLink,
  RefreshCw, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"

type Application = {
  id: string
  company_name: string
  job_title: string
  application_date: string
  application_method: string
  notes: string | null
  location: string | null
}

type DraftState = {
  status: "idle" | "loading" | "done" | "error"
  email: string
  error: string
}

export function FollowUpDrafter() {
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [drafts, setDrafts] = useState<Record<string, DraftState>>({})
  const [expanded, setExpanded] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>("")

  useEffect(() => {
    async function fetchApplied() {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return

      // 1. Try auth metadata first — always works, no extra table needed
      const meta = userData.user?.user_metadata
      const metaName = meta?.full_name || meta?.name || ""
      if (metaName) setUserName(metaName)

      // 2. Try profiles table — silently skip if table doesn't exist (404)
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", userId)
        .single()

      if (!profileError && profileData?.full_name) {
        setUserName(profileData.full_name)
      }

      // 3. Fetch applications
      const { data } = await supabase
        .from("applications")
        .select("id, company_name, job_title, application_date, application_method, notes, location")
        .eq("user_id", userId)
        .eq("status", "Applied")
        .order("application_date", { ascending: false })

      if (data) setApps(data as Application[])
      setLoading(false)
    }
    fetchApplied()
  }, [])

  const generateDraft = async (app: Application) => {
    setDrafts((prev) => ({
      ...prev,
      [app.id]: { status: "loading", email: "", error: "" },
    }))
    setExpanded(app.id)

    const daysSince = Math.floor(
      (Date.now() - new Date(app.application_date).getTime()) / (1000 * 60 * 60 * 24)
    )

    const prompt = `Write a concise, professional follow-up email for a job application:
- Role: ${app.job_title}
- Company: ${app.company_name}
- Applied via: ${app.application_method}
- Days since applying: ${daysSince}
${app.location ? `- Location: ${app.location}` : ""}
${app.notes ? `- Notes: ${app.notes}` : ""}

Requirements:
- Subject line on the first line starting with "Subject: "
- Keep it under 120 words
- Friendly but professional tone
- Express continued interest and ask about next steps
- Use "I" as the sender
- Sign off with the name: ${userName || "[Your Name]"}
- Plain text only, no markdown.`

    try {
      const emailText = await generateFollowUpAction(prompt)

      // Guard: if action returned undefined/empty, surface a real error
      if (!emailText || typeof emailText !== "string" || emailText.trim() === "") {
        throw new Error("AI returned an empty response. Check your Gemini API key or try again.")
      }

      setDrafts((prev) => ({
        ...prev,
        [app.id]: { status: "done", email: emailText, error: "" },
      }))
    } catch (err: any) {
      console.error("Drafting Error:", err)
      setDrafts((prev) => ({
        ...prev,
        [app.id]: {
          status: "error",
          email: "",
          error: err.message || "Failed to generate. Please try again later.",
        },
      }))
    }
  }

  const copyToClipboard = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  // Only called when draft.email is a confirmed non-empty string
  const getGmailComposeUrl = (emailBody: string) => {
    const lines = emailBody.split("\n")
    const subjectLine = lines[0].replace("Subject: ", "").trim()
    const body = lines.slice(2).join("\n").trim()
    return `https://mail.google.com/mail/u/0/?view=cm&fs=1&to=${encodeURIComponent("hr@gmail.com")}&su=${encodeURIComponent(subjectLine)}&body=${encodeURIComponent(body)}`
  }

  const getGoogleSearchUrl = (companyName: string) => {
    const query = encodeURIComponent(`HR contact email ${companyName}`)
    return `https://www.google.com/search?q=${query}`
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    return `${days} days ago`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin" style={{ color: "#4ade80" }} />
      </div>
    )
  }

  if (apps.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center rounded-xl"
        style={{ border: "1px dashed rgba(74,222,128,0.2)" }}
      >
        <Mail className="h-8 w-8 mb-3" style={{ color: "rgba(74,222,128,0.3)" }} />
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
          No applications with "Applied" status found.
        </p>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.2)" }}>
          Add applications or update statuses to see them here.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header hint */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
        style={{
          backgroundColor: "rgba(74,222,128,0.05)",
          border: "1px solid rgba(74,222,128,0.15)",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        <Sparkles className="h-3 w-3 shrink-0" style={{ color: "#4ade80" }} />
        {apps.length} application{apps.length > 1 ? "s" : ""} with status{" "}
        <span className="text-blue-400 mx-1 font-medium">Applied</span> — click Generate to draft a follow-up
        {userName && (
          <span className="ml-auto shrink-0" style={{ color: "rgba(74,222,128,0.6)" }}>
            Signing as: {userName}
          </span>
        )}
      </div>

      {/* Application list */}
      {apps.map((app, i) => {
        const draft = drafts[app.id]
        const isExpanded = expanded === app.id
        const isLoading = draft?.status === "loading"

        return (
          <motion.div
            key={app.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="rounded-xl overflow-hidden"
            style={{
              border: "1px solid rgba(255,255,255,0.08)",
              backgroundColor: "rgba(255,255,255,0.02)",
            }}
          >
            {/* App row */}
            <div className="flex items-center gap-3 px-4 py-3.5">
              <div
                className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0 text-sm font-bold"
                style={{
                  backgroundColor: "rgba(74,222,128,0.1)",
                  color: "#4ade80",
                  border: "1px solid rgba(74,222,128,0.2)",
                }}
              >
                {app.company_name.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{app.company_name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {app.job_title}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.15)" }}>·</span>
                  <span
                    className="text-xs flex items-center gap-1 shrink-0"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    <Clock className="h-2.5 w-2.5" />
                    {formatDate(app.application_date)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  size="sm"
                  onClick={() => generateDraft(app)}
                  disabled={isLoading}
                  className="h-7 px-3 text-xs gap-1.5 font-medium"
                  style={{
                    backgroundColor:
                      draft?.status === "done" ? "rgba(74,222,128,0.08)" : "rgba(74,222,128,0.15)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    color: "#4ade80",
                  }}
                >
                  {isLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : draft?.status === "done" ? (
                    <RefreshCw className="h-3 w-3" />
                  ) : (
                    <Sparkles className="h-3 w-3" />
                  )}
                  {isLoading ? "Writing..." : draft?.status === "done" ? "Redo" : "Generate"}
                </Button>

                {draft?.status === "done" && (
                  <button
                    onClick={() => setExpanded(isExpanded ? null : app.id)}
                    className="h-7 w-7 rounded-md flex items-center justify-center transition-colors"
                    style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.4)" }}
                  >
                    {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                )}
              </div>
            </div>

            {/* Draft area */}
            <AnimatePresence>
              {isExpanded && draft && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div className="px-4 py-4 space-y-3">
                    {draft.status === "error" && (
                      <p className="text-xs" style={{ color: "#f87171" }}>
                        {draft.error}
                      </p>
                    )}

                    {draft.status === "done" && draft.email && (
                      <>
                        <div
                          className="rounded-lg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap"
                          style={{
                            backgroundColor: "#0a1a10",
                            border: "1px solid rgba(74,222,128,0.15)",
                            color: "rgba(255,255,255,0.8)",
                            maxHeight: "240px",
                            overflowY: "auto",
                          }}
                        >
                          {draft.email.split("\n").map((line, idx) => (
                            <span key={idx}>
                              {idx === 0 && line.startsWith("Subject:") ? (
                                <span style={{ color: "#4ade80", fontWeight: 600 }}>{line}</span>
                              ) : (
                                line
                              )}
                              {"\n"}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              onClick={() => copyToClipboard(app.id, draft.email)}
                              className="h-7 px-3 text-xs gap-1.5"
                              style={{
                                backgroundColor:
                                  copied === app.id ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)",
                                border: "1px solid rgba(255,255,255,0.12)",
                                color: copied === app.id ? "#4ade80" : "rgba(255,255,255,0.6)",
                              }}
                            >
                              {copied === app.id ? (
                                <><CheckCheck className="h-3 w-3" /> Copied!</>
                              ) : (
                                <><Copy className="h-3 w-3" /> Copy</>
                              )}
                            </Button>

                            <a
                              href={getGmailComposeUrl(draft.email)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                size="sm"
                                className="h-7 px-3 text-xs gap-1.5"
                                style={{
                                  backgroundColor: "rgba(234,67,53,0.12)",
                                  border: "1px solid rgba(234,67,53,0.3)",
                                  color: "#ea4335",
                                }}
                              >
                                <Mail className="h-3 w-3" />
                                Open in Gmail
                                <ExternalLink className="h-2.5 w-2.5" />
                              </Button>
                            </a>
                          </div>

                          <a
                            href={getGoogleSearchUrl(app.company_name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs transition-colors hover:opacity-80"
                            style={{ color: "rgba(96,165,250,0.7)" }}
                          >
                            <Search className="h-3 w-3" />
                            Find HR email
                            <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        </div>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )
      })}
    </div>
  )
}
