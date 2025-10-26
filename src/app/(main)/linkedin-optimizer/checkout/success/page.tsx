/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, Mail, Phone, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"
import prisma from "@/utils/prisma"
import stripe from "@/lib/stripe"

interface SuccessPageProps {
  searchParams?: Promise<{
    orderId?: string
    session_id?: string
  }>;
}

<<<<<<< HEAD
async function getOrderFromStripeSession(sessionId: string) {
  try {
    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    
    if (!session) {
      return null
    }

    // Find or update order based on session
    let order
    
    if (session.metadata?.orderId) {
      // Update existing order
      order = await prisma.consultationOrder.update({
        where: { id: session.metadata.orderId },
        data: {
          paymentStatus: session.payment_status === "paid" ? "completed" : "pending",
          status: session.payment_status === "paid" ? "confirmed" : "pending",
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent as string || null,
          updatedAt: new Date(),
        },
        include: { user: true },
      })
    } else if (session.metadata?.orderData) {
      // Create order from session metadata (fallback)
      const orderData = JSON.parse(session.metadata.orderData)
      order = await prisma.consultationOrder.create({
        data: {
          clientName: orderData.clientName,
          clientEmail: orderData.clientEmail,
          requirements: orderData.requirements || [],
          amount: orderData.amount,
          currency: orderData.currency,
          paymentStatus: session.payment_status === "paid" ? "completed" : "pending",
          status: session.payment_status === "paid" ? "confirmed" : "pending",
          stripeSessionId: session.id,
          paymentIntentId: session.payment_intent as string || null,
        },
        include: { user: true },
      })
    }

    return order
  } catch (error) {
    console.error("Error retrieving order from Stripe session:", error)
    return null
  }
}
=======
// async function getOrderFromStripeSession(sessionId: string) {
//   try {
//     // Get session from Stripe
//     const session = await stripe.checkout.sessions.retrieve(sessionId)
    
//     if (!session) {
//       return null
//     }

//     // Find or update order based on session
//     let order
    
//     if (session.metadata?.orderId) {
//       // Update existing order
//       order = await prisma.consultationOrder.update({
//         where: { id: session.metadata.orderId },
//         data: {
//           paymentStatus: session.payment_status === "paid" ? "completed" : "pending",
//           status: session.payment_status === "paid" ? "confirmed" : "pending",
//           stripeSessionId: session.id,
//           paymentIntentId: session.payment_intent as string || null,
//           updatedAt: new Date(),
//         },
//         include: { user: true },
//       })
//     } else if (session.metadata?.orderData) {
//       // Create order from session metadata (fallback)
//       const orderData = JSON.parse(session.metadata.orderData)
//       order = await prisma.consultationOrder.create({
//         data: {
//           clientName: orderData.clientName,
//           clientEmail: orderData.clientEmail,
//           requirements: orderData.requirements || [],
//           amount: orderData.amount,
//           currency: orderData.currency,
//           paymentStatus: session.payment_status === "paid" ? "completed" : "pending",
//           status: session.payment_status === "paid" ? "confirmed" : "pending",
//           stripeSessionId: session.id,
//           paymentIntentId: session.payment_intent as string || null,
//         },
//         include: { user: true },
//       })
//     }

