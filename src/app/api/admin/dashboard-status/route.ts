import { NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET() {
  try {
    // Get total reports count
    const totalReports = await prisma.linkedinProfile.count()

    // Get active orders count
    const activeOrders = await prisma.consultationOrder.count({
      where: {
        consultationStatus: "IN_PROGRESS",
      },
    })

    // Get average score from optimization reports
    const avgScoreResult = await prisma.optimizationReport.aggregate({
      _avg: {
        overallScore: true,
      },
    })

    // Get total revenue
    const totalRevenueResult = await prisma.consultationOrder.aggregate({
      _sum: {
        amount: true,
      },
    })

    return NextResponse.json({
      totalReports,
      activeOrders,
      avgScore: Math.round(avgScoreResult._avg.overallScore || 0),
      totalRevenue: totalRevenueResult._sum.amount || 0,
    })
  } catch (error) {
    console.error("Dashboard stats error:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
