import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/utils/prisma" // Adjust path based on your Prisma setup

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Query all consultants with relevant fields
    const consultants = await prisma.consultant.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        title: true,
        bio: true,
        specializations: true,
        skills: true,
        experience: true,
        isActive: true,
        maxOrders: true,
        hourlyRate: true,
        totalOrders: true,
        completedOrders: true,
        averageRating: true,
        availability: true,
      },
      orderBy: {
        averageRating: 'desc', // Sort by averageRating in descending order
      },
    })

    return NextResponse.json({
      success: true,
      consultants,
    })
  } catch (error) {
    console.error("Failed to fetch consultants:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch consultants" },
      { status: 500 }
    )
  }
}
