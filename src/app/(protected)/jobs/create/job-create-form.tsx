"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { createJob } from "@/actions/jobs";
import { toast } from "sonner";

const industries = [
  "Technology", "Healthcare", "Finance", "Education", "Marketing",
  "Sales", "Engineering", "Design", "Operations", "Human Resources",
  "Legal", "Consulting", "Manufacturing", "Retail", "Real Estate"
];

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (2-5 years)" },
  { value: "senior", label: "Senior Level (5+ years)" },
  { value: "executive", label: "Executive Level" }
];

const educationLevels = [
  { value: "high-school", label: "High School" },
  { value: "associate", label: "Associate Degree" },
  { value: "bachelor", label: "Bachelor's Degree" },
  { value: "master", label: "Master's Degree" },
  { value: "phd", label: "PhD" },
  { value: "certification", label: "Professional Certification" }
];

const currencies = [
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
  { value: "ZAR", label: "ZAR (R)" },
  { value: "CAD", label: "CAD (C$)" },
  { value: "AUD", label: "AUD (A$)" }
];

export default function JobCreateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const handleSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    
    formData.set("skills", skills.join(","));
    
    try {
      await createJob(formData);
      toast.success("Job posted successfully!");
    } catch (error) {
      toast.error("Failed to post job. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form action={handleSubmit} className="space-y-8">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Job Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Senior Software Engineer"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="company">Company Name *</Label>
              <Input
                id="company"
                name="company"
                placeholder="Your company name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Select name="industry">
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="location">Job Location *</Label>
              <Input
                id="location"
                name="location"
                placeholder="e.g. New York, NY or Remote"
                required
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Job Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="jobType">Job Type *</Label>
              <Select name="jobType" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select job type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="experienceLevel">Experience Level</Label>
              <Select name="experienceLevel">
                <SelectTrigger>
                  <SelectValue placeholder="Select experience level" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="educationLevel">Education Level</Label>
              <Select name="educationLevel">
                <SelectTrigger>
                  <SelectValue placeholder="Select education level" />
                </SelectTrigger>
                <SelectContent>
                  {educationLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select name="currency" defaultValue="USD">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency.value} value={currency.value}>
                      {currency.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Salary Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salaryMin">Minimum Salary</Label>
              <Input
                id="salaryMin"
                name="salaryMin"
                type="number"
                placeholder="50000"
                min="0"
              />
            </div>
            
            <div>
              <Label htmlFor="salaryMax">Maximum Salary</Label>
              <Input
                id="salaryMax"
                name="salaryMax"
                type="number"
                placeholder="80000"
                min="0"
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Required Skills</h3>
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g. JavaScript, Project Management)"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
              />
              <Button type="button" onClick={addSkill} variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Important Dates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="openingDate">Opening Date *</Label>
              <Input
                id="openingDate"
                name="openingDate"
                type="date"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="closingDate">Closing Date *</Label>
              <Input
                id="closingDate"
                name="closingDate"
                type="date"
                required
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Job Description</h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Job Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the role, responsibilities, and what you're looking for in a candidate..."
                rows={6}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="requirements">Requirements</Label>
              <Textarea
                id="requirements"
                name="requirements"
                placeholder="List the specific requirements, qualifications, and skills needed..."
                rows={4}
              />
            </div>
            
            <div>
              <Label htmlFor="benefits">Benefits & Perks</Label>
              <Textarea
                id="benefits"
                name="benefits"
                placeholder="Describe the benefits, perks, and what makes your company great..."
                rows={4}
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Your first name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Your last name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="posterPosition">Your Position *</Label>
              <Input
                id="posterPosition"
                name="posterPosition"
                placeholder="e.g. HR Manager, CEO"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="companyEmail">Company Email *</Label>
              <Input
                id="companyEmail"
                name="companyEmail"
                type="email"
                placeholder="contact@company.com"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="companyPhone">Company Phone *</Label>
              <Input
                id="companyPhone"
                name="companyPhone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="businessLocation">Business Location *</Label>
              <Input
                id="businessLocation"
                name="businessLocation"
                placeholder="Company headquarters location"
                required
              />
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-semibold mb-4">Application Method</h3>
          <div>
            <Label htmlFor="applicationUrl">External Application URL (Optional)</Label>
            <Input
              id="applicationUrl"
              name="applicationUrl"
              type="url"
              placeholder="https://company.com/careers/apply"
            />
            <p className="text-sm text-muted-foreground mt-1">
              If provided, candidates will be redirected to this URL to apply. Otherwise, they can apply directly through our platform.
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button type="submit" disabled={isSubmitting} className="flex-1 sm:flex-none">
          {isSubmitting ? "Posting Job..." : "Post Job"}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}