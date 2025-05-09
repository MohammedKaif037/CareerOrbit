"use client"
//TODO impl

import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export function SuccessRateChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) return

      // Fetch all applications for the user
      const { data: apps, error } = await supabase
        .from("applications")
        .select("application_method, status")
        .eq("user_id", userId)

      if (error || !apps) return

      // Aggregate counts
      const methodStats: Record<string, { applications: number; interviews: number; offers: number }> = {}

      for (const app of apps) {
        const method = app.application_method || "Other"
        if (!methodStats[method]) {
          methodStats[method] = { applications: 0, interviews: 0, offers: 0 }
        }

        methodStats[method].applications += 1

        if (app.status === "Interviewing") methodStats[method].interviews += 1
        if (app.status === "Offer") methodStats[method].offers += 1
      }

      const chartData = Object.entries(methodStats).map(([name, values]) => ({
        name,
        ...values,
      }))

      setData(chartData)
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

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
            color: "white",
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
