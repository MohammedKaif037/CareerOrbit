"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"

const data = [
  {
    name: "Job Board",
    applications: 20,
    interviews: 5,
    offers: 1,
  },
  {
    name: "Company Website",
    applications: 15,
    interviews: 6,
    offers: 1,
  },
  {
    name: "Referral",
    applications: 7,
    interviews: 5,
    offers: 2,
  },
  {
    name: "Recruiter",
    applications: 5,
    interviews: 3,
    offers: 1,
  },
  {
    name: "LinkedIn",
    applications: 10,
    interviews: 2,
    offers: 0,
  },
]

export function SuccessRateChart() {
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
        <Legend
          wrapperStyle={{
            paddingTop: "20px",
            color: "rgba(255,255,255,0.7)",
          }}
        />
        <Bar dataKey="applications" name="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="interviews" name="Interviews" fill="#facc15" radius={[4, 4, 0, 0]} />
        <Bar dataKey="offers" name="Offers" fill="#4ade80" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
