/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, Line, PieChart, Pie, Cell, BarChart } from "recharts"
import {
  Users,
  TrendingUp,
  Star,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Target,
  Banknote,
  Search,
  UserPlus,
  AlertTriangle,
} from "lucide-react"

interface DashboardStats {
  totalRevenue: number
  totalOrders: number
  activeConsultants: number
  completionRate: number
  averageOrderValue: number
  pendingOrders: number
  monthlyGrowth: number
  customerSatisfaction: number
}

interface ConsultantPerformance {
  id: string
  name: string
  avatar?: string
  totalOrders: number
  completedOrders: number
  averageRating: number
  revenue: number
  completionRate: number
  currentWorkload: number
  maxCapacity: number
}

interface RevenueData {
  date: string
  revenue: number
  orders: number
}

interface OrderStatusData {
  status: string
  count: number
  color: string
}

interface Order {
  id: string
  userId: string
  consultantId?: string
  consultationStatus: string
  paymentStatus: string
  amount: number
  createdAt: string
  deliveryUrl?: string
  notes?: string
  user: {
    name: string
    email: string
  }
  consultant?: {
    name: string
    email: string
  }
}

interface Consultant {
  id: string
  name: string
  email: string
  specialization: string
  isActive: boolean
  currentWorkload: number
  maxCapacity: number
  averageRating: number
}

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [consultantPerformance, setConsultantPerformance] = useState<ConsultantPerformance[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [orderFilter, setOrderFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("monthly")

const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
    fetchOrders()
    fetchConsultants()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

    useEffect(() => {
    if (assignModalOpen) {
      fetchAvailableConsultants()
    }
  }, [assignModalOpen])

  const fetchAvailableConsultants = async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log("Fetching available consultants...") // Debug log
      
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

 const availableConsultants = consultants.filter((c) => 
    c.isActive && c.currentWorkload < c.maxCapacity
  )


  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [statsRes, performanceRes, revenueRes, statusRes] = await Promise.all([
        fetch(`/api/admin/dashboard/stats?timeRange=${timeRange}`),
        fetch(`/api/admin/dashboard/consultant-performance?timeRange=${timeRange}`),
        fetch(`/api/admin/dashboard/revenue-chart?timeRange=${timeRange}`),
        fetch(`/api/admin/order-status?timeRange=${timeRange}`),
      ])

      const statsData = await statsRes.json()
      const performanceData = await performanceRes.json()
      const revenueChartData = await revenueRes.json()
      const statusChartData = await statusRes.json()

      setStats(statsData.stats)
      setConsultantPerformance(performanceData.performance || [])
      setRevenueData(revenueChartData.data || [])
      setOrderStatusData(statusChartData.data || [])
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/orders")
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
    } catch (error) {
      console.error("Failed to fetch consultants:", error)
    }
  }

  const assignOrderToConsultant = async (orderId: string, consultantId: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ consultantId }),
      })

      if (response.ok) {
        await fetchOrders()
        await fetchDashboardData()
        setAssignModalOpen(false)
        setSelectedOrder(null)
      }
    } catch (error) {
      console.error("Failed to assign order:", error)
    }
  }

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        await fetchOrders()
        await fetchDashboardData()
      }
    } catch (error) {
      console.error("Failed to update order status:", error)
    }
  }

  const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/payment`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus }),
      })

      if (response.ok) {
        await fetchOrders()
        await fetchDashboardData()
      }
    } catch (error) {
      console.error("Failed to update payment status:", error)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredOrders = orders.filter((order) => {
    const matchesFilter =
      orderFilter === "all" ||
      (orderFilter === "unassigned" && !order.consultantId) ||
      (orderFilter === "pending" && order.consultationStatus === "PENDING") ||
      (orderFilter === "in_progress" && order.consultationStatus === "IN_PROGRESS") ||
      (orderFilter === "completed" && order.consultationStatus === "COMPLETED")

    const matchesSearch =
      searchTerm === "" ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  // Custom label renderer for pie chart
  const renderCustomLabel = (entry: any) => {
    const RADIAN = Math.PI / 180
    const radius = entry.innerRadius + (entry.outerRadius - entry.innerRadius) * 0.5
    const x = entry.cx + radius * Math.cos(-entry.midAngle * RADIAN)
    const y = entry.cy + radius * Math.sin(-entry.midAngle * RADIAN)

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > entry.cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {entry.status}
      </text>
    )
  }

  // Calculate percentages for order status data
  const getPieChartData = () => {
    if (!orderStatusData || orderStatusData.length === 0) return []

    const totalCount = orderStatusData.reduce((sum, item) => sum + item.count, 0)

    return orderStatusData.map((item) => ({
      ...item,
      percentage: ((item.count / totalCount) * 100).toFixed(1),
    }))
  }

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-2))",
    },
    pending: {
      label: "Pending",
      color: "hsl(var(--chart-3))",
    },
    in_progress: {
      label: "In Progress",
      color: "hsl(var(--chart-4))",
    },
    completed: {
      label: "Completed",
      color: "hsl(var(--chart-5))",
    },
  } satisfies ChartConfig

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
          <h1 className="text-3xl font-bold text-foreground">Manager Dashboard</h1>
          <p className="text-muted-foreground">LinkedIn optimization business overview</p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Time Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">This Week</SelectItem>
              <SelectItem value="monthly">This Month</SelectItem>
              <SelectItem value="quarterly">This Quarter</SelectItem>
              <SelectItem value="yearly">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600"}>
                  {stats.monthlyGrowth >= 0 ? "+" : ""}
                  {stats.monthlyGrowth.toFixed(1)}%
                </span>{" "}
                from last period
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">Avg: {formatCurrency(stats.averageOrderValue)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Consultants</CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeConsultants}</div>
              <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending assignments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <Star className="h-3 w-3 inline mr-1" />
                {stats.customerSatisfaction.toFixed(1)} avg rating
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Order Management Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Management</CardTitle>
              <CardDescription>Assign orders to consultants and manage status</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Select value={orderFilter} onValueChange={setOrderFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Consultant</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.user?.name}</div>
                      <div className="text-sm text-muted-foreground">{order.user?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{formatCurrency(order.amount)}</TableCell>
                  <TableCell>
                    {order.consultant ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {order.consultant.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{order.consultant.name}</span>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-orange-600">
                        Unassigned
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.consultationStatus}
                      onValueChange={(value) => updateOrderStatus(order.id, value)}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={order.paymentStatus} onValueChange={(value) => updatePaymentStatus(order.id, value)}>
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="PAID">Paid</SelectItem>
                        <SelectItem value="FAILED">Failed</SelectItem>
                        <SelectItem value="REFUNDED">Refunded</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {!order.consultantId && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedOrder(order)
                          setAssignModalOpen(true)
                        }}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Assign
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

<Dialog open={assignModalOpen} onOpenChange={setAssignModalOpen}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Assign Order to Consultant</DialogTitle>
          <DialogDescription>
            Select an available consultant for order {selectedOrder?.id.slice(0, 8)}...
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading consultants...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <AlertTriangle className="h-8 w-8 text-red-500" />
              <p className="text-red-600 text-center">{error}</p>
              <Button variant="outline" onClick={fetchAvailableConsultants}>
                Retry
              </Button>
            </div>
          ) : availableConsultants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 space-y-2">
              <Users className="h-8 w-8 text-gray-400" />
              <p className="text-gray-600 text-center">
                {consultants.length === 0 
                  ? "No consultants found" 
                  : "No available consultants at the moment"
                }
              </p>
              <Button variant="outline" onClick={fetchAvailableConsultants}>
                Refresh
              </Button>
            </div>
          ) : (
            availableConsultants.map((consultant) => (
              <div key={consultant.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback>
                      {consultant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{consultant.name}</div>
                    {consultant.specialization && (
                      <div className="text-sm text-muted-foreground">{consultant.specialization}</div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {consultant.averageRating && (
                        <>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span>{consultant.averageRating.toFixed(1)}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>
                        {consultant.currentWorkload || 0}/{consultant.maxCapacity || 1} capacity
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Progress 
                    value={((consultant.currentWorkload || 0) / (consultant.maxCapacity || 1)) * 100} 
                    className="w-16" 
                  />
                  <Button
                    size="sm"
                    onClick={() => selectedOrder && assignOrderToConsultant(selectedOrder.id, consultant.id)}
                  >
                    Assign
                  </Button>
                </div>
              </div>
            ))
          )}

          {/* Debug Info - Remove in production */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs space-y-1">
              <p><strong>Debug Info:</strong></p>
              <p>Loading: {loading.toString()}</p>
              <p>Error: {error || 'None'}</p>
              <p>Total consultants: {consultants.length}</p>
              <p>Available consultants: {availableConsultants.length}</p>
              {consultants.length > 0 && (
                <div className="mt-2">
                  <p><strong>Consultant Details:</strong></p>
                  {consultants.map(c => (
                    <div key={c.id} className="ml-2">
                      <p>{c.name}: active={c.isActive?.toString()}, workload={c.currentWorkload}, max={c.maxCapacity || c.maxCapacity}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Revenue and order volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        name === "revenue" ? formatCurrency(value as number) : value,
                        name === "revenue" ? "Revenue" : "Orders",
                      ]}
                    />
                  }
                />
                <Bar yAxisId="right" dataKey="orders" fill="var(--color-orders)" opacity={0.3} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <PieChart>
                <Pie
                  data={getPieChartData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {getPieChartData().map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name, props) => [
                        `${value} orders`,
                        `${props.payload.status} (${props.payload.percentage}%)`,
                      ]}
                    />
                  }
                />
              </PieChart>
            </ChartContainer>

            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {getPieChartData().map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span>{entry.status}</span>
                  </div>
                  <span className="font-medium">{entry.percentage}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consultant Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Consultant Performance</CardTitle>
          <CardDescription>Individual consultant metrics and workload</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {consultantPerformance.map((consultant) => (
              <div key={consultant.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={consultant.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {consultant.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{consultant.name}</h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{consultant.completedOrders} completed</span>
                      <span>{formatCurrency(consultant.revenue)} revenue</span>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        <span>{consultant.averageRating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm font-medium">{consultant.completionRate}%</p>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="w-32">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Workload</span>
                      <span>
                        {consultant.currentWorkload}/{consultant.maxCapacity}
                      </span>
                    </div>
                    <Progress value={(consultant.currentWorkload / consultant.maxCapacity) * 100} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Urgent Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {stats && stats.pendingOrders > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm">{stats.pendingOrders} unassigned orders</span>
                <Button size="sm" variant="outline" onClick={() => setOrderFilter("unassigned")}>
                  View
                </Button>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm">Review consultant performance</span>
              <Button size="sm" variant="outline">
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Recent Completions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">
              {consultantPerformance.reduce((sum, c) => sum + c.completedOrders, 0)}
            </p>
            <p className="text-xs text-muted-foreground">Orders completed this period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              Performance Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-sm">
                  <span>Monthly Revenue Target</span>
                  <span>75%</span>
                </div>
                <Progress value={75} className="mt-1" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>Customer Satisfaction</span>
                  <span>92%</span>
                </div>
                <Progress value={92} className="mt-1" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
