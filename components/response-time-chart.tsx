"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

const data = [
  { name: "Google", days: 5 },
  { name: "Microsoft", days: 7 },
  { name: "Amazon", days: 10 },
  { name: "Apple", days: 3 },
  { name: "Meta", days: 14 },
  { name: "Netflix", days: 8 },
  { name: "SpaceX", days: 12 },
  { name: "Tesla", days: 9 },
]

export function ResponseTimeChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
        <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.7)" }} axisLine={{ stroke: "rgba(255,255,255,0.2)" }} />
        <YAxis
          label={{
            value: "Days",
            angle: -90,
            position: "insideLeft",
            fill: "rgba(255,255,255,0.7)",
          }}
          tick={{ fill: "rgba(255,255,255,0.7)" }}
          axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "0.5rem",
            boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
          }}
          formatter={(value) => [`${value} days`, "Response Time"]}
        />
        <Line
          type="monotone"
          dataKey="days"
          stroke="#38bdf8"
          strokeWidth={2}
          dot={{
            fill: "#38bdf8",
            r: 6,
            strokeWidth: 2,
            stroke: "rgba(0,0,0,0.5)",
          }}
          activeDot={{
            r: 8,
            stroke: "#38bdf8",
            strokeWidth: 2,
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
