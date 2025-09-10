import { NextResponse } from "next/server"
import  prisma  from "@/utils/prisma"

export async function GET() {
  try {
    const orders = await prisma.consultationOrder.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        consultant: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            specializations: true,
            maxOrders: true,
            _count: {
              select: {
                consultationOrders: {
                  where: {
                    consultationStatus: "IN_PROGRESS",
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const assignments = orders.map((order) => ({
      id: order.id,
      orderId: order.id,
      consultantId: order.consultantId,
      assignedAt: order.consultantId ? order.updatedAt.toISOString() : null,
      status: order.consultantId
        ? order.consultationStatus === "COMPLETED"
          ? "completed"
          : order.consultationStatus === "IN_PROGRESS"
            ? "in_progress"
            : "assigned"
        : "unassigned",
      priority: "medium", // You can add priority logic based on order age, amount, etc.
      order: {
        id: order.id,
        clientName: order.clientName,
        clientEmail: order.clientEmail,
        amount: order.amount,
        requirements: (order.requirements as string[]) || [],
        createdAt: order.createdAt.toISOString(),
      },
      consultant: order.consultant
        ? {
            id: order.consultant.id,
            name: order.consultant.name,
            email: order.consultant.email,
            avatar: order.consultant.avatar,
            specializations: (order.consultant.specializations as string[]) || [],
            currentOrders: order.consultant._count.consultationOrders,
            maxOrders: order.consultant.maxOrders,
          }
        : undefined,
    }))

    return NextResponse.json({ assignments })
  } catch (error) {
    console.error("Error fetching assignments:", error)
    return NextResponse.json({ error: "Failed to fetch assignments" }, { status: 500 })
  }
}
