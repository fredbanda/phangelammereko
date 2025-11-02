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
    // ✅ STEP 1: Sync Clerk user with database
    console.log("👤 Syncing user:", user.emailAddresses[0].emailAddress);
    
    const dbUser = await prisma.user.upsert({
      where: { email: user.emailAddresses[0].emailAddress },
      update: {
        name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
        photoUrl: user.imageUrl || null,
        updatedAt: new Date(),
      },
      create: {
        email: user.emailAddresses[0].emailAddress,
        name: user.fullName || `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        phone: user.phoneNumbers[0]?.phoneNumber || null,
        photoUrl: user.imageUrl || null,
      },
    });

    console.log("✅ Database user synced:", dbUser.id);

    // ✅ STEP 2: Get Stripe price
    const price = await stripe.prices.retrieve(priceId);
    const isRecurring = !!price.recurring;

    // ✅ STEP 3: Extract requirements
    const requirements = orderData?.requirements || {};
    console.log("📝 Creating order with requirements:", JSON.stringify(requirements, null, 2));

    // ✅ STEP 4: Create order with DATABASE user ID
    const order = await prisma.consultationOrder.create({
      data: {
        userId: dbUser.id, // ← Use database user ID, not Clerk ID
        clientName: orderData?.clientName || dbUser.name || user.emailAddresses[0].emailAddress,
        clientEmail: orderData?.clientEmail || user.emailAddresses[0].emailAddress,
        requirements: requirements,
        amount: price.unit_amount || 0,
        currency: price.currency?.toUpperCase() || "ZAR",
        paymentStatus: "PENDING",
        consultationStatus: "PENDING",
      },
    });
    
    console.log("✅ Order created with ID:", order.id);
    console.log("✅ Order requirements saved:", JSON.stringify(order.requirements, null, 2));

    // ✅ STEP 5: Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: isRecurring ? "subscription" : "payment",
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/cancel`,
      customer_email: user.emailAddresses[0].emailAddress,

      metadata: {
        clerkUserId: user.id, // Store Clerk ID for reference
        dbUserId: dbUser.id,   // Store database ID
        orderId: order.id,
      },

      ...(isRecurring && {
        subscription_data: {
          metadata: {
            clerkUserId: user.id,
            dbUserId: dbUser.id,
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
    
    // Better error logging
    if (error instanceof Error) {
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
    }
    
    return { error: "Failed to create checkout session" };
  }
}