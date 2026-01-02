/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  Edit3, 
  BarChart3, 
  FileText, 
  Download,
  Sparkles,
  CheckCircle2,
  
  Calendar,

  ArrowRight,
  
  Target,
  TrendingUp
} from "lucide-react"
import { LinkedinPdfUpload } from "./linkedin-pdf-upload"
import { LinkedinManualInput } from "./linkedin-manual-input"
import { LinkedinAnalysisResults } from "./linkedin-analysis-results"
import { LinkedinReportGenerator } from "./linkedin-report-generator"
import { AccountCreationPrompt } from "./account-creation-prompt"
import { OptimizationBookingModal } from "./optimization-booking-modal"
import { toast } from "sonner"

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

export function LinkedinAnalyzer() {
  const [activeTab, setActiveTab] = useState("input")
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [showAccountPrompt, setShowAccountPrompt] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)

  const handleProfileSubmit = async (data: ProfileData) => {
    setIsAnalyzing(true)
    setProfileData(data)
    toast.loading("Analyzing your LinkedIn profile with AI...")

    try {
      const response = await fetch("/api/linkedin/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to analyze profile")
      }

      const result = await response.json()
      setAnalysisData(result)
      setActiveTab("analysis")
      toast.success("Profile analyzed successfully!")
      
      // Show account creation prompt after analysis
      setTimeout(() => {
        setShowAccountPrompt(true)
      }, 2000)

    } catch (error) {
      console.error(error)
      toast.error("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleGenerateReport = async () => {
    if (!analysisData || !profileData) return

    toast.loading("Generating your optimization report...")

    try {
      const response = await fetch("/api/linkedin/generate-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          profileId: analysisData.profileId,
          analysisData,
          profileData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate report")
      }

      const result = await response.json()
      setAnalysisData(prev => prev ? { ...prev, reportUrl: result.reportUrl } : null)
      setReportGenerated(true)
      setActiveTab("report")
      toast.success("Report generated successfully!")

    } catch (error) {
      console.error(error)
      toast.error("Failed to generate report. Please try again.")
    }
  }

  const handleBookOptimization = () => {
    setShowBookingModal(true)
  }

  const handleDownloadReport = () => {
    if (analysisData?.reportUrl) {
      window.open(analysisData.reportUrl, '_blank')
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Target className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">LinkedIn Profile Analyzer</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get AI-powered insights and recommendations to optimize your LinkedIn profile for better career opportunities
        </p>
      </div>

      {/* Progress Indicator */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "input" ? "bg-primary text-white" : 
                analysisData ? "bg-green-500 text-white" : "bg-muted"
              }`}>
                {analysisData ? <CheckCircle2 className="w-4 h-4" /> : "1"}
              </div>
              <span className="font-medium">Profile Input</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "analysis" ? "bg-primary text-white" : 
                analysisData ? "bg-green-500 text-white" : "bg-muted"
              }`}>
                {analysisData ? <CheckCircle2 className="w-4 h-4" /> : "2"}
              </div>
              <span className="font-medium">AI Analysis</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeTab === "report" ? "bg-primary text-white" : 
                reportGenerated ? "bg-green-500 text-white" : "bg-muted"
              }`}>
                {reportGenerated ? <CheckCircle2 className="w-4 h-4" /> : "3"}
              </div>
              <span className="font-medium">Report & Booking</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="input" className="flex items-center gap-2">
            <Edit3 className="w-4 h-4" />
            Profile Input
          </TabsTrigger>
          <TabsTrigger value="analysis" disabled={!analysisData} className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analysis Results
          </TabsTrigger>
          <TabsTrigger value="report" disabled={!reportGenerated} className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Report & Booking
          </TabsTrigger>
        </TabsList>

        {/* Profile Input Tab */}
        <TabsContent value="input" className="space-y-6">
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="upload" className="flex items-center gap-2 ">
                <Button size="lg" variant="emerald" className="px-8 cursor-pointer">
                <Upload className="w-4 h-4" />
                  PDF Upload
                  </Button>
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Button size="lg" variant="default" className="px-8 cursor-pointer">
                <Edit3 className="w-4 h-4" />
                
                  Manual Input
                </Button>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="w-5 h-5 text-primary" />
                    Upload LinkedIn Profile PDF
                  </CardTitle>
                  <CardDescription>
                    Download your LinkedIn profile as a PDF (LinkedIn → More → Save to PDF) and upload it here for quick analysis.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LinkedinPdfUpload onProfileSubmit={handleProfileSubmit} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="manual">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-accent" />
                    Enter Profile Information
                  </CardTitle>
                  <CardDescription>
                    Manually enter your LinkedIn profile information for detailed analysis and optimization suggestions.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <LinkedinManualInput onProfileSubmit={handleProfileSubmit} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {isAnalyzing && (
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-4">
                  <Sparkles className="w-8 h-8 text-primary animate-spin" />
                  <div className="text-center">
                    <h3 className="font-semibold text-lg mb-2">Analyzing Your Profile</h3>
                    <p className="text-sm text-muted-foreground">
                      Our AI is examining your profile for optimization opportunities...
                    </p>
                  </div>
                  <Progress value={75} className="w-full max-w-md" />
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Analysis Results Tab */}
        <TabsContent value="analysis" className="space-y-6">
          {analysisData && (
            <>
              <LinkedinAnalysisResults data={analysisData} />
              
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardContent className="pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-center md:text-left">
                      <h3 className="font-semibold text-lg mb-2">Ready for Your Detailed Report?</h3>
                      <p className="text-sm text-muted-foreground">
                        Generate a comprehensive PDF report with actionable recommendations
                      </p>
                    </div>
                    <Button onClick={handleGenerateReport} size="lg" className="px-8">
                      <FileText className="w-5 h-5 mr-2" />
                      Generate Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* Report & Booking Tab */}
        <TabsContent value="report" className="space-y-6">
          {analysisData && reportGenerated && (
            <>
              <LinkedinReportGenerator 
                analysisData={analysisData} 
                profileData={profileData}
                onDownload={handleDownloadReport}
              />
              
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 border-2 border-purple-200">
                <CardContent className="pt-6">
                  <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="w-6 h-6 text-purple-600" />
                      <h3 className="font-bold text-xl">Take Your Profile to the Next Level</h3>
                    </div>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Want professional help implementing these recommendations? Book a consultation with our LinkedIn optimization experts.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                      <Button onClick={handleBookOptimization} size="lg" className="px-8">
                        <Calendar className="w-5 h-5 mr-2" />
                        Book Optimization Service
                      </Button>
                      <Button variant="outline" onClick={handleDownloadReport} size="lg">
                        <Download className="w-5 h-5 mr-2" />
                        Download Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      {showAccountPrompt && (
        <AccountCreationPrompt 
          isOpen={showAccountPrompt}
          onClose={() => setShowAccountPrompt(false)}
          analysisData={analysisData}
          profileData={profileData}
        />
      )}

      {showBookingModal && (
        <OptimizationBookingModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          analysisData={analysisData}
          profileData={profileData}
        />
      )}
    </div>
  )
}