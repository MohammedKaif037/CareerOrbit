"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, ExternalLink, Edit, Trash2, Copy, Star, Download, ArrowUpDown } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"

// Define the application type based on the schema
type Application = {
  id: string
  company_name: string
  job_title: string
  application_date: string
  application_method: string
  resume_sent: boolean
  cover_letter_sent: boolean
  interview_scheduled: boolean
  interview_type: string | null
  interviewers: string | null
  follow_up_required: boolean
  follow_up_date: string | null
  notes: string | null
  status: "Applied" | "Interviewing" | "Offer" | "Rejected"
  job_url: string | null
  salary_range: string | null
  location: string | null
  priority: number | null
}

// Static fallback data
const fallbackData: Application[] = [
  {
    id: "1",
    company_name: "SpaceX",
    job_title: "Frontend Developer",
    application_date: "2023-04-15",
    application_method: "Company Website",
    resume_sent: true,
    cover_letter_sent: true,
    interview_scheduled: true,
    interview_type: "Technical",
    interviewers: "John Doe, Jane Smith",
    follow_up_required: false,
    follow_up_date: null,
    notes: "Great conversation about React and Next.js",
    status: "Interviewing",
    job_url: "https://spacex.com/careers",
    salary_range: "$120K - $150K",
    location: "Remote",
    priority: 5,
  },
  {
    id: "2",
    company_name: "NASA",
    job_title: "UI Designer",
    application_date: "2023-04-10",
    application_method: "LinkedIn",
    resume_sent: true,
    cover_letter_sent: false,
    interview_scheduled: true,
    interview_type: "Portfolio Review",
    interviewers: "Michael Johnson",
    follow_up_required: true,
    follow_up_date: "2023-04-25",
    notes: "Need to prepare portfolio presentation",
    status: "Interviewing",
    job_url: "https://nasa.gov/careers",
    salary_range: "$100K - $130K",
    location: "Houston, TX",
    priority: 4,
  },
  {
    id: "3",
    company_name: "Blue Origin",
    job_title: "Full Stack Developer",
    application_date: "2023-04-05",
    application_method: "Referral",
    resume_sent: true,
    cover_letter_sent: true,
    interview_scheduled: false,
    interview_type: null,
    interviewers: null,
    follow_up_required: true,
    follow_up_date: "2023-04-20",
    notes: "Referred by Alex from engineering team",
    status: "Applied",
    job_url: "https://blueorigin.com/careers",
    salary_range: "$130K - $160K",
    location: "Seattle, WA",
    priority: 3,
  },
  {
    id: "4",
    company_name: "Google",
    job_title: "Software Engineer",
    application_date: "2023-04-01",
    application_method: "Company Website",
    resume_sent: true,
    cover_letter_sent: false,
    interview_scheduled: true,
    interview_type: "Technical + Behavioral",
    interviewers: "Sarah Williams, Robert Brown",
    follow_up_required: false,
    follow_up_date: null,
    notes: "Final round scheduled for next week",
    status: "Interviewing",
    job_url: "https://careers.google.com",
    salary_range: "$150K - $180K",
    location: "Mountain View, CA",
    priority: 5,
  },
  {
    id: "5",
    company_name: "Microsoft",
    job_title: "Product Manager",
    application_date: "2023-03-28",
    application_method: "Recruiter",
    resume_sent: true,
    cover_letter_sent: true,
    interview_scheduled: false,
    interview_type: null,
    interviewers: null,
    follow_up_required: true,
    follow_up_date: "2023-04-18",
    notes: "Recruiter mentioned timeline of 2-3 weeks",
    status: "Applied",
    job_url: "https://careers.microsoft.com",
    salary_range: "$140K - $170K",
    location: "Redmond, WA",
    priority: 4,
  },
  {
    id: "6",
    company_name: "Apple",
    job_title: "UX Researcher",
    application_date: "2023-03-25",
    application_method: "LinkedIn",
    resume_sent: true,
    cover_letter_sent: true,
    interview_scheduled: true,
    interview_type: "Case Study",
    interviewers: "Emily Davis",
    follow_up_required: false,
    follow_up_date: null,
    notes: "Need to prepare research presentation",
    status: "Interviewing",
    job_url: "https://apple.com/careers",
    salary_range: "$120K - $150K",
    location: "Cupertino, CA",
    priority: 4,
  },
  {
    id: "7",
    company_name: "Meta",
    job_title: "React Developer",
    application_date: "2023-03-20",
    application_method: "Referral",
    resume_sent: true,
    cover_letter_sent: false,
    interview_scheduled: false,
    interview_type: null,
    interviewers: null,
    follow_up_required: true,
    follow_up_date: "2023-04-15",
    notes: "Referred by college friend in React team",
    status: "Applied",
    job_url: "https://metacareers.com",
    salary_range: "$130K - $160K",
    location: "Menlo Park, CA",
    priority: 3,
  },
  {
    id: "8",
    company_name: "Amazon",
    job_title: "Cloud Engineer",
    application_date: "2023-03-15",
    application_method: "Company Website",
    resume_sent: true,
    cover_letter_sent: true,
    interview_scheduled: true,
    interview_type: "Technical",
    interviewers: "James Wilson, Maria Garcia",
    follow_up_required: false,
    follow_up_date: null,
    notes: "Offer received! Need to review compensation package",
    status: "Offer",
    job_url: "https://amazon.jobs",
    salary_range: "$140K - $170K",
    location: "Seattle, WA",
    priority: 5,
  },
]

