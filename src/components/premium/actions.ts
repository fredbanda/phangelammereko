/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { currentUser } from "@clerk/nextjs/server";
import stripe from "@/lib/stripe";

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

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      customer_email: user.emailAddresses[0].emailAddress,

      metadata: {
        userId: user.id,
        ...(orderData?.orderId && { orderId: orderData.orderId }),
        ...(orderData && { orderData: JSON.stringify(orderData) }),
      },

      ...(isRecurring && {
        subscription_data: {
          metadata: {
            userId: user.id,
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

    return { url: session.url };
  } catch (error) {
    console.error("Checkout session error:", error);
    return { error: "Failed to create checkout session" };
  }
}
