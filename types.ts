import { ResumeValues } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export interface EditorFormProps {
    resumeData: ResumeValues;
    setResumeData: (data: ResumeValues) => void;
}



export const resumeDataInclude = {
    workExperiences: true,
    educations: true,
    hardSkills: true,
    softSkills: true,
    certifications: true,
    awards: true,  
    projectsPublications: true,
} satisfies Prisma.ResumeInclude;

export type ResumeServerData = Prisma.ResumeGetPayload<{
    include: typeof resumeDataInclude;
}>;

export type { Job, JobType, JobStatus } from "@prisma/client";

/* ------------------------------------------------------------
   🔹 Analysis Result Types
------------------------------------------------------------ */
export interface KeywordAnalysis {
  missingKeywords: string[];
  underusedKeywords: string[];
  industryKeywords: string[];
  suggestions: string[];
}

export interface StructureAnalysis {
  hasHeadline: boolean;
  hasSummary: boolean;
  hasExperience: boolean;
  hasSkills: boolean;
  hasEducation: boolean;
  completenessScore: number;
}

export interface ReadabilityAnalysis {
  sentenceCount: number;
  avgSentenceLength: number;
  activeVerbCount: number;
  metricsCount: number;
  jargonScore: number;
  readabilityScore: number;
}

export interface OptimizationSuggestion {
  type: "headline" | "summary" | "experience" | "skills";
  priority: "high" | "medium" | "low";
  suggestion: string;
  example?: string;
}


