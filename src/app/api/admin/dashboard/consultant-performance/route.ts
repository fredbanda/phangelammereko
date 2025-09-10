import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/utils/prisma"

export async function GET(request: NextRequest) {
  try {
    const consultants = await prisma.consultant.findMany({
      where: { isActive: true },
      include: {
        consultationOrders: {
          select: {
            status: true,
            amount: true,
          },
        },
        _count: {
          select: {
            consultationOrders: {
              where: {
                status: "IN_PROGRESS",
              },
            },
          },
        },
      },
    })

    const performance = consultants.map((consultant) => {
      const orders = consultant.consultationOrders
      const completedOrders = orders.filter((o) => o.status === "COMPLETED").length
      const totalOrders = orders.length
      const revenue = orders.filter((o) => o.status === "COMPLETED").reduce((sum, o) => sum + o.amount, 0)

      return {
        id: consultant.id,
        name: consultant.name,
        avatar: consultant.avatar,
        totalOrders,
        completedOrders,
        averageRating: consultant.averageRating || 0,
        revenue,
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
        currentWorkload: consultant._count.consultationOrders,
        maxCapacity: consultant.maxOrders,
      }
    })

    // Sort by revenue descending
    performance.sort((a, b) => b.revenue - a.revenue)

    return NextResponse.json({ performance })
  } catch (error) {
    console.error("Error fetching consultant performance:", error)
    return NextResponse.json({ error: "Failed to fetch consultant performance" }, { status: 500 })
  }
}
