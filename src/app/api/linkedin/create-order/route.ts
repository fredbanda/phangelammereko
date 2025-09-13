import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma";
import { payfast } from "@/lib/payfast";

export async function POST(request: NextRequest) {
  try {
    // Read the request body once and store it
    const body = await request.json();
    console.log(`LinkedIn create order request: ${JSON.stringify(body)}`);

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized: No user ID" }, { status: 401 });
    }

    const user = await currentUser();
    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid user data or missing email" },
        { status: 401 }
      );
    }

    // Ensure user exists in the database
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.emailAddresses[0].emailAddress,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
        photoUrl: user.imageUrl || undefined,
      },
      create: {
        id: user.id,
        email: user.emailAddresses[0].emailAddress, // Required field
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        name: user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : undefined,
        photoUrl: user.imageUrl || undefined,
        phone: undefined,
        address: undefined,
        location: undefined,
        city: undefined,
        country: undefined,
        jobTitle: undefined,
        linkedin: undefined,
        github: undefined,
        twitter: undefined,
        portfolioUrl: undefined,
      },
    });
    console.log(`Database user: ${JSON.stringify(dbUser)}`);

    // Validate required fields
    const { personalInfo, requirements, amount = 200000, currency = "ZAR" } = body;
    if (!personalInfo?.firstName || !personalInfo?.lastName || !personalInfo?.email) {
      return NextResponse.json(
        { error: "Missing required personal information" },
        { status: 400 }
      );
    }

    // Create initial order in database
    const order = await prisma.consultationOrder.create({
      data: {
        userId: dbUser.id, // Use the verified database user ID
        clientName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        clientEmail: personalInfo.email,
        requirements: {
          personalInfo,
          requirements,
          linkedinUrl: personalInfo.linkedinUrl,
          currentRole: requirements?.currentRole,
          targetRole: requirements?.targetRole,
          industry: requirements?.industry,
          experience: requirements?.experience,
          urgency: requirements?.urgency,
          specificRequirements: requirements?.specificRequirements,
        },
        amount: amount,
        currency: currency,
        paymentStatus: "PENDING",
        consultationStatus: "PENDING",
        consultantId: null,
      },
    });
    console.log(`Created order: ${JSON.stringify(order)}`);

    // Create PayFast payment
    const { paymentData, paymentUrl } = payfast.createPayment({
      orderId: order.id,
      clientName: `${personalInfo.firstName} ${personalInfo.lastName}`,
      clientEmail: personalInfo.email,
      clientPhone: personalInfo.phone,
      amount: amount,
      description: `LinkedIn Optimization Consultation - Order #${order.id}`,
    });
    console.log(`Payment data: ${JSON.stringify(paymentData)}`);

    // Update order with payment reference
    await prisma.consultationOrder.update({
      where: { id: order.id },
      data: {
        paymentId: paymentData.m_payment_id,
      },
    });

    return NextResponse.json({
      orderId: order.id,
      paymentData,
      paymentUrl,
      success: true,
    });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Create order error:", error);
    if (error.code === "P2003") {
      return NextResponse.json(
        { error: "Invalid user ID: User does not exist in the database" },
        { status: 400 }
      );
    }
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Email already exists in the database" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create order", details: error.message },
      { status: 500 }
    );
  }
}