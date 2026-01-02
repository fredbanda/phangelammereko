/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  FileText, 
  Download, 
  Share2, 
  Printer,
  CheckCircle2,
  Calendar,
  Clock,
  TrendingUp,
  Award,
  Target,
  Lightbulb
} from "lucide-react"

interface AnalysisData {
  profileId: string
  overallScore: number
  headlineScore: number
  summaryScore: number
  experienceScore: number
  skillsScore: number
  keywordAnalysis: {
    missingKeywords: string[]
    suggestions: string[]
  }
  recommendations: {
    headline: string[]
    summary: string[]
    experience: string[]
    skills: string[]
    aiSkills: string[]
  }
  reportUrl?: string
}

interface ProfileData {
  headline: string
  summary: string
  location: string
  industry: string
  experiences: any[]
  education: any[]
  skills: string[]
  profileUrl: string
  email: string
}

interface LinkedinReportGeneratorProps {
  analysisData: AnalysisData
  profileData: ProfileData | null
  onDownload: () => void
}

export function LinkedinReportGenerator({ 
  analysisData, 
  profileData, 
  onDownload 
}: LinkedinReportGeneratorProps) {
  const totalRecommendations = 
    analysisData.recommendations.headline.length +
    analysisData.recommendations.summary.length +
    analysisData.recommendations.experience.length +
    analysisData.recommendations.skills.length +
    analysisData.recommendations.aiSkills.length

  const handleShare = async () => {
    if (navigator.share && analysisData.reportUrl) {
      try {
        await navigator.share({
          title: 'My LinkedIn Profile Analysis Report',
          text: `I got a ${analysisData.overallScore}% score on my LinkedIn profile analysis!`,
          url: analysisData.reportUrl,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback to copying URL
      if (analysisData.reportUrl) {
        navigator.clipboard.writeText(analysisData.reportUrl)
        // You could show a toast here
      }
    }
  }

  const handlePrint = () => {
    if (analysisData.reportUrl) {
      const printWindow = window.open(analysisData.reportUrl, '_blank')
      printWindow?.addEventListener('load', () => {
        printWindow.print()
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-2 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold">Report Generated Successfully!</h2>
              </div>
              <p className="text-muted-foreground">
                Your comprehensive LinkedIn optimization report is ready
              </p>
              <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date().toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Generated just now
                </div>
              </div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">{analysisData.overallScore}%</div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Profile Score
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Target className="w-4 h-4 text-blue-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{totalRecommendations}</div>
            <p className="text-xs text-muted-foreground">
              Actionable improvements identified
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Lightbulb className="w-4 h-4 text-yellow-500" />
              AI Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">{analysisData.recommendations.aiSkills.length}</div>
            <p className="text-xs text-muted-foreground">
              Future-ready skills to learn
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-500" />
              Potential Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-1">+{Math.min(100 - analysisData.overallScore, 35)}%</div>
            <p className="text-xs text-muted-foreground">
              Estimated score improvement
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Report Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Report Contents
          </CardTitle>
          <CardDescription>
            Your personalized LinkedIn optimization report includes:
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Profile Score Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    Detailed breakdown of your headline, summary, experience, and skills scores
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Keyword Optimization</h4>
                  <p className="text-sm text-muted-foreground">
                    Missing keywords and industry-specific terms to improve visibility
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI Skills Roadmap</h4>
                  <p className="text-sm text-muted-foreground">
                    Future-ready AI skills to learn for career advancement
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Actionable Recommendations</h4>
                  <p className="text-sm text-muted-foreground">
                    Step-by-step improvements for each section of your profile
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Industry Benchmarks</h4>
                  <p className="text-sm text-muted-foreground">
                    How your profile compares to industry standards
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Implementation Timeline</h4>
                  <p className="text-sm text-muted-foreground">
                    Quick wins and long-term goals with suggested timelines
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={onDownload} size="lg" className="px-8">
              <Download className="w-5 h-5 mr-2" />
              Download PDF Report
            </Button>
            
            <Button onClick={handleShare} variant="outline" size="lg" className="px-8">
              <Share2 className="w-5 h-5 mr-2" />
              Share Report
            </Button>
            
            <Button onClick={handlePrint} variant="outline" size="lg" className="px-8">
              <Printer className="w-5 h-5 mr-2" />
              Print Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Stats */}
      <Card className="bg-gradient-to-r from-slate-50 to-gray-50 dark:from-slate-950 dark:to-gray-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-primary" />
            Your Profile Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{analysisData.headlineScore}%</div>
              <p className="text-xs text-muted-foreground">Headline Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{analysisData.summaryScore}%</div>
              <p className="text-xs text-muted-foreground">Summary Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">{analysisData.experienceScore}%</div>
              <p className="text-xs text-muted-foreground">Experience Score</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">{analysisData.skillsScore}%</div>
              <p className="text-xs text-muted-foreground">Skills Score</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}