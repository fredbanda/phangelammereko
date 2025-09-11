/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = "force-dynamic";

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ShoppingCart,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Download,
  MessageSquare,
  Search,
  Shield,
} from "lucide-react"
import Link from "next/link"

async function OrdersContent() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/orders`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }

    const orders = await response.json()

    if (orders.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No orders yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Consultation orders will appear here once customers book services.
            </p>
            <Button asChild>
              <Link href="/linkedin-optimizer/checkout">View Booking Page</Link>
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-6">
        {orders.map((order: any) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </div>
    )
  } catch (error) {
    console.log(error)
    
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load orders</p>
        </CardContent>
      </Card>
    )
  }
}

function OrderCard({ order }: { order: any }) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "default",
      in_progress: "secondary",
      pending: "outline",
    } as const

    return <Badge variant={variants[status as keyof typeof variants] || "outline"}>{status.replace("_", " ")}</Badge>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "border-green-200 bg-green-50"
      case "in_progress":
        return "border-blue-200 bg-blue-50"
      default:
        return "border-yellow-200 bg-yellow-50"
    }
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${getStatusColor(order.status)}`}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon(order.status)}
            <div>
              <CardTitle className="text-lg">Order #{order.id}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                Ordered on {new Date(order.createdAt).toLocaleDateString()}
                <span className="mx-2">•</span>
                <span>Customer: {order.user.name}</span>
                {order.consultant && (
                  <>
                    <span className="mx-2">•</span>
                    <span>Consultant: {order.consultant}</span>
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">R{order.amount.toLocaleString()}</span>
            {getStatusBadge(order.status)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Service</h4>
          <p className="text-sm text-muted-foreground">LinkedIn Profile Optimization</p>
        </div>

        <div>
          <h4 className="font-medium mb-2">Requirements</h4>
          <p className="text-sm text-muted-foreground">{order.requirements || "No specific requirements provided"}</p>
        </div>

        {order.status === "in_progress" && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Progress</h4>
              <span className="text-sm text-muted-foreground">{order.progress || 0}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${order.progress || 0}%` }}
              />
            </div>
          </div>
        )}

        {order.deliverables && (
          <div>
            <h4 className="font-medium mb-2">Deliverables</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              {order.deliverables.map((item: string, index: number) => (
                <li key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            {order.status === "completed" && order.deliveredAt && (
              <span>Delivered on {new Date(order.deliveredAt).toLocaleDateString()}</span>
            )}
            {order.status === "in_progress" && order.expectedDelivery && (
              <span>Expected delivery: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
            )}
            {order.status === "pending" && <span>Waiting for consultant assignment</span>}
          </div>

          <div className="flex gap-2">
            {order.status === "completed" && (
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            )}
            <Button variant="outline" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Contact
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminOrdersPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-medium text-rose-600">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Consultation Orders</h1>
          <p className="text-muted-foreground">Track LinkedIn optimization consultation orders and progress</p>
        </div>
        <Button asChild>
          <Link href="/linkedin-optimizer/checkout">
            <ShoppingCart className="mr-2 h-4 w-4" />
            View Booking Page
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by order ID or consultant..." className="pl-10" />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="status">By Status</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Loading orders...</div>}>
        <OrdersContent />
      </Suspense>
    </div>
  )
}
