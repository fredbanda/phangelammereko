/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const timeRange = searchParams.get("timeRange") || "monthly"
    const sortBy = searchParams.get("sortBy") || "newest"

    const now = new Date()
    let startDate: Date | undefined

    switch (timeRange) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "custom":
        // For custom range, we'd need additional parameters
        break
      default:
        startDate = undefined
    }

    const whereClause: any = {}

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate,
      }
    }

    // Search filter - enhanced to search client name and email
    if (search) {
      whereClause.OR = [
        {
          clientName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          clientEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          id: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    // Status filter
    if (status !== "all") {
      whereClause.status = status
    }

    // Sort order
    let orderBy: any = { createdAt: "desc" }
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "status":
        orderBy = { status: "asc" }
        break
      case "amount":
        orderBy = { amount: "desc" }
        break
    }

    const orders = await prisma.consultationOrder.findMany({
      where: whereClause,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        consultant: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      status: order.paymentStatus,
      amount: order.amount,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      consultant: order.consultant
        ? {
            name: order.consultant.name,
            email: order.consultant.email,
          }
        : undefined,
      requirements: order.requirements || [],
    }))

    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}
