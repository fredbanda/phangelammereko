/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  MapPin,
  Clock,
  DollarSign,
  Building2,
  Bookmark,
  BookmarkCheck,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Users,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { bookmarkJob, removeBookmark, isJobBookmarked } from "@/actions/jobs";
import { useAuth } from "@clerk/nextjs";

interface Job {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  jobType: string;
  salaryMin: number | null;
  salaryMax: number | null;
  currency: string | null;
  skills: string[];
  description: string | null;
  createdAt: Date;
  closingDate: Date;
  isPromoted: boolean;
  viewCount: number;
  _count: {
    applications: number;
    bookmarks: number;
  };
}

interface FilterOptions {
  industries: string[];
  locations: string[];
  skills: string[];
}

interface JobsClientProps {
  initialJobs: Job[];
  total: number;
  pages: number;
  currentPage: number;
  filterOptions: FilterOptions;
  initialFilters: any;
}

export default function JobsClient({
  initialJobs,
  total,
  pages,
  currentPage,
  filterOptions,
  initialFilters,
}: JobsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isSignedIn } = useAuth();

  const [jobs, setJobs] = useState(initialJobs);
  const [bookmarkedJobs, setBookmarkedJobs] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: initialFilters.search || "",
    industry: initialFilters.industry || "all",
    location: initialFilters.location || "all",
    jobType: initialFilters.jobType || "all",
    salaryMin: initialFilters.salaryMin || "",
    salaryMax: initialFilters.salaryMax || "",
    experienceLevel: initialFilters.experienceLevel || "all",
  });

  useEffect(() => {
    const checkBookmarks = async () => {
      if (!isSignedIn) return;

      const bookmarkPromises = jobs.map((job) => isJobBookmarked(job.id));
      const bookmarkResults = await Promise.all(bookmarkPromises);

      const bookmarkedSet = new Set<string>();
      jobs.forEach((job, index) => {
        if (bookmarkResults[index]) {
          bookmarkedSet.add(job.id);
        }
      });

      setBookmarkedJobs(bookmarkedSet);
    };

    checkBookmarks();
  }, [jobs, isSignedIn]);

  const updateURL = (newFilters: typeof filters, page = 1) => {
    const params = new URLSearchParams();

    Object.entries(newFilters).forEach(([key, value]) => {
      // Skip empty values and "all" (which means no filter)
      if (value && value !== "all") {
        params.set(key, value.toString());
      }
    });

    if (page > 1) params.set("page", page.toString());

    const queryString = params.toString();
    router.push(`/jobs${queryString ? `?${queryString}` : ""}`);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  const handleBookmark = async (jobId: string) => {
    if (!isSignedIn) return;

    try {
      if (bookmarkedJobs.has(jobId)) {
        await removeBookmark(jobId);
        setBookmarkedJobs((prev) => {
          const newSet = new Set(prev);
          newSet.delete(jobId);
          return newSet;
        });
      } else {
        await bookmarkJob(jobId);
        setBookmarkedJobs((prev) => new Set(prev).add(jobId));
      }
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const formatSalary = (
    min: number | null,
    max: number | null,
    currency: string | null
  ) => {
    const curr = currency || "USD";
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${curr} ${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${curr} ${max.toLocaleString()}`;
    }
    return "Salary not specified";
  };

  const jobTypeLabels = {
    FULL_TIME: "Full-time",
    PART_TIME: "Part-time",
    CONTRACT: "Contract",
    REMOTE: "Remote",
  } as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="sticky top-4">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <h3 className="font-semibold">Filters</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          <div className={`space-y-6 ${showFilters ? "block" : "hidden lg:block"}`}>
            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Job title, company..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Industry */}
            <div>
              <label className="text-sm font-medium mb-2 block">Industry</label>
              <Select
                value={filters.industry}
                onValueChange={(value) => handleFilterChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All industries</SelectItem>
                  {filterOptions.industries.map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Location */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <Select
                value={filters.location}
                onValueChange={(value) => handleFilterChange("location", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All locations</SelectItem>
                  {filterOptions.locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Job Type */}
            <div>
              <label className="text-sm font-medium mb-2 block">Job Type</label>
              <Select
                value={filters.jobType}
                onValueChange={(value) => handleFilterChange("jobType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Salary Range */}
            <div>
              <label className="text-sm font-medium mb-2 block">Salary Range</label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Min"
                  type="number"
                  value={filters.salaryMin}
                  onChange={(e) => handleFilterChange("salaryMin", e.target.value)}
                />
                <Input
                  placeholder="Max"
                  type="number"
                  value={filters.salaryMax}
                  onChange={(e) => handleFilterChange("salaryMax", e.target.value)}
                />
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="text-sm font-medium mb-2 block">Experience Level</label>
              <Select
                value={filters.experienceLevel}
                onValueChange={(value) => handleFilterChange("experienceLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All levels</SelectItem>
                  <SelectItem value="entry">Entry Level</SelectItem>
                  <SelectItem value="mid">Mid Level</SelectItem>
                  <SelectItem value="senior">Senior Level</SelectItem>
                  <SelectItem value="executive">Executive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="lg:col-span-3">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-muted-foreground">
            Showing {jobs.length} of {total} jobs
          </p>
        </div>

        <div className="space-y-4">
          {jobs.map((job) => (
            <Card
              key={job.id}
              className={`hover:shadow-md transition-shadow ${
                job.isPromoted ? "ring-2 ring-primary/20" : ""
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Link href={`/jobs/${job.id}`} className="hover:underline">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                      </Link>
                      {job.isPromoted && (
                        <Badge variant="secondary" className="text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.company}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm mb-3">
                      <Badge variant="outline">
                        {jobTypeLabels[job.jobType as keyof typeof jobTypeLabels] ||
                          job.jobType}
                      </Badge>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <DollarSign className="h-4 w-4" />
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </div>
                    </div>

                    {job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {job.skills.slice(0, 5).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && (
                          <Badge variant="secondary" className="text-xs">
                            +{job.skills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}

                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 ml-4">
                    {isSignedIn && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(job.id)}
                        className="h-8 w-8 p-0"
                      >
                        {bookmarkedJobs.has(job.id) ? (
                          <BookmarkCheck className="h-4 w-4 text-primary" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <Separator className="mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {job.viewCount} views
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {job._count.applications} applicants
                    </div>
                    <div className="flex items-center gap-1">
                      <Bookmark className="h-3 w-3" />
                      {job._count.bookmarks} saved
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/jobs/${job.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => updateURL(filters, currentPage - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pages) }, (_, i) => {
                const page = i + 1;
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateURL(filters, page)}
                  >
                    {page}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === pages}
              onClick={() => updateURL(filters, currentPage + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}