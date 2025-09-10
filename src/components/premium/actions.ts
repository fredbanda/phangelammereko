"use server";

import { currentUser } from "@clerk/nextjs/server";
import stripe from "@/lib/stripe";

export async function createCheckoutSession(priceId: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error("Unauthorized user");
  }

  // Look up price details from Stripe
  const price = await stripe.prices.retrieve(priceId);
  const isRecurring = !!price.recurring;

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    mode: isRecurring ? "subscription" : "payment", // 👈 switch here
    success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing/success`,
    cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/billing`,
    customer_email: user.emailAddresses[0].emailAddress,
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
    throw new Error("Error creating checkout session");
  }

  return session.url;
}
