"use client"

import { useState } from "react"
import { approveJob, rejectJob } from "@/actions/jobs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, DollarSign, User, Mail, CheckCircle, XCircle, Eye } from "lucide-react"
import { Job } from "types"

interface AdminJobCardProps {
  job: Job
}

export function AdminJobCard({ job }: AdminJobCardProps) {
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [showFullDescription, setShowFullDescription] = useState(false)

  // const formatSalary = (min?: number | null, max?: number | null) => {
  //   if (!min && !max) return "Not specified"
  //   if (min && max) return `R${min.toLocaleString()} - R${max.toLocaleString()}`
  //   if (min) return `From R${min.toLocaleString()}`
  //   if (max) return `Up to R${max.toLocaleString()}`
  //   return "Not specified"
  // }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const formatJobType = (jobType: string) => {
    return jobType.replace(/[_-]/g, " ").toLowerCase()
  }

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await approveJob(job.id)
    } catch (error) {
      console.error("Error approving job:", error)
    } finally {
      setIsApproving(false)
    }
  }

  const handleReject = async () => {
    setIsRejecting(true)
    try {
      await rejectJob(job.id)
    } catch (error) {
      console.error("Error rejecting job:", error)
    } finally {
      setIsRejecting(false)
    }
  }

  return (
    <Card className="border-l-4 border-l-amber-400">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg leading-tight">{job.title || "Untitled Job"}</h3>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                Pending Review
              </Badge>
            </div>
            <p className="text-muted-foreground font-medium">{job.company || "Unknown Company"}</p>
          </div>

          <Badge variant="outline" className="capitalize">
            {formatJobType(job.jobType)}
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            {job.location || "Location not specified"}
          </div>

          <div className="flex items-center gap-1">
            <DollarSign className="h-4 w-4" />
            {(job.salaryMin, job.salaryMax)}
          </div>

          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatDate(job.createdAt)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Job Description */}
        {job.description && (
          <div>
            <h4 className="font-medium mb-2">Description</h4>
            <p className={`text-sm text-muted-foreground ${showFullDescription ? "" : "line-clamp-3"}`}>
              {job.description}
            </p>
            {job.description.length > 100 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="mt-1 p-0 h-auto text-xs"
              >
                <Eye className="h-3 w-3 mr-1" />
                {showFullDescription ? "Show less" : "Show more"}
              </Button>
            )}
          </div>
        )}

        {/* Requirements */}
        {job.requirements && (
          <div>
            <h4 className="font-medium mb-2">Requirements</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{job.requirements}</p>
          </div>
        )}

        {/* Benefits */}
        {job.benefits && (
          <div>
            <h4 className="font-medium mb-2">Benefits</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{job.benefits}</p>
          </div>
        )}

        <Separator />

        {/* Poster Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <User className="h-4 w-4" />
            <span>Posted by:</span>
            <div className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              {job.userEmail || "Unknown"}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">Job ID: #{job.id}</div>
        </div>

        <Separator />

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            {isApproving ? "Approving..." : "Approve"}
          </Button>

          <Button onClick={handleReject} disabled={isApproving || isRejecting} variant="destructive" className="flex-1">
            <XCircle className="h-4 w-4 mr-2" />
            {isRejecting ? "Rejecting..." : "Reject"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}