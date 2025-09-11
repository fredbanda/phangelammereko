import { getUserJobs } from "@/actions/jobs"
import { UserJobCard } from "@/app/(protected)/jobs/_components/user-job-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Plus, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const userJobs = await getUserJobs()

  const pendingJobs = userJobs.filter((job) => job.status === "PENDING")
  const approvedJobs = userJobs.filter((job) => job.status === "APPROVED")
  const rejectedJobs = userJobs.filter((job) => job.status === "REJECTED")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h1 className="text-xl font-bold">JobBoard</h1>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/jobs" className="text-muted-foreground hover:text-foreground">
              Browse Jobs
            </Link>
            <Link
              href="/post-job"
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Post Job
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-balance mb-2">My Dashboard</h1>
            <p className="text-muted-foreground">Manage your job postings and track their status</p>
          </div>

          <Link href="/post-job">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Post New Job
            </Button>
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userJobs.length}</div>
              <p className="text-xs text-muted-foreground">Jobs posted</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingJobs.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{approvedJobs.length}</div>
              <p className="text-xs text-muted-foreground">Live jobs</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{rejectedJobs.length}</div>
              <p className="text-xs text-muted-foreground">Need revision</p>
            </CardContent>
          </Card>
        </div>

        {/* Jobs List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Your Job Postings
              <Badge variant="secondary">{userJobs.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs posted yet</h3>
                <p className="text-muted-foreground mb-4">Start by posting your first job listing.</p>
                <Link href="/post-job">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Post Your First Job
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userJobs.map((job) => (
                  <UserJobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
