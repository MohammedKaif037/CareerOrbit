"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Zap, Loader2, CheckCircle2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createApplication } from "@/lib/supabase-client"
import { useAuth } from "@/lib/auth-context"

export function QuickAddApplication({ onAdded }: { onAdded?: () => void }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setValue("")
      setStatus("idle")
      setErrorMsg("")
    }
  }, [open])

  const handleSubmit = async () => {
    const parts = value.split(";").map((p) => p.trim())
    if (parts.length < 2) {
      setErrorMsg("Format: role ; company ; location")
      return
    }

    const [job_title, company_name, location = ""] = parts

    if (!job_title || !company_name) {
      setErrorMsg("Role and company are required")
      return
    }

    if (!user) {
      setErrorMsg("You must be logged in")
      return
    }

    setStatus("loading")
    setErrorMsg("")

    const today = new Date().toISOString().split("T")[0]

    const { data, error } = await createApplication({
      user_id: user.id,
      job_title,
      company_name,
      location,
      status: "Applied",
      application_date: new Date(today).toISOString(),
      application_method: "Other",
      priority: 3,
      resume_sent: false,
      cover_letter_sent: false,
      follow_up_required: false,
      interview_scheduled: false,
      follow_up_date: null,
      notes: "",
      salary_range: "",
      job_url: "",
    })

    if (error) {
      setStatus("error")
      setErrorMsg(typeof error === "string" ? error : "Failed to add application")
      return
    }

    setStatus("success")
    onAdded?.()

    setTimeout(() => {
      setOpen(false)
    }, 1200)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSubmit()
    if (e.key === "Escape") setOpen(false)
  }

  // Parse preview from input
  const parts = value.split(";").map((p) => p.trim())
  const preview = {
    role: parts[0] || null,
    company: parts[1] || null,
    location: parts[2] || null,
  }
  const hasPreview = preview.role || preview.company

  return (
    <div className="relative flex items-center">
      {/* Thunder button */}
      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className={`h-9 w-9 shrink-0 transition-all duration-200 ${
          open
            ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400 hover:bg-yellow-500/30"
            : "bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20"
        }`}
        title="Quick add application"
      >
        <Zap className={`h-4 w-4 ${open ? "fill-yellow-400" : ""}`} />
      </Button>

      {/* Expanding input panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "320px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-10 overflow-hidden"
          >
            <div className="flex flex-col gap-1 pl-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => {
                      setValue(e.target.value)
                      setErrorMsg("")
                      setStatus("idle")
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="role ; company ; location"
                    className="w-full h-9 px-3 text-sm rounded-md bg-green-900/30 border border-green-300/30 text-white placeholder:text-green-300/30 focus:outline-none focus:border-green-400 focus:ring-1 focus:ring-green-400/20 pr-8"
                  />
                  {/* Status icon inside input */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {status === "loading" && (
                      <Loader2 className="h-3.5 w-3.5 text-green-400 animate-spin" />
                    )}
                    {status === "success" && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
                    )}
                    {status === "error" && (
                      <X className="h-3.5 w-3.5 text-red-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Live preview */}
              <AnimatePresence>
                {hasPreview && status === "idle" && !errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 px-1 text-xs text-green-300/60 whitespace-nowrap overflow-hidden"
                  >
                    {preview.role && (
                      <span className="text-white/70 truncate max-w-[90px]">{preview.role}</span>
                    )}
                    {preview.company && (
                      <>
                        <span className="text-green-500/40">@</span>
                        <span className="text-green-300/70 truncate max-w-[90px]">{preview.company}</span>
                      </>
                    )}
                    {preview.location && (
                      <>
                        <span className="text-green-500/40">·</span>
                        <span className="truncate max-w-[70px]">{preview.location}</span>
                      </>
                    )}
                    <span className="ml-auto text-green-500/40 shrink-0">↵ Enter</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {errorMsg && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-red-400 px-1"
                  >
                    {errorMsg}
                  </motion.p>
                )}
              </AnimatePresence>

              {/* Success */}
              <AnimatePresence>
                {status === "success" && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-400 px-1"
                  >
                    ✓ Application added!
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
