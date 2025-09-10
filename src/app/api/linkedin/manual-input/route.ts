import { auth } from "@clerk/nextjs/server"
import { LinkedinProfileInputSchema } from "@/lib/validations"
import prisma from "@/utils/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated user from Clerk
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = LinkedinProfileInputSchema.parse(body)

    console.log("🚀 LinkedIn profile input data:", validatedData)
    console.log("🚀 User ID from auth:", userId)

    // Create LinkedIn profile record with real user ID
    const linkedinProfile = await prisma.linkedinProfile.create({
      data: {
        userId,
        headline: validatedData.headline,
        summary: validatedData.summary,
        location: validatedData.location,
        industry: validatedData.industry,
        experiences: validatedData.experiences,
        education: validatedData.education,
        skills: validatedData.skills,
        profileUrl: validatedData.profileUrl,
        lastAnalyzed: new Date(),
      },
    })

    console.log("🚀 LinkedIn profile created:", linkedinProfile)

    return NextResponse.json({
      success: true,
      profileId: linkedinProfile.id,
      message: "Profile information saved successfully",
    })
  } catch (error) {
    console.error("Manual input error:", error)
    return NextResponse.json({ error: "Failed to save profile information" }, { status: 500 })
  }
}
