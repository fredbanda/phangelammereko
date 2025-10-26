/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import OrderAssignmentModal from "./order-assignment-modal"
import OrderStatusManager from "./order-status-manager"
import {
  Search,
  Filter,
  UserPlus,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Eye,
  MoreHorizontal,
  Settings,
} from "lucide-react"
import { useState, useEffect } from "react"

interface ConsultationOrder {
  id: string
  clientName: string
  clientEmail: string
  consultationType: string
  amount: number
  currency: string
  consultationStatus: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "REFUNDED"
  createdAt: string
  updatedAt: string
  deliveredAt?: string
  consultantId?: string
  consultant?: {
    id: string
    name: string
    avatar?: string
    email: string
  }
  requirements?: any
  consultantNotes?: string
  deliveryUrl?: string
}

interface Consultant {
  id: string
  name: string
  email: string
  avatar?: string
  isActive: boolean
  currentWorkload: number
  maxOrders: number
  specializations?: string[]
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<ConsultationOrder[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [paymentFilter, setPaymentFilter] = useState("all")
  const [assignmentModalOpen, setAssignmentModalOpen] = useState(false)
  const [statusManagerOpen, setStatusManagerOpen] = useState(false)
  const [selectedOrderForAssignment, setSelectedOrderForAssignment] = useState<ConsultationOrder | null>(null)
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState<ConsultationOrder | null>(null)

  useEffect(() => {
    fetchOrders()
    fetchConsultants()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin-link/orders")
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    }
  }

  const fetchConsultants = async () => {
    try {
      const response = await fetch("/api/admin-link/consultants/available")
      const data = await response.json()
      setConsultants(data.consultants || [])
      setLoading(false)
    } catch (error) {
      console.error("Failed to fetch consultants:", error)
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency = "ZAR") => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency,
    }).format(amount / 100) // Convert from cents
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: Clock, color: "text-yellow-600" },
      IN_PROGRESS: { variant: "default" as const, icon: UserPlus, color: "text-blue-600" },
      COMPLETED: { variant: "default" as const, icon: CheckCircle, color: "text-green-600" },
      CANCELLED: { variant: "destructive" as const, icon: XCircle, color: "text-red-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]
    const Icon = config?.icon || Clock

    return (
      <Badge variant={config?.variant || "secondary"} className="flex items-center gap-1">
        <Icon className={`h-3 w-3 ${config?.color}`} />
        {status.replace("_", " ")}
      </Badge>
    )
  }

  const getPaymentBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, color: "text-yellow-600" },
      PAID: { variant: "default" as const, color: "text-green-600" },
      FAILED: { variant: "destructive" as const, color: "text-red-600" },
      REFUNDED: { variant: "outline" as const, color: "text-gray-600" },
    }

    const config = statusConfig[status as keyof typeof statusConfig]

    return (
      <Badge variant={config?.variant || "secondary"} className="flex items-center gap-1">
        <DollarSign className={`h-3 w-3 ${config?.color}`} />
        {status}
      </Badge>
    )
  }

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.clientEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.consultationStatus === statusFilter
    const matchesPayment = paymentFilter === "all" || order.paymentStatus === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin-link/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultationStatus: status }),
      })

      if (response.ok) {
        fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const updatePaymentStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin-link/orders/${orderId}/payment`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: status }),
      })

      if (response.ok) {
        fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error("Failed to update payment status:", error)
    }
  }

  const handleAssignOrder = (order: ConsultationOrder) => {
    setSelectedOrderForAssignment(order)
    setAssignmentModalOpen(true)
  }

  const assignOrderToConsultant = async (orderId: string, consultantId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/admin-link/orders/${orderId}/assign`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consultantId,
          consultantNotes: notes,
          consultationStatus: "IN_PROGRESS",
        }),
      })

      if (response.ok) {
        fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error("Failed to assign order:", error)
    }
  }

  const handleManageStatus = (order: ConsultationOrder) => {
    setSelectedOrderForStatus(order)
    setStatusManagerOpen(true)
  }

  const updateOrderWithDetails = async (orderId: string, updates: any) => {
    try {
      const response = await fetch(`/api/admin-link/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })

      if (response.ok) {
        fetchOrders() // Refresh orders
      }
    } catch (error) {
      console.error("Failed to update order:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Order Management</h1>
          <p className="text-muted-foreground">Manage consultation orders and assignments</p>
        </div>
        <Button
          onClick={() => {
            const unassignedOrder = orders.find(
              (order) => !order.consultantId && order.consultationStatus === "PENDING",
            )
            if (unassignedOrder) {
              handleAssignOrder(unassignedOrder)
            }
          }}
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Assign Orders
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by client name, email, or order ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Order Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Payment Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="PAID">Paid</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
                <SelectItem value="REFUNDED">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders ({filteredOrders.length})</CardTitle>
          <CardDescription>Manage consultation orders, assignments, and status updates</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Order Details</TableHead>
                <TableHead>Consultant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.clientName}</div>
                      <div className="text-sm text-muted-foreground">{order.clientEmail}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.consultationType.replace("_", " ")}</div>
                      <div className="text-sm text-muted-foreground">ID: {order.id.slice(-8)}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {order.consultant ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={order.consultant.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {order.consultant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium text-sm">{order.consultant.name}</div>
                          <div className="text-xs text-muted-foreground">{order.consultant.email}</div>
                        </div>
                      </div>
                    ) : (
                      <Badge variant="outline">Unassigned</Badge>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.consultationStatus)}</TableCell>
                  <TableCell>{getPaymentBadge(order.paymentStatus)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(order.amount, order.currency)}</TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleManageStatus(order)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Manage Status
                        </DropdownMenuItem>
                        {!order.consultantId && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleAssignOrder(order)}>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Consultant
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Quick Updates</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "IN_PROGRESS")}>
                          Set In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "COMPLETED")}>
                          Mark Completed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "CANCELLED")}>
                          Cancel Order
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel>Payment Status</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, "PAID")}>
                          Mark Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, "FAILED")}>
                          Mark Failed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updatePaymentStatus(order.id, "REFUNDED")}>
                          Mark Refunded
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <OrderAssignmentModal
        isOpen={assignmentModalOpen}
        onClose={() => {
          setAssignmentModalOpen(false)
          setSelectedOrderForAssignment(null)
        }}
        order={selectedOrderForAssignment}
        onAssign={assignOrderToConsultant}
      />

      {/* Status Manager Modal */}
      <OrderStatusManager
        isOpen={statusManagerOpen}
        onClose={() => {
          setStatusManagerOpen(false)
          setSelectedOrderForStatus(null)
        }}
        order={selectedOrderForStatus}
        onUpdateStatus={updateOrderWithDetails}
      />
    </div>
  )
}
