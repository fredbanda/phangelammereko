import { type NextRequest, NextResponse } from "next/server"

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ orderId: string } >}) {
  try {
    const { orderId } = await params
    const { consultationStatus } = await request.json()

    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Validate the status value
    // 3. Update the order status in the database
    // 4. Update timestamps (deliveredAt if completed)
    // 5. Send notifications to client and consultant
    // 6. Update consultant workload if completed/cancelled

    console.log(`Updating order ${orderId} status to: ${consultationStatus}`)

    // Mock database update
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updates: any = {
      consultationStatus,
      updatedAt: new Date().toISOString(),
    }

    if (consultationStatus === "COMPLETED") {
      updates.deliveredAt = new Date().toISOString()
    }

    return NextResponse.json({
      success: true,
      message: "Order status updated successfully",
      updates,
    })
  } catch (error) {
    console.error("Failed to update order status:", error)
    return NextResponse.json({ success: false, error: "Failed to update order status" }, { status: 500 })
  }
}
