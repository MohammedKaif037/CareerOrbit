"use client"

import { useEffect, useState } from "react"
import { CalendarClock, CheckCircle, Clock, XCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase-client"
import { formatDistanceToNow } from "date-fns"

// Type for activity items
type ActivityItem = {
  id: string
  company: string
  action: string
  date: string
  icon: any
  iconColor: string
}

export function RecentActivity() {
  const [isLoading, setIsLoading] = useState(true)
  const [activities, setActivities] = useState<ActivityItem[]>([])

  useEffect(() => {
    async function fetchRecentActivity() {
      try {
        const { data: userData } = await supabase.auth.getUser()
        
        if (userData?.user) {
          // Get recent applications or status changes
          const { data: applicationsData, error } = await supabase
            .from('applications')
            .select('*')
            .eq('user_id', userData.user.id)
            .order('updated_at', { ascending: false })
            .limit(5)
          
          if (applicationsData && !error) {
            const formattedActivities = applicationsData.map(app => {
              let action, icon, iconColor
              
              // Determine the action and icon based on status
              switch (app.status) {
                case 'Applied':
                  action = 'Applied'
                  icon = Clock
                  iconColor = 'text-blue-500'
                  break
                case 'Interviewing':
                  action = 'Interview Scheduled'
                  icon = CalendarClock
                  iconColor = 'text-yellow-500'
                  break
                case 'Offer':
                  action = 'Offer Received'
                  icon = CheckCircle
                  iconColor = 'text-green-500'
                  break
                case 'Rejected':
                  action = 'Rejected'
                  icon = XCircle
                  iconColor = 'text-red-500'
                  break
                default:
                  action = 'Updated'
                  icon = Clock
                  iconColor = 'text-blue-500'
              }
              
              return {
                id: app.id,
                company: app.company_name,
                action,
                date: formatDistanceToNow(new Date(app.updated_at || app.created_at), { addSuffix: true }),
                icon,
                iconColor
              }
            })
            
            setActivities(formattedActivities)
          }
        }
      } catch (error) {
        console.error("Error fetching recent activity:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecentActivity()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-center">
        <p className="text-muted-foreground">No recent activity.<br />Start your job search journey!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-3">
          <div className={`mt-0.5 ${activity.iconColor}`}>
            <activity.icon className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              {activity.company} - {activity.action}
            </p>
            <p className="text-sm text-muted-foreground">{activity.date}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
