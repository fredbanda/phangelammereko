import { Suspense } from "react";
import { getJobs, getJobFilters } from "@/actions/jobs";
import JobsClient from "./jobs-client";
import { Skeleton } from "@/components/ui/skeleton";

interface SearchParams {
  search?: string;
  industry?: string;
  location?: string;
  jobType?: string;
  salaryMin?: string;
  salaryMax?: string;
  skills?: string;
  experienceLevel?: string;
  page?: string;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const filters = {
    search: params.search,
    industry: params.industry,
    location: params.location,
    jobType: params.jobType,
    salaryMin: params.salaryMin ? parseInt(params.salaryMin) : undefined,
    salaryMax: params.salaryMax ? parseInt(params.salaryMax) : undefined,
    skills: params.skills ? params.skills.split(',') : undefined,
    experienceLevel: params.experienceLevel,
    page: params.page ? parseInt(params.page) : 1,
  };

  const [jobsData, filterOptions] = await Promise.all([
    getJobs(filters),
    getJobFilters()
  ]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Find Your Next Opportunity</h1>
          <p className="text-muted-foreground">
            Discover {jobsData.total} job opportunities from top companies
          </p>
        </div>

        <Suspense fallback={<JobsPageSkeleton />}>
          <JobsClient 
            initialJobs={jobsData.jobs}
            total={jobsData.total}
            pages={jobsData.pages}
            currentPage={jobsData.currentPage}
            filterOptions={filterOptions}
            initialFilters={filters}
          />
        </Suspense>
      </div>
    </div>
  );
}

function JobsPageSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-1">
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      </div>
      <div className="lg:col-span-3">
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}