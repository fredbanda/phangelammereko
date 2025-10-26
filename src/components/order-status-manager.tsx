/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Clock, CheckCircle, XCircle, AlertTriangle, Upload, FileText } from "lucide-react"
import { format } from "date-fns"

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
  deliveredAt?: string
  deliveryUrl?: string
  consultantNotes?: string
  consultant?: {
    id: string
    name: string
    avatar?: string
    email: string
  }
}

interface OrderStatusManagerProps {
  isOpen: boolean
  onClose: () => void
  order: ConsultationOrder | null
  onUpdateStatus: (orderId: string, updates: any) => void
}

export default function OrderStatusManager({ isOpen, onClose, order, onUpdateStatus }: OrderStatusManagerProps) {
  const [consultationStatus, setConsultationStatus] = useState<string>("")
  const [paymentStatus, setPaymentStatus] = useState<string>("")
  const [consultantNotes, setConsultantNotes] = useState("")
  const [deliveryUrl, setDeliveryUrl] = useState("")
  const [deliveryDate, setDeliveryDate] = useState<Date | undefined>(undefined)
  const [loading, setLoading] = useState(false)

  // Initialize form when order changes
  useState(() => {
    if (order) {
      setConsultationStatus(order.consultationStatus)
      setPaymentStatus(order.paymentStatus)
      setConsultantNotes(order.consultantNotes || "")
      setDeliveryUrl(order.deliveryUrl || "")
      setDeliveryDate(order.deliveredAt ? new Date(order.deliveredAt) : undefined)
    }
  })

  const handleSave = async () => {
    if (!order) return

    setLoading(true)
    try {
      const updates: any = {
        consultationStatus,
        paymentStatus,
        consultantNotes,
        deliveryUrl,
      }

      // If marking as completed, set delivery date
      if (consultationStatus === "COMPLETED" && !order.deliveredAt) {
        updates.deliveredAt = deliveryDate || new Date()
      }

      onUpdateStatus(order.id, updates)
      onClose()
    } catch (error) {
      console.error("Failed to update order:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "IN_PROGRESS":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />
      case "COMPLETED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "CANCELLED":
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getPaymentIcon = (status: string) => {
    switch (status) {
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "PAID":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "REFUNDED":
        return <AlertTriangle className="h-4 w-4 text-gray-600" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const formatCurrency = (amount: number, currency = "ZAR") => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency,
    }).format(amount / 100)
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Order Status</DialogTitle>
          <DialogDescription>Update order status, payment information, and delivery details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Client</Label>
                  <p className="text-sm">{order.clientName}</p>
                  <p className="text-xs text-muted-foreground">{order.clientEmail}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Service</Label>
                  <p className="text-sm">{order.consultationType.replace("_", " ")}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Amount</Label>
                  <p className="text-sm font-medium">{formatCurrency(order.amount, order.currency)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Order ID</Label>
                  <p className="text-sm font-mono">{order.id.slice(-12)}</p>
                </div>
              </div>
              {order.consultant && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <Label className="text-sm font-medium">Assigned Consultant</Label>
                  <p className="text-sm">{order.consultant.name}</p>
                  <p className="text-xs text-muted-foreground">{order.consultant.email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Status Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Consultation Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getStatusIcon(consultationStatus)}
                  Order Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="consultation-status">Current Status</Label>
                  <Select value={consultationStatus} onValueChange={setConsultationStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="IN_PROGRESS">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-blue-600" />
                          In Progress
                        </div>
                      </SelectItem>
                      <SelectItem value="COMPLETED">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Completed
                        </div>
                      </SelectItem>
                      <SelectItem value="CANCELLED">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Cancelled
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {consultationStatus === "COMPLETED" && (
                  <div>
                    <Label>Delivery Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {deliveryDate ? format(deliveryDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={deliveryDate} onSelect={setDeliveryDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Payment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getPaymentIcon(paymentStatus)}
                  Payment Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="payment-status">Payment Status</Label>
                  <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-yellow-600" />
                          Pending
                        </div>
                      </SelectItem>
                      <SelectItem value="PAID">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          Paid
                        </div>
                      </SelectItem>
                      <SelectItem value="FAILED">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-4 w-4 text-red-600" />
                          Failed
                        </div>
                      </SelectItem>
                      <SelectItem value="REFUNDED">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-gray-600" />
                          Refunded
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Delivery Information */}
          {(consultationStatus === "COMPLETED" || consultationStatus === "IN_PROGRESS") && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="delivery-url">Delivery URL</Label>
                  <Input
                    id="delivery-url"
                    placeholder="https://drive.google.com/... or file path"
                    value={deliveryUrl}
                    onChange={(e) => setDeliveryUrl(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Link to the optimized LinkedIn profile or deliverable files
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Consultant Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Consultant Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="consultant-notes">Internal Notes</Label>
                <Textarea
                  id="consultant-notes"
                  placeholder="Add notes about the consultation progress, client feedback, or any special considerations..."
                  value={consultantNotes}
                  onChange={(e) => setConsultantNotes(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Status History */}
          <Card>
            <CardHeader>
              <CardTitle>Status History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                  <span>Order created</span>
                </div>
                {order.consultant && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>

                    <span className="text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</span>
                    <span>Assigned to {order.consultant.name}</span>
                  </div>
                )}
                {order.deliveredAt && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-muted-foreground">{new Date(order.deliveredAt).toLocaleString()}</span>
                    <span>Order delivered</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
