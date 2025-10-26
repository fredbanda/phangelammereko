import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/utils/prisma" // Adjust path based on your Prisma setup

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // Query active consultants with available capacity
    const availableConsultants = await prisma.consultant.findMany({
      where: {
        isActive: true,
        totalOrders: {
          lt: prisma.consultant.fields.maxOrders, // Filter consultants with orders less than maxOrders
        },
      },
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
      orderBy: [
        { averageRating: 'desc' }, // Sort by averageRating in descending order
        { totalOrders: 'asc' },    // Then by totalOrders in ascending order
      ],
    })

    return NextResponse.json({
      success: true,
      consultants: availableConsultants,
    })
  } catch (error) {
    console.error("Failed to fetch available consultants:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch available consultants" },
      { status: 500 }
    )
  }
}