/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/webhooks/stripe/route.ts
import stripe from "@/lib/stripe";
import prisma from "@/utils/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

// Helper function to update order status
async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentIntentId: any,
) {
  try {
    await prisma.consultationOrder.update({
      where: { id: orderId },
      data: {
        paymentStatus: status === "completed" ? "PAID" : "PENDING",
        consultationStatus: status === "completed" ? "IN_PROGRESS" : "PENDING",
        paymentId: typeof paymentIntentId === "string" ? paymentIntentId : null,
        updatedAt: new Date(),
      },
    });
    console.log(`✅ Order ${orderId} updated to ${status}`);
  } catch (error) {
    console.error(`❌ Error updating order ${orderId}:`, error);
    throw error;
  }
}

// Helper function to save order to database
async function saveOrderToDatabase(data: any) {
  try {
    let userId = data.userId;

    // If no userId, try to find or create user by email
    if (!userId && data.clientEmail) {
      let user = await prisma.user.findUnique({
        where: { email: data.clientEmail },
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            email: data.clientEmail,
            name: data.clientName || "Unknown",
          },
        });
      }
      userId = user.id;
    }

    if (!userId) {
      throw new Error("Unable to determine userId for order creation");
    }

    const order = await prisma.consultationOrder.create({
      data: {
        userId,
        clientName: data.clientName,
        clientEmail: data.clientEmail,
        requirements: data.requirements || {},
        amount: data.amount,
        currency: data.currency || "ZAR",
        paymentStatus: data.status === "completed" ? "PAID" : "PENDING",
        consultationStatus:
          data.status === "completed" ? "IN_PROGRESS" : "PENDING",
        paymentId: data.paymentIntentId || null,
      },
    });

    console.log(`✅ Order created: ${order.id}`);
    return order;
  } catch (error) {
    console.error("❌ Error saving order to database:", error);
    throw error;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!,
    );
  } catch (error) {
    console.error("❌ Error constructing event:", error);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;

    try {
      let orderData = null;

      if (session.metadata?.orderData) {
        try {
          orderData = JSON.parse(session.metadata.orderData);
        } catch (err) {
          console.error("❌ Failed to parse orderData", err);
        }
      }

      if (session.metadata?.orderId) {
        // ✅ Update existing order
        await updateOrderStatus(
          session.metadata.orderId,
          "completed",
          session.payment_intent,
        );
      } else if (orderData) {
        // ✅ Create new order with confirmed payment
        await saveOrderToDatabase({
          ...orderData,
          status: "completed",
          userId: session.metadata?.userId,
          paymentIntentId: session.payment_intent,
          stripeSessionId: session.id,
        });
      }
    } catch (err) {
      console.error("❌ Error handling checkout.session.completed", err);
    }
  }

  return NextResponse.json({ received: true });
}
