import { getPendingJobs } from "@/actions/jobs"
import { AdminJobCard } from "@/app/(protected)/jobs/_components/admin-job-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function AdminPage() {
  const pendingJobs = await getPendingJobs()

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h1 className="text-xl font-bold">JobBoard Admin</h1>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
              Browse Jobs
            </Link>
            <a href="/post-job" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Post Job
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and manage job postings awaiting approval</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingJobs.length}</div>
              <p className="text-xs text-muted-foreground">Jobs awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Jobs approved today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected Today</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Jobs rejected today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Active</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247</div>
              <p className="text-xs text-muted-foreground">Active job listings</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Jobs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Pending Job Reviews
              <Badge variant="secondary">{pendingJobs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {pendingJobs.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 mx-auto text-green-600 mb-4" />
                <h3 className="text-lg font-medium mb-2">All caught up!</h3>
                <p className="text-muted-foreground">No jobs are currently pending review.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingJobs.map((job) => (
                  <AdminJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}