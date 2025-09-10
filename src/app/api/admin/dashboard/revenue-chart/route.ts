import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/utils/prisma"
import { format, subDays, eachDayOfInterval } from "date-fns"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get("timeRange") || "monthly"

    const now = new Date()
    let days = 30
    let dateFormat = "MMM dd"

    switch (timeRange) {
      case "weekly":
        days = 7
        dateFormat = "EEE"
        break
      case "quarterly":
        days = 90
        dateFormat = "MMM dd"
        break
      case "yearly":
        days = 365
        dateFormat = "MMM"
        break
    }

    const startDate = subDays(now, days)
    const dateRange = eachDayOfInterval({ start: startDate, end: now })

    const orders = await prisma.consultationOrder.findMany({
      where: {
        paymentStatus: "PAID",
        consultationStatus: "COMPLETED",
        createdAt: { gte: startDate },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    })

    const data = dateRange.map((date) => {
      const dayOrders = orders.filter((order) => format(order.createdAt, "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

      return {
        date: format(date, dateFormat),
        revenue: dayOrders.reduce((sum, order) => sum + order.amount, 0),
        orders: dayOrders.length,
      }
    })

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching revenue chart data:", error)
    return NextResponse.json({ error: "Failed to fetch revenue chart data" }, { status: 500 })
  }
}
