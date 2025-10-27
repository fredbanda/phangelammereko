"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Users, UserCheck, Clock, AlertCircle, Shuffle, Eye, ArrowRight } from "lucide-react"
import { format } from "date-fns"

interface Assignment {
  id: string
  orderId: string
  consultantId: string | null
  assignedAt: string | null
  status: "unassigned" | "assigned" | "in_progress" | "completed"
  priority: "low" | "medium" | "high"
  order: {
    id: string
    clientName: string
    clientEmail: string
    amount: number
    requirements: string[]
    createdAt: string
  }
  consultant?: {
    id: string
    name: string
    email: string
    avatar?: string
    specializations: string[]
    currentOrders: number
    maxOrders: number
  }
}

interface Consultant {
  id: string
  name: string
  email: string
  avatar?: string
  specializations: string[]
  currentOrders: number
  maxOrders: number
  isActive: boolean
  averageRating?: number
}

export default function AssignmentManagement() {
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null)
  const [showAssignDialog, setShowAssignDialog] = useState(false)
  const [selectedConsultant, setSelectedConsultant] = useState<string>("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [assignmentsRes, consultantsRes] = await Promise.all([
        fetch("/api/admin/assignments"),
        fetch("/api/admin/consultants"),
      ])

      const assignmentsData = await assignmentsRes.json()
      const consultantsData = await consultantsRes.json()

      setAssignments(assignmentsData.assignments || [])
      setConsultants(consultantsData.consultants || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAutoAssign = async () => {
    try {
      const response = await fetch("/api/admin/assignments/auto-assign", {
        method: "POST",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("Failed to auto-assign:", error)
    }
  }

  const handleManualAssign = async () => {
    if (!selectedAssignment || !selectedConsultant) return

    try {
      const response = await fetch(`/api/admin/assignments/${selectedAssignment.id}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId: selectedConsultant }),
      })

      if (response.ok) {
        setShowAssignDialog(false)
        setSelectedAssignment(null)
        setSelectedConsultant("")
        fetchData()
      }
    } catch (error) {
      console.error("Failed to assign consultant:", error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "assigned":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "unassigned":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  const unassignedOrders = assignments.filter((a) => a.status === "unassigned")
  const assignedOrders = assignments.filter((a) => a.status === "assigned" || a.status === "in_progress")
  const completedOrders = assignments.filter((a) => a.status === "completed")

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
          <h1 className="text-3xl font-bold text-foreground">Assignment Management</h1>
          <p className="text-muted-foreground">Assign consultants to client orders</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleAutoAssign} className="bg-accent hover:bg-accent/90">
            <Shuffle className="h-4 w-4 mr-2" />
            Auto Assign
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{unassignedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting assignment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned</CardTitle>
            <UserCheck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{assignedOrders.length}</div>
            <p className="text-xs text-muted-foreground">In progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <Users className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedOrders.length}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assignment Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {assignments.length > 0
                ? Math.round(((assignments.length - unassignedOrders.length) / assignments.length) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Orders assigned</p>
          </CardContent>
        </Card>
      </div>

      {/* Consultant Workload Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Consultant Workload</CardTitle>
          <CardDescription>Current capacity and availability</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {consultants
              .filter((c) => c.isActive)
              .map((consultant) => (
                <div key={consultant.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={consultant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {consultant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{consultant.name}</h4>
                      <span className="text-sm text-muted-foreground">
                        {consultant.currentOrders}/{consultant.maxOrders}
                      </span>
                    </div>
                    <Progress value={(consultant.currentOrders / consultant.maxOrders) * 100} className="mt-2" />
                    <div className="flex flex-wrap gap-1 mt-2">
                      {consultant.specializations.slice(0, 2).map((spec, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Assignment Tabs */}
      <Tabs defaultValue="unassigned" className="space-y-4">
        <TabsList>
          <TabsTrigger value="unassigned">Unassigned ({unassignedOrders.length})</TabsTrigger>
          <TabsTrigger value="assigned">Assigned ({assignedOrders.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="unassigned">
          <Card>
            <CardHeader>
              <CardTitle>Unassigned Orders</CardTitle>
              <CardDescription>Orders waiting for consultant assignment</CardDescription>
            </CardHeader>
            <CardContent>
              {unassignedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No unassigned orders.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {unassignedOrders.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium">{assignment.order.clientName}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.order.clientEmail}</p>
                          </div>
                          <Badge className={getPriorityColor(assignment.priority)}>{assignment.priority}</Badge>
                          <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatCurrency(assignment.order.amount)}</span>
                          <span>Created {format(new Date(assignment.order.createdAt), "MMM dd, yyyy")}</span>
                          <span>{assignment.order.requirements.length} requirements</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedAssignment(assignment)
                            setShowAssignDialog(true)
                          }}
                        >
                          <UserCheck className="h-4 w-4 mr-2" />
                          Assign
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assigned">
          <Card>
            <CardHeader>
              <CardTitle>Assigned Orders</CardTitle>
              <CardDescription>Orders currently being worked on</CardDescription>
            </CardHeader>
            <CardContent>
              {assignedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No assigned orders.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {assignedOrders.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium">{assignment.order.clientName}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.order.clientEmail}</p>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignment.consultant?.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {assignment.consultant?.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{assignment.consultant?.name}</span>
                          </div>
                          <Badge className={getStatusColor(assignment.status)}>
                            {assignment.status.replace("_", " ")}
                          </Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatCurrency(assignment.order.amount)}</span>
                          <span>
                            Assigned{" "}
                            {assignment.assignedAt ? format(new Date(assignment.assignedAt), "MMM dd, yyyy") : "N/A"}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          Reassign
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Orders</CardTitle>
              <CardDescription>Successfully delivered consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {completedOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No completed orders yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {completedOrders.map((assignment) => (
                    <div key={assignment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <div>
                            <h4 className="font-medium">{assignment.order.clientName}</h4>
                            <p className="text-sm text-muted-foreground">{assignment.order.clientEmail}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={assignment.consultant?.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {assignment.consultant?.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{assignment.consultant?.name}</span>
                          </div>
                          <Badge className={getStatusColor(assignment.status)}>{assignment.status}</Badge>
                        </div>
                        <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatCurrency(assignment.order.amount)}</span>
                          <span>Completed recently</span>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assignment Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Consultant</DialogTitle>
            <DialogDescription>
              Select a consultant for {selectedAssignment?.order.clientName}&apos;s order
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Available Consultants</h4>
              <Select value={selectedConsultant} onValueChange={setSelectedConsultant}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a consultant" />
                </SelectTrigger>
                <SelectContent>
                  {consultants
                    .filter((c) => c.isActive && c.currentOrders < c.maxOrders)
                    .map((consultant) => (
                      <SelectItem key={consultant.id} value={consultant.id}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={consultant.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-xs">
                              {consultant.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{consultant.name}</span>
                          <span className="text-xs text-muted-foreground">
                            ({consultant.currentOrders}/{consultant.maxOrders})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAssignDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleManualAssign} disabled={!selectedConsultant}>
                Assign Consultant
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
