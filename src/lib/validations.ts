import { email } from "node_modules/zod/v4/core/regexes.cjs";
import { z } from "zod";

/* ------------------------------------------------------------
   🔹 Common Helpers
------------------------------------------------------------ */
export const optionalString = z.union([z.string(), z.literal(""), z.undefined()]);

/* ------------------------------------------------------------
   🔹 Enums
------------------------------------------------------------ */
export const JobTypeEnum = z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "REMOTE"]);
export const JobStatusEnum = z.enum(["PENDING", "APPROVED", "REJECTED"]);
export const ConsultationStatusEnum = z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]);
export const PaymentStatusEnum = z.enum(["PENDING", "PAID", "FAILED", "REFUNDED"]);
export const UserRoleEnum = z.enum(["USER", "ADMIN", "CONSULTANT"]);
export const SaleStatusEnum = z.enum(["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED", "REFUNDED"]);
export const PackageTypeEnum = z.enum(["STANDARD", "PRIORITY", "URGENT"]);

/* ------------------------------------------------------------
   🔹 User Schema
------------------------------------------------------------ */
export const userSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  name: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  phone: optionalString,
  photoUrl: optionalString,
  address: optionalString,
  location: optionalString,
  city: optionalString,
  country: optionalString,
  jobTitle: optionalString,
  linkedin: optionalString,
  github: optionalString,
  twitter: optionalString,
  portfolioUrl: optionalString,
  role: UserRoleEnum.optional().default("USER"),
  isAdmin: z.boolean().optional().default(false),
});

export type UserValues = z.infer<typeof userSchema>;

/* ------------------------------------------------------------
   🔹 General Info
------------------------------------------------------------ */
export const generalInformSchema = z.object({
  title: optionalString,
  description: optionalString,
});

export type GeneralInfoValues = z.infer<typeof generalInformSchema>;

