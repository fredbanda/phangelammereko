import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "monthly"

    const now = new Date()
    let startDate: Date
    let endDate: Date = now

    switch (timeRange) {
      case "weekly":
        startDate = startOfWeek(now)
        endDate = endOfWeek(now)
        break
      case "quarterly":
        startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
        break
      case "yearly":
        startDate = startOfYear(now)
        endDate = endOfYear(now)
        break
      case "monthly":
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
    }

    // Get previous period for comparison
    const periodLength = endDate.getTime() - startDate.getTime()
    const prevStartDate = new Date(startDate.getTime() - periodLength)
    const prevEndDate = new Date(endDate.getTime() - periodLength)

    const [currentRevenue, previousRevenue, totalOrders, activeConsultants, completedOrders, pendingOrders, avgRating] =
      await Promise.all([
        // Current period revenue
        prisma.consultationOrder.aggregate({
          where: {
            paymentStatus: { in: ["PAID"] },
            consultationStatus: { in: ["COMPLETED"] },
            createdAt: { gte: startDate, lte: endDate },
          },
          _sum: { amount: true },
          _avg: { amount: true },
          _count: true,
        }),

        // Previous period revenue for growth calculation
        prisma.consultationOrder.aggregate({
          where: {
                        paymentStatus: { in: ["PAID"] },
            consultationStatus: { in: ["COMPLETED"] },
            createdAt: { gte: prevStartDate, lte: prevEndDate },
          },
          _sum: { amount: true },
        }),

        // Total orders in period
        prisma.consultationOrder.count({
          where: {
            createdAt: { gte: startDate, lte: endDate },
          },
        }),

        // Active consultants
        prisma.consultant.count({
          where: { isActive: true },
        }),

        // Completed orders
        prisma.consultationOrder.count({
          where: {
            consultationStatus: "COMPLETED",
            createdAt: { gte: startDate, lte: endDate },
          },
        }),

        // Pending orders (unassigned)
        prisma.consultationOrder.count({
          where: {
            consultantId: null,
            paymentStatus: "PAID",
          },
        }),

        // Average rating from consultants
        prisma.consultant.aggregate({
          where: { isActive: true },
          _avg: { averageRating: true },
        }),
      ])

    const totalRevenue = currentRevenue._sum.amount || 0
    const prevTotalRevenue = previousRevenue._sum.amount || 0
    const monthlyGrowth = prevTotalRevenue > 0 ? ((totalRevenue - prevTotalRevenue) / prevTotalRevenue) * 100 : 0
    const completionRate = totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
    const averageOrderValue = currentRevenue._avg.amount || 0
    const customerSatisfaction = avgRating._avg.averageRating || 0

    const stats = {
      totalRevenue,
      totalOrders,
      activeConsultants,
      completionRate,
      averageOrderValue,
      pendingOrders,
      monthlyGrowth,
      customerSatisfaction,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ error: "Failed to fetch dashboard stats" }, { status: 500 })
  }
}
