"use client"
//TODO impl
import { useEffect, useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Video } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

export function InterviewCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [interviews, setInterviews] = useState<any[]>([])
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)

  useEffect(() => {
    async function fetchInterviews() {
      // Fetch the current user
      const { data: userData, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error("Error fetching user:", userError)
        setDebugInfo({ type: "auth_error", error: userError })
        return
      }
      
      if (!userData?.user) {
        console.log("No user found")
        setDebugInfo({ type: "no_user" })
        return
      }
      
      console.log("Current user ID:", userData.user.id)
      
      // Fetch all interviews to check if there are any in the database
      const { data: allData, error: allError } = await supabase
        .from("interview_events")
        .select("*")
      
      if (allError) {
        console.error("Error fetching all interviews:", allError)
        setDebugInfo({ type: "all_query_error", error: allError })
        return
      }
      
      console.log("All interviews in DB:", allData)
      
      // Fetch only this user's interviews
      const { data, error } = await supabase
        .from("interview_events")
        .select("*")
        .eq("user_id", userData.user.id)
        .order("scheduled_time", { ascending: true })

      if (error) {
        console.error("Error fetching user interviews:", error)
        setDebugInfo({ 
          type: "user_query_error", 
          error, 
          userId: userData.user.id,
          allInterviews: allData
        })
      } else {
        console.log("User interviews found:", data)
        setInterviews(data || [])
        setDebugInfo({ 
          type: "success", 
          count: data?.length || 0,
          userId: userData.user.id,
          allInterviews: allData
        })
      }
    }

    fetchInterviews()
  }, [])

  const getInterviewsForDate = (date: Date | undefined) => {
    if (!date) return []

    const matchingInterviews = interviews.filter((interview) => {
      // Handle potentially invalid date strings
      try {
        const interviewDate = new Date(interview.scheduled_time)
        
        // Check if the date is valid
        if (isNaN(interviewDate.getTime())) {
          console.error("Invalid date format:", interview.scheduled_time)
          return false
        }
        
        const dateMatches = (
          interviewDate.getDate() === date.getDate() &&
          interviewDate.getMonth() === date.getMonth() &&
          interviewDate.getFullYear() === date.getFullYear()
        )
        
        if (dateMatches) {
          console.log("Found matching interview for selected date:", interview)
        }
        
        return dateMatches
      } catch (err) {
        console.error("Error processing date:", err)
        return false
      }
    })
    
    console.log(`Found ${matchingInterviews.length} interviews for ${date.toDateString()}`)
    return matchingInterviews
  }

  const formatTime = (date: Date) => {
    // Check for invalid date
    if (isNaN(date.getTime())) {
      return "Invalid time"
    }
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isDayWithInterview = (day: Date) => {
    return interviews.some((interview) => {
      try {
        const interviewDate = new Date(interview.scheduled_time)
        // Check if the date is valid
        if (isNaN(interviewDate.getTime())) {
          return false
        }
        
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Debug info panel - remove in production */}
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
                  <CardTitle className="text-lg">{interview.company || "Interview"}</CardTitle>
                  <CardDescription>{interview.notes || interview.event_type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span>
                      {formatTime(new Date(interview.scheduled_time))} ({interview.duration_minutes} min)
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
                {selectedInterview.company || "Interview"} - {selectedInterview.notes || selectedInterview.event_type}
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
                    <a href={selectedInterview.meeting_url} target="_blank" rel="noopener noreferrer">
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
                    {selectedInterview.interviewers.map((i: string, index: number) => (
                      <li key={index}>{i}</li>
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