/* ------------------------------------------------------------
   🔹 Personal Info
------------------------------------------------------------ */
export const personalInformSchema = z.object({
  photo: z
    .union([
      z
        .instanceof(File)
        .refine((file) => file.type.startsWith("image/"), {
          message: "Please upload a valid image",
        })
        .refine((file) => file.size <= 4 * 1024 * 1024, {
          message: "Please upload a file smaller than 4MB",
        }),
      z.null(),
      z.string(),
      z.undefined(),
    ])
    .optional(),
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

export type PersonalInfoValues = z.infer<typeof personalInformSchema>;

/* ------------------------------------------------------------
   🔹 Work Experience
------------------------------------------------------------ */
export const workExperienceSchema = z.object({
  workExperiences: z
    .array(
      z.object({
        id: z.string().optional(),
        position: optionalString,
        company: optionalString,
        description: optionalString,
        startDate: optionalString,
        endDate: optionalString,
      })
    )
    .optional(),
});

export type WorkExperienceValues = z.infer<typeof workExperienceSchema>;

/* ------------------------------------------------------------
   🔹 Education
------------------------------------------------------------ */
export const educationSchema = z.object({
  educations: z
    .array(
      z.object({
        id: z.string().optional(),
        institution: optionalString,
        qualification: optionalString,
        city: optionalString,
        country: optionalString,
        startDate: optionalString,
        endDate: optionalString,
      })
    )
    .optional(),
});

export type EducationValues = z.infer<typeof educationSchema>;

/* ------------------------------------------------------------
   🔹 Certifications
------------------------------------------------------------ */
export const certificationSchema = z.object({
  certifications: z
    .array(
      z.object({
        id: z.string().optional(),
        body: optionalString,
        certification: optionalString,
        year: optionalString,
      })
    )
    .optional(),
});

export type CertificationValues = z.infer<typeof certificationSchema>;

/* ------------------------------------------------------------
   🔹 Skills
------------------------------------------------------------ */
export const hardSkillSchema = z.object({
  hardSkills: z.array(z.object({ 
    id: z.string().optional(),
    title: optionalString 
  })).optional(),
});

export type HardSkillValues = z.infer<typeof hardSkillSchema>;

/* ------------------------------------------------------------
   🔹 Soft Skills
------------------------------------------------------------ */
export const softSkillSchema = z.object({
  softSkills: z.array(z.object({ 
    id: z.string().optional(),
    title: optionalString 
  })).optional(),
});

export type SoftSkillValues = z.infer<typeof softSkillSchema>;

/* ------------------------------------------------------------
   🔹 Awards
------------------------------------------------------------ */
export const awardSchema = z.object({
  awards: z
    .array(
      z.object({
        id: z.string().optional(),
        title: optionalString,
        description: optionalString,
        issuer: optionalString,
        date: optionalString,
      })
    )
    .optional(),
});

export type AwardValues = z.infer<typeof awardSchema>;

/* ------------------------------------------------------------
   🔹 Projects / Publications
------------------------------------------------------------ */
export const projectsPublicationSchema = z.object({
  projectsPublications: z
    .array(
      z.object({
        id: z.string().optional(),
        title: optionalString,
        description: optionalString,
        link: optionalString,
        type: optionalString,
        publisher: optionalString,
        publicationDate: optionalString,
      })
    )
    .optional(),
});

export type ProjectsPublicationValues = z.infer<typeof projectsPublicationSchema>;

/* ------------------------------------------------------------
   🔹 Summary
------------------------------------------------------------ */
export const summarySchema = z.object({
  summary: optionalString,
});

export type SummaryValues = z.infer<typeof summarySchema>;

/* ------------------------------------------------------------
   🔹 Resume Schema (Unified)
------------------------------------------------------------ */
export const resumeSchema = z.object({
  id: z.string().optional(),
  userId: z.string().optional(),
  ...generalInformSchema.shape,
  ...personalInformSchema.shape,
  ...workExperienceSchema.shape,
  ...educationSchema.shape,
  ...certificationSchema.shape,
  ...softSkillSchema.shape,
  ...hardSkillSchema.shape,
  ...awardSchema.shape,
  ...summarySchema.shape,
  ...projectsPublicationSchema.shape,
  colorHex: optionalString,
  borderStyle: optionalString,
});

export type ResumeValues = Omit<z.infer<typeof resumeSchema>, "photo"> & {
  id?: string;
  photo?: File | string | null;
};

/* ------------------------------------------------------------
   🔹 Generate Summary Schema
------------------------------------------------------------ */
export const generateSummarySchema = z.object({
  jobTitle: optionalString,
  ...workExperienceSchema.shape,
  ...hardSkillSchema.shape,
  ...softSkillSchema.shape,
  ...summarySchema.shape,
  ...awardSchema.shape,
  ...projectsPublicationSchema.shape,
});

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>;

/* ------------------------------------------------------------
   🔹 LinkedIn Experience
------------------------------------------------------------ */
export const LinkedinExperienceSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  location: optionalString,
  startDate: z.string().min(1, "Start date is required"),
  endDate: optionalString,
  current: z.boolean().optional(),
  description: optionalString,
});

export type LinkedinExperience = z.infer<typeof LinkedinExperienceSchema>;

/* ------------------------------------------------------------
   🔹 LinkedIn Education
------------------------------------------------------------ */
export const LinkedinEducationSchema = z.object({
  school: z.string().min(1, "School/University is required"),
  degree: optionalString,
  field: optionalString,
  startYear: optionalString,
  endYear: optionalString,
});

export type LinkedinEducation = z.infer<typeof LinkedinEducationSchema>;

/* ------------------------------------------------------------
   🔹 LinkedIn Profile Input Schema
------------------------------------------------------------ */
export const LinkedinProfileInputSchema = z.object({
  // Contact
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: optionalString,

  // Basic Info
  headline: z.string().min(10, "Headline must be at least 10 characters"),
  summary: optionalString,
  location: optionalString,
  industry: optionalString,
  profileUrl: z.union([z.string().url("Please enter a valid URL"), z.literal("")]).optional(),

  // Experience
  experiences: z.array(LinkedinExperienceSchema).min(1, "At least one experience is required"),

  // Education
  education: z.array(LinkedinEducationSchema),

  // Skills
  skills: z.array(z.string()),

  // Consent
  marketingConsent: z.boolean().optional(),
});

