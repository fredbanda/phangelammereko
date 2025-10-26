import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    // Await params in Next.js 15
    const { orderId } = await params;
    const { paymentStatus } = await request.json();

    console.log(
      `Updating order ${orderId} payment status to: ${paymentStatus}`,
    );

    // TODO: Update order in your database here
    // await db.order.update({ where: { id: orderId }, data: { paymentStatus } });

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
    });
  } catch (error) {
    console.error("Failed to update payment status:", error);

    return NextResponse.json(
      { success: false, error: "Failed to update payment status" },
      { status: 500 },
    );
  }
}
