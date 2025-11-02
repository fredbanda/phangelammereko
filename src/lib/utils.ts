

import { ResumeServerData } from "types"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ResumeValues } from "./validations"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fileReplacer(key: unknown, value: unknown) {
 return value instanceof File ? {
  name: value.name,
  size: value.size,
  type: value.type,
  lastModified: value.lastModified,
 }
  : value
}

export function mapToResumevalues(data: ResumeServerData):ResumeValues {
  return {
    id: data.id,
    title: data.title || undefined,
    description: data.description || undefined,
    firstName: data.firstName || undefined,
    lastName: data.lastName || undefined,
    email: data.email || undefined,
    phone: data.phone || undefined,
    address: data.address || undefined,
    location: data.location || undefined,
    city: data.city || undefined,
    country: data.country || undefined,
    linkedin: data.linkedin || undefined,
    github: data.github || undefined,
    twitter: data.twitter || undefined,
    portfolioUrl: data.portfolioUrl || undefined,
    jobTitle: data.jobTitle || undefined,
    photo: data.photoUrl || undefined,

    workExperiences: data.workExperiences.map((exp) => ({
      position: exp.position || undefined,
      company: exp.company || undefined,
      description: exp.description || undefined,
      startDate: exp.startDate?.toString().split("T")[0] || undefined,
      endDate: exp.endDate?.toString().split("T")[0] || undefined,
    })),
    educations: data.educations.map((edu) => ({
      institution: edu.institution || undefined,
      qualification: edu.qualification || undefined,
      city: edu.city || undefined,
      country: edu.country || undefined,
      startDate: edu.startDate?.toString().split("T")[0] || undefined,
      endDate: edu.endDate?.toString().split("T")[0] || undefined,
    })),
    skills: data.hardSkills.map((skill) => ({
      title: skill.title || undefined,
    })),
    certifications: data.certifications.map((cert) => ({
      certification: cert.certification || undefined,
      body: cert.body || undefined,
      year: cert.year?.toString().split("T")[0] || undefined,
    })),
    awards: data.awards.map((award) => ({
      title: award.title || undefined,
      description: award.description || undefined,
      date: award.date?.toString().split("T")[0] || undefined,
      issuer: award.issuer || undefined,
    })),
    projectsPublications: data.projectsPublications.map((pub) => ({
      title: pub.title || undefined,
      description: pub.description || undefined,
      link: pub.link || undefined,
      type: pub.type || undefined,
      publisher: pub.publisher || undefined,
      publicationDate: pub.publicationDate?.toString().split("T")[0] || undefined,
    })),
    borderStyle: data.borderStyle,
    colorHex: data.colorHex,
    summary: data.summary || undefined,
  }
}
