/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"
import { consultationOrderSchema } from "@/lib/validations"

// GET /api/orders - Fetch consultation orders with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || "all"
    const consultationStatus = searchParams.get("consultationStatus") || "all"
    const timeRange = searchParams.get("timeRange") || "monthly"
    const sortBy = searchParams.get("sortBy") || "newest"

    const now = new Date()
    let startDate: Date | undefined

    switch (timeRange) {
      case "weekly":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case "yearly":
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      case "monthly":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case "custom":
        // For custom range, we'd need additional parameters
        break
      default:
        startDate = undefined
    }

    const whereClause: any = {}

    if (startDate) {
      whereClause.createdAt = {
        gte: startDate,
      }
    }

    // Search filter - enhanced to search client name, email, and order ID
    if (search) {
      whereClause.OR = [
        {
          clientName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          clientEmail: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          id: {
            contains: search,
            mode: "insensitive",
          },
        },
      ]
    }

    // Payment status filter
    if (status !== "all") {
      whereClause.paymentStatus = status
    }

    // Consultation status filter
    if (consultationStatus !== "all") {
      whereClause.consultationStatus = consultationStatus
    }

    // Sort order
    let orderBy: any = { createdAt: "desc" }
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "status":
        orderBy = { paymentStatus: "asc" }
        break
      case "consultationStatus":
        orderBy = { consultationStatus: "asc" }
        break
      case "amount":
        orderBy = { amount: "desc" }
        break
    }

    const orders = await prisma.consultationOrder.findMany({
      where: whereClause,
      orderBy,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        consultant: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        sale: {
          select: {
            id: true,
            packageType: true,
            status: true,
          },
        },
      },
    })

    console.log("📝 ORDERS:", orders);
    

    const transformedOrders = orders.map((order) => ({
      id: order.id,
      userId: order.userId,
      clientName: order.clientName,
      clientEmail: order.clientEmail,
      consultationStatus: order.consultationStatus,
      paymentStatus: order.paymentStatus,
      amount: order.amount,
      currency: order.currency,
      consultationType: order.consultationType,
      requirements: order.requirements || null,
      deliveredAt: order.deliveredAt?.toISOString() || null,
      deliveryUrl: order.deliveryUrl || null,
      consultantNotes: order.consultantNotes || null,
      paymentId: order.paymentId || null,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
      user: order.user
        ? {
            id: order.user.id,
            name: order.user.name,
            email: order.user.email,
            phone: order.user.phone,
          }
        : null,
      consultant: order.consultant
        ? {
            id: order.consultant.id,
            name: order.consultant.name,
            email: order.consultant.email,
            phone: order.consultant.phone,
            avatar: order.consultant.avatar,
          }
        : null,
      sale: order.sale || null,
    }))
    console.log(transformedOrders);
    

    return NextResponse.json({ orders: transformedOrders })
  } catch (error) {
    console.error("Orders fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 })
  }
}

// POST /api/orders - Create a new consultation order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the input
    const validatedData = consultationOrderSchema.parse(body)

    // Create the order
    const order = await prisma.consultationOrder.create({
      data: {
            ...(validatedData.userId ? { userId: validatedData.userId } : {}),
        clientName: validatedData.clientName,
        clientEmail: validatedData.clientEmail,
        amount: validatedData.amount,
        currency: validatedData.currency || "ZAR",
        consultationType: validatedData.consultationType || "linkedin_optimization",
        consultationStatus: validatedData.consultationStatus || "PENDING",
        paymentStatus: validatedData.paymentStatus || "PENDING",
        requirements: validatedData.requirements || null,
        consultantId: validatedData.consultantId || null,
        deliveryUrl: validatedData.deliveryUrl || null,
        consultantNotes: validatedData.consultantNotes || null,
        paymentId: validatedData.paymentId || null,
        deliveredAt: validatedData.deliveredAt || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        consultant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(
      { 
        message: "Order created successfully", 
        order 
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Order creation error:", error)
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    )
  }
}

// PATCH /api/orders - Update an order (bulk or single)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { orderId, updates } = body

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    // Validate updates against schema (partial)
    const validatedUpdates = consultationOrderSchema.partial().parse(updates)

    const updatedOrder = await prisma.consultationOrder.update({
      where: { id: orderId },
      data: {
        ...validatedUpdates,
        updatedAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        consultant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      message: "Order updated successfully",
      order: updatedOrder,
    })
  } catch (error: any) {
    console.error("Order update error:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    )
  }
}

// DELETE /api/orders - Delete an order
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      )
    }

    await prisma.consultationOrder.delete({
      where: { id: orderId },
    })

    return NextResponse.json({
      message: "Order deleted successfully",
    })
  } catch (error: any) {
    console.error("Order deletion error:", error)

    if (error.code === "P2025") {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: "Failed to delete order" },
      { status: 500 }
    )
  }
}