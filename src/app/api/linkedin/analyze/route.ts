import { NextRequest, NextResponse } from "next/server"
import { generateSummary } from "@/actions/gemini"
import prisma from "@/utils/prisma"
import { nanoid } from "nanoid"

export async function POST(request: NextRequest) {
  try {
    const profileData = await request.json()
    
    // Generate a unique profile ID
    const profileId = nanoid()
    
    // Create the analysis prompt for Gemini
    const analysisPrompt = `
    Analyze this LinkedIn profile and provide detailed optimization recommendations:

    PROFILE DATA:
    - Headline: ${profileData.headline || "Not provided"}
    - Summary: ${profileData.summary || "Not provided"}
    - Location: ${profileData.location || "Not provided"}
    - Industry: ${profileData.industry || "Not provided"}
    - Skills: ${profileData.skills?.join(", ") || "Not provided"}
    - Experience: ${JSON.stringify(profileData.experiences || [])}
    - Education: ${JSON.stringify(profileData.education || [])}

    Please provide a comprehensive analysis in the following JSON format:
    {
      "overallScore": <number 0-100>,
      "headlineScore": <number 0-100>,
      "summaryScore": <number 0-100>,
      "experienceScore": <number 0-100>,
      "skillsScore": <number 0-100>,
      "keywordAnalysis": {
        "missingKeywords": ["keyword1", "keyword2"],
        "suggestions": ["suggestion1", "suggestion2"]
      },
      "recommendations": {
        "headline": ["recommendation1", "recommendation2"],
        "summary": ["recommendation1", "recommendation2"],
        "experience": ["recommendation1", "recommendation2"],
        "skills": ["recommendation1", "recommendation2"],
        "aiSkills": ["Machine Learning", "Data Analysis", "Python", "AI Tools"]
      }
    }

    Focus on:
    1. Keyword optimization for better visibility
    2. Professional language and impact statements
    3. Industry-specific recommendations
    4. AI and future-ready skills to learn
    5. Quantifiable achievements
    6. Professional branding

    Provide specific, actionable recommendations that will improve profile visibility and career prospects.
    `

    // Get AI analysis
    const aiResponse = await generateSummary(analysisPrompt)
    
    // Parse the AI response
    let analysisData
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        analysisData = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in AI response")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      // Fallback analysis
      analysisData = {
        overallScore: 65,
        headlineScore: 70,
        summaryScore: 60,
        experienceScore: 65,
        skillsScore: 70,
        keywordAnalysis: {
          missingKeywords: ["leadership", "innovation", "results-driven"],
          suggestions: ["Add industry-specific keywords", "Include action verbs", "Quantify achievements"]
        },
        recommendations: {
          headline: ["Make it more specific to your role", "Add key skills", "Include value proposition"],
          summary: ["Start with a strong opening", "Add quantifiable achievements", "Include call to action"],
          experience: ["Use bullet points", "Quantify results", "Add relevant keywords"],
          skills: ["Add trending skills", "Include certifications", "Balance hard and soft skills"],
          aiSkills: ["Machine Learning", "Data Analysis", "Python", "AI Tools", "Automation"]
        }
      }
    }

    // Save to database
    const user = await prisma.user.upsert({
      where: { email: profileData.email },
      update: {},
      create: {
        email: profileData.email,
        name: profileData.headline?.split("|")[0]?.trim() || "LinkedIn User",
      },
    })

    const linkedinProfile = await prisma.linkedinProfile.create({
      data: {
        id: profileId,
        userId: user.id,
        
        email: profileData.email,
        headline: profileData.headline,
        summary: profileData.summary,
        location: profileData.location,
        industry: profileData.industry,
        experiences: profileData.experiences,
        education: profileData.education,
        skills: profileData.skills,
        profileUrl: profileData.profileUrl,
        lastAnalyzed: new Date(),
        profileScore: analysisData.overallScore,
      },
    })

    const optimizationReport = await prisma.optimizationReport.create({
      data: {
        userId: user.id,
        email: profileData.email,
        linkedinProfileId: profileId,
        overallScore: analysisData.overallScore,
        headlineScore: analysisData.headlineScore,
        summaryScore: analysisData.summaryScore,
        experienceScore: analysisData.experienceScore,
        skillsScore: analysisData.skillsScore,
        keywordAnalysis: analysisData.keywordAnalysis,
        headlineSuggestions: analysisData.recommendations.headline,
        summarySuggestions: analysisData.recommendations.summary,
        experienceSuggestions: analysisData.recommendations.experience,
        skillSuggestions: analysisData.recommendations.skills,
      },
    })

    return NextResponse.json({
      profileId,
      ...analysisData,
    })

  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze profile" },
      { status: 500 }
    )
  }
}