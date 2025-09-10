/* eslint-disable @typescript-eslint/no-explicit-any */

import { LinkedinProfileInput, StructureAnalysis } from "../validations"


export class StructureAnalyzer {
  analyze(profile: LinkedinProfileInput): StructureAnalysis {
    const hasHeadline = !!(profile.headline && profile.headline.trim().length > 0)
    const hasSummary = !!(profile.summary && profile.summary.trim().length > 50) // Minimum 50 chars
    const hasExperience = !!(
      profile.experiences &&
      profile.experiences.length > 0 &&
      profile.experiences.some((exp: any) => exp.title && exp.company && exp.startDate)
    )
    const hasSkills = !!(profile.skills && profile.skills.length >= 3) // Minimum 3 skills
    const hasEducation = !!(
      profile.education &&
      profile.education.length > 0 &&
      profile.education.some((edu: any) => edu.school)
    )

    // Calculate completeness score
    const completenessFactors = [
      { check: hasHeadline, weight: 20 },
      { check: hasSummary, weight: 25 },
      { check: hasExperience, weight: 30 },
      { check: hasSkills, weight: 15 },
      { check: hasEducation, weight: 10 },
    ]

    const completenessScore = completenessFactors.reduce((score, factor) => {
      return score + (factor.check ? factor.weight : 0)
    }, 0)

    return {
      hasHeadline,
      hasSummary,
      hasExperience,
      hasSkills,
      hasEducation,
      completenessScore,
    }
  }

  generateSuggestions(analysis: StructureAnalysis): string[] {
    const suggestions: string[] = []

    if (!analysis.hasHeadline) {
      suggestions.push("Add a compelling professional headline that showcases your value proposition")
    }

    if (!analysis.hasSummary) {
      suggestions.push("Write a detailed summary section highlighting your key achievements and expertise")
    }

    if (!analysis.hasExperience) {
      suggestions.push("Add your work experience with detailed descriptions of your responsibilities and achievements")
    }

    if (!analysis.hasSkills) {
      suggestions.push("List at least 10-15 relevant skills to improve your profile's searchability")
    }

    if (!analysis.hasEducation) {
      suggestions.push("Include your educational background to provide a complete professional picture")
    }

    if (analysis.completenessScore < 70) {
      suggestions.push("Your profile completeness is below optimal. Focus on filling out missing sections first")
    }

    return suggestions
  }
}
