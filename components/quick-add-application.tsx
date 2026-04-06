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
      setErrorMsg("Format: role ; company ; location ; method")
      return
    }

    const [job_title, company_name, location = "", application_method = "Naukri"] = parts

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
      application_method: application_method || "Naukri",
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
    method: parts[3] || "Naukri",
  }
  const hasPreview = preview.role || preview.company

  return (
    <div className="relative flex items-center">
      {/* Thunder button */}
      <Button
        type="button"
        size="icon"
        onClick={() => setOpen((o) => !o)}
        className={`h-9 w-9 shrink-0 transition-all duration-200 border ${
          open
            ? "bg-yellow-500/30 border-yellow-400 text-yellow-300 hover:bg-yellow-500/40"
            : "bg-yellow-500/15 border-yellow-500/40 text-yellow-400 hover:bg-yellow-500/25"
        }`}
        title="Quick add application"
      >
        <Zap className={`h-4 w-4 ${open ? "fill-yellow-300" : ""}`} />
      </Button>

      {/* Expanding input panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: "360px", opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-11 z-50"
          >
            <div
              className="flex flex-col gap-1.5 p-2 rounded-lg border border-green-400/40 shadow-xl shadow-black/60"
              style={{ backgroundColor: "#0a1f12" }}
            >
              <div className="relative">
                <input
                  ref={inputRef}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value)
                    setErrorMsg("")
                    setStatus("idle")
                  }}
                  onKeyDown={handleKeyDown}
                  placeholder="role ; company ; location ; method"
                  className="w-full h-9 px-3 pr-8 text-sm rounded-md border text-white focus:outline-none focus:ring-1"
                  style={{
                    backgroundColor: "#0f2d1a",
                    borderColor: "rgba(74,222,128,0.35)",
                    caretColor: "#4ade80",
                  }}
                />
                {/* Status icon */}
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                  {status === "loading" && <Loader2 className="h-3.5 w-3.5 text-green-400 animate-spin" />}
                  {status === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />}
                  {status === "error" && <X className="h-3.5 w-3.5 text-red-400" />}
                </div>
              </div>

              {/* Live preview */}
              <AnimatePresence>
                {hasPreview && status === "idle" && !errorMsg && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 px-1 text-xs whitespace-nowrap overflow-hidden"
                  >
                    {preview.role && (
                      <span className="text-white font-medium truncate max-w-[80px]">{preview.role}</span>
                    )}
                    {preview.company && (
                      <>
                        <span className="text-green-500/50">@</span>
                        <span className="text-green-300 truncate max-w-[80px]">{preview.company}</span>
                      </>
                    )}
                    {preview.location && (
                      <>
                        <span className="text-green-500/50">·</span>
                        <span className="text-green-300/60 truncate max-w-[60px]">{preview.location}</span>
                      </>
                    )}
                    <span className="text-green-500/50">·</span>
                    <span className="text-yellow-400/70 truncate max-w-[60px]">{preview.method}</span>
                    <span className="ml-auto text-green-500/40 shrink-0 text-[10px]">↵ Enter</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Format hint when empty */}
              {!value && (
                <p className="text-[10px] px-1" style={{ color: "rgba(74,222,128,0.3)" }}>
                  method defaults to <span style={{ color: "rgba(250,204,21,0.6)" }}>Naukri</span> if not provided
                </p>
              )}

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