//     return order
//   } catch (error) {
//     console.error("Error retrieving order from Stripe session:", error)
//     return null
//   }
// }
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const resolvedSearchParams = await searchParams
  const orderId = resolvedSearchParams?.orderId
  const sessionId = resolvedSearchParams?.session_id

  let order

  if (orderId) {
    // Direct order ID access (existing flow)
    order = await prisma.consultationOrder.findUnique({
      where: { id: orderId },
      include: { user: true },
    })
  } else if (sessionId) {
    // Stripe session redirect (new flow)
<<<<<<< HEAD
    order = await getOrderFromStripeSession(sessionId)
=======
    // order = await getOrderFromStripeSession(sessionId)
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b
  }

  if (!order) {
    notFound()
  }

  // Handle case where requirements might not be properly structured
  let requirements: any = {}
  try {
    requirements = typeof order.requirements === 'string' 
      ? JSON.parse(order.requirements) 
      : order.requirements || {}
  } catch (error) {
    console.error("Error parsing requirements:", error)
    requirements = {
      personalInfo: {
        firstName: order.clientName?.split(' ')[0] || 'N/A',
        lastName: order.clientName?.split(' ').slice(1).join(' ') || '',
        email: order.clientEmail || 'N/A',
        phone: 'N/A'
      },
      requirements: {
        currentRole: 'N/A',
        targetRole: 'N/A',
        industry: 'N/A',
        urgency: 'standard'
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Order Confirmed!</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Thank you for choosing our LinkedIn optimization service. Your order has been successfully processed.
            </p>
          </div>

          {/* Order Details */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Order Details
                <Badge variant="outline">Order #{order.id.slice(-8)}</Badge>
              </CardTitle>
              <CardDescription>Your LinkedIn optimization consultation has been scheduled</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Contact Information</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Name:</strong> {requirements.personalInfo?.firstName || 'N/A'} {requirements.personalInfo?.lastName || ''}
                    </p>
                    <p>
                      <strong>Email:</strong> {requirements.personalInfo?.email || order.clientEmail || 'N/A'}
                    </p>
                    <p>
                      <strong>Phone:</strong> {requirements.personalInfo?.phone || 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Optimization Details</h4>
                  <div className="space-y-1 text-sm">
                    <p>
                      <strong>Current Role:</strong> {requirements.requirements?.currentRole || 'N/A'}
                    </p>
                    <p>
                      <strong>Target Role:</strong> {requirements.requirements?.targetRole || 'N/A'}
                    </p>
                    <p>
                      <strong>Industry:</strong> {requirements.requirements?.industry || 'N/A'}
                    </p>
                    <p>
                      <strong>Timeline:</strong> <Badge variant="secondary">{requirements.requirements?.urgency || 'standard'}</Badge>
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment Status */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Payment Status</p>
                    <p className="text-sm text-muted-foreground">
                      Amount: {order.currency} {(order.amount / 100).toFixed(2)}
                    </p>
                  </div>
<<<<<<< HEAD
                  <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                    {order.paymentStatus === 'completed' ? 'Paid' : 'Processing'}
                  </Badge>
=======
                  {/* <Badge variant={order.paymentStatus === 'completed' ? 'default' : 'secondary'}>
                    {order.paymentStatus === 'completed' ? 'Paid' : 'Processing'}
                  </Badge> */}
>>>>>>> f67a3c6f132c1225fbc5c39baadceba1453edc0b
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>What Happens Next?</CardTitle>
              <CardDescription>Here&apos;s what you can expect in the coming days</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Confirmation Email
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      You&apos;ll receive a detailed confirmation email within the next few minutes with your order summary
                      and next steps.
                    </p>
                    <Badge variant="outline" className="mt-2">
                      Immediate
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Consultation Scheduling
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Our team will contact you within 24 hours to schedule your 45-minute consultation session at a
                      time that works for you.
                    </p>
                    <Badge variant="outline" className="mt-2">
                      Within 24 hours
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-chart-1 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Profile Optimization
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      After your consultation, our experts will work on optimizing your LinkedIn profile according to
                      your goals and requirements.
                    </p>
                    <Badge variant="outline" className="mt-2">
                      {requirements.requirements?.urgency === "urgent"
                        ? "1-2 business days"
                        : requirements.requirements?.urgency === "priority"
                          ? "3-4 business days"
                          : "5-7 business days"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 border rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Delivery & Support
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Receive your completely optimized LinkedIn profile content, ready to copy and paste. Includes free
                      LinkedIn banner design!
                    </p>
                    <Badge variant="outline" className="mt-2">
                      Final delivery
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Support & Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>Our support team is here to assist you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm">
                    <strong>Email:</strong> support@linkedinoptimizer.com
                  </p>
                  <p className="text-sm">
                    <strong>Phone:</strong> +27 21 123 4567
                  </p>
                  <p className="text-sm">
                    <strong>Hours:</strong> Mon-Fri, 9AM-5PM SAST
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Continue Building Your Career</CardTitle>
                <CardDescription>Explore our other services</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/resume-builder">
                      Build a Resume
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                  <Button variant="outline" className="w-full bg-transparent" asChild>
                    <Link href="/linkedin-optimizer">
                      Analyze Another Profile
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                    </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}