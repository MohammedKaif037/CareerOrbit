"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

const data = [
  { name: "Applied", value: 25, color: "#3b82f6" },
  { name: "Interview", value: 10, color: "#facc15" },
  { name: "Offer", value: 2, color: "#4ade80" },
  { name: "Rejected", value: 5, color: "#f87171" },
]

export function StatusSummary() {
  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className="pulsing"
                style={{ animationDelay: `${index * 0.5}s` }}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} Applications`, ""]}
            contentStyle={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              borderColor: "rgba(255, 255, 255, 0.1)",
              borderRadius: "0.5rem",
              boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
