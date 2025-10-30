/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { currentUser } from "@clerk/nextjs/server";
import stripe from "@/lib/stripe";
import prisma from "@/utils/prisma";

export async function createCheckoutSession(priceId: string, orderData?: any) {
  const user = await currentUser();
  if (!user) {
    return {
      error: "Please log in to continue",
      requiresAuth: true,
    };
  }

  try {
    const price = await stripe.prices.retrieve(priceId);
    const isRecurring = !!price.recurring;

    // 🆕 CREATE ORDER BEFORE STRIPE CHECKOUT
    let orderId = orderData?.orderId;
    
    if (!orderId) {
      console.log("📝 Creating order before checkout for user:", user.id);
      
      // Create the order in the database
      const order = await prisma.consultationOrder.create({
        data: {
          userId: user.id,
          clientName: orderData?.clientName || user.fullName || user.emailAddresses[0].emailAddress,
          clientEmail: orderData?.clientEmail || user.emailAddresses[0].emailAddress,
          requirements: orderData?.requirements || {},
          amount: price.unit_amount || 0,
          currency: price.currency?.toUpperCase() || "ZAR",
          paymentStatus: "PENDING",
          consultationStatus: "PENDING",
        },
      });
      
      orderId = order.id;
      console.log("✅ Order created:", orderId);
    }

    // Create Stripe session with orderId
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      customer_email: user.emailAddresses[0].emailAddress,

      metadata: {
        userId: user.id,
        orderId: orderId,  // ✅ Always include orderId now!
        ...(orderData && { orderData: JSON.stringify(orderData) }),
      },

      ...(isRecurring && {
        subscription_data: {
          metadata: {
            userId: user.id,
            orderId: orderId,  // ✅ Also include in subscription metadata
          },
        },
        consent_collection: {
          terms_of_service: "required",
        },
      }),
    });

    if (!session.url) {
      return { error: "Error creating checkout session" };
    }

    console.log("✅ Checkout session created:", session.id, "for order:", orderId);

    return { url: session.url, orderId: orderId };
  } catch (error) {
    console.error("Checkout session error:", error);
    return { error: "Failed to create checkout session" };
  }
}