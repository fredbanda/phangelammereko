/* eslint-disable @typescript-eslint/no-explicit-any */

import { LinkedinProfileInput, ReadabilityAnalysis } from "../validations"


export class ReadabilityAnalyzer {
  private countSentences(text: string): number {
    return text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0).length
  }

  private countWords(text: string): number {
    return text.split(/\s+/).filter((word) => word.length > 0).length
  }

  private countActiveVerbs(text: string): number {
    const activeVerbs = [
      "achieved",
      "accomplished",
      "built",
      "created",
      "developed",
      "designed",
      "implemented",
      "improved",
      "increased",
      "led",
      "managed",
      "optimized",
      "reduced",
      "streamlined",
      "delivered",
      "executed",
      "launched",
      "established",
      "generated",
      "transformed",
      "collaborated",
      "coordinated",
      "facilitated",
      "mentored",
      "trained",
      "supervised",
    ]

    const words = text.toLowerCase().split(/\s+/)
    return activeVerbs.reduce((count, verb) => {
      return count + words.filter((word) => word.includes(verb)).length
    }, 0)
  }

  private countMetrics(text: string): number {
    // Look for numbers, percentages, dollar amounts, etc.
    const metricPatterns = [
      /\d+%/g, // Percentages
      /\$\d+/g, // Dollar amounts
      /\d+\+/g, // Numbers with plus
      /\d+k/gi, // Thousands (10k, 5K)
      /\d+m/gi, // Millions
      /\d+x/gi, // Multipliers (2x, 3X)
      /\d+\s*(years?|months?)/gi, // Time periods
    ]

    return metricPatterns.reduce((count, pattern) => {
      const matches = text.match(pattern)
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  private calculateJargonScore(text: string): number {
    const jargonWords = [
      "synergy",
      "leverage",
      "paradigm",
      "disruptive",
      "innovative",
      "cutting-edge",
      "best-in-class",
      "world-class",
      "industry-leading",
      "next-generation",
      "revolutionary",
      "groundbreaking",
      "game-changing",
      "turnkey",
      "holistic",
    ]

    const words = text.toLowerCase().split(/\s+/)
    const jargonCount = jargonWords.reduce((count, jargon) => {
      return count + words.filter((word) => word.includes(jargon)).length
    }, 0)

    const totalWords = words.length
    return totalWords > 0 ? (jargonCount / totalWords) * 100 : 0
  }

  analyze(profile: LinkedinProfileInput): ReadabilityAnalysis {
    const allText = [
      profile.headline || "",
      profile.summary || "",
      ...(profile.experiences?.map((exp: any) => exp.description || "") || []),
    ].join(" ")

    const sentenceCount = this.countSentences(allText)
    const wordCount = this.countWords(allText)
    const avgSentenceLength = sentenceCount > 0 ? wordCount / sentenceCount : 0
    const activeVerbCount = this.countActiveVerbs(allText)
    const metricsCount = this.countMetrics(allText)
    const jargonScore = this.calculateJargonScore(allText)

    // Calculate overall readability score (0-100)
    let readabilityScore = 100

    // Penalize very long sentences
    if (avgSentenceLength > 20) {
      readabilityScore -= Math.min(30, (avgSentenceLength - 20) * 2)
    }

    // Reward active verbs
    const activeVerbRatio = wordCount > 0 ? (activeVerbCount / wordCount) * 100 : 0
    if (activeVerbRatio < 2) {
      readabilityScore -= 20
    }

    // Reward metrics and quantifiable achievements
    const metricsRatio = wordCount > 0 ? (metricsCount / wordCount) * 100 : 0
    if (metricsRatio < 1) {
      readabilityScore -= 15
    }

    // Penalize excessive jargon
    if (jargonScore > 5) {
      readabilityScore -= Math.min(25, jargonScore * 3)
    }

    readabilityScore = Math.max(0, Math.min(100, readabilityScore))

    return {
      sentenceCount,
      avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
      activeVerbCount,
      metricsCount,
      jargonScore: Math.round(jargonScore * 10) / 10,
      readabilityScore: Math.round(readabilityScore),
    }
  }

  generateSuggestions(analysis: ReadabilityAnalysis): string[] {
    const suggestions: string[] = []

    if (analysis.avgSentenceLength > 20) {
      suggestions.push("Break down long sentences into shorter, more impactful statements")
    }

    if (analysis.activeVerbCount < 5) {
      suggestions.push("Use more action verbs to describe your achievements (achieved, built, led, improved)")
    }

    if (analysis.metricsCount < 3) {
      suggestions.push("Add quantifiable metrics to demonstrate your impact (percentages, dollar amounts, team sizes)")
    }

    if (analysis.jargonScore > 5) {
      suggestions.push("Reduce buzzwords and jargon. Use clear, specific language instead")
    }

    if (analysis.readabilityScore < 60) {
      suggestions.push("Overall readability needs improvement. Focus on clear, concise, and impactful language")
    }

    return suggestions
  }
}
