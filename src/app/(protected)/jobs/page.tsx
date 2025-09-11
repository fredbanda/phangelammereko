import { getJobs } from "@/actions/jobs"
import { JobCard } from "../../(protected)/jobs/_components/job-card"
import { JobFilters } from "@/app/(protected)/jobs/_components/job-filters"
import { Briefcase } from "lucide-react"
import Link from "next/link"

export default async function JobsPage() {
  const jobs = await getJobs()

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
            <Link href="/job-home" className="text-muted-foreground hover:text-foreground">
              Home
            </Link>
            <a href="/post-job" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Post Job
            </a>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Discover your next career opportunity from {jobs.length} available positions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters />
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {jobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  Be the first to post a job or check back later for new opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
