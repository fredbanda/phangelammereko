/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import prisma from "@/utils/prisma"
import { ProfileAnalyzer } from "@/lib/analysis/profile-analyzer"
import { Prisma } from "@prisma/client"

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from Clerk
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { profileId } = body

    if (!profileId) {
      return NextResponse.json({ error: "Profile ID is required" }, { status: 400 })
    }

    // Get LinkedIn profile from database
    const linkedinProfile = await prisma.linkedinProfile.findUnique({
      where: {
        id: profileId,
        userId: userId // Ensure user owns this profile
      }
    })

    if (!linkedinProfile) {
      return NextResponse.json({ 
        error: "Profile not found or you don't have permission to access it" 
      }, { status: 404 })
    }

    // Convert database record to analysis input format
    const profileInput = {
      headline: linkedinProfile.headline || "",
      summary: linkedinProfile.summary || "",
      location: linkedinProfile.location || "",
      industry: linkedinProfile.industry || "",
      experiences: Array.isArray(linkedinProfile.experiences) 
        ? linkedinProfile.experiences as any[]
        : [],
      education: Array.isArray(linkedinProfile.education) 
        ? linkedinProfile.education as any[]
        : [],
      skills: Array.isArray(linkedinProfile.skills) 
        ? linkedinProfile.skills as string[]
        : [],
      profileUrl: linkedinProfile.profileUrl || "",
    }

    // Perform analysis
    const analyzer = new ProfileAnalyzer()
    const analysisResult = await analyzer.analyze(profileInput)

    // Convert analysis objects to Prisma-compatible JSON
    const convertToJsonValue = (obj: any): Prisma.InputJsonValue => {
      return JSON.parse(JSON.stringify(obj))
    }

    // Save analysis results to database
    const optimizationReport = await prisma.optimizationReport.create({
      data: {
        userId: userId,
        linkedinProfileId: profileId,
        overallScore: analysisResult.overallScore,
        headlineScore: analysisResult.scores.keyword || 0,
        summaryScore: analysisResult.scores.readability || 0,
        experienceScore: analysisResult.scores.experience || 0,
        skillsScore: analysisResult.scores.structure || 0,
        
        // Convert interfaces to JSON-compatible objects
        keywordAnalysis: convertToJsonValue(analysisResult.keywordAnalysis || {}),
        structureAnalysis: convertToJsonValue(analysisResult.structureAnalysis || {}),
        readabilityScore: convertToJsonValue(analysisResult.readabilityAnalysis || {}),
        
        // Convert suggestion arrays to JSON-compatible format
        headlineSuggestions: convertToJsonValue(
          analysisResult.suggestions?.filter((s) => s.type === "headline") || []
        ),
        summarySuggestions: convertToJsonValue(
          analysisResult.suggestions?.filter((s) => s.type === "summary") || []
        ),
        experienceSuggestions: convertToJsonValue(
          analysisResult.suggestions?.filter((s) => s.type === "experience") || []
        ),
        skillSuggestions: convertToJsonValue(
          analysisResult.suggestions?.filter((s) => s.type === "skills") || []
        ),
        
        reportGenerated: true,
      },
    })

    // Update profile with analysis timestamp and score
    await prisma.linkedinProfile.update({
      where: { id: profileId },
      data: {
        lastAnalyzed: new Date(),
        profileScore: analysisResult.overallScore,
      },
    })

    return NextResponse.json({
      success: true,
      reportId: optimizationReport.id,
      analysisResult,
      message: "Profile analysis completed successfully",
    })
    
  } catch (error) {
    console.error("Analysis error:", error)
    
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("connect")) {
        return NextResponse.json(
          { error: "Database connection failed", details: "Please try again later" },
          { status: 503 }
        )
      }
      
      if (error.message.includes("Unauthorized")) {
        return NextResponse.json(
          { error: "Authentication failed", details: "Please log in again" },
          { status: 401 }
        )
      }
    }
    
    return NextResponse.json(
      {
        error: "Failed to analyze profile",
        details: error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    )
  }
}