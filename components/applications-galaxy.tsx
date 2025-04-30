"use client"

import { useEffect, useRef, useState } from "react"
import { supabase, Application } from "@/lib/supabase-client"
import { motion } from "framer-motion"

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "applied":
      return "#3b82f6"
    case "interviewing":
      return "#facc15"
    case "offer":
      return "#4ade80"
    case "rejected":
      return "#f87171"
    default:
      return "#a1a1aa"
  }
}

export function ApplicationsGalaxy() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [applications, setApplications] = useState<any[]>([])

  useEffect(() => {
    async function fetchApplications() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user?.id) return

      const { data, error } = await supabase
        .from("applications")
        .select("*")
        .eq("user_id", userData.user.id)

      if (data) {
        // enrich with random galaxy coordinates and size
        const enriched = data.map((app, i) => ({
          ...app,
          x: Math.random() * 80 + 10, // 10–90%
          y: Math.random() * 80 + 10,
          size: Math.random() * 10 + 10, // 10–20px
        }))
        setApplications(enriched)
      }
    }

    fetchApplications()
  }, [])

  // Mouse parallax effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { left, top, width, height } = containerRef.current.getBoundingClientRect()
      const x = (e.clientX - left) / width
      const y = (e.clientY - top) / height

      const stars = containerRef.current.querySelectorAll(".application-star")
      stars.forEach((star) => {
        const speed = Number.parseFloat(star.getAttribute("data-speed") || "0.05")
        const offsetX = (x - 0.5) * speed * 50
        const offsetY = (y - 0.5) * speed * 50
        star.setAttribute("style", `transform: translate(${offsetX}px, ${offsetY}px)`)
      })
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => document.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden rounded-lg">
      {/* Background stars */}
      {Array.from({ length: 50 }).map((_, i) => (
        <div
          key={`bg-star-${i}`}
          className="absolute rounded-full bg-white/30"
          style={{
            width: Math.random() * 2 + 1 + "px",
            height: Math.random() * 2 + 1 + "px",
            top: Math.random() * 100 + "%",
            left: Math.random() * 100 + "%",
            opacity: Math.random() * 0.5 + 0.2,
          }}
        />
      ))}

      {/* Application stars */}
      {applications.map((app, index) => {
        const color = getStatusColor(app.status)
        const speed = (app.size / 20) * 0.1 + 0.02

        return (
          <motion.div
            key={app.id}
            className="application-star absolute rounded-full cursor-pointer"
            data-speed={speed}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.05 }}
            style={{
              left: `${app.x}%`,
              top: `${app.y}%`,
              width: `${app.size}px`,
              height: `${app.size}px`,
              backgroundColor: color,
              boxShadow: `0 0 ${app.size / 2}px ${color}`,
            }}
            whileHover={{ scale: 1.5 }}
          >
            <div className="absolute opacity-0 hover:opacity-100 transition-opacity duration-200 bg-black/80 text-white p-2 rounded-md text-xs whitespace-nowrap z-10 -translate-x-1/2 -translate-y-full -mt-2 left-1/2 top-0">
              <p className="font-bold">{app.company_name}</p>
              <p>{app.job_title}</p>
              <p className="capitalize">{app.status}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
