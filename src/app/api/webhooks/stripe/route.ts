/* eslint-disable @typescript-eslint/no-explicit-any */
// /api/webhooks/stripe/route.ts

import stripe from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";


export async function POST(request: Request) {
  const body = await request.text();

  // ✅ call headers() once, then use .get()
  const headerList = await headers();
  const signature = headerList.get("Stripe-Signature") as string;

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error(" ❌ Error constructing event:", error);
    
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
          session.payment_intent
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

async function saveOrderToDatabase(orderData: any) {
  // 👇 Your DB save logic
  // e.g., prisma.order.create({ data: orderData })
  console.log("✅ Saving order:", orderData);
}

async function updateOrderStatus(
  orderId: string,
  status: string,
  paymentIntentId: string
) {
  // 👇 Your DB update logic
  // e.g., prisma.order.update({ where: { id: orderId }, data: { status, paymentIntentId } })
  console.log(`✅ Updating order ${orderId} → ${status}`);
}
