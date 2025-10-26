/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import {
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
} from "recharts"
import { Users, TrendingUp, Star, AlertCircle, CheckCircle, UserCheck, Target, Banknote } from "lucide-react"

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

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [consultantPerformance, setConsultantPerformance] = useState<ConsultantPerformance[]>([])
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [orderStatusData, setOrderStatusData] = useState<OrderStatusData[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("monthly")

  useEffect(() => {
    fetchDashboardData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange])

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
        textAnchor={x > entry.cx ? 'start' : 'end'} 
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
    
    return orderStatusData.map(item => ({
      ...item,
      percentage: ((item.count / totalCount) * 100).toFixed(1)
    }))
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Revenue and order volume over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip
                  formatter={(value, name) => [
                    name === "revenue" ? formatCurrency(value as number) : value,
                    name === "revenue" ? "Revenue" : "Orders",
                  ]}
                />
                <Bar yAxisId="right" dataKey="orders" fill="#8b5cf6" opacity={0.3} />
                <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1f2937" strokeWidth={2} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Order Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status Distribution</CardTitle>
            <CardDescription>Current order status breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
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
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} orders`, 
                    `${props.payload.status} (${props.payload.percentage}%)`
                  ]} 
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Legend */}
            <div className="mt-4 grid grid-cols-2 gap-2">
              {getPieChartData().map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    ></div>
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
                <Button size="sm" variant="outline">
                  Assign
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