/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Star, Users, Clock, CheckCircle, AlertTriangle } from "lucide-react"

interface Consultant {
  id: string
  name: string
  email: string
  avatar?: string
  title?: string
  bio?: string
  specializations?: string[]
  skills?: string[]
  experience?: number
  isActive: boolean
  currentWorkload: number
  maxOrders: number
  hourlyRate?: number
  totalOrders: number
  completedOrders: number
  averageRating?: number
  availability?: any
}

interface ConsultationOrder {
  id: string
  clientName: string
  clientEmail: string
  consultationType: string
  amount: number
  currency: string
  requirements?: any
  consultationStatus: string
  paymentStatus: string
  createdAt: string
}

interface OrderAssignmentModalProps {
  isOpen: boolean
  onClose: () => void
  order: ConsultationOrder | null
  onAssign: (orderId: string, consultantId: string, notes?: string) => void
}

export default function OrderAssignmentModal({ isOpen, onClose, order, onAssign }: OrderAssignmentModalProps) {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedConsultant, setSelectedConsultant] = useState<string | null>(null)
  const [assignmentNotes, setAssignmentNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchAvailableConsultants()
    }
  }, [isOpen])

  const fetchAvailableConsultants = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching consultants...") // Debug log
      
      const response = await fetch("/api/admin-link/consultants/available")
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      console.log("API Response:", data) // Debug log
      
      // Handle different possible response structures
      const consultantsList = data.consultants || data.data || data || []
      
      console.log("Consultants list:", consultantsList) // Debug log
      
      setConsultants(consultantsList)
      
      if (consultantsList.length === 0) {
        console.warn("No consultants returned from API")
      }
      
    } catch (error) {
      console.error("Failed to fetch consultants:", error)
      setError(error instanceof Error ? error.message : "Failed to fetch consultants")
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = () => {
    if (selectedConsultant && order) {
      onAssign(order.id, selectedConsultant, assignmentNotes)
      setSelectedConsultant(null)
      setAssignmentNotes("")
      onClose()
    }
  }

  const formatCurrency = (amount: number, currency = "ZAR") => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: currency,
    }).format(amount / 100)
  }

  const getWorkloadColor = (workload: number, maxCapacity: number) => {
    const percentage = (workload / maxCapacity) * 100
    if (percentage >= 90) return "text-red-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  const getAvailabilityStatus = (consultant: Consultant) => {
    const workloadPercentage = (consultant.currentWorkload / consultant.maxOrders) * 100

    if (!consultant.isActive) {
      return { status: "Inactive", color: "text-gray-500", icon: AlertTriangle }
    }
    if (workloadPercentage >= 100) {
      return { status: "Full Capacity", color: "text-red-600", icon: AlertTriangle }
    }
    if (workloadPercentage >= 80) {
      return { status: "Nearly Full", color: "text-yellow-600", icon: Clock }
    }
    return { status: "Available", color: "text-green-600", icon: CheckCircle }
  }

  if (!order) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Order to Consultant</DialogTitle>
          <DialogDescription>Select a consultant to handle this LinkedIn optimization order</DialogDescription>
        </DialogHeader>

        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Client</Label>
                <p className="text-sm">{order.clientName}</p>
                <p className="text-xs text-muted-foreground">{order.clientEmail}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Service Type</Label>
                <p className="text-sm">{order.consultationType.replace("_", " ")}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Amount</Label>
                <p className="text-sm font-medium">{formatCurrency(order.amount, order.currency)}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Order Date</Label>
                <p className="text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
            {order.requirements && (
              <div className="mt-4">
                <Label className="text-sm font-medium">Special Requirements</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  {typeof order.requirements === "string" ? order.requirements : JSON.stringify(order.requirements)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Consultants */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Available Consultants</h3>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-red-600 text-center">{error}</p>
              <Button variant="outline" onClick={fetchAvailableConsultants}>
                Retry
              </Button>
            </div>
          ) : consultants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Users className="h-8 w-8 text-gray-400" />
              <p className="text-gray-600 text-center">No consultants available</p>
              <Button variant="outline" onClick={fetchAvailableConsultants}>
                Refresh
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 max-h-96 overflow-y-auto">
              {consultants.map((consultant) => {
                const availability = getAvailabilityStatus(consultant)
                const Icon = availability.icon
                const isSelected = selectedConsultant === consultant.id

                return (
                  <Card
                    key={consultant.id}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                    } ${!consultant.isActive || consultant.currentWorkload >= consultant.maxOrders ? "opacity-60" : ""}`}
                    onClick={() => {
                      if (consultant.isActive && consultant.currentWorkload < consultant.maxOrders) {
                        setSelectedConsultant(consultant.id)
                      }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={consultant.avatar || "/placeholder.svg"} />
                            <AvatarFallback>
                              {consultant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{consultant.name}</h4>
                              <Badge variant="outline" className={`flex items-center gap-1 ${availability.color}`}>
                                <Icon className="h-3 w-3" />
                                {availability.status}
                              </Badge>
                            </div>
                            {consultant.title && <p className="text-sm text-muted-foreground">{consultant.title}</p>}
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{consultant.completedOrders || 0} completed</span>
                              </div>
                              {consultant.averageRating && (
                                <div className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span>{consultant.averageRating.toFixed(1)}</span>
                                </div>
                              )}
                              {consultant.hourlyRate && <span>R{consultant.hourlyRate}/hr</span>}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm">
                            <span className={getWorkloadColor(consultant.currentWorkload || 0, consultant.maxOrders || 1)}>
                              {consultant.currentWorkload || 0}/{consultant.maxOrders || 1}
                            </span>
                          </div>
                          <div className="w-24 mt-1">
                            <Progress
                              value={((consultant.currentWorkload || 0) / (consultant.maxOrders || 1)) * 100}
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>

                      {consultant.specializations && consultant.specializations.length > 0 && (
                        <div className="mt-3">
                          <div className="flex flex-wrap gap-1">
                            {consultant.specializations.slice(0, 3).map((spec, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {spec}
                              </Badge>
                            ))}
                            {consultant.specializations.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{consultant.specializations.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Loading: {loading.toString()}</p>
              <p>Error: {error || 'None'}</p>
              <p>Consultants count: {consultants.length}</p>
            </div>
          )}
        </div>

        {/* Assignment Notes */}
        {selectedConsultant && (
          <div className="space-y-2">
            <Label htmlFor="notes">Assignment Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any special instructions or notes for the consultant..."
              value={assignmentNotes}
              onChange={(e) => setAssignmentNotes(e.target.value)}
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleAssign} disabled={!selectedConsultant}>
            Assign Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}