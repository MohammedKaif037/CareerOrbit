"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ExternalLink, Edit, Trash2, CheckCircle, Clock, XCircle, CalendarClock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { motion } from "framer-motion"

// Mock data for applications
const applications = [
  {
    id: 1,
    company: "SpaceX",
    position: "Frontend Developer",
    location: "Remote",
    appliedDate: "2023-04-15",
    status: "applied",
    link: "#",
  },
  {
    id: 2,
    company: "NASA",
    position: "UI Designer",
    location: "Houston, TX",
    appliedDate: "2023-04-10",
    status: "interview",
    link: "#",
  },
  {
    id: 3,
    company: "Blue Origin",
    position: "Full Stack Developer",
    location: "Seattle, WA",
    appliedDate: "2023-04-05",
    status: "rejected",
    link: "#",
  },
  {
    id: 4,
    company: "Google",
    position: "Software Engineer",
    location: "Mountain View, CA",
    appliedDate: "2023-04-01",
    status: "offer",
    link: "#",
  },
  {
    id: 5,
    company: "Microsoft",
    position: "Product Manager",
    location: "Redmond, WA",
    appliedDate: "2023-03-28",
    status: "applied",
    link: "#",
  },
  {
    id: 6,
    company: "Apple",
    position: "UX Researcher",
    location: "Cupertino, CA",
    appliedDate: "2023-03-25",
    status: "interview",
    link: "#",
  },
  {
    id: 7,
    company: "Meta",
    position: "React Developer",
    location: "Menlo Park, CA",
    appliedDate: "2023-03-20",
    status: "applied",
    link: "#",
  },
  {
    id: 8,
    company: "Amazon",
    position: "Cloud Engineer",
    location: "Seattle, WA",
    appliedDate: "2023-03-15",
    status: "offer",
    link: "#",
  },
]

const getStatusBadge = (status: string) => {
  switch (status) {
    case "applied":
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
          <Clock className="mr-1 h-3 w-3" />
          Applied
        </Badge>
      )
    case "interview":
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
          <CalendarClock className="mr-1 h-3 w-3" />
          Interview
        </Badge>
      )
    case "offer":
      return (
        <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
          <CheckCircle className="mr-1 h-3 w-3" />
          Offer
        </Badge>
      )
    case "rejected":
      return (
        <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function ApplicationList() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="rounded-md border border-white/10 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-white/5 hover:bg-white/10">
            <TableHead>Company</TableHead>
            <TableHead>Position</TableHead>
            <TableHead className="hidden md:table-cell">Location</TableHead>
            <TableHead className="hidden md:table-cell">Applied Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applications.map((application) => (
            <motion.tr
              key={application.id}
              className="border-t border-white/10 hover:bg-white/5 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: application.id * 0.05 }}
              onMouseEnter={() => setHoveredRow(application.id)}
              onMouseLeave={() => setHoveredRow(null)}
            >
              <TableCell className="font-medium">{application.company}</TableCell>
              <TableCell>{application.position}</TableCell>
              <TableCell className="hidden md:table-cell">{application.location}</TableCell>
              <TableCell className="hidden md:table-cell">{formatDate(application.appliedDate)}</TableCell>
              <TableCell>{getStatusBadge(application.status)}</TableCell>
              <TableCell className="text-right">
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
                    <DropdownMenuItem className="cursor-pointer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Job
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
