/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Plus, 
  Minus, 
  Briefcase, 
  GraduationCap, 
  Award, 
  Sparkles,
  Calendar,
  MapPin,
  Building,
  Link as LinkIcon,
  Lightbulb,
  CheckCircle2
} from "lucide-react"
import { LinkedinProfileInputSchema } from "../../lib/validations"
import { toast } from "sonner"
import * as z from "zod"

type FormData = z.infer<typeof LinkedinProfileInputSchema>

interface LinkedinManualInputProps {
  onProfileSubmit?: (data: any) => void
}

export function LinkedinManualInput({ onProfileSubmit }: LinkedinManualInputProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSkill, setNewSkill] = useState("")
  const [showTips, setShowTips] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(LinkedinProfileInputSchema),
    defaultValues: {
      name: "",
      headline: "",
      email: "",
      summary: "",
      location: "",
      industry: "",
      experiences: [
        {
          title: "",
          company: "",
          location: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        },
      ],
      education: [
        {
          school: "",
          degree: "",
          field: "",
          startYear: "",
          endYear: "",
        },
      ],
      skills: [],
      profileUrl: "",
      
    } satisfies FormData,
  })

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control: form.control,
    name: "experiences",
  })

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control: form.control,
    name: "education",
  })

  const skills = form.watch("skills")
  const watchedFields = form.watch()

  // Calculate completion percentage
  const calculateCompletion = () => {
    let completed = 0
    const total = 10 // Base fields

    if (watchedFields.name) completed++
    if (watchedFields.email) completed++
    if (watchedFields.headline) completed++
    if (watchedFields.summary) completed++
    if (watchedFields.location) completed++
    if (watchedFields.industry) completed++
    if (watchedFields.profileUrl) completed++
    if (watchedFields.experiences?.some(exp => exp.title && exp.company)) completed++
    if (watchedFields.education?.some(edu => edu.school && edu.degree)) completed++
    if (skills.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  const completionPercentage = calculateCompletion()

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      form.setValue("skills", [...skills, newSkill.trim()])
      setNewSkill("")
      toast.success(`Added "${newSkill.trim()}" to skills`)
    } else if (skills.includes(newSkill.trim())) {
      toast.error("This skill is already added")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    form.setValue(
      "skills",
      skills.filter((skill) => skill !== skillToRemove),
    )
    toast.success("Skill removed")
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    
    if (onProfileSubmit) {
      // Use the parent component's submit handler
      onProfileSubmit(data)
      setIsSubmitting(false)
      return
    }

    // Fallback to original behavior
    toast.loading("Analyzing your LinkedIn profile...")

    try {
      const response = await fetch("/api/linkedin/manual-input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to submit profile")
      }

      const result = await response.json()
      toast.success("Profile analyzed successfully!")

      setTimeout(() => {
        window.location.href = `/linkedin-optimizer/analysis/${result.profileId}`
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h3 className="font-semibold text-lg">Profile Completion</h3>
            </div>
            <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          <p className="text-sm text-muted-foreground mt-2">
            {completionPercentage < 100 
              ? "Complete all sections for the best analysis results"
              : "Great! Your profile is ready for analysis"}
          </p>
        </CardContent>
      </Card>

      {/* Tips Toggle */}
      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-5 h-5 text-yellow-500" />
          <span className="font-medium">Show optimization tips</span>
        </div>
        <Switch checked={showTips} onCheckedChange={setShowTips} />
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Basic Information
            </CardTitle>
            <CardDescription>
              Your professional identity and contact details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showTips && (
              <Alert className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                <Lightbulb className="w-4 h-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Your headline should be compelling and keyword-rich. Include your role, key skills, and value proposition.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1">
                  Full Name <span className="text-destructive">*</span>
                  {watchedFields.name && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
                </Label>
                <Input
                  id="name"
                  placeholder="Your full name"
                  {...form.register("name")}
                  className={form.formState.errors.name ? "border-destructive" : ""}
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center gap-1">
                  Email Address <span className="text-destructive">*</span>
                  {watchedFields.email && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  {...form.register("email")}
                  className={form.formState.errors.email ? "border-destructive" : ""}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="headline" className="flex items-center gap-1">
                Professional Headline <span className="text-destructive">*</span>
                {watchedFields.headline && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
              </Label>
              <Input
                id="headline"
                placeholder="e.g., Senior Software Engineer | Full-Stack Developer | Tech Innovator"
                {...form.register("headline")}
                className={form.formState.errors.headline ? "border-destructive" : ""}
              />
              {form.formState.errors.headline && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.headline.message}</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="location" className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Location
                  {watchedFields.location && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
                </Label>
                <Input id="location" placeholder="e.g., Cape Town, South Africa" {...form.register("location")} />
              </div>
              <div>
                <Label htmlFor="industry" className="flex items-center gap-1">
                  <Building className="w-4 h-4" />
                  Industry
                  {watchedFields.industry && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
                </Label>
                <Input id="industry" placeholder="e.g., Information Technology & Services" {...form.register("industry")} />
              </div>
            </div>

            <div>
              <Label htmlFor="profileUrl" className="flex items-center gap-1">
                <LinkIcon className="w-4 h-4" />
                LinkedIn Profile URL
                {watchedFields.profileUrl && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
              </Label>
              <Input id="profileUrl" placeholder="https://linkedin.com/in/yourname" {...form.register("profileUrl")} />
            </div>

            <div>
              <Label htmlFor="summary" className="flex items-center gap-1">
                About / Summary
                {watchedFields.summary && <CheckCircle2 className="w-4 h-4 text-green-500 ml-1" />}
              </Label>
              <Textarea
                id="summary"
                placeholder="Write a compelling summary highlighting your expertise, achievements, and career goals..."
                rows={5}
                {...form.register("summary")}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {watchedFields.summary?.length || 0} characters (recommended: 200-300)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Experience Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-accent" />
              Work Experience
            </CardTitle>
            <CardDescription>
              Showcase your professional journey and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {showTips && (
              <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200">
                <Lightbulb className="w-4 h-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Use bullet points, quantify achievements (e.g., Increased sales by 30% ), and include relevant keywords for your industry.
                </AlertDescription>
              </Alert>
            )}

            {experienceFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-lg">Experience {index + 1}</h4>
                  {experienceFields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeExperience(index)}>
                      <Minus className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>Job Title</Label>
                    <Input
                      placeholder="e.g., Senior Software Engineer"
                      {...form.register(`experiences.${index}.title`)}
                    />
                  </div>
                  <div>
                    <Label>Company</Label>
                    <Input placeholder="e.g., Tech Company Inc." {...form.register(`experiences.${index}.company`)} />
                  </div>
                </div>

                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <Label>Location</Label>
                    <Input placeholder="Cape Town, SA" {...form.register(`experiences.${index}.location`)} />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Start Date
                    </Label>
                    <Input placeholder="Jan 2020" {...form.register(`experiences.${index}.startDate`)} />
                  </div>
                  <div>
                    <Label className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      End Date
                    </Label>
                    <Input placeholder="Present" {...form.register(`experiences.${index}.endDate`)} />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Switch {...form.register(`experiences.${index}.current`)} />
                      <span className="text-sm">Current</span>
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Description & Achievements</Label>
                  <Textarea
                    placeholder="• Led a team of 5 developers&#10;• Increased application performance by 40%&#10;• Implemented CI/CD pipeline reducing deployment time by 60%"
                    rows={4}
                    {...form.register(`experiences.${index}.description`)}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendExperience({
                  title: "",
                  company: "",
                  location: "",
                  startDate: "",
                  endDate: "",
                  current: false,
                  description: "",
                })
              }
              className="w-full border-dashed border-2 hover:border-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Experience
            </Button>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-chart-1" />
              Education
            </CardTitle>
            <CardDescription>
              Your academic background and qualifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {educationFields.map((field, index) => (
              <div key={field.id} className="space-y-4 p-4 border-2 rounded-lg hover:border-primary/50 transition-colors">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-lg">Education {index + 1}</h4>
                  {educationFields.length > 1 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeEducation(index)}>
                      <Minus className="w-4 h-4 mr-1" /> Remove
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label>School/University</Label>
                    <Input placeholder="e.g., University of Cape Town" {...form.register(`education.${index}.school`)} />
                  </div>
                  <div>
                    <Label>Degree / Qualification</Label>
                    <Input placeholder="e.g., Bachelor of Science" {...form.register(`education.${index}.degree`)} />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>Field of Study</Label>
                    <Input placeholder="e.g., Computer Science" {...form.register(`education.${index}.field`)} />
                  </div>
                  <div>
                    <Label>Start Year</Label>
                    <Input placeholder="2016" type="number" {...form.register(`education.${index}.startYear`)} />
                  </div>
                  <div>
                    <Label>End Year</Label>
                    <Input placeholder="2020" type="number" {...form.register(`education.${index}.endYear`)} />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendEducation({
                  school: "",
                  degree: "",
                  field: "",
                  startYear: "",
                  endYear: "",
                })
              }
              className="w-full border-dashed border-2 hover:border-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Another Education
            </Button>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-500" />
              Skills & Expertise
            </CardTitle>
            <CardDescription>
              Add relevant skills (recommended: 10-50 skills)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showTips && (
              <Alert className="bg-purple-50 dark:bg-purple-950 border-purple-200">
                <Lightbulb className="w-4 h-4" />
                <AlertDescription>
                  <strong>Tip:</strong> Include both technical and soft skills. Prioritize in-demand skills for your industry.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Input
                placeholder="Add a skill (press Enter)..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addSkill()
                  }
                }}
              />
              <Button type="button" onClick={addSkill} variant="default">
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>

            {skills.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {skills.length} skill{skills.length !== 1 ? 's' : ''} added
                </p>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-sm py-1 px-3 hover:bg-destructive/10 transition-colors">
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeSkill(skill)} 
                        className="ml-2 hover:text-destructive font-bold"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {skills.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No skills added yet. Start by adding your key competencies.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <div className="text-center">
                <h3 className="font-semibold text-lg mb-2">Ready to Optimize Your Profile?</h3>
                <p className="text-sm text-muted-foreground">
                  Get personalized recommendations to improve your LinkedIn presence
                </p>
              </div>
              <Button 
                type="submit" 
                disabled={isSubmitting || completionPercentage < 50} 
                size="lg" 
                className="w-full md:w-auto px-12"
              >
                {isSubmitting ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    Analyzing Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Analyze My LinkedIn Profile
                  </>
                )}
              </Button>
              {completionPercentage < 50 && (
                <p className="text-xs text-muted-foreground">
                  Complete at least 50% of the form to analyze your profile
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}