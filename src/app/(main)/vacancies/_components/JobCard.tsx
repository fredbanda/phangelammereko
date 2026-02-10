"use client"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MapPin, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

interface JobCardProps {
  job: {
    id: string
    title?: string | null
    company?: string | null
    location?: string | null
    salaryMin?: number | null
    salaryMax?: number | null
    currency?: string | null
    description?: string | null
    createdAt: Date
  }
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <div className="p-4 border rounded-md bg-card">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg">
            <Link href={`/vacancies/${job.id}`} className="hover:underline">
              {job.title}
            </Link>
          </h3>
          <div className="text-muted-foreground">{job.company}</div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost">Share</Button>
          <Button size="sm" variant="ghost">Save</Button>
        </div>
      </div>

      <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {job.location}
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="h-4 w-4" />
          {job.salaryMin && job.salaryMax 
            ? `${job.currency} ${job.salaryMin} - ${job.salaryMax}` 
            : "Salary not specified"}
        </div>
        <div className="text-xs">
          Posted {formatDistanceToNow(new Date(job.createdAt))} ago
        </div>
      </div>

      <p className="text-sm text-muted-foreground mt-3 line-clamp-3">{job.description}</p>
    </div>
  )
}