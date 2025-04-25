"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Video } from "lucide-react"

// Mock interview data
const interviews = [
  {
    id: 1,
    company: "SpaceX",
    position: "Frontend Developer",
    date: new Date(2023, 3, 20, 14, 0), // April 20, 2023, 2:00 PM
    duration: 60,
    type: "video",
    link: "https://meet.google.com/abc-defg-hij",
    interviewers: ["John Doe", "Jane Smith"],
  },
  {
    id: 2,
    company: "NASA",
    position: "UI Designer",
    date: new Date(2023, 3, 22, 10, 30), // April 22, 2023, 10:30 AM
    duration: 45,
    type: "video",
    link: "https://zoom.us/j/123456789",
    interviewers: ["Michael Johnson"],
  },
  {
    id: 3,
    company: "Google",
    position: "Software Engineer",
    date: new Date(2023, 3, 25, 15, 0), // April 25, 2023, 3:00 PM
    duration: 90,
    type: "onsite",
    location: "Mountain View, CA",
    interviewers: ["Sarah Williams", "Robert Brown", "Emily Davis"],
  },
]

export function InterviewCalendar() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [selectedInterview, setSelectedInterview] = useState<any | null>(null)

  // Function to get interviews for a specific date
  const getInterviewsForDate = (date: Date | undefined) => {
    if (!date) return []

    return interviews.filter((interview) => {
      const interviewDate = new Date(interview.date)
      return (
        interviewDate.getDate() === date.getDate() &&
        interviewDate.getMonth() === date.getMonth() &&
        interviewDate.getFullYear() === date.getFullYear()
      )
    })
  }

  // Function to format time
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Get interviews for the selected date
  const interviewsForDate = getInterviewsForDate(date)

  // Function to highlight dates with interviews
  const isDayWithInterview = (day: Date) => {
    return interviews.some((interview) => {
      const interviewDate = new Date(interview.date)
      return (
        interviewDate.getDate() === day.getDate() &&
        interviewDate.getMonth() === day.getMonth() &&
        interviewDate.getFullYear() === day.getFullYear()
      )
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <CardTitle className="text-lg">{interview.company}</CardTitle>
                  <CardDescription>{interview.position}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-yellow-400" />
                    <span>
                      {formatTime(new Date(interview.date))} ({interview.duration} min)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    {interview.type === "video" ? (
                      <>
                        <Video className="h-4 w-4 text-yellow-400" />
                        <span>Video Interview</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="h-4 w-4 text-yellow-400" />
                        <span>{interview.location}</span>
                      </>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {interview.interviewers.map((interviewer: string, index: number) => (
                      <Badge key={index} variant="outline" className="bg-yellow-500/10 border-yellow-500/20">
                        {interviewer}
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
                {selectedInterview.company} - {selectedInterview.position}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Date & Time</h4>
                <p>
                  {new Date(selectedInterview.date).toLocaleString(undefined, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>Duration: {selectedInterview.duration} minutes</p>
              </div>

              {selectedInterview.type === "video" ? (
                <div className="space-y-2">
                  <h4 className="font-medium">Meeting Link</h4>
                  <p className="text-primary underline">
                    <a href={selectedInterview.link} target="_blank" rel="noopener noreferrer">
                      {selectedInterview.link}
                    </a>
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <h4 className="font-medium">Location</h4>
                  <p>{selectedInterview.location}</p>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Interviewers</h4>
                <ul className="list-disc list-inside">
                  {selectedInterview.interviewers.map((interviewer: string, index: number) => (
                    <li key={index}>{interviewer}</li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
