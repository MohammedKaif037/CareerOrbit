"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

const STATUS_COLORS = {
  Applied: "#3b82f6",
  Interview: "#facc15",
  Offer: "#4ade80",
  Rejected: "#f87171",
}

export function StatusSummary() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([
    { name: "Applied", value: 0 },
    { name: "Interview", value: 0 },
    { name: "Offer", value: 0 },
    { name: "Rejected", value: 0 },
  ])

  useEffect(() => {
    async function fetchStatusData() {
      try {
        const { data: userData } = await supabase.auth.getUser()

        if (userData?.user) {
          const { data: statsData } = await supabase.rpc("get_application_stats", {
            user_id: userData.user.id,
          })

          if (statsData) {
            setData([
              { name: "Applied", value: statsData.applied || 0 },
              { name: "Interview", value: statsData.interviewing || 0 },
              { name: "Offer", value: statsData.offer || 0 },
              { name: "Rejected", value: statsData.rejected || 0 },
            ])
          }
        }
      } catch (error) {
        console.error("Error fetching status data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStatusData()
  }, [])

  const total = data.reduce((acc, d) => acc + d.value, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (total === 0) {
    return (
      <div className="text-center text-muted-foreground py-4">
        No application data yet.<br />Add your first application to see statistics.
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row md:items-center md:gap-6">
      <div className="h-[200px] w-full md:w-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={2}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [`${value} Applications`, name]}
              contentStyle={{
                backgroundColor: "rgba(0, 0, 0, 0.8)",
                borderRadius: "0.5rem",
                color: "#fff",
                fontSize: "12px",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-4 md:mt-0 space-y-1 text-sm">
        {data.map((item) => (
          <li key={item.name} className="flex items-center gap-2">
            <span className="block w-3 h-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[item.name] }} />
            {item.name} — {item.value}
          </li>
        ))}
      </ul>
    </div>
  )
}
