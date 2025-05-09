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
} from "recharts"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export function ApplicationsChart() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchChartData() {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData?.user?.id) return

      const { data: statsData } = await supabase.rpc("get_application_stats", {
        user_id: userData.user.id,
      })

      if (statsData) {
        const formatted = [
          { name: "Applied", value: statsData.applied || 0, fill: "#3b82f6" },
          { name: "Interview", value: statsData.interviewing || 0, fill: "#facc15" },
          { name: "Offer", value: statsData.offer || 0, fill: "#4ade80" },
          { name: "Rejected", value: statsData.rejected || 0, fill: "#f87171" },
        ]
        setData(formatted)
      }

      setLoading(false)
    }

    fetchChartData()
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
            color: "#fff",
            borderColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "0.5rem",
            boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
          }}
        />
        <Bar dataKey="value" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
