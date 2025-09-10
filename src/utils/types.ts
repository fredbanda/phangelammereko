import { ResumeValues } from "@/lib/validations";
import { Prisma } from "@prisma/client";

export interface EditorFormProps {
    resumeData: ResumeValues;
    setResumeData: (data: ResumeValues) => void;
}



export const resumeDataInclude = {
    workExperiences: true,
    educations: true,
    skills: true,
    softSkills: true,
    certifications: true,
    awards: true,  
    projectsPublications: true,
} satisfies Prisma.ResumeInclude;

export type ResumeServerData = Prisma.ResumeGetPayload<{
    include: typeof resumeDataInclude;
}>;

