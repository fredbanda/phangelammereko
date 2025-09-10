"use client"

import { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Minus, Briefcase, GraduationCap, Award } from "lucide-react"
import { LinkedinProfileInputSchema } from "../../lib/validations"
import { toast } from "sonner"
import * as z from "zod"

// Define the form type directly from the schema
type FormData = z.infer<typeof LinkedinProfileInputSchema>

export function LinkedinManualInput() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newSkill, setNewSkill] = useState("")

  const form = useForm<FormData>({
    resolver: zodResolver(LinkedinProfileInputSchema),
    defaultValues: {
      headline: "",
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
    } satisfies FormData, // Use satisfies to ensure type safety
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

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      form.setValue("skills", [...skills, newSkill.trim()])
      setNewSkill("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    form.setValue(
      "skills",
      skills.filter((skill) => skill !== skillToRemove),
    )
  }

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)

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

      // Redirect to analysis page
      setTimeout(() => {
        window.location.href = `/linkedin-optimizer/analysis/${result.profileId}`
      }, 1500)
    } catch (error) {
      console.error(error)
      toast.error("Something went wrong please try again")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="headline">Professional Headline *</Label>
              <Input
                id="headline"
                placeholder="e.g., Senior Software Engineer at Tech Company"
                {...form.register("headline")}
              />
              {form.formState.errors.headline && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.headline.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g., Cape Town, South Africa" {...form.register("location")} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input id="industry" placeholder="e.g., Information Technology" {...form.register("industry")} />
            </div>
            <div>
              <Label htmlFor="profileUrl">LinkedIn Profile URL</Label>
              <Input id="profileUrl" placeholder="https://linkedin.com/in/yourname" {...form.register("profileUrl")} />
            </div>
          </div>

          <div>
            <Label htmlFor="summary">About / Summary</Label>
            <Textarea
              id="summary"
              placeholder="Write a compelling summary of your professional background..."
              rows={4}
              {...form.register("summary")}
            />
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
        </CardHeader>
        <CardContent className="space-y-6">
          {experienceFields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Experience {index + 1}</h4>
                {experienceFields.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeExperience(index)}>
                    <Minus className="w-4 h-4" />
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

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input placeholder="e.g., Cape Town, SA" {...form.register(`experiences.${index}.location`)} />
                </div>
                <div>
                  <Label>Start Date</Label>
                  <Input placeholder="e.g., Jan 2020" {...form.register(`experiences.${index}.startDate`)} />
                </div>
                <div>
                  <Label>End Date</Label>
                  <Input placeholder="e.g., Present" {...form.register(`experiences.${index}.endDate`)} />
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe your key responsibilities and achievements..."
                  rows={3}
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
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
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
        </CardHeader>
        <CardContent className="space-y-6">
          {educationFields.map((field, index) => (
            <div key={field.id} className="space-y-4 p-4 border rounded-lg">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Education {index + 1}</h4>
                {educationFields.length > 1 && (
                  <Button type="button" variant="outline" size="sm" onClick={() => removeEducation(index)}>
                    <Minus className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label>School/University</Label>
                  <Input placeholder="e.g., University of Cape Town" {...form.register(`education.${index}.school`)} />
                </div>
                <div>
                  <Label>Degree</Label>
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
                  <Input placeholder="e.g., 2016" {...form.register(`education.${index}.startYear`)} />
                </div>
                <div>
                  <Label>End Year</Label>
                  <Input placeholder="e.g., 2020" {...form.register(`education.${index}.endYear`)} />
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
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </CardContent>
      </Card>

      {/* Skills Section */}
      <Card>
        <CardHeader>
          <CardTitle>Skills</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add a skill..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill} variant="outline">
              Add
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="cursor-pointer">
                {skill}
                <button type="button" onClick={() => removeSkill(skill)} className="ml-2 hover:text-destructive">
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-center">
        <Button type="submit" disabled={isSubmitting} size="lg" className="w-full md:w-auto px-8">
          {isSubmitting ? "Analyzing Profile..." : "Analyze My LinkedIn Profile"}
        </Button>
      </div>
    </form>
  )
}