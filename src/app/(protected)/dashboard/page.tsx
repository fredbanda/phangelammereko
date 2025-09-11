/* eslint-disable @typescript-eslint/no-explicit-any */
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FileText, ShoppingCart, TrendingUp, Clock, CheckCircle, AlertCircle, Shield } from "lucide-react"
import Link from "next/link"

async function DashboardStats() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/dashboard-stats`, {
      cache: "no-store",
    })

    console.log(response)
    

    if (!response.ok) {
      throw new Error("Failed to fetch stats")
    }

    const stats = await response.json()
    console.log(stats);
    

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReports}</div>
            <p className="text-xs text-muted-foreground">LinkedIn profiles analyzed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
            <p className="text-xs text-muted-foreground">Consultations in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}</div>
            <p className="text-xs text-muted-foreground">Profile optimization score</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R{stats.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From LinkedIn optimization</p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.log(error)
    
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load dashboard stats</p>
      </div>
    )
  }
}

async function RecentReports() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/recent-reports`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch reports")
    }

    const reports = await response.json()

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Reports</CardTitle>
            <CardDescription>Latest LinkedIn profile analyses</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/reports">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No reports yet</p>
            ) : (
              reports.slice(0, 3).map((report: any) => (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {report.profile.fullName} - {report.profile.headline}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Analyzed on {new Date(report.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">Score: {report.overallScore}/100</div>
                      <Progress value={report.overallScore} className="w-20 h-2" />
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/linkedin-optimizer/analysis/${report.profileId}`}>View</Link>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.log(error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Latest LinkedIn profile analyses</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Failed to load reports</p>
        </CardContent>
      </Card>
    )
  }
}

async function RecentOrders() {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in_progress":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
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

  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/recent-orders`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch orders")
    }

    const orders = await response.json()

    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Consultation orders and status</CardDescription>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No orders yet</p>
            ) : (
              orders.slice(0, 3).map((order: any) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(order.status)}
                    <div>
                      <h4 className="font-medium">LinkedIn Profile Optimization</h4>
                      <p className="text-sm text-muted-foreground">
                        {order.user.name} • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">R{order.amount.toLocaleString()}</div>
                      {order.status === "in_progress" && order.expectedDelivery && (
                        <p className="text-xs text-muted-foreground">
                          Due: {new Date(order.expectedDelivery).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    )
  } catch (error) {
    console.log(error)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Consultation orders and status</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">Failed to load orders</p>
        </CardContent>
      </Card>
    )
  }
}

export default function AdminDashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-medium text-rose-600">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">LinkedIn Optimization Overview</h1>
          <p className="text-muted-foreground">Monitor reports, orders, and business performance</p>
        </div>
        <Button asChild>
          <Link href="/linkedin-optimizer">New Analysis</Link>
        </Button>
      </div>

      <Suspense fallback={<div>Loading stats...</div>}>
        <DashboardStats />
      </Suspense>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Suspense fallback={<div>Loading reports...</div>}>
          <RecentReports />
        </Suspense>

        <Suspense fallback={<div>Loading orders...</div>}>
          <RecentOrders />
        </Suspense>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get started with LinkedIn optimization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/linkedin-optimizer" className="flex flex-col items-center gap-2">
                <FileText className="h-6 w-6" />
                <span>Analyze Profile</span>
                <span className="text-xs text-muted-foreground">Get free analysis</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/linkedin-optimizer/checkout" className="flex flex-col items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                <span>Book Consultation</span>
                <span className="text-xs text-muted-foreground">R2,000 expert review</span>
              </Link>
            </Button>

            <Button asChild variant="outline" className="h-auto p-4 bg-transparent">
              <Link href="/dashboard/reports" className="flex flex-col items-center gap-2">
                <TrendingUp className="h-6 w-6" />
                <span>View Reports</span>
                <span className="text-xs text-muted-foreground">All your analyses</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
