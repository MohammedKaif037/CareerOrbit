'use client';

export const dynamic = "force-dynamic";

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Rocket, ArrowLeft, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "@/lib/auth-context"
import { createApplication } from "@/lib/supabase-client"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NewApplication() {
  const { user } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const [formStep, setFormStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    application_method: 'Company Website',
    contact_name: '',
    contact_email: '',
    follow_up_date: '',
    priority: '3', // Set a default value for priority
  });

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading user...</p>
      </div>
    );
  }

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear previous errors when form is modified
    if (error) setError(null);
  };

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }));
    // Clear previous errors when form is modified
    if (error) setError(null);
  };

  const handleCheckboxChange = (id, checked) => {
    setFormData(prev => ({ ...prev, [id]: checked }));
    // Clear previous errors when form is modified
    if (error) setError(null);
  };

  const nextStep = () => {
    // Basic validation for first step
    if (formStep === 0) {
      if (!formData.company_name.trim()) {
        setError('Company name is required');
        return;
      }
      if (!formData.job_title.trim()) {
        setError('Job title is required');
        return;
      }
      if (!formData.location.trim()) {
        setError('Location is required');
        return;
      }
    }
    
    setError(null);
    setFormStep(prev => prev + 1);
  };
  
  const prevStep = () => {
    setError(null);
    setFormStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create an application');
      return;
    }

    setIsSubmitting(true);
    setError(null);

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
        priority: parseInt(formData.priority, 10) // Ensure priority is a number
      };

      const { data, error: apiError } = await createApplication(applicationData);

      if (apiError) {
        setError(apiError);
        return;
      }

      if (data) {
        router.push('/applications');
      } else {
        setError('Failed to create application. Please try again.');
      }
    } catch (err) {
      console.error('Error creating application:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          {error && (
            <Alert variant="destructive" className="m-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

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
                  <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Applied">Applied</SelectItem>
                      <SelectItem value="Interviewing">Interview</SelectItem>
                      <SelectItem value="Offer">Offer</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="application_method">Application Method</Label>
                  <Select
                    value={formData.application_method}
                    onValueChange={(value) => handleSelectChange("application_method", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company Website">Company Website</SelectItem>
                      <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                      <SelectItem value="Indeed">Indeed</SelectItem>
                      <SelectItem value="Referral">Referral</SelectItem>
                      <SelectItem value="Recruiter">Recruiter</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority (1-5)</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleSelectChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">★ (Low)</SelectItem>
                      <SelectItem value="2">★★</SelectItem>
                      <SelectItem value="3">★★★ (Medium)</SelectItem>
                      <SelectItem value="4">★★★★</SelectItem>
                      <SelectItem value="5">★★★★★ (High)</SelectItem>
                    </SelectContent>
                  </Select>
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
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={prevStep}>
                  Back
                </Button>
                <Button type="submit" disabled={isSubmitting} className="gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
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
