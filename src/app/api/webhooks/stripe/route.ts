/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/webhooks/stripe/route.ts

import stripe from "@/lib/stripe"
import prisma from "@/utils/prisma"
import { headers } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const body = await request.text()
  const headerList = await headers()
  const signature = headerList.get("Stripe-Signature") as string

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error) {
    console.error("❌ Error constructing event:", error)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  // if (event.type === "checkout.session.completed") {
  //   const session = event.data.object as any

  //   try {
  //     if (session.metadata?.orderId) {
  //       // Update existing order
  //       await prisma.consultationOrder.update({
  //         where: { id: session.metadata.orderId },
  //         data: {
  //           paymentStatus: "PAID",
  //           consultationStatus: "COMPLETED",
  //           stripeSessionId: session.id,
  //           paymentIntentId: session.payment_intent,
  //           updatedAt: new Date(),
  //         },
  //       })
  //       console.log(`✅ Updated order ${session.metadata.orderId}`)
  //     } else if (session.metadata?.orderData) {
  //       // Create new order (fallback)
  //       const orderData = JSON.parse(session.metadata.orderData)
  //       await prisma.consultationOrder.create({
  //         data: {
  //           clientName: orderData.clientName,
  //           clientEmail: orderData.clientEmail,
  //           requirements: orderData.requirements || [],
  //           amount: orderData.amount,
  //           currency: orderData.currency,
  //           paymentStatus: "PAID",
  //           consultationStatus: "COMPLETED",
  //           stripeSessionId: session.id,
  //           paymentIntentId: session.payment_intent,
  //         },
  //       })
  //       console.log("✅ Created new order from webhook")
  //     }
  //   } catch (err) {
  //     console.error("❌ Error handling checkout.session.completed:", err)
  //   }
  // }

  return NextResponse.json({ received: true })
}