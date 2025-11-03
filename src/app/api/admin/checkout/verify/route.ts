import { NextRequest, NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import stripe from "@/lib/stripe";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 },
      );
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 404 });
    }

    // Find the order by session metadata or update based on session info
    let order;

    if (session.metadata?.orderId) {
      // Update existing order
      order = await prisma.consultationOrder.update({
        where: { id: session.metadata.orderId },
        data: {
          paymentStatus: session.payment_status === "paid" ? "PAID" : "PENDING",
          consultationStatus:
            session.payment_status === "paid" ? "IN_PROGRESS" : "PENDING",
          paymentId: (session.payment_intent as string) || null,
          updatedAt: new Date(),
        },
      });
    } else {
      // Try to find order by other means or create if needed
      // This is a fallback in case metadata wasn't set properly
      const orderData = session.metadata?.orderData
        ? JSON.parse(session.metadata.orderData)
        : null;

      if (orderData) {
        // Find or create user
        let userId = session.metadata?.userId;

        if (!userId && orderData.clientEmail) {
          // Try to find user by email
          let user = await prisma.user.findUnique({
            where: { email: orderData.clientEmail },
          });

          // Create user if not found
          if (!user) {
            user = await prisma.user.create({
              data: {
                email: orderData.clientEmail,
                name: orderData.clientName,
              },
            });
          }
          userId = user.id;
        }

        if (!userId) {
          return NextResponse.json(
            { error: "Unable to determine userId for order creation" },
            { status: 400 },
          );
        }

        // Create the order
        order = await prisma.consultationOrder.create({
          data: {
            userId,
            clientName: orderData.clientName,
            clientEmail: orderData.clientEmail,
            requirements: orderData.requirements || {},
            amount: orderData.amount,
            currency: orderData.currency || "ZAR",
            paymentStatus:
              session.payment_status === "paid" ? "PAID" : "PENDING",
            consultationStatus:
              session.payment_status === "paid" ? "IN_PROGRESS" : "PENDING",
            paymentId: (session.payment_intent as string) || null,
          },
        });
      } else {
        return NextResponse.json(
          { error: "Could not find or create order" },
          { status: 404 },
        );
      }
    }

    return NextResponse.json({
      order: {
        id: order.id,
        clientName: order.clientName,
        clientEmail: order.clientEmail,
        amount: order.amount,
        currency: order.currency,
        consultationStatus: order.consultationStatus,
        paymentStatus: order.paymentStatus,
        createdAt: order.createdAt.toISOString(),
      },
      session: {
        id: session.id,
        payment_status: session.payment_status,
        customer_email: session.customer_details?.email,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    );
  }
}
