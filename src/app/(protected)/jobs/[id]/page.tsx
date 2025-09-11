import prisma from "@/utils/prisma"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { MapPin, Clock, DollarSign, Crown, Briefcase, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface JobDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { id } = await params

  const job = await prisma.job.findUnique({
    where: {
      id: id,
      status: "APPROVED",
    },
  })

  if (!job) {
    notFound()
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })
  }

  const isPromoted = job.isPromoted && job.promotedUntil && new Date(job.promotedUntil) > new Date()

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

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/jobs" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card className={isPromoted ? "border-amber-200 bg-gradient-to-r from-amber-50/50 to-orange-50/50" : ""}>
              <CardHeader>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-balance">{job.title}</h1>
                    {isPromoted && (
                      <Badge variant="secondary" className="bg-amber-100 text-amber-800 border-amber-200">
                        <Crown className="h-3 w-3 mr-1" />
                        Promoted
                      </Badge>
                    )}
                  </div>
                  <p className="text-xl text-muted-foreground">{job.company}</p>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>

                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {(job.salaryMin, job.salaryMax)}
                  </div>

                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Posted {formatDate(job.createdAt)}
                  </div>

                  <Badge variant="outline" className="capitalize">
                    {job.jobType.replace("_", " ").toLowerCase()}
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Description</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{job.description}</p>
              </CardContent>
            </Card>

            {job.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle>Requirements</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.requirements}</p>
                </CardContent>
              </Card>
            )}

            {job.benefits && (
              <Card>
                <CardHeader>
                  <CardTitle>Benefits & Perks</CardTitle>
                </CardHeader>
                <CardContent className="prose prose-sm max-w-none">
                  <p className="whitespace-pre-wrap">{job.benefits}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Apply for this Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full" size="lg">
                  Apply Now
                </Button>

                <Separator />

                <div className="text-sm text-muted-foreground space-y-2">
                  <p>Posted by: {job.userEmail}</p>
                  <p>Job ID: #{job.id}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job Type:</span>
                  <span className="capitalize">{job.jobType.replace("_", " ").toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span>{job.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Salary:</span>
                  <span>{(job.salaryMin, job.salaryMax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Posted:</span>
                  <span>{formatDate(job.createdAt)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
