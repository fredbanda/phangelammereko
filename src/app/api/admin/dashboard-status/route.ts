// /api/admin/dashboard/stats/route.ts
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "monthly"

    // Calculate date range based on timeRange parameter
    const now = new Date()
    let startDate: Date
    let previousPeriodStart: Date

    switch (timeRange) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        previousPeriodStart = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
        break
      case "quarterly":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        previousPeriodStart = new Date(now.getFullYear(), quarterStart - 3, 1)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        previousPeriodStart = new Date(now.getFullYear() - 1, 0, 1)
        break
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
        break
    }

    // Get current period data
    const [
      totalOrders,
      completedOrders,
      revenueData,
      activeConsultantsData,
      pendingOrders,
      previousPeriodRevenue
    ] = await Promise.all([
      // Total orders in current period
      prisma.consultationOrder.count({
        where: {
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Completed orders in current period
      prisma.consultationOrder.count({
        where: {
          consultationStatus: "COMPLETED",
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Revenue data for current period
      prisma.consultationOrder.aggregate({
        where: {
          paymentStatus: "PAID",
          consultationStatus: "COMPLETED",
          createdAt: {
            gte: startDate,
          },
        },
        _sum: {
          amount: true,
        },
        _avg: {
          amount: true,
        },
      }),

      // Active consultants (consultants with orders in current period)
      prisma.consultationOrder.findMany({
        where: {
          consultantId: { not: null },
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          consultantId: true,
        },
        distinct: ['consultantId'],
      }),

      // Pending orders (unassigned)
      prisma.consultationOrder.count({
        where: {
          consultantId: null,
          consultationStatus: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
        },
      }),

      // Previous period revenue for growth calculation
      prisma.consultationOrder.aggregate({
        where: {
          paymentStatus: "PAID",
          consultationStatus: "COMPLETED",
          createdAt: {
            gte: previousPeriodStart,
            lt: startDate,
          },
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    const totalRevenue = revenueData._sum.amount || 0
    const averageOrderValue = revenueData._avg.amount || 0
    const activeConsultants = activeConsultantsData.length
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    
    // Calculate monthly growth
    const previousRevenue = previousPeriodRevenue._sum.amount || 0
    const monthlyGrowth = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0

    // Get average customer satisfaction from consultant ratings
    const satisfactionData = await prisma.consultant.aggregate({
      _avg: {
        averageRating: true,
      },
    })

    const stats = {
      totalRevenue,
      totalOrders,
      activeConsultants,
      completionRate,
      averageOrderValue,
      pendingOrders,
      monthlyGrowth: Math.round(monthlyGrowth * 10) / 10,
      customerSatisfaction: satisfactionData._avg.averageRating || 4.5,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}