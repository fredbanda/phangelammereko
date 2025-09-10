import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "monthly"

    // Calculate date range based on timeRange parameter
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Get order statistics
    const [totalOrders, paidOrders, inProgressOrders, cancelledOrders, completedOrders, revenueData] =
      await Promise.all([
        // Total orders in time range
        prisma.consultationOrder.count({
          where: {
            createdAt: {
              gte: startDate,
            },
          },
        }),

        // Paid orders
        prisma.consultationOrder.count({
          where: {
            paymentStatus: "PAID",
            createdAt: {
              gte: startDate,
            },
          },
        }),

        // In progress orders
        prisma.consultationOrder.count({
          where: {
            consultationStatus: "IN_PROGRESS",
            createdAt: {
              gte: startDate,
            },
          },
        }),

        // Cancelled orders
        prisma.consultationOrder.count({
          where: {
            consultationStatus: "CANCELLED",
            createdAt: {
              gte: startDate,
            },
          },
        }),

        // Completed orders
        prisma.consultationOrder.count({
          where: {
            consultationStatus: "COMPLETED",
            createdAt: {
              gte: startDate,
            },
          },
        }),

        // Revenue data
        prisma.consultationOrder.aggregate({
          where: {
            paymentStatus: {
              in: ["PAID"],
              
            },
            consultationStatus: {
                in: ["COMPLETED"],
            },
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
      ])

    const totalRevenue = revenueData._sum.amount || 0
    const averageOrderValue = revenueData._avg.amount || 0
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0

    const stats = {
      totalOrders,
      paidOrders,
      inProgressOrders,
      cancelledOrders,
      completedOrders,
      totalRevenue,
      averageOrderValue,
      completionRate,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching order stats:", error)
    return NextResponse.json({ error: "Failed to fetch order statistics" }, { status: 500 })
  }
}
