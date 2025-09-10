import {z} from "zod";

export const optionalString = z.string().optional().or(z.literal(""))

export const generalInformSchema = z.object({
    title: optionalString,
    description: optionalString,
});

export type GeneralInfoValues = z.infer<typeof generalInformSchema>

export const personalInformSchema = z.object({
  // Updated photo schema to handle File, null, undefined, or string (existing URL)
  photo: z.union([
    z.instanceof(File).refine(
      (file) => file.type.startsWith("image/"),
      {
        message: "Please upload a valid image",
      }
    ).refine(
      (file) => file.size <= 1024 * 1024 * 4,
      {
        message: "Please upload a file smaller than 4MB",
      }
    ),
    z.null(), // For explicit removal
    z.string(), // For existing URL
    z.undefined(), // For no change
  ]).optional(),
  firstName: optionalString,
  lastName: optionalString,
  email: optionalString,
  phone: optionalString,
  address: optionalString,
  location: optionalString,
  city: optionalString,
  country: optionalString,
  linkedin: optionalString,
  github: optionalString,
  twitter: optionalString,
  portfolioUrl: optionalString,
  jobTitle: optionalString,
});

export type PersonalInfoValues = z.infer<typeof personalInformSchema>

export const workExperienceSchema = z.object({
    workExperiences: z.array(z.object({
        position: optionalString,
        company: optionalString,
        description: optionalString,
        startDate: optionalString,
        endDate: optionalString,
    })).optional()
})

export type WorkExperienceValues = z.infer<typeof workExperienceSchema>

export const educationSchema = z.object({
  educations: z.array(z.object({
    institution: optionalString,
    qualification: optionalString,
    city: optionalString,
    country: optionalString,
    startDate: optionalString,
    endDate: optionalString,
  })).optional()
})

export type EducationValues = z.infer<typeof educationSchema>

export const certificationSchema = z.object({
  certifications: z.array(z.object({
    body: optionalString,
    certification: optionalString,
    year: optionalString,
  })).optional()
})

export type CertificationValues = z.infer<typeof certificationSchema>

export const skillSchema = z.object({
  skills: z.array(z.object({
    title: optionalString,
  })).optional()
})

export type SkillValues = z.infer<typeof skillSchema>

export const softSkillSchema = z.object({
  softSkills: z.array(z.object({
    title: optionalString,
  })).optional()
})

export type SoftSkillValues = z.infer<typeof softSkillSchema>

export const awardSchema = z.object({
  awards: z.array(z.object({
    title: optionalString,
    description: optionalString,
    issuer: optionalString,
    date: optionalString,
  })).optional()
})

export type AwardValues = z.infer<typeof awardSchema>

export const projectsPublicationSchema = z.object({
  projectsPublications: z.array(z.object({
    title: optionalString,
    description: optionalString,
    link: optionalString,
    type: optionalString,
    publisher: optionalString,
    publicationDate: optionalString,
  })).optional()
})

export type ProjectsPublicationValues = z.infer<typeof projectsPublicationSchema>

export const summarySchema = z.object({
  summary: optionalString
})

export type SummaryValues = z.infer<typeof summarySchema>

export const resumeSchema = z.object({
    ...generalInformSchema.shape,
    ...personalInformSchema.shape,
    ...workExperienceSchema.shape,
    ...educationSchema.shape,
    ...certificationSchema.shape,
    ...skillSchema.shape,
    ...softSkillSchema.shape,
    ...awardSchema.shape,
    ...summarySchema.shape,
    ...projectsPublicationSchema.shape,
    colorHex: optionalString,
    borderStyle: optionalString,
});

export type ResumeValues = Omit<z.infer<typeof resumeSchema>, "photo"> & {
    id?: string;
    photo?: File | string | null;
}

export const generateSummarySchema = z.object({
  jobTitle: optionalString,
  ...workExperienceSchema.shape,
  ...skillSchema.shape,
  ...softSkillSchema.shape,
  ...summarySchema.shape,
  ...awardSchema.shape,
  ...projectsPublicationSchema.shape,
})

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>

export const LinkedinExperienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: z.string().optional().or(z.literal("")),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().or(z.literal("")),
  current: z.boolean(),
  description: z.string().optional().or(z.literal("")),
})

// ✅ Education Schema
export const LinkedinEducationSchema = z.object({
  school: z.string().min(1, "School/University is required"),
  degree: z.string().optional().or(z.literal("")),
  field: z.string().optional().or(z.literal("")),
  startYear: z.string().optional().or(z.literal("")),
  endYear: z.string().optional().or(z.literal("")),
})

// ✅ Main Profile Input Schema
export const LinkedinProfileInputSchema = z.object({
  headline: z.string().min(1, "Headline is required"),
  summary: z.string().optional().or(z.literal("")),
  location: z.string().optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  experiences: z.array(LinkedinExperienceSchema).min(1, "At least one experience is required"),
  education: z.array(LinkedinEducationSchema),
  skills: z.array(z.string()),
  profileUrl: z.union([
    z.string().url("Please enter a valid URL"),
    z.literal("")
  ]).optional(),
})

// ✅ Type Inference
export type LinkedinProfileInput = z.infer<typeof LinkedinProfileInputSchema>
export type LinkedinExperience = z.infer<typeof LinkedinExperienceSchema>
export type LinkedinEducation = z.infer<typeof LinkedinEducationSchema>

// Analysis Result Types
export interface KeywordAnalysis {
  missingKeywords: string[]
  underusedKeywords: string[]
  industryKeywords: string[]
  suggestions: string[]
}

export interface StructureAnalysis {
  hasHeadline: boolean
  hasSummary: boolean
  hasExperience: boolean
  hasSkills: boolean
  hasEducation: boolean
  completenessScore: number
}

export interface ReadabilityAnalysis {
  sentenceCount: number
  avgSentenceLength: number
  activeVerbCount: number
  metricsCount: number
  jargonScore: number
  readabilityScore: number
}

export interface OptimizationSuggestion {
  type: "headline" | "summary" | "experience" | "skills"
  priority: "high" | "medium" | "low"
  suggestion: string
  example?: string
}