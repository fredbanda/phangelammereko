/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payfast/webhook/route.ts
import { NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/utils/prisma"
import { payfast } from "@/lib/payfast"

export async function POST(request: NextRequest) {
  try {
    const headersList = await headers()
    const contentType = headersList.get('content-type')

    // PayFast sends form data
    let pfData: Record<string, string> = {}
    
    if (contentType?.includes('application/x-www-form-urlencoded')) {
      const formData = await request.formData()
      for (const [key, value] of formData.entries()) {
        pfData[key] = value.toString()
      }
    } else {
      // Fallback for JSON (though PayFast typically sends form data)
      pfData = await request.json()
    }

    console.log('PayFast notification received:', pfData)

    // Validate the payment notification
    const validation = await payfast.validatePaymentNotification(pfData)
    
    if (!validation.isValid) {
      console.error('Invalid PayFast notification')
      return NextResponse.json({ error: 'Invalid notification' }, { status: 400 })
    }

    const { orderId, paymentStatus, amount } = validation

    if (!orderId) {
      console.error('No order ID found in PayFast notification')
      return NextResponse.json({ error: 'No order ID' }, { status: 400 })
    }

    // Find the order in database
    const order = await prisma.consultationOrder.findUnique({
      where: { id: orderId },
      include: { user: true }
    })

    if (!order) {
      console.error(`Order ${orderId} not found`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Update order based on payment status
    let updateData: any = {
      updatedAt: new Date(),
    }

    switch (paymentStatus) {
      case 'COMPLETE':
        updateData = {
          ...updateData,
          paymentStatus: 'PAID',
          consultationStatus: 'PENDING', // Ready for consultant assignment
        }
        
        // Log successful payment
        console.log(`Payment completed for order ${orderId}, amount: ${amount}`)
        
        // Here you could add additional logic like:
        // - Send confirmation email to client
        // - Notify admins about new paid order
        // - Create notification for consultant assignment
        
        break
        
      case 'FAILED':
      case 'CANCELLED':
        updateData = {
          ...updateData,
          paymentStatus: 'FAILED',
        }
        console.log(`Payment failed/cancelled for order ${orderId}`)
        break
        
      default:
        console.log(`Unknown payment status: ${paymentStatus} for order ${orderId}`)
        break
    }

    // Update the order
    const updatedOrder = await prisma.consultationOrder.update({
      where: { id: orderId },
      data: updateData,
    })

    console.log(`Order ${orderId} updated:`, updateData)

    // Send email notifications (optional - you can implement this)
    if (paymentStatus === 'COMPLETE') {
      await sendPaymentConfirmationEmail(updatedOrder)
      await notifyAdminOfNewOrder(updatedOrder)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('PayFast webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

// Helper functions for email notifications (implement as needed)
async function sendPaymentConfirmationEmail(order: any) {
  // Implement email sending logic here
  // You can use services like SendGrid, AWS SES, or Resend
  console.log(`Sending confirmation email to ${order.clientEmail}`)
}

async function notifyAdminOfNewOrder(order: any) {
  // Implement admin notification logic here
  console.log(`New paid order received: ${order.id}`)
}

// Ensure the webhook endpoint accepts POST requests only
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 })
}