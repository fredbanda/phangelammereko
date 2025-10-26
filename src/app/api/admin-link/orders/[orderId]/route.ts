import { type NextRequest, NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { orderId } = await context.params;

    const order = {
      id: orderId,
      clientName: "John Smith",
      clientEmail: "john.smith@email.com",
      consultationType: "linkedin_optimization",
      amount: 200000,
      currency: "ZAR",
      consultationStatus: "PENDING",
      paymentStatus: "PAID",
      createdAt: "2024-01-15T10:00:00Z",
      updatedAt: "2024-01-15T10:00:00Z",
      requirements: "Need help with LinkedIn headline and summary optimization",
    };

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Failed to fetch order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { orderId } = await context.params;
    const updates = await request.json();

    console.log(`Updating order ${orderId} with:`, updates);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    });
  } catch (error) {
    console.error("Failed to update order:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update order" },
      { status: 500 },
    );
  }
}
