import { NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, marketingConsent, analysisData, profileData } = await request.json()
    
    // Create or update user
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        name,
        phone,
      },
      create: {
        email,
        name,
        phone,
      },
    })

    // If analysis data is provided, ensure the LinkedIn profile and report are linked to this user
    if (analysisData && profileData) {
      // Update LinkedIn profile to be associated with this user
      await prisma.linkedinProfile.updateMany({
        where: {
          email: email,
          userId: { not: user.id }, // Only update if not already associated
        },
        data: {
          userId: user.id,
        },
      })

      // Update optimization reports to be associated with this user
      await prisma.optimizationReport.updateMany({
        where: {
          email: email,
          userId: { not: user.id }, // Only update if not already associated
        },
        data: {
          userId: user.id,
        },
      })

      // Create a lead record for marketing purposes if consent is given
      if (marketingConsent) {
        await prisma.lead.upsert({
          where: { email },
          update: {
            phone,
            headline: profileData.headline,
            profileUrl: profileData.profileUrl,
            location: profileData.location,
            industry: profileData.industry,
            summary: profileData.summary,
            skills: profileData.skills || [],
            overallScore: analysisData.overallScore,
            headlineScore: analysisData.headlineScore,
            summaryScore: analysisData.summaryScore,
            experienceScore: analysisData.experienceScore,
            skillsScore: analysisData.skillsScore,
            marketingConsent: true,
          },
          create: {
            email,
            phone,
            headline: profileData.headline,
            profileUrl: profileData.profileUrl,
            location: profileData.location,
            industry: profileData.industry,
            summary: profileData.summary,
            skills: profileData.skills || [],
            overallScore: analysisData.overallScore,
            headlineScore: analysisData.headlineScore,
            summaryScore: analysisData.summaryScore,
            experienceScore: analysisData.experienceScore,
            skillsScore: analysisData.skillsScore,
            marketingConsent: true,
          },
        })
      }
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      message: "Account created successfully",
    })

  } catch (error) {
    console.error("Account creation error:", error)
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    )
  }
}