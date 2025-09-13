import { auth } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } else {
    try {
      const { orderId } = await context.params;
      const { consultantId, consultantNotes, consultationStatus } =
        await request.json();

      // In a real app, you would:
      // 1. Verify admin authentication
      // 2. Validate consultant exists and is available
      // 3. Check consultant capacity
      // 4. Update the order with consultant assignment
      // 5. Update consultant's current workload
      // 6. Send assignment notifications
      // 7. Update order status to IN_PROGRESS

      console.log(`Assigning order ${orderId} to consultant ${consultantId}`);

      const updates = {
        consultantId,
        consultantNotes: consultantNotes || "",
        consultationStatus: consultationStatus || "IN_PROGRESS",
        updatedAt: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        message: "Order assigned successfully",
        updates,
      });
    } catch (error) {
      console.error("Failed to assign order:", error);
      return NextResponse.json(
        { success: false, error: "Failed to assign order" },
        { status: 500 },
      );
    }
  }
}