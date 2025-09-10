import { NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET() {
  try {
    const recentReports = await prisma.optimizationReport.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        profile: {
          select: {
            fullName: true,
            headline: true,
          },
        },
      },
    })

    return NextResponse.json(recentReports)
  } catch (error) {
    console.error("Recent reports error:", error)
    return NextResponse.json({ error: "Failed to fetch recent reports" }, { status: 500 })
  }
}
