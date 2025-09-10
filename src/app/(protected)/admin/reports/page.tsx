/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts"
import { Download, TrendingUp, TrendingDown, Target, DollarSign, Users, Star, FileText, Filter } from "lucide-react"

interface ReportData {
  overview: {
    totalRevenue: number
    totalOrders: number
    averageOrderValue: number
    completionRate: number
    customerSatisfaction: number
    revenueGrowth: number
    orderGrowth: number
  }
  trends: {
    date: string
    revenue: number
    orders: number
    completionRate: number
  }[]
  consultantPerformance: {
    name: string
    revenue: number
    orders: number
    completionRate: number
    rating: number
  }[]
  kpis: {
    name: string
    current: number
    target: number
    unit: string
    trend: "up" | "down" | "stable"
    change: number
  }[]
}

export default function ReportsAndKPIs() {
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState("last30days")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [reportType, setReportType] = useState("overview")
  const [consultantFilter, setConsultantFilter] = useState("all")

  useEffect(() => {
    fetchReportData()
  }, [dateRange, startDate, endDate, reportType, consultantFilter])

  const fetchReportData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        dateRange,
        startDate,
        endDate,
        reportType,
        consultantFilter,
      })

      const response = await fetch(`/api/admin/reports?${params}`)
      const data = await response.json()
      setReportData(data.report)
    } catch (error) {
      console.error("Failed to fetch report data:", error)
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (format: "pdf" | "csv" | "excel") => {
    try {
      const params = new URLSearchParams({
        dateRange,
        startDate,
        endDate,
        reportType,
        consultantFilter,
        format,
      })

      const response = await fetch(`/api/admin/reports/export?${params}`)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `linkedin-report-${format}-${Date.now()}.${format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xlsx"}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Failed to export report:", error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount)
  }

  const getKPIColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />
      default:
        return <div className="h-4 w-4" />
    }
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
        {`${entry.name}`}
      </text>
    )
  }

  // Calculate percentages for pie chart data
  const getPieChartData = () => {
    if (!reportData?.consultantPerformance) return []
    
    const totalRevenue = reportData.consultantPerformance.reduce((sum, consultant) => sum + consultant.revenue, 0)
    
    return reportData.consultantPerformance.map(consultant => ({
      ...consultant,
      percentage: ((consultant.revenue / totalRevenue) * 100).toFixed(1)
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
    <div className="space-y-6 p-6 h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & KPIs</h1>
          <p className="text-muted-foreground">Comprehensive business analytics and performance tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportReport("csv")}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" onClick={() => exportReport("excel")}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button onClick={() => exportReport("pdf")}>
            <FileText className="h-4 w-4 mr-2" />
            PDF Report
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last7days">Last 7 Days</SelectItem>
                  <SelectItem value="last30days">Last 30 Days</SelectItem>
                  <SelectItem value="last90days">Last 90 Days</SelectItem>
                  <SelectItem value="thisyear">This Year</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {dateRange === "custom" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="reportType">Report Type</Label>
              <Select value={reportType} onValueChange={setReportType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overview">Business Overview</SelectItem>
                  <SelectItem value="consultant">Consultant Performance</SelectItem>
                  <SelectItem value="financial">Financial Analysis</SelectItem>
                  <SelectItem value="operational">Operational Metrics</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="consultantFilter">Consultant</Label>
              <Select value={consultantFilter} onValueChange={setConsultantFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All consultants" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Consultants</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="top-performers">Top Performers</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <>
          {/* KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {reportData.kpis.map((kpi, index) => (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{kpi.name}</CardTitle>
                  {getTrendIcon(kpi.trend)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {kpi.unit === "currency" ? formatCurrency(kpi.current) : `${kpi.current}${kpi.unit}`}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Progress value={(kpi.current / kpi.target) * 100} className="flex-1 mr-2" />
                    <span className="text-xs text-muted-foreground">
                      {Math.round((kpi.current / kpi.target) * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Target: {kpi.unit === "currency" ? formatCurrency(kpi.target) : `${kpi.target}${kpi.unit}`}
                    <span className={kpi.change >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                      {kpi.change >= 0 ? "+" : ""}
                      {kpi.change.toFixed(1)}%
                    </span>
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Report Tabs */}
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="comparison">Comparison</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Business Metrics</CardTitle>
                    <CardDescription>Key performance indicators for the selected period</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span>Total Revenue</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(reportData.overview.totalRevenue)}</div>
                        <div className="text-xs text-green-600">+{reportData.overview.revenueGrowth.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>Total Orders</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{reportData.overview.totalOrders}</div>
                        <div className="text-xs text-green-600">+{reportData.overview.orderGrowth.toFixed(1)}%</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-4 w-4 text-muted-foreground" />
                        <span>Completion Rate</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{reportData.overview.completionRate}%</div>
                        <Progress value={reportData.overview.completionRate} className="w-20 mt-1" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span>Customer Satisfaction</span>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{reportData.overview.customerSatisfaction.toFixed(1)}/5.0</div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-3 w-3 ${
                                star <= reportData.overview.customerSatisfaction
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Breakdown</CardTitle>
                    <CardDescription>Revenue distribution by consultant</CardDescription>
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
                          dataKey="revenue"
                        >
                          {getPieChartData().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [
                            formatCurrency(value as number), 
                            `${props.payload.name} (${props.payload.percentage}%)`
                          ]} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    {/* Legend */}
                    <div className="mt-4 grid grid-cols-1 gap-2">
                      {getPieChartData().map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: `hsl(${index * 45}, 70%, 60%)` }}
                            ></div>
                            <span>{entry.name}</span>
                          </div>
                          <span className="font-medium">{entry.percentage}%</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends">
              <Card>
                <CardHeader>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Revenue, orders, and completion rate over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={reportData.trends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip
                        formatter={(value, name) => [
                          name === "revenue" ? formatCurrency(value as number) : value,
                          name === "revenue" ? "Revenue" : name === "orders" ? "Orders" : "Completion Rate",
                        ]}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#1f2937" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="orders" stroke="#8b5cf6" strokeWidth={2} />
                      <Line yAxisId="right" type="monotone" dataKey="completionRate" stroke="#10b981" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="performance">
              <Card>
                <CardHeader>
                  <CardTitle>Consultant Performance</CardTitle>
                  <CardDescription>Individual consultant metrics and rankings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {reportData.consultantPerformance.map((consultant, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <div>
                            <h4 className="font-medium">{consultant.name}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>{consultant.orders} orders</span>
                              <span>{consultant.completionRate}% completion</span>
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                <span>{consultant.rating.toFixed(1)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(consultant.revenue)}</div>
                          <div className="text-xs text-muted-foreground">Revenue</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comparison">
              <Card>
                <CardHeader>
                  <CardTitle>Period Comparison</CardTitle>
                  <CardDescription>Compare current period with previous period</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={reportData.consultantPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => formatCurrency(value as number)} />
                      <Bar dataKey="revenue" fill="#1f2937" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}