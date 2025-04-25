"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

// Mock data for applications
const applications = [
  { id: 1, company: "SpaceX", position: "Frontend Developer", status: "applied", x: 30, y: 40, size: 15 },
  { id: 2, company: "NASA", position: "UI Designer", status: "interview", x: 60, y: 20, size: 18 },
  { id: 3, company: "Blue Origin", position: "Full Stack Developer", status: "rejected", x: 75, y: 60, size: 12 },
  { id: 4, company: "Google", position: "Software Engineer", status: "offer", x: 40, y: 70, size: 20 },
  { id: 5, company: "Microsoft", position: "Product Manager", status: "applied", x: 20, y: 30, size: 14 },
  { id: 6, company: "Apple", position: "UX Researcher", status: "interview", x: 80, y: 40, size: 16 },
  { id: 7, company: "Meta", position: "React Developer", status: "applied", x: 50, y: 50, size: 13 },
  { id: 8, company: "Amazon", position: "Cloud Engineer", status: "offer", x: 65, y: 25, size: 19 },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "applied":
      return "#3b82f6" // blue
    case "interview":
      return "#facc15" // yellow
    case "offer":
      return "#4ade80" // green
    case "rejected":
      return "#f87171" // red
    default:
      return "#a1a1aa" // gray
  }
}

export function ApplicationsGalaxy() {
  const containerRef = useRef<HTMLDivElement>(null)

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
      {applications.map((app) => {
        const color = getStatusColor(app.status)
        const speed = (app.size / 20) * 0.1 + 0.02

        return (
          <motion.div
            key={app.id}
            className="application-star absolute rounded-full cursor-pointer"
            data-speed={speed}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: app.id * 0.1 }}
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
              <p className="font-bold">{app.company}</p>
              <p>{app.position}</p>
              <p className="capitalize">{app.status}</p>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