export type LinkedinProfileInput = z.infer<typeof LinkedinProfileInputSchema>;
/* ------------------------------------------------------------
   🔹 LinkedIn Profile Schema (Database)
------------------------------------------------------------ */
export const LinkedinProfileSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  headline: optionalString,
  summary: optionalString,
  location: optionalString,
  industry: optionalString,
  experiences: z.any().optional(), // Stored as JSON
  education: z.any().optional(), // Stored as JSON
  skills: z.any().optional(), // Stored as JSON
  profileUrl: optionalString,
  profilePdf: optionalString,
  lastAnalyzed: z.date().optional(),
  profileScore: z.number().int().min(0).max(100).optional(),
});

export type LinkedinProfileValues = z.infer<typeof LinkedinProfileSchema>;

/* ------------------------------------------------------------
   🔹 Lead Experience Schema
------------------------------------------------------------ */
export const leadExperienceSchema = z.object({
  id: z.string().optional(),
  leadId: z.string(),
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  location: optionalString,
  startDate: optionalString,
  endDate: optionalString,
  current: z.boolean().default(false),
  description: optionalString,
});

export type LeadExperienceValues = z.infer<typeof leadExperienceSchema>;

/* ------------------------------------------------------------
   🔹 Lead Education Schema
------------------------------------------------------------ */
export const leadEducationSchema = z.object({
  id: z.string().optional(),
  leadId: z.string(),
  school: z.string().min(1, "School is required"),
  degree: optionalString,
  field: optionalString,
  startYear: optionalString,
  endYear: optionalString,
});

export type LeadEducationValues = z.infer<typeof leadEducationSchema>;

/* ------------------------------------------------------------
   🔹 Lead Schema
------------------------------------------------------------ */
export const leadSchema = z.object({
  id: z.string().optional(),
  email: z.string().email("Please enter a valid email address"),
  phone: optionalString,
  headline: optionalString,
  profileUrl: optionalString,
  location: optionalString,
  industry: optionalString,
  summary: optionalString,
  skills: z.array(z.string()).default([]),
  overallScore: z.number().int().min(0).max(100),
  headlineScore: z.number().int().min(0).max(100),
  summaryScore: z.number().int().min(0).max(100),
  experienceScore: z.number().int().min(0).max(100),
  skillsScore: z.number().int().min(0).max(100),
  marketingConsent: z.boolean().default(false),
  contacted: z.boolean().default(false),
  converted: z.boolean().default(false),
});

export type LeadValues = z.infer<typeof leadSchema>;

/* ------------------------------------------------------------
   🔹 Sale Schema
------------------------------------------------------------ */
export const saleSchema = z.object({
  id: z.string().optional(),
  leadId: z.string(),
  customerName: z.string().min(1, "Customer name is required"),
  customerEmail: z.string().email("Please enter a valid email address"),
  customerPhone: optionalString,
  packageType: PackageTypeEnum,
  amount: z.number().int().positive("Amount must be positive"),
  currency: z.string().default("ZAR"),
  status: SaleStatusEnum.default("PENDING"),
  consultationOrderId: optionalString,
  agentId: optionalString,
  agentName: optionalString,
  paymentMethod: optionalString,
  paymentReference: optionalString,
  paidAt: z.date().optional(),
  deliveryDeadline: z.date().optional(),
  completedAt: z.date().optional(),
  notes: optionalString,
});

export type SaleValues = z.infer<typeof saleSchema>;

/* ------------------------------------------------------------
   🔹 Consultation Order Schema
------------------------------------------------------------ */
export const consultationOrderSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  consultationStatus: ConsultationStatusEnum.default("PENDING"),
  amount: z.number().int().positive("Amount must be positive"),
  currency: z.string().default("ZAR"),
  consultationType: z.string().default("linkedin_optimization"),
  requirements: z.any().optional(), // JSON
  consultantId: optionalString,
  deliveredAt: z.date().optional(),
  deliveryUrl: optionalString,
  consultantNotes: optionalString,
  paymentId: optionalString,
  paymentStatus: PaymentStatusEnum.default("PENDING"),
  clientName: z.string().min(1, "Client name is required"),
  clientEmail: z.string().email("Please enter a valid email address"),
});

export type ConsultationOrderValues = z.infer<typeof consultationOrderSchema>;

