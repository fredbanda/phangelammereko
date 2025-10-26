import { type NextRequest, NextResponse } from "next/server"

<<<<<<< HEAD
export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params
=======
export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await the params Promise
    const { orderId } = await params
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b
    const { paymentStatus } = await request.json()

    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Validate the payment status
    // 3. Update the payment status in the database
    // 4. Handle refund processing if status is REFUNDED
    // 5. Send payment confirmation emails
    // 6. Update financial records

    console.log(`Updating order ${orderId} payment status to: ${paymentStatus}`)

    return NextResponse.json({
      success: true,
      message: "Payment status updated successfully",
    })
  } catch (error) {
    console.error("Failed to update payment status:", error)
<<<<<<< HEAD
    return NextResponse.json({ success: false, error: "Failed to update payment status" }, { status: 500 })
  }
}
=======
    return NextResponse.json(
      { success: false, error: "Failed to update payment status" }, 
      { status: 500 }
    )
  }
}
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b
