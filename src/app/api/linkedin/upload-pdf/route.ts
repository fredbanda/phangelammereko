/* eslint-disable @typescript-eslint/no-unused-vars */
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"
import { auth, currentUser } from "@clerk/nextjs/server"

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // ✅ Make sure user exists in DB
    let dbUser = await prisma.user.findUnique({ where: { id: userId } })
    if (!dbUser) {
      const clerkUser = await currentUser() // fetch Clerk user data
      dbUser = await prisma.user.create({
        data: {
          id: userId, // Clerk userId as primary key
          email: clerkUser?.emailAddresses[0]?.emailAddress ?? "",
          name: `${clerkUser?.firstName ?? ""} ${clerkUser?.lastName ?? ""}`.trim(),
        },
      })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    const buffer = await file.arrayBuffer()
    const fileName = `linkedin-profile-${Date.now()}.pdf`

    // ✅ Save record linked to the DB user
    const linkedinProfile = await prisma.linkedinProfile.create({
      data: {
        userId: dbUser.id, // safe now
        profilePdf: fileName,
        lastAnalyzed: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      profileId: linkedinProfile.id,
      message: "PDF uploaded successfully",
    })
  } catch (error) {
    console.error("PDF upload error:", error)
    return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 })
  }
}