/* ------------------------------------------------------------
   🔹 Consultant Schema
------------------------------------------------------------ */
export const consultantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: optionalString,
  avatar: optionalString,
  title: optionalString,
  bio: optionalString,
  specializations: z.any().optional(), // JSON
  skills: z.any().optional(), // JSON
  experience: z.number().int().optional(),
  isActive: z.boolean().default(true),
  maxOrders: z.number().int().default(5),
  hourlyRate: z.number().int().optional(),
  totalOrders: z.number().int().default(0),
  completedOrders: z.number().int().default(0),
  averageRating: z.number().optional(),
  availability: z.any().optional(), // JSON
});

export type ConsultantValues = z.infer<typeof consultantSchema>;

/* ------------------------------------------------------------
   🔹 Job Schema
------------------------------------------------------------ */
export const jobSchema = z.object({
  id: z.string().optional(),
  title: optionalString,
  company: optionalString,
  firstName: optionalString,
  lastName: optionalString,
  companyEmail: optionalString,
  companyPhone: optionalString,
  posterPosition: optionalString,
  businessLocation: optionalString,
  openingDate: z.date(),
  closingDate: z.date(),
  location: optionalString,
  jobType: JobTypeEnum,
  salaryMin: optionalString,
  salaryMax: optionalString,
  currency: z.string().default("USD"),
  description: optionalString,
  requirements: optionalString,
  benefits: optionalString,
  userId: z.string(),
  userEmail: optionalString,
  status: JobStatusEnum.default("PENDING"),
  isPromoted: z.boolean().default(false),
  promotedUntil: z.date().optional(),
  approvedAt: z.date().optional(),
  approvedBy: optionalString,
});

export type JobValues = z.infer<typeof jobSchema>;

/* ------------------------------------------------------------
   🔹 Analysis Result Types
------------------------------------------------------------ */
export const keywordAnalysisSchema = z.object({
  missingKeywords: z.array(z.string()),
  underusedKeywords: z.array(z.string()),
  industryKeywords: z.array(z.string()),
  suggestions: z.array(z.string()),
});

export type KeywordAnalysis = z.infer<typeof keywordAnalysisSchema>;

export const structureAnalysisSchema = z.object({
  hasHeadline: z.boolean(),
  hasSummary: z.boolean(),
  hasExperience: z.boolean(),
  hasSkills: z.boolean(),
  hasEducation: z.boolean(),
  completenessScore: z.number().min(0).max(100),
});

export type StructureAnalysis = z.infer<typeof structureAnalysisSchema>;

export const readabilityAnalysisSchema = z.object({
  sentenceCount: z.number().int(),
  avgSentenceLength: z.number(),
  activeVerbCount: z.number().int(),
  metricsCount: z.number().int(),
  jargonScore: z.number(),
  readabilityScore: z.number().min(0).max(100),
});

export type ReadabilityAnalysis = z.infer<typeof readabilityAnalysisSchema>;

export const optimizationSuggestionSchema = z.object({
  type: z.enum(["headline", "summary", "experience", "skills"]),
  priority: z.enum(["high", "medium", "low"]),
  suggestion: z.string(),
  example: optionalString,
});

export type OptimizationSuggestion = z.infer<typeof optimizationSuggestionSchema>;

/* ------------------------------------------------------------
   🔹 Optimization Report Schema
------------------------------------------------------------ */
export const optimizationReportSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  email: z.string(),
  linkedinProfileId: z.string(),
  overallScore: z.number().int().min(0).max(100),
  headlineScore: z.number().int().min(0).max(100).optional(),
  summaryScore: z.number().int().min(0).max(100).optional(),
  experienceScore: z.number().int().min(0).max(100).optional(),
  skillsScore: z.number().int().min(0).max(100).optional(),
  keywordAnalysis: z.any().optional(), // JSON - use keywordAnalysisSchema for validation
  structureAnalysis: z.any().optional(), // JSON - use structureAnalysisSchema for validation
  readabilityScore: z.any().optional(), // JSON - use readabilityAnalysisSchema for validation
  resumeAlignment: z.any().optional(), // JSON
  headlineSuggestions: z.any().optional(), // JSON
  summarySuggestions: z.any().optional(), // JSON
  experienceSuggestions: z.any().optional(), // JSON
  skillSuggestions: z.any().optional(), // JSON
  reportGenerated: z.boolean().default(false),
  reportUrl: optionalString,
});

export type OptimizationReportValues = z.infer<typeof optimizationReportSchema>;