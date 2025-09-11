/* eslint-disable @typescript-eslint/no-unused-vars */
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, DollarSign, Crown, Banknote } from "lucide-react"
import type { Job } from "@/utils/types"
import Rand from "../../../../../public/south-africa-rand.png"

interface JobCardProps {
  job: Job
}

export function JobCard({ job }: JobCardProps) {
  const formatSalary = (min?: string, max?: string) => {
    if (!min && !max) return null
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`
    if (min) return `From $${min.toLocaleString()}`
    if (max) return `Up to $${max.toLocaleString()}`
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  const isPromoted = job.isPromoted && job.promotedUntil && new Date(job.promotedUntil) > new Date()

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${isPromoted ? "border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg leading-tight">{job.title}</h3>
              {isPromoted && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                  <Crown className="h-3 w-3 mr-1" />
                  Promoted
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground font-medium">{job.company}</p>
          </div>

          <Badge variant="outline" className="capitalize">
            {job.jobType.replace("-", " ")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>

          {(job.salaryMin, job.salaryMax) && (
            <div className="flex items-center gap-1">
              <Banknote className="h-4 w-4" />
              {(job.salaryMin, job.salaryMax)}
            </div>
          )}

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(job.createdAt)}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">Posted by {job.userEmail}</div>

          <Button size="sm">View Details</Button>
        </div>
      </CardContent>
    </Card>
  )
}
