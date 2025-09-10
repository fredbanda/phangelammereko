import prisma from "@/utils/prisma"
import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { consultantId } = await request.json()

    // Check if consultant is available

    const consultant = await prisma.consultant.findUnique({
      where: { id: consultantId },
      include: {
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

    if (!consultant) {
      return NextResponse.json({ error: "Consultant not found" }, { status: 404 })
    }

    if (!consultant.isActive) {
      return NextResponse.json({ error: "Consultant is not active" }, { status: 400 })
    }

    if (consultant._count.consultationOrders >= consultant.maxOrders) {
      return NextResponse.json({ error: "Consultant has reached maximum capacity" }, { status: 400 })
    }

    // Assign the order
    const updatedOrder = await prisma.consultationOrder.update({
      where: { id: params.id },
      data: {
        consultantId,
        status: "IN_PROGRESS",
      },
      include: {
        consultant: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Order assigned successfully",
      order: updatedOrder,
    })
  } catch (error) {
    console.error("Error assigning order:", error)
    return NextResponse.json({ error: "Failed to assign order" }, { status: 500 })
  }
}
