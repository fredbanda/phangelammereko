import prisma from "@/utils/prisma"
import { type NextRequest, NextResponse } from "next/server"


export async function POST(request: NextRequest) {
  try {
    const orderData = await request.json()

    // Validate required fields
    if (!orderData.personalInfo || !orderData.requirements || !orderData.payment) {
      return NextResponse.json({ error: "Missing required order data" }, { status: 400 })
    }

    // TODO: Process payment with Stripe or other payment provider
    // For now, we'll simulate successful payment processing

    // Create user if doesn't exist
    let user = await prisma.user.findUnique({
      where: { email: orderData.personalInfo.email },
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: orderData.personalInfo.email,
          name: `${orderData.personalInfo.firstName} ${orderData.personalInfo.lastName}`,
        },
      })
    }

    // Create consultation order
    const consultationOrder = await prisma.consultationOrder.create({
      data: {
        userId: user.id,
        amount: orderData.amount,
        currency: orderData.currency,
        consultationType: "linkedin_optimization",
        requirements: {
          personalInfo: orderData.personalInfo,
          requirements: orderData.requirements,
          urgency: orderData.requirements.urgency,
        },
        status: "PENDING",
        paymentStatus: "PAID", // Simulating successful payment
        paymentId: `payment_${Date.now()}`, // Simulated payment ID
      },
    })

    // TODO: Send confirmation email
    // TODO: Notify admin team of new order
    // TODO: Schedule consultation based on urgency

    return NextResponse.json({
      success: true,
      orderId: consultationOrder.id,
      message: "Order created successfully",
      nextSteps: {
        consultation: "You will be contacted within 24 hours to schedule your consultation",
        delivery: `Your optimized profile will be delivered within ${getDeliveryTimeframe(orderData.requirements.urgency)}`,
      },
    })
  } catch (error) {
    console.error("Create order error:", error)
    return NextResponse.json(
      {
        error: "Failed to create order",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

function getDeliveryTimeframe(urgency: string): string {
  switch (urgency) {
    case "urgent":
      return "1-2 business days"
    case "priority":
      return "3-4 business days"
    default:
      return "5-7 business days"
  }
}
