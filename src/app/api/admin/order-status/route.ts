// /api/admin/dashboard/order-status/route.ts
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "monthly"

    // Calculate date range
    const now = new Date()
    let startDate: Date

    switch (timeRange) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "quarterly":
        const quarterStart = Math.floor(now.getMonth() / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "monthly":
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
    }

    // Get order counts by status
    const [
      unassignedCount,
      pendingCount,
      inProgressCount,
      completedCount,
      cancelledCount
    ] = await Promise.all([
      // Unassigned orders (no consultant assigned)
      prisma.consultationOrder.count({
        where: {
          consultantId: null,
          consultationStatus: {
            notIn: ["COMPLETED", "CANCELLED"],
          },
          createdAt: {
            gte: startDate,
          },
        },
      }),

      // Pending orders (assigned but not started)
      prisma.consultationOrder.count({
        where: {
          consultationStatus: "PENDING",
          consultantId: { not: null },
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

      // Completed orders
      prisma.consultationOrder.count({
        where: {
          consultationStatus: "COMPLETED",
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
    ])

    // Define colors for different statuses
    const data = [
      {
        status: "Unassigned",
        count: unassignedCount,
        color: "#ef4444", // red-500
      },
      {
        status: "Pending",
        count: pendingCount,
        color: "#f59e0b", // amber-500
      },
      {
        status: "In Progress",
        count: inProgressCount,
        color: "#3b82f6", // blue-500
      },
      {
        status: "Completed",
        count: completedCount,
        color: "#10b981", // emerald-500
      },
      {
        status: "Cancelled",
        count: cancelledCount,
        color: "#6b7280", // gray-500
      },
    ].filter(item => item.count > 0) // Only include statuses that have orders

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching order status data:", error)
    return NextResponse.json({ error: "Failed to fetch order status data" }, { status: 500 })
  }
}
