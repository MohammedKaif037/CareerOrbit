"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Clock, CalendarClock, CheckCircle, XCircle, Ghost, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

type Status = "Applied" | "Interviewing" | "Offer" | "Rejected" | "Ghosted"

const STATUS_CONFIG: Record<Status, { icon: React.ElementType; bg: string; text: string; dot: string }> = {
  Applied:      { icon: Clock,        bg: "#1e3a5f", text: "#60a5fa", dot: "#3b82f6" },
  Interviewing: { icon: CalendarClock, bg: "#3b2f00", text: "#facc15", dot: "#eab308" },
  Offer:        { icon: CheckCircle,  bg: "#0f2d1a", text: "#4ade80", dot: "#22c55e" },
  Rejected:     { icon: XCircle,      bg: "#2d0f0f", text: "#f87171", dot: "#ef4444" },
  Ghosted:      { icon: Ghost,        bg: "#1f1f1f", text: "#9ca3af", dot: "#6b7280" },
}

const ALL_STATUSES: Status[] = ["Applied", "Interviewing", "Offer", "Rejected", "Ghosted"]

type Props = {
  applicationId: string
  currentStatus: Status
  onUpdated?: (newStatus: Status) => void
}

export function QuickStatusUpdate({ applicationId, currentStatus, onUpdated }: Props) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<Status>(currentStatus)
  const [saving, setSaving] = useState<Status | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const handleSelect = async (newStatus: Status) => {
    if (newStatus === status) { setOpen(false); return }
    setSaving(newStatus)
    setOpen(false)

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", applicationId)

    if (!error) {
      setStatus(newStatus)
      onUpdated?.(newStatus)
    }
    setSaving(null)
  }

  const config = STATUS_CONFIG[status]
  const Icon = saving ? Loader2 : config.icon

  return (
    <div ref={ref} className="relative inline-flex">
      {/* Current status pill — click to open */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setOpen((o) => !o) }}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-150 hover:brightness-125 active:scale-95 cursor-pointer select-none"
        style={{ backgroundColor: config.bg, color: config.text, border: `1px solid ${config.dot}40` }}
        title="Click to change status"
      >
        <Icon className={`h-3 w-3 shrink-0 ${saving ? "animate-spin" : ""}`} />
        {saving ? saving : status}
        <span className="ml-0.5 opacity-50 text-[10px]">▾</span>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full mt-1.5 left-0 z-50 rounded-lg overflow-hidden shadow-2xl"
            style={{ backgroundColor: "#0d1f12", border: "1px solid rgba(74,222,128,0.2)", minWidth: "140px" }}
          >
            {ALL_STATUSES.map((s) => {
              const c = STATUS_CONFIG[s]
              const SIcon = c.icon
              const isActive = s === status
              return (
                <button
                  key={s}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSelect(s) }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors duration-100 hover:bg-white/5"
                  style={{ color: isActive ? c.text : "rgba(255,255,255,0.6)" }}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: isActive ? c.dot : "rgba(255,255,255,0.2)" }}
                  />
                  <SIcon className="h-3 w-3 shrink-0" style={{ color: isActive ? c.text : "rgba(255,255,255,0.4)" }} />
                  {s}
                  {isActive && <span className="ml-auto text-[10px] opacity-40">✓</span>}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
