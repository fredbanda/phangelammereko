import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/utils/prisma" // Adjust path based on your Prisma setup

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get("status")
    const payment = searchParams.get("payment")

    // Build Prisma query with filters
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}
    if (status && status !== "all") {
      where.consultationStatus = status
    }
    if (payment && payment !== "all") {
      where.paymentStatus = payment
    }

    // Query consultation orders with consultant information
    const orders = await prisma.consultationOrder.findMany({
      where,
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        consultationType: true,
        amount: true,
        currency: true,
        consultationStatus: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        consultantId: true,
        requirements: true,
        deliveredAt: true,
        deliveryUrl: true,
        consultantNotes: true,
        consultant: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // Sort by creation date, newest first
      },
    })

    return NextResponse.json({
      success: true,
      orders,
    })
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    return NextResponse.json(
      { success: false, error: "Failed to fetch orders" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    const { clientName, clientEmail, consultationType, amount, currency, requirements, userId } = body
    if (!clientName || !clientEmail || !consultationType || !amount || !currency || !userId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create new consultation order
    const newOrder = await prisma.consultationOrder.create({
      data: {
        clientName,
        clientEmail,
        consultationType,
        amount,
        currency,
        requirements,
        userId,
        consultationStatus: 'PENDING',
        paymentStatus: 'PENDING',
      },
      select: {
        id: true,
        clientName: true,
        clientEmail: true,
        consultationType: true,
        amount: true,
        currency: true,
        consultationStatus: true,
        paymentStatus: true,
        createdAt: true,
        updatedAt: true,
        requirements: true,
        userId: true,
      },
    })

    return NextResponse.json({
      success: true,
      order: newOrder,
    })
  } catch (error) {
    console.error("Failed to create order:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create order" },
      { status: 500 }
    )
  }
}