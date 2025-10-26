import { type NextRequest, NextResponse } from "next/server"

<<<<<<< HEAD
export async function GET(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params
=======
export async function GET(
  request: NextRequest, 
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await the params Promise
    const { orderId } = await params
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b

    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Query the database for the specific order
    // 3. Include consultant and user information

    // Mock response
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
    }

    return NextResponse.json({
      success: true,
      order,
    })
  } catch (error) {
    console.error("Failed to fetch order:", error)
<<<<<<< HEAD
    return NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: { orderId: string } }) {
  try {
    const { orderId } = params
=======
    return NextResponse.json(
      { success: false, error: "Failed to fetch order" }, 
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest, 
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    // Await the params Promise
    const { orderId } = await params
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b
    const updates = await request.json()

    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Validate the update data
    // 3. Update the order in the database
    // 4. Send notifications if status changed
    // 5. Update consultant workload if assignment changed

    console.log(`Updating order ${orderId} with:`, updates)

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
    })
  } catch (error) {
    console.error("Failed to update order:", error)
<<<<<<< HEAD
    return NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 })
  }
}
=======
    return NextResponse.json(
      { success: false, error: "Failed to update order" }, 
      { status: 500 }
    )
  }
}
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b
