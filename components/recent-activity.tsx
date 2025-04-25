import { CalendarClock, CheckCircle, Clock, XCircle } from "lucide-react"

const activities = [
  {
    id: 1,
    company: "SpaceX",
    action: "Applied",
    date: "2 days ago",
    icon: Clock,
    iconColor: "text-blue-500",
  },
  {
    id: 2,
    company: "NASA",
    action: "Interview Scheduled",
    date: "Yesterday",
    icon: CalendarClock,
    iconColor: "text-yellow-500",
  },
  {
    id: 3,
    company: "Blue Origin",
    action: "Rejected",
    date: "4 hours ago",
    icon: XCircle,
    iconColor: "text-red-500",
  },
  {
    id: 4,
    company: "Google",
    action: "Offer Received",
    date: "Just now",
    icon: CheckCircle,
    iconColor: "text-green-500",
  },
]

export function RecentActivity() {
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
