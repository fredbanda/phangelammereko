import { NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET() {
  try {
    const recentOrders = await prisma.consultationOrder.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(recentOrders)
  } catch (error) {
    console.error("Recent orders error:", error)
    return NextResponse.json({ error: "Failed to fetch recent orders" }, { status: 500 })
  }
}
