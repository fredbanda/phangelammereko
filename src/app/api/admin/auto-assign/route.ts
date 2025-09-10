import { NextResponse } from "next/server"
import  prisma  from "@/utils/prisma"

export async function POST() {
  try {
    // Get unassigned orders
    const unassignedOrders = await prisma.consultationOrder.findMany({
      where: {
        consultantId: null,
        status: "PENDING",
      },
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "asc", // Assign older orders first
      },
    })

    // Get available consultants
    const consultants = await prisma.consultant.findMany({
      where: {
        isActive: true,
      },
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

    const assignments = []

    for (const order of unassignedOrders) {
      // Find the best consultant based on:
      // 1. Availability (current orders < max orders)
      // 2. Specializations match (if any requirements specified)
      // 3. Lowest current workload

      const availableConsultants = consultants.filter(
        (consultant) => consultant._count.consultationOrders < consultant.maxOrders,
      )

      if (availableConsultants.length === 0) {
        continue // No available consultants
      }

      // Sort by workload (ascending) and rating (descending)
      const bestConsultant = availableConsultants.sort((a, b) => {
        const workloadDiff = a._count.consultationOrders - b._count.consultationOrders
        if (workloadDiff !== 0) return workloadDiff

        return (b.averageRating || 0) - (a.averageRating || 0)
      })[0]

      // Assign the order
      await prisma.consultationOrder.update({
        where: { id: order.id },
        data: {
          consultantId: bestConsultant.id,
          status: "IN_PROGRESS",
        },
      })

      // Update consultant's current order count
      consultants.find((c) => c.id === bestConsultant.id)!._count.consultationOrders++

      assignments.push({
        orderId: order.id,
        consultantId: bestConsultant.id,
        clientName: order.clientName,
      })
    }

    return NextResponse.json({
      message: `Successfully assigned ${assignments.length} orders`,
      assignments,
    })
  } catch (error) {
    console.error("Error auto-assigning orders:", error)
    return NextResponse.json({ error: "Failed to auto-assign orders" }, { status: 500 })
  }
}
