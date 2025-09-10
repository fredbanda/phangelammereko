import { NextResponse } from "next/server"
import  prisma  from "@/utils/prisma"

export async function GET() {
  try {
    const statusCounts = await prisma.consultationOrder.groupBy({
        by: ["consultationStatus"],
        _count: {
          consultationStatus: true,
        },
    })

    const statusColors = {
      PENDING: "#fbbf24",
      PAID: "#8b5cf6",
      IN_PROGRESS: "#3b82f6",
      COMPLETED: "#10b981",
      CANCELLED: "#ef4444",
    }

    const data = statusCounts.map((item) => ({
      status: item.consultationStatus.toLowerCase().replace("_", " "),
        //count: item._count.consultationStatus,
      color: statusColors[item.consultationStatus as keyof typeof statusColors] || "#6b7280",
    }))

    return NextResponse.json({ data })
  } catch (error) {
    console.error("Error fetching order status data:", error)
    return NextResponse.json({ error: "Failed to fetch order status data" }, { status: 500 })
  }
}
