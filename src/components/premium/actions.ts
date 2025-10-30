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

    // Extract requirements properly
    const requirements = orderData?.requirements || {};
    
    console.log("📝 Creating order with requirements:", JSON.stringify(requirements, null, 2));

    // CREATE ORDER BEFORE STRIPE CHECKOUT
    const order = await prisma.consultationOrder.create({
      data: {
        userId: user.id,
        clientName: orderData?.clientName || user.fullName || user.emailAddresses[0].emailAddress,
        clientEmail: orderData?.clientEmail || user.emailAddresses[0].emailAddress,
        requirements: requirements, // ✅ This should now have all the data
        amount: price.unit_amount || 0,
        currency: price.currency?.toUpperCase() || "ZAR",
        paymentStatus: "PENDING",
        consultationStatus: "PENDING",
      },
    });
    
    console.log("✅ Order created with ID:", order.id);
    console.log("✅ Order requirements saved:", JSON.stringify(order.requirements, null, 2));

    // Create Stripe session with orderId
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      customer_email: user.emailAddresses[0].emailAddress,

      metadata: {
        userId: user.id,
        orderId: order.id,
        // Don't include orderData in metadata anymore - it's already saved in DB
      },

      ...(isRecurring && {
        subscription_data: {
          metadata: {
            userId: user.id,
            orderId: order.id,
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

    console.log("✅ Checkout session created:", session.id, "for order:", order.id);

    return { url: session.url, orderId: order.id };
  } catch (error) {
    console.error("❌ Checkout session error:", error);
    return { error: "Failed to create checkout session" };
  }
}