export function ApplicationsTable() {
  const [applications, setApplications] = useState<Application[]>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usingFallback, setUsingFallback] = useState(true)
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Application | null
    direction: "ascending" | "descending" | null
  }>({
    key: null,
    direction: null,
  })

  useEffect(() => {
    async function fetchApplications() {
      try {
        // Always start with fallback data
        setApplications(fallbackData)

        // Check if Supabase is properly initialized
        if (!supabase) {
          console.log("Supabase not initialized, using fallback data")
          setUsingFallback(true)
          setLoading(false)
          return
        }

        // Attempt to fetch from Supabase
        const { data, error } = await supabase.from("applications").select("*")

        if (error) {
          console.error("Error fetching from Supabase:", error)
          setUsingFallback(true)
        } else if (data && data.length > 0) {
          setApplications(data as Application[])
          setUsingFallback(false)
        } else {
          // No data in Supabase, use fallback
          console.log("No data in Supabase, using fallback data")
          setUsingFallback(true)
        }
      } catch (err) {
        console.error("Failed to fetch applications:", err)
        setError("Failed to load applications. Using fallback data.")
        setUsingFallback(true)
      } finally {
        setLoading(false)
      }
    }

    fetchApplications()
  }, [])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Applied":
        return <Badge className="bg-blue-500 hover:bg-blue-600">{status}</Badge>
      case "Interviewing":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">{status}</Badge>
      case "Offer":
        return <Badge className="bg-green-500 hover:bg-green-600">{status}</Badge>
      case "Rejected":
        return <Badge className="bg-red-500 hover:bg-red-600">{status}</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityStars = (priority: number | null) => {
    if (!priority) return "-"
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < priority ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`} />
        ))}
      </div>
    )
  }

  const requestSort = (key: keyof Application) => {
    let direction: "ascending" | "descending" | null = "ascending"

    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    } else if (sortConfig.key === key && sortConfig.direction === "descending") {
      direction = null
    }

    setSortConfig({ key, direction })
  }

  const getSortedApplications = () => {
    if (!sortConfig.key || !sortConfig.direction) {
      return applications
    }

    return [...applications].sort((a, b) => {
      const aValue = a[sortConfig.key as keyof Application]
      const bValue = b[sortConfig.key as keyof Application]

      if (aValue === null) return sortConfig.direction === "ascending" ? 1 : -1
      if (bValue === null) return sortConfig.direction === "ascending" ? -1 : 1

      if (aValue < bValue) {
        return sortConfig.direction === "ascending" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "ascending" ? 1 : -1
      }
      return 0
    })
  }

  const sortedApplications = getSortedApplications()

  const exportToCSV = () => {
    // Create CSV content
    const headers = [
      "ID",
      "Company",
      "Job Title",
      "Applied Date",
      "Method",
      "Resume Sent",
      "Cover Letter",
      "Interview Scheduled",
      "Status",
      "Location",
      "Priority",
      "Notes",
    ]

    const rows = applications.map((app) => [
      app.id,
      app.company_name,
      app.job_title,
      app.application_date,
      app.application_method,
      app.resume_sent ? "Yes" : "No",
      app.cover_letter_sent ? "Yes" : "No",
      app.interview_scheduled ? "Yes" : "No",
      app.status,
      app.location || "",
      app.priority || "",
      app.notes || "",
    ])

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "job_applications.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse text-primary">Loading applications...</div>
      </div>
    )
  }

  if (error && applications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {usingFallback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-md p-3 text-yellow-500 mb-4"
        >
          <p>
            <strong>Note:</strong> Using static fallback data. Connect Supabase to use real-time data storage.
          </p>
        </motion.div>
      )}

      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" className="flex items-center gap-2 cosmic-glow" onClick={exportToCSV}>
          <Download className="h-4 w-4" />
          Export to CSV
        </Button>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full align-middle">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="overflow-hidden border border-green-300/30 rounded-lg shadow-lg cosmic-glow-green"
          >
            <table className="min-w-full divide-y divide-green-300/30">
              <thead className="bg-green-900/30">
                <tr>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("id")}>
                      ID
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("company_name")}>
                      Company
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("job_title")}>
                      Job Title
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("application_date")}>
                      Applied Date
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("application_method")}>
                      Method
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Resume
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Cover Letter
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Interview
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("status")}>
                      Status
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("location")}>
                      Location
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    <div className="flex items-center cursor-pointer" onClick={() => requestSort("priority")}>
                      Priority
                      <ArrowUpDown className="ml-1 h-4 w-4" />
                    </div>
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-green-300/30 bg-green-900/10">
                {sortedApplications.map((app, index) => (
                  <motion.tr
                    key={app.id}
                    className={index % 2 === 0 ? "bg-green-900/20" : "bg-green-900/10"}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    whileHover={{ backgroundColor: "rgba(74, 222, 128, 0.1)" }}
                  >
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 px-2 text-xs font-mono"
                              onClick={() => {
                                navigator.clipboard.writeText(app.id)
                                // You could add a toast notification here
                              }}
                            >
                              #{app.id.substring(0, 5)}...
                              <Copy className="ml-1 h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Copy ID to clipboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium">{app.company_name}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">{app.job_title}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">{formatDate(app.application_date)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">{app.application_method}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <Checkbox
                        checked={app.resume_sent}
                        disabled
                        className={app.resume_sent ? "bg-green-500 border-green-500" : ""}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <Checkbox
                        checked={app.cover_letter_sent}
                        disabled
                        className={app.cover_letter_sent ? "bg-green-500 border-green-500" : ""}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <Checkbox
                        checked={app.interview_scheduled}
                        disabled
                        className={app.interview_scheduled ? "bg-green-500 border-green-500" : ""}
                      />
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">{getStatusBadge(app.status)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">{app.location || "-"}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">{getPriorityStars(app.priority)}</td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-card border-white/10">
                          <DropdownMenuItem className="cursor-pointer">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {app.job_url && (
                            <DropdownMenuItem className="cursor-pointer">
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View Job
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
