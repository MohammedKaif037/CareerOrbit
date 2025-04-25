"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rocket, ArrowLeft, Paperclip, FileText } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { createApplication } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Checkbox } from "@/components/ui/checkbox"

export default function NewApplication() {
  const [formStep, setFormStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { user } = useAuth()
  const router = useRouter()

  // Form state
  const [formData, setFormData] = useState({
    company_name: '',
    job_title: '',
    location: '',
    job_url: '',
    application_date: new Date().toISOString().split('T')[0],
    status: 'Applied',
    notes: '',
    salary_range: '',
    resume_sent: false,
    cover_letter_sent: false,
    application_method: 'Website',
    contact_name: '',
    contact_email: '',
    follow_up_date: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleCheckboxChange = (id: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [id]: checked }))
  }

  const nextStep = () => setFormStep((prev) => prev + 1)
  const prevStep = () => setFormStep((prev) => prev - 1)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      alert('You must be logged in to create an application')
      return
    }

    setIsSubmitting(true)

    try {
      const applicationData = {
        ...formData,
        user_id: user.id,
        application_date: new Date(formData.application_date).toISOString(),
        follow_up_date: formData.follow_up_date 
          ? new Date(formData.follow_up_date).toISOString() 
          : null,
        follow_up_required: false,
        interview_scheduled: false,
      }

      const result = await createApplication(applicationData)
      
      if (result) {
        router.push('/applications')
      } else {
        throw new Error('Failed to create application')
      }
    } catch (error) {
      console.error('Error creating application:', error)
      alert('Failed to create application. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container max-w-3xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/applications">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Launch New Application</h1>
      </div>

      <Card className="glass-card overflow-hidden">
        <form onSubmit={handleSubmit}>
          {formStep === 0 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>Enter details about the company and position</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input 
                    id="company_name" 
                    placeholder="e.g. SpaceX" 
                    required 
                    value={formData.company_name}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_title">Position</Label>
                  <Input 
                    id="job_title" 
                    placeholder="e.g. Frontend Developer" 
                    required 
                    value={formData.job_title}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input 
                    id="location" 
                    placeholder="e.g. Remote, New York, NY" 
                    required 
                    value={formData.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="job_url">Job Posting URL</Label>
                  <Input 
                    id="job_url" 
                    type="url" 
                    placeholder="https://..." 
                    value={formData.job_url}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="salary_range">Salary Range (Optional)</Label>
                  <Input 
                    id="salary_range" 
                    placeholder="e.g. $80,000 - $100,000" 
                    value={formData.salary_range}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button type="button" onClick={nextStep}>
                  Continue
                </Button>
              </CardFooter>
            </motion.div>
          )}

          {formStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <CardHeader>
                <CardTitle>Application Details</CardTitle>
                <CardDescription>Enter information about your application</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="application_date">Date Applied</Label>
                  <Input 
                    id="application_date" 
                    type="date" 
                    required 
                    value={formData.application_date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    defaultValue={formData.status}
                    onValueChange={(value) => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interviewing">Interviewing</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                      <SelectItem value="Archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="application_method">Application Method</Label>
                  <Select 
                    defaultValue={formData.application_method}
                    onValueChange={(value) => handleSelectChange('application_method', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Website">Company Website</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Indeed">Indeed</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Email">Direct Email</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="resume_checkbox" 
                      checked={formData.resume_sent}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('resume_sent', checked as boolean)
                      }
                    />
                    <Label htmlFor="resume_checkbox" className="flex items-center gap-1">
                      <Paperclip className="h-4 w-4" />
                      Resume Sent
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="cover_letter_checkbox" 
                      checked={formData.cover_letter_sent}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('cover_letter_sent', checked as boolean)
                      }
                    />
                    <Label htmlFor="cover_letter_checkbox" className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      Cover Letter
                    </Label>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea 
                    id="notes" 
                    placeholder="Any additional notes about this application..." 
                    rows={4} 
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </div>
                <div className="pt-4 space-y-2">
                  <Label className="font-medium">Contact Information (Optional)</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_name">Contact Name</Label>
                      <Input 
                        id="contact_name" 
                        placeholder="e.g. John Smith" 
                        value={formData.contact_name}
                        onChange={handleChange}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Contact Email</Label>
                      <Input 
                        id="contact_email" 
                        type="email" 
                        placeholder="e.g. john@company.com" 
                        value={formData.contact_email}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="follow_up_date">Follow Up Date (Optional)</Label>
                  <Input 
                    id="follow_up_date" 
                    type="date" 
                    value={formData.follow_up_date}
                    onChange={handleChange}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <Rocket className="h-4 w-4" />
                      Launch Application
                    </>
                  )}
                </Button>
              </CardFooter>
            </motion.div>
          )}
        </form>
      </Card>
    </div>
  )
}
