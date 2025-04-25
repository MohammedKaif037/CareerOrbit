"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Applied", value: 42, fill: "#3b82f6" },
  { name: "Screening", value: 28, fill: "#8b5cf6" },
  { name: "Interview", value: 15, fill: "#facc15" },
  { name: "Final Round", value: 8, fill: "#fb923c" },
  { name: "Offer", value: 2, fill: "#4ade80" },
]

export function ApplicationsChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)" }} axisLine={{ stroke: "rgba(255,255,255,0.2)" }} />
        <YAxis tick={{ fill: "rgba(255,255,255,0.7)" }} axisLine={{ stroke: "rgba(255,255,255,0.2)" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "0.5rem",
            boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} className="pulsing" />
      </BarChart>
    </ResponsiveContainer>
  )
}
