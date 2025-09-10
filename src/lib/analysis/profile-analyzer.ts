import type { LinkedinProfileInput, OptimizationSuggestion } from "../validations"
import { KeywordAnalyzer } from "./keyword-analyzer"
import { ReadabilityAnalyzer } from "./readability-analyzer"
import { StructureAnalyzer } from "./structure-analyzer"


export interface ProfileAnalysisResult {
  overallScore: number
  keywordAnalysis: ReturnType<KeywordAnalyzer["analyze"]>
  structureAnalysis: ReturnType<StructureAnalyzer["analyze"]>
  readabilityAnalysis: ReturnType<ReadabilityAnalyzer["analyze"]>
  suggestions: OptimizationSuggestion[]
  scores: {
    keyword: number
    structure: number
    readability: number
    experience: number
  }
}

export class ProfileAnalyzer {
  private keywordAnalyzer = new KeywordAnalyzer()
  private structureAnalyzer = new StructureAnalyzer()
  private readabilityAnalyzer = new ReadabilityAnalyzer()

  private calculateKeywordScore(keywordAnalysis: ReturnType<KeywordAnalyzer["analyze"]>): number {
    const totalRelevantKeywords = keywordAnalysis.industryKeywords.length
    const missingKeywords = keywordAnalysis.missingKeywords.length
    const underusedKeywords = keywordAnalysis.underusedKeywords.length

    // Start with 100 and deduct points
    let score = 100
    score -= (missingKeywords / totalRelevantKeywords) * 60 // Heavy penalty for missing keywords
    score -= (underusedKeywords / totalRelevantKeywords) * 30 // Moderate penalty for underused

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private calculateExperienceScore(profile: LinkedinProfileInput): number {
    if (!profile.experiences || profile.experiences.length === 0) return 0

    let score = 0
    const maxScore = 100

    // Points for having experiences
    score += Math.min(40, profile.experiences.length * 10) // Up to 40 points for multiple experiences

    // Points for detailed descriptions
    const experiencesWithDescriptions = profile.experiences.filter(
      (exp) => exp.description && exp.description.trim().length > 50,
    ).length
    score += (experiencesWithDescriptions / profile.experiences.length) * 35

    // Points for recent experience (assuming first is most recent)
    if (profile.experiences[0] && profile.experiences[0].current) {
      score += 15
    }

    // Points for complete information
    const completeExperiences = profile.experiences.filter((exp) => exp.title && exp.company && exp.startDate).length
    score += (completeExperiences / profile.experiences.length) * 10

    return Math.min(maxScore, Math.round(score))
  }

  private generateSuggestions(
    profile: LinkedinProfileInput,
    keywordAnalysis: ReturnType<KeywordAnalyzer["analyze"]>,
    structureAnalysis: ReturnType<StructureAnalyzer["analyze"]>,
    readabilityAnalysis: ReturnType<ReadabilityAnalyzer["analyze"]>,
  ): OptimizationSuggestion[] {
    const suggestions: OptimizationSuggestion[] = []

    // Headline suggestions
    if (!profile.headline || profile.headline.length < 50) {
      suggestions.push({
        type: "headline",
        priority: "high",
        suggestion: "Expand your headline to include your role, key skills, and value proposition",
        example: "Senior Software Engineer | React & Node.js Expert | Building Scalable Web Applications",
      })
    }

    // Summary suggestions
    if (!profile.summary || profile.summary.length < 200) {
      suggestions.push({
        type: "summary",
        priority: "high",
        suggestion: "Write a compelling summary that tells your professional story and highlights key achievements",
        example:
          "Start with your current role, mention 2-3 key accomplishments with metrics, and end with your career goals",
      })
    }

    // Keyword suggestions
    if (keywordAnalysis.missingKeywords.length > 0) {
      suggestions.push({
        type: "skills",
        priority: "medium",
        suggestion: `Add these relevant keywords to your profile: ${keywordAnalysis.missingKeywords.slice(0, 3).join(", ")}`,
      })
    }

    // Experience suggestions
    if (profile.experiences && profile.experiences.length > 0) {
      const experiencesWithoutMetrics = profile.experiences.filter(
        (exp) => exp.description && !exp.description.match(/\d+[%$kKmM]|\d+\s*(years?|months?)/g),
      )

      if (experiencesWithoutMetrics.length > 0) {
        suggestions.push({
          type: "experience",
          priority: "high",
          suggestion: "Add quantifiable metrics to your experience descriptions",
          example:
            "Instead of 'Improved system performance', write 'Improved system performance by 40%, reducing load times from 3s to 1.8s'",
        })
      }
    }

    // Readability suggestions
    const readabilitySuggestions = this.readabilityAnalyzer.generateSuggestions(readabilityAnalysis)
    readabilitySuggestions.forEach((suggestion) => {
      suggestions.push({
        type: "summary",
        priority: "medium",
        suggestion,
      })
    })

    return suggestions.slice(0, 8) // Limit to top 8 suggestions
  }

  async analyze(profile: LinkedinProfileInput): Promise<ProfileAnalysisResult> {
    // Perform all analyses
    const keywordAnalysis = this.keywordAnalyzer.analyze(profile)
    const structureAnalysis = this.structureAnalyzer.analyze(profile)
    const readabilityAnalysis = this.readabilityAnalyzer.analyze(profile)

    // Calculate individual scores
    const keywordScore = this.calculateKeywordScore(keywordAnalysis)
    const structureScore = structureAnalysis.completenessScore
    const readabilityScore = readabilityAnalysis.readabilityScore
    const experienceScore = this.calculateExperienceScore(profile)

    // Calculate overall score (weighted average)
    const overallScore = Math.round(
      keywordScore * 0.3 + // 30% weight
        structureScore * 0.25 + // 25% weight
        readabilityScore * 0.25 + // 25% weight
        experienceScore * 0.2, // 20% weight
    )

    // Generate suggestions
    const suggestions = this.generateSuggestions(profile, keywordAnalysis, structureAnalysis, readabilityAnalysis)

    return {
      overallScore,
      keywordAnalysis,
      structureAnalysis,
      readabilityAnalysis,
      suggestions,
      scores: {
        keyword: keywordScore,
        structure: structureScore,
        readability: readabilityScore,
        experience: experienceScore,
      },
    }
  }
}
