"use client"
import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Video } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

// Enhanced type definitions
type Application = {
  id: string;
  company_name: string;
  job_title: string;
}

type InterviewEvent = {
  id: string;
  application_id: string;
  event_type: 'video' | 'onsite';
  scheduled_time: string;
  duration_minutes: number;
  interviewers?: string[];
  notes?: string | null;
  user_id: string;
  location?: string | null;
  meeting_url?: string | null;
  application?: Application;  // Optional application details
}

export function InterviewCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [interviews, setInterviews] = useState<InterviewEvent[]>([])
  const [selectedInterview, setSelectedInterview] = useState<InterviewEvent | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchInterviews() {
      setIsLoading(true)
      try {
        // Get current user
        const { data: userData, error: userError } = await supabase.auth.getUser()

        if (userError || !userData?.user) {
          console.error("Authentication error:", userError)
          setDebugInfo({ 
            type: "auth_error", 
            error: userError,
            message: "Unable to fetch user" 
          })
          setIsLoading(false)
          return
        }

        // Fetch interviews with full application details
        const { data, error } = await supabase
          .from("interview_events")
          .select(`
            *,
            applications (
              id,
              company_name,
              job_title
            )
          `)
          .eq("user_id", userData.user.id)
          .order("scheduled_time", { ascending: true })

        if (error) {
          console.error("Error fetching interviews:", error)
          setDebugInfo({ 
            type: "query_error", 
            error,
            userId: userData.user.id 
          })
        } else {
          // Transform data to include application details
          const transformedInterviews = data.map(item => ({
            ...item,
            application: item.applications,  // Add application details
            location: item.location || 'Not specified',
            company_name: item.applications?.company_name || 'Unknown Company',
            job_title: item.applications?.job_title || 'Unknown Job'
          }))

          console.log("Interviews found:", transformedInterviews)
          setInterviews(transformedInterviews)
          setDebugInfo({ 
            type: "success", 
            count: transformedInterviews.length,
            userId: userData.user.id 
          })
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setDebugInfo({ 
          type: "unexpected_error", 
          error: err 
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  const getInterviewsForDate = (date: Date | undefined) => {
    if (!date) return []

    return interviews.filter((interview) => {
      try {
        const interviewDate = new Date(interview.scheduled_time)
        
        return (
          interviewDate.getDate() === date.getDate() &&
          interviewDate.getMonth() === date.getMonth() &&
          interviewDate.getFullYear() === date.getFullYear()
        )
      } catch (err) {
        console.error("Error processing date:", err)
        return false
      }
    })
  }

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch (err) {
      return "Invalid time"
    }
  }

  const isDayWithInterview = (day: Date) => {
    return interviews.some((interview) => {
      try {
        const interviewDate = new Date(interview.scheduled_time)
        return (
          interviewDate.getDate() === day.getDate() &&
          interviewDate.getMonth() === day.getMonth() &&
          interviewDate.getFullYear() === day.getFullYear()
        )
      } catch (err) {
        return false
      }
    })
  }

  const interviewsForDate = getInterviewsForDate(date)

  if (isLoading) {
    return <div>Loading interviews...</div>
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {debugInfo && (
        <div className="col-span-2 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-md mb-4">
          <h3 className="text-lg font-bold mb-2">Debug Info</h3>
          <pre className="text-xs overflow-auto max-h-40">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>
      )}

      <div>
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-md border border-white/10 p-3 glass-card"
          modifiers={{
            interview: (date) => isDayWithInterview(date),
          }}
          modifiersClassNames={{
            interview: "bg-primary/20 text-primary font-bold",
          }}
        />
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">
          {date ? (
            <>Interviews on {date.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</>
          ) : (
            <>Select a date</>
          )}
        </h3>

        {interviewsForDate.length === 0 ? (
          <p className="text-muted-foreground">No interviews scheduled for this date.</p>
        ) : (
          <div className="space-y-4">
            {interviewsForDate.map((interview) => (
              <Card
                key={interview.id}
                className="glass-card cosmic-glow-yellow cursor-pointer transition-all hover:scale-[1.02]"
                onClick={() => setSelectedInterview(interview)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {interview.application?.company_name || 'Unknown Company'}
                  </CardTitle>
                  <CardDescription>
                    {interview.application?.job_title || 'Unknown Job'}
                    {interview.notes ? ` - ${interview.notes}` : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span>
                      {formatTime(interview.scheduled_time)} ({interview.duration_minutes} min)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {interview.event_type === "video" ? (
                      <>
                        <Video className="h-4 w-4 text-yellow-400" />
                        <span>Video Interview</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-yellow-400" />
                        <span>{interview.location || "No location specified"}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {interview.interviewers?.map((person: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-yellow-500/10 border-yellow-500/20">
                        {person}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {selectedInterview && (
          <Card className="glass-card mt-4">
            <CardHeader>
              <CardTitle>Interview Details</CardTitle>
              <CardDescription>
                {selectedInterview.application?.company_name || 'Unknown Company'} - 
                {selectedInterview.application?.job_title || 'Unknown Job'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium">Date & Time</h4>
                <p>
                  {new Date(selectedInterview.scheduled_time).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long", 
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>Duration: {selectedInterview.duration_minutes} minutes</p>
              </div>

              {selectedInterview.event_type === "video" ? (
                <div>
                  <h4 className="font-medium">Meeting Link</h4>
                  <p className="text-primary underline">
                    <a href={selectedInterview.meeting_url || '#'} target="_blank" rel="noopener noreferrer">
                      {selectedInterview.meeting_url || "No meeting link provided"}
                    </a>
                  </p>
                </div>
              ) : (
                <div>
                  <h4 className="font-medium">Location</h4>
                  <p>{selectedInterview.location || "No location specified"}</p>
                </div>
              )}

              <div>
                <h4 className="font-medium">Interviewers</h4>
                {selectedInterview.interviewers && selectedInterview.interviewers.length > 0 ? (
                  <ul className="list-disc list-inside">
                    {selectedInterview.interviewers.map((interviewer: string, index: number) => (
                      <li key={index}>{interviewer}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No interviewers specified</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
                    }
