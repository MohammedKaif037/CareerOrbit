// "use client"

// import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

// const data = [
//   { name: "Applied", value: 25, color: "#3b82f6" },
//   { name: "Interview", value: 10, color: "#facc15" },
//   { name: "Offer", value: 2, color: "#4ade80" },
//   { name: "Rejected", value: 5, color: "#f87171" },
// ]

// export function StatusSummary() {
//   return (
//     <div className="h-[200px] w-full">
//       <ResponsiveContainer width="100%" height="100%">
//         <PieChart>
//           <Pie
//             data={data}
//             cx="50%"
//             cy="50%"
//             innerRadius={40}
//             outerRadius={70}
//             paddingAngle={2}
//             dataKey="value"
//             label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
//             labelLine={false}
//           >
//             {data.map((entry, index) => (
//               <Cell key={`cell-${index}`} fill={entry.color} />
//             ))}
//           </Pie>
//           <Tooltip
//             formatter={(value) => [`${value} Applications`, ""]}
//             contentStyle={{
//               backgroundColor: "rgba(0, 0, 0, 0.8)",
//               borderColor: "rgba(255, 255, 255, 0.1)",
//               borderRadius: "0.5rem",
//               boxShadow: "0 0 10px rgba(56, 189, 248, 0.3)",
//             }}
//           />
//         </PieChart>
//       </ResponsiveContainer>
//     </div>
//   )
// }
"use client"

import { useEffect, useState } from "react"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { supabase } from "@/lib/supabase-client"
import { Loader2 } from "lucide-react"

export function StatusSummary() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState([
    { name: "Applied", value: 0, color: "#3b82f6" },
    { name: "Interview", value: 0, color: "#facc15" },
    { name: "Offer", value: 0, color: "#4ade80" },
    { name: "Rejected", value: 0, color: "#f87171" },
  ])

  useEffect(() => {
    async function fetchStatusData() {
      try {
        const { data: userData } = await supabase.auth.getUser()
        
        if (userData?.user) {
          // Get application stats
          const { data: statsData } = await supabase.rpc("get_application_stats", {
            user_id: userData.user.id,
          })
          
          if (statsData) {
            setData([
              { name: "Applied", value: statsData.applied || 0, color: "#3b82f6" },
              { name: "Interview", value: statsData.interviewing || 0, color: "#facc15" },
              { name: "Offer", value: statsData.offer || 0, color: "#4ade80" },
              { name: "Rejected", value: statsData.rejected || 0, color: "#f87171" },
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  // If there's no data, show a message
  const totalApplications = data.reduce((acc, item) => acc + item.value, 0)
  if (totalApplications === 0) {
    return (
      <div className="flex items-center justify-center h-[200px] text-center">
        <p className="text-muted-foreground">No application data yet.<br />Add your first application to see statistics.</p>
      </div>
    )
  }

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
              <Cell key={`cell-${index}`} fill={entry.color} />
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
