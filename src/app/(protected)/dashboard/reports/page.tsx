/* eslint-disable @typescript-eslint/no-explicit-any */

export const dynamic = "force-dynamic";

import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Eye, Calendar, TrendingUp, Search, Shield } from "lucide-react"
import Link from "next/link"

async function ReportsContent() {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/admin/reports`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error("Failed to fetch reports")
    }

    const reports = await response.json()

    if (reports.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No reports yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start by analyzing LinkedIn profiles to get detailed optimization insights.
            </p>
            <Button asChild>
              <Link href="/linkedin-optimizer">Create First Report</Link>
            </Button>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid gap-6">
        {reports.map((report: any) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </div>
    )
  } catch (error) {
    console.log(error)
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">Failed to load reports</p>
        </CardContent>
      </Card>
    )
  }
}

function ReportCard({ report }: { report: any }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>
    if (score >= 60) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>
    return <Badge className="bg-red-100 text-red-800">Needs Work</Badge>
  }

  const suggestionsCount =
    (report.keywordSuggestions?.length || 0) +
    (report.structureSuggestions?.length || 0) +
    (report.readabilitySuggestions?.length || 0) +
    (report.experienceSuggestions?.length || 0)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {report.profile.fullName} - {report.profile.headline}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 mt-1">
              <Calendar className="h-4 w-4" />
              Analyzed on {new Date(report.createdAt).toLocaleDateString()}
              <span className="mx-2">•</span>
              <span>{report.profile.industry || "Not specified"}</span>
            </CardDescription>
          </div>
          {getScoreBadge(report.overallScore)}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Overall Score</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(report.overallScore)}`}>{report.overallScore}</span>
            <span className="text-muted-foreground">/100</span>
          </div>
        </div>

        <Progress value={report.overallScore} className="h-2" />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Keywords:</span>
            <span className="font-medium">{report.keywordScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Structure:</span>
            <span className="font-medium">{report.structureScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Readability:</span>
            <span className="font-medium">{report.readabilityScore}/100</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Experience:</span>
            <span className="font-medium">{report.experienceScore}/100</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">{suggestionsCount} optimization suggestions</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button asChild size="sm">
              <Link href={`/linkedin-optimizer/analysis/${report.profileId}`}>
                <Eye className="mr-2 h-4 w-4" />
                View Report
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminReportsPage() {
  return (
    <div className="container mx-auto py-8 space-y-8 h-screen">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-5 w-5 text-rose-600" />
            <span className="text-sm font-medium text-rose-600">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">LinkedIn Reports</h1>
          <p className="text-muted-foreground">View and manage all LinkedIn profile analyses</p>
        </div>
        <Button asChild>
          <Link href="/linkedin-optimizer">
            <FileText className="mr-2 h-4 w-4" />
            New Analysis
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by profile name or industry..." className="pl-10" />
              </div>
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scores</SelectItem>
                <SelectItem value="excellent">Excellent (80+)</SelectItem>
                <SelectItem value="good">Good (60-79)</SelectItem>
                <SelectItem value="needs-work">Needs Work (&lt;60)</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="newest">
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest-score">Highest Score</SelectItem>
                <SelectItem value="lowest-score">Lowest Score</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Loading reports...</div>}>
        <ReportsContent />
      </Suspense>
    </div>
  )
}
