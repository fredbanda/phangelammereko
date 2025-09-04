import {z} from "zod";

export const optionalString = z.string().optional().or(z.literal(""))

export const generalInformSchema = z.object({
    title: optionalString,
    description: optionalString,
});

export type GeneralInfoValues = z.infer<typeof generalInformSchema>

export const personalInformSchema = z.object({
    photo: z.custom<File | undefined>()
  .refine(
    (file) => !file || (file instanceof File && file.type.startsWith("image/")),
    {
      message: "Please upload a valid image", 
       path: ["photo"],
    }
       )
  .refine(file => !file || file.size <= 1024 * 1024 * 4, {
    message: "Please upload a file smaller than 4MB", 
     path: ["photo"],
  }),
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
  ...summarySchema.shape,
  ...awardSchema.shape,
  ...projectsPublicationSchema.shape,
})

export type GenerateSummaryInput = z.infer<typeof generateSummarySchema>