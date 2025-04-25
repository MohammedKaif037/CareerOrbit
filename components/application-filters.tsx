"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Filter, X } from "lucide-react"

type FilterProps = {
  onFilterChange: (filters: any) => void
}

export function ApplicationFilters({ onFilterChange }: FilterProps) {
  const [open, setOpen] = useState(false)
  const [status, setStatus] = useState<string | undefined>(undefined)
  const [location, setLocation] = useState("")
  const [minPriority, setMinPriority] = useState<string | undefined>(undefined)

  const handleReset = () => {
    setStatus(undefined)
    setLocation("")
    setMinPriority(undefined)
    onFilterChange({})
  }

  const handleApplyFilters = () => {
    onFilterChange({
      status,
      location: location || undefined,
      minPriority: minPriority ? Number.parseInt(minPriority) : undefined,
    })
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="shrink-0">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 glass-card border-white/10">
        <div className="space-y-4">
          <h4 className="font-medium">Filter Applications</h4>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Any status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Applied">Applied</SelectItem>
                <SelectItem value="Interviewing">Interviewing</SelectItem>
                <SelectItem value="Offer">Offer</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="Filter by location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">Minimum Priority</Label>
            <Select value={minPriority} onValueChange={setMinPriority}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Any priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">★ (1)</SelectItem>
                <SelectItem value="2">★★ (2)</SelectItem>
                <SelectItem value="3">★★★ (3)</SelectItem>
                <SelectItem value="4">★★★★ (4)</SelectItem>
                <SelectItem value="5">★★★★★ (5)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-between pt-2">
            <Button variant="outline" size="sm" onClick={handleReset}>
              <X className="mr-2 h-4 w-4" />
              Reset
            </Button>
            <Button size="sm" onClick={handleApplyFilters}>
              Apply Filters
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
