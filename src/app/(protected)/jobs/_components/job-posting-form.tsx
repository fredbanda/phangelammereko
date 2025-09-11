"use client"

import { useEffect, useState } from "react"
import { createJob } from "@/actions/jobs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { PromotionModal } from "@/app/(protected)/jobs/_components/promotion-modal"
import { Crown } from "lucide-react"



export function JobPostingForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastCreatedJobId, setLastCreatedJobId] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    company: "",
    firstName: "",
    lastName: "",
    companyEmail: "",
    companyPhone: "",
    posterPosition: "",
    businessLocation: "",
    openingDate: "",
    closingDate: "",
    location: "",
    jobType: "",
    salaryMin: "",
    salaryMax: "",
    description: "",
    requirements: "",
    benefits: "",
  })
  
  useEffect(() => {
    const savedData = localStorage.getItem("job-posting-form")
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        setFormData(parsed)
      } catch (error) {
        console.error("Error parsing saved form data:", error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("job-posting-form", JSON.stringify(formData))
  }, [formData])

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      const form = event.currentTarget
      const formData = new FormData(form)
      await createJob(formData)
      localStorage.removeItem("job-posting-form")
      setFormData({
        title: "",
        company: "",
        firstName: "",
        lastName: "",
        companyEmail: "",
        companyPhone: "",
        posterPosition: "",
        businessLocation: "",
        openingDate: "",
        closingDate: "",
        location: "",
        jobType: "full-time",
        salaryMin: "",
        salaryMax: "",
        description: "",
        requirements: "",
        benefits: "",
      })
      setLastCreatedJobId(Date.now())
    } catch (error) {
      console.error("Error submitting job:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Senior Frontend Developer"
                
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="company">Company Name *</Label>
                <Input
                  id="company"
                  name="company"
                  placeholder="e.g. Acme Corp"
                  
                  value={formData.company}
                  onChange={(e) => handleInputChange("company", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Company Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email *</Label>
                  <Input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    placeholder="e.g. hr@acmecorp.com"
                    
                    value={formData.companyEmail}
                    onChange={(e) => handleInputChange("companyEmail", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone *</Label>
                  <Input
                    id="companyPhone"
                    name="companyPhone"
                    type="tel"
                    placeholder="e.g. +1 (555) 123-4567"
                    
                    value={formData.companyPhone}
                    onChange={(e) => handleInputChange("companyPhone", e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="posterPosition">Your Position in Company *</Label>
                  <Input
                    id="posterPosition"
                    name="posterPosition"
                    placeholder="e.g. HR Manager, CEO, Recruiter"
                    
                    value={formData.posterPosition}
                    onChange={(e) => handleInputChange("posterPosition", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="businessLocation">Business Location *</Label>
                  <Input
                    id="businessLocation"
                    name="businessLocation"
                    placeholder="e.g. 123 Main St, New York, NY"
                    
                    value={formData.businessLocation}
                    onChange={(e) => handleInputChange("businessLocation", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="e.g. HR Manager, CEO, Recruiter"
                    
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="e.g. 123 Main St, New York, NY"
                    
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Job Posting Period</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openingDate">Opening Date *</Label>
                  <Input
                    id="openingDate"
                    name="openingDate"
                    type="date"
                    
                    value={formData.openingDate}
                    onChange={(e) => handleInputChange("openingDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="closingDate">Closing Date *</Label>
                  <Input
                    id="closingDate"
                    name="closingDate"
                    type="date"
                    
                    value={formData.closingDate}
                    onChange={(e) => handleInputChange("closingDate", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Job Location *</Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="e.g. San Francisco, CA or Remote"
                  
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobType">Job Type</Label>
                <Select
                  name="jobType"
                  value={formData.jobType}
                  onValueChange={(value) => handleInputChange("jobType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-time</SelectItem>
                    <SelectItem value="part-time">Part-time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salaryMin">Minimum Salary (ZAR)</Label>
                <Input
                  id="salaryMin"
                  name="salaryMin"
                  type="number"
                  placeholder="e.g. 80000"
                  value={formData.salaryMin}
                  onChange={(e) => handleInputChange("salaryMin", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salaryMax">Maximum Salary (USD)</Label>
                <Input
                  id="salaryMax"
                  name="salaryMax"
                  type="number"
                  placeholder="e.g. 120000"
                  value={formData.salaryMax}
                  onChange={(e) => handleInputChange("salaryMax", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="min-h-32"
                
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="List the  skills, experience, and qualifications..."
                className="min-h-24"
                value={formData.requirements}
                onChange={(e) => handleInputChange("requirements", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="benefits">Benefits & Perks</Label>
              <Textarea
                id="benefits"
                name="benefits"
                placeholder="Health insurance, flexible hours, remote work, etc..."
                className="min-h-24"
                value={formData.benefits}
                onChange={(e) => handleInputChange("benefits", e.target.value)}
              />
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Posting Job..." : "Post Job"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            Premium Promotion
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Want your job to stand out? Promote it to appear at the top of search results and get more qualified
            applicants.
          </p>

          <div className="flex items-center justify-between">
            <div>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Premium Feature
              </Badge>
              <p className="text-sm font-medium mt-1">Starting from $49</p>
            </div>

            <PromotionModal jobId={String(lastCreatedJobId || 0)} jobTitle="Your New Job">
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent">
                Learn More
              </Button>
            </PromotionModal>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            <p>✓ Appears at the top of job listings</p>
            <p>✓ Highlighted with premium badge</p>
            <p>✓ 3-5x more visibility than regular posts</p>
            <p>✓ Featured in our newsletter (premium plan)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

