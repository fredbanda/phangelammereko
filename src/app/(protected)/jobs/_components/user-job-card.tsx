"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { PromotionModal } from "../_components/promotion-modal"
import { MapPin, Clock, DollarSign, Crown, Eye, Edit, Zap } from "lucide-react"
import Link from "next/link"
import type { Job } from "@/utils/types"

interface UserJobCardProps {
  job: Job
}

export function UserJobCard({ job }: UserJobCardProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200"
      case "pending":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
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
              <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
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
              <DollarSign className="h-4 w-4" />
              {(job.salaryMin, job.salaryMax)}
            </div>
          )}

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(job.createdAt)}
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

        {isPromoted && job.promotedUntil && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <Crown className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-800">
                Promotion expires on {new Date(job.promotedUntil).toLocaleDateString()}
              </span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-muted-foreground">Job ID: #{job.id}</div>

          <div className="flex items-center gap-2">
            {job.status === "APPROVED" && (
              <Link href={`/jobs/${job.id}`}>
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Live
                </Button>
              </Link>
            )}

            {job.status === "APPROVED" && !isPromoted && (
              <PromotionModal jobId={job.id} jobTitle="" >
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50 bg-transparent"
                >
                  <Zap className="h-4 w-4 mr-2" />
                  Promote
                </Button>
              </PromotionModal>
            )}

            <Button size="sm" variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
