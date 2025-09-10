/* eslint-disable @typescript-eslint/no-explicit-any */

import { KeywordAnalysis, LinkedinProfileInput } from "../validations"


// Industry-specific keyword databases
const INDUSTRY_KEYWORDS = {
  "Information Technology": [
    "software development",
    "programming",
    "javascript",
    "python",
    "react",
    "node.js",
    "cloud computing",
    "aws",
    "azure",
    "devops",
    "agile",
    "scrum",
    "api",
    "database",
    "machine learning",
    "artificial intelligence",
    "cybersecurity",
    "full-stack",
  ],
  Marketing: [
    "digital marketing",
    "seo",
    "sem",
    "social media",
    "content marketing",
    "email marketing",
    "analytics",
    "conversion optimization",
    "brand management",
    "campaign management",
    "marketing automation",
    "lead generation",
    "roi",
    "kpi",
  ],
  Finance: [
    "financial analysis",
    "investment",
    "portfolio management",
    "risk management",
    "financial modeling",
    "budgeting",
    "forecasting",
    "compliance",
    "audit",
    "derivatives",
    "equity",
    "fixed income",
    "treasury",
    "corporate finance",
  ],
  Sales: [
    "sales management",
    "business development",
    "lead generation",
    "crm",
    "salesforce",
    "account management",
    "client relations",
    "negotiation",
    "closing",
    "pipeline management",
    "territory management",
    "quota attainment",
    "revenue growth",
  ],
  Healthcare: [
    "patient care",
    "clinical research",
    "medical devices",
    "healthcare management",
    "electronic health records",
    "hipaa",
    "quality improvement",
    "patient safety",
    "healthcare analytics",
    "telemedicine",
    "pharmaceutical",
    "regulatory compliance",
  ],
  Education: [
    "curriculum development",
    "instructional design",
    "student engagement",
    "assessment",
    "educational technology",
    "learning management systems",
    "pedagogy",
    "research",
    "academic administration",
    "student services",
    "online learning",
    "educational leadership",
  ],
}

const GENERAL_PROFESSIONAL_KEYWORDS = [
  "leadership",
  "team management",
  "project management",
  "strategic planning",
  "problem solving",
  "communication",
  "collaboration",
  "innovation",
  "mentoring",
  "process improvement",
  "data analysis",
  "stakeholder management",
  "cross-functional",
  "results-driven",
  "performance optimization",
  "quality assurance",
  "customer service",
]

export class KeywordAnalyzer {
  private getIndustryKeywords(industry?: string): string[] {
    if (!industry) return GENERAL_PROFESSIONAL_KEYWORDS

    const normalizedIndustry = Object.keys(INDUSTRY_KEYWORDS).find(
      (key) => key.toLowerCase().includes(industry.toLowerCase()) || industry.toLowerCase().includes(key.toLowerCase()),
    )

    return normalizedIndustry
      ? [...INDUSTRY_KEYWORDS[normalizedIndustry as keyof typeof INDUSTRY_KEYWORDS], ...GENERAL_PROFESSIONAL_KEYWORDS]
      : GENERAL_PROFESSIONAL_KEYWORDS
  }

  private extractTextContent(profile: LinkedinProfileInput): string {
    const textParts = [
      profile.headline || "",
      profile.summary || "",
      ...(profile.experiences?.map((exp: any) => `${exp.title} ${exp.description || ""}`) || []),
      ...(profile.skills || []),
    ]

    return textParts.join(" ").toLowerCase()
  }

  private calculateKeywordDensity(text: string, keywords: string[]): Map<string, number> {
    const density = new Map<string, number>()
    const words = text.split(/\s+/).filter((word) => word.length > 2)
    const totalWords = words.length

    keywords.forEach((keyword) => {
      const keywordWords = keyword.toLowerCase().split(/\s+/)
      let count = 0

      if (keywordWords.length === 1) {
        // Single word keyword
        count = words.filter((word) => word.includes(keywordWords[0])).length
      } else {
        // Multi-word keyword
        const keywordRegex = new RegExp(keyword.replace(/\s+/g, "\\s+"), "gi")
        const matches = text.match(keywordRegex)
        count = matches ? matches.length : 0
      }

      density.set(keyword, totalWords > 0 ? (count / totalWords) * 100 : 0)
    })

    return density
  }

  analyze(profile: LinkedinProfileInput): KeywordAnalysis {
    const industryKeywords = this.getIndustryKeywords(profile.industry)
    const profileText = this.extractTextContent(profile)
    const keywordDensity = this.calculateKeywordDensity(profileText, industryKeywords)

    const missingKeywords: string[] = []
    const underusedKeywords: string[] = []
    const suggestions: string[] = []

    industryKeywords.forEach((keyword) => {
      const density = keywordDensity.get(keyword) || 0

      if (density === 0) {
        missingKeywords.push(keyword)
      } else if (density < 0.5) {
        // Less than 0.5% density
        underusedKeywords.push(keyword)
      }
    })

    // Generate suggestions
    if (missingKeywords.length > 0) {
      suggestions.push(`Consider adding these relevant keywords: ${missingKeywords.slice(0, 5).join(", ")}`)
    }

    if (underusedKeywords.length > 0) {
      suggestions.push(`Increase usage of these keywords: ${underusedKeywords.slice(0, 3).join(", ")}`)
    }

    if (profile.headline && profile.headline.split(" ").length < 5) {
      suggestions.push("Expand your headline to include more relevant keywords and value proposition")
    }

    return {
      missingKeywords: missingKeywords.slice(0, 10),
      underusedKeywords: underusedKeywords.slice(0, 8),
      industryKeywords: industryKeywords.slice(0, 15),
      suggestions,
    }
  }
}
