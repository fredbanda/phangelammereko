/* eslint-disable @typescript-eslint/no-explicit-any */
import JobCard from "./_components/JobCard"
import JobFilters from "./_components/JobFilters"
import { Suspense } from "react"
import { Briefcase } from "lucide-react"
import Link from "next/link"

async function fetchJobs(searchParams: Record<string, any>) {
  const url = new URL(`${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/jobs`)
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value as string)
  })

  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error("Failed to fetch")
    return await res.json()
  } catch (err) {
    console.error("Failed to fetch jobs:", err)
    return { data: [], total: 0, page: 1, pageSize: 12 }
  }
}

interface VacanciesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VacanciesPage({ searchParams }: VacanciesPageProps) {
  const params = await searchParams
  const jobsData = await fetchJobs(params)

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
            <Link href="/jobs/create" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90">
              Post Job
            </Link>
          </nav>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-balance mb-2">Browse Jobs</h1>
          <p className="text-muted-foreground">
            Discover your next career opportunity from {jobsData.total} available positions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <Suspense fallback={<div>Loading filters...</div>}>
              <JobFilters />
            </Suspense>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-3">
            {jobsData.data.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No jobs found</h3>
                <p className="text-muted-foreground">
                  Be the first to post a job or check back later for new opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {jobsData.data.map((job: any) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            )}

            {/* Pagination placeholder */}
            {jobsData.total > jobsData.pageSize && (
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Showing {jobsData.data.length} of {jobsData.total} jobs
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}