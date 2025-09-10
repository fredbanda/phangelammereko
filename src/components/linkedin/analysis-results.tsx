/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  TrendingUp,
  Target,
  FileText,
  Users,
  Award,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Download,
  Star,
} from "lucide-react";
import { createCheckoutSession } from "../premium/actions";
import { toast } from "sonner";
import { useState } from "react";

interface AnalysisResultsProps {
  profile: any;
  report: any;
}

export function AnalysisResults({ profile, report }: AnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Needs Work";
    return "Poor";
  };

  const keywordAnalysis = report.keywordAnalysis as any;
  const structureAnalysis = report.structureAnalysis as any;
  const readabilityScore = report.readabilityScore as any;

  // async function handlePremiumClick(priceId: string) {
  //   try {
  //     setLoading(true);
  //     const sessionUrl = await createCheckoutSession(priceId);
  //     window.location.href = sessionUrl;
  //   } catch (error) {
  //     console.log(error);
  //     toast.error("Something went wrong while creating the checkout session", {
  //       position: "top-right",
  //     });
  //   } finally {
  //     setLoading(false);
  //   }
  // }

  const handlePaymentSubmit = async (priceId: string) => {
    setIsSubmitting(true)
  
    try {
      // Combine all form data
      // const orderData = {
      //   personalInfo: personalForm.getValues(),
      //   requirements: requirementsForm.getValues(),
      //   payment: data,
      //   amount: 200000, // R2000 in cents
      //   currency: "ZAR",
      //   status: 'pending' // Add status field
      // }
  
      // First, save the order data to database
      const response = await fetch("/api/linkedin/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(priceId),
      })
  
      if (!response.ok) {
        throw new Error("Failed to create order")
      }
  
      const result = await response.json()
      const orderId = result.orderId
  
      // Then redirect to Stripe with the order ID
      const sessionUrl = await createCheckoutSession(
        process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED!,
        //orderId! // Pass order ID to Stripe metadata
      )
      
      window.location.href = sessionUrl
      
    } catch (error) {
      console.error(error)
      toast.error("Failed to process order")
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDownloadPDF() {
    console.log("handleDownloadPDF clicked");
    
    try {
      setIsDownloading(true);

      console.log(report);
      
      
      // Make request to your API endpoint
      const response = await fetch(`/api/linkedin/download-report/pdf?reportId=${report.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/pdf',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate PDF report');
      }

      // Get the PDF blob
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `linkedin-analysis-report-${report.id}.pdf`;

      console.log(link);
      
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success("PDF report downloaded successfully!", {
        position: "top-right",
      });

    } catch (error) {
      console.error('Download error:', error);
      toast.error("Failed to download PDF report. Please try again.", {
        position: "top-right",
      });
    } finally {
      setIsDownloading(false);
    }
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-foreground mb-4 text-4xl font-bold text-balance">
            LinkedIn Profile Analysis Report
          </h1>
          <p className="text-muted-foreground text-xl text-pretty">
            Comprehensive insights and recommendations for your professional
            profile
          </p>
        </div>

        {/* Overall Score Card */}
        <Card className="border-primary/20 mb-8 border-2 shadow-lg">
          <CardHeader className="from-primary/5 to-accent/5 bg-gradient-to-r text-center">
            <div className="mb-4 flex items-center justify-center gap-4">
              <div className="relative">
                <div className="border-primary/20 flex h-24 w-24 items-center justify-center rounded-full border-8">
                  <span
                    className={`text-3xl font-bold ${getScoreColor(report.overallScore)}`}
                  >
                    {report.overallScore}
                  </span>
                </div>
                <div className="absolute -top-2 -right-2">
                  <Award className="text-accent h-8 w-8" />
                </div>
              </div>
              <div className="text-left">
                <CardTitle className="text-2xl">
                  Overall Profile Score
                </CardTitle>
                <CardDescription className="text-lg">
                  {getScoreLabel(report.overallScore)} - {report.overallScore}
                  /100
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-4">
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Target className="text-primary mr-2 h-5 w-5" />
                  <span className="font-semibold">Keywords</span>
                </div>
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.headlineScore || 0)}`}
                >
                  {report.headlineScore || 0}
                </div>
                <Progress value={report.headlineScore || 0} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <FileText className="text-accent mr-2 h-5 w-5" />
                  <span className="font-semibold">Structure</span>
                </div>
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.skillsScore || 0)}`}
                >
                  {report.skillsScore || 0}
                </div>
                <Progress value={report.skillsScore || 0} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <TrendingUp className="text-chart-1 mr-2 h-5 w-5" />
                  <span className="font-semibold">Readability</span>
                </div>
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.summaryScore || 0)}`}
                >
                  {report.summaryScore || 0}
                </div>
                <Progress value={report.summaryScore || 0} className="mt-2" />
              </div>
              <div className="text-center">
                <div className="mb-2 flex items-center justify-center">
                  <Users className="text-chart-2 mr-2 h-5 w-5" />
                  <span className="font-semibold">Experience</span>
                </div>
                <div
                  className={`text-2xl font-bold ${getScoreColor(report.experienceScore || 0)}`}
                >
                  {report.experienceScore || 0}
                </div>
                <Progress
                  value={report.experienceScore || 0}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Analysis Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="keywords">Keywords</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
            <TabsTrigger value="readability">Readability</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    Strengths
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {structureAnalysis?.hasHeadline && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Professional headline present</span>
                      </li>
                    )}
                    {structureAnalysis?.hasSummary && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Detailed summary section</span>
                      </li>
                    )}
                    {structureAnalysis?.hasExperience && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Work experience documented</span>
                      </li>
                    )}
                    {structureAnalysis?.hasSkills && (
                      <li className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span>Skills section populated</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
                    Areas for Improvement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {keywordAnalysis?.missingKeywords?.length > 0 && (
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>
                          {keywordAnalysis.missingKeywords.length} missing
                          industry keywords
                        </span>
                      </li>
                    )}
                    {readabilityScore?.metricsCount < 3 && (
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Add more quantifiable achievements</span>
                      </li>
                    )}
                    {readabilityScore?.activeVerbCount < 5 && (
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Use more action verbs</span>
                      </li>
                    )}
                    {structureAnalysis?.completenessScore < 80 && (
                      <li className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span>Profile completeness below optimal</span>
                      </li>
                    )}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="keywords" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyword Analysis</CardTitle>
                <CardDescription>
                  Optimize your profile with industry-relevant keywords to
                  improve visibility
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {keywordAnalysis?.missingKeywords?.length > 0 && (
                  <div>
                    <h4 className="text-destructive mb-3 font-semibold">
                      Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {keywordAnalysis.missingKeywords
                        .slice(0, 10)
                        .map((keyword: string, index: number) => (
                          <Badge key={index} variant="destructive">
                            {keyword}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {keywordAnalysis?.underusedKeywords?.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-yellow-600">
                      Underused Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {keywordAnalysis.underusedKeywords
                        .slice(0, 8)
                        .map((keyword: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-yellow-600 text-yellow-600"
                          >
                            {keyword}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}

                {keywordAnalysis?.industryKeywords?.length > 0 && (
                  <div>
                    <h4 className="mb-3 font-semibold text-green-600">
                      Relevant Industry Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {keywordAnalysis.industryKeywords
                        .slice(0, 12)
                        .map((keyword: string, index: number) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="border-green-600 text-green-600"
                          >
                            {keyword}
                          </Badge>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="structure" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Structure Analysis</CardTitle>
                <CardDescription>
                  Completeness score:{" "}
                  {structureAnalysis?.completenessScore || 0}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full ${structureAnalysis?.hasHeadline ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span>Professional Headline</span>
                    </div>
                    <Badge
                      variant={
                        structureAnalysis?.hasHeadline
                          ? "default"
                          : "destructive"
                      }
                    >
                      {structureAnalysis?.hasHeadline ? "Complete" : "Missing"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full ${structureAnalysis?.hasSummary ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span>About/Summary Section</span>
                    </div>
                    <Badge
                      variant={
                        structureAnalysis?.hasSummary
                          ? "default"
                          : "destructive"
                      }
                    >
                      {structureAnalysis?.hasSummary ? "Complete" : "Missing"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full ${structureAnalysis?.hasExperience ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span>Work Experience</span>
                    </div>
                    <Badge
                      variant={
                        structureAnalysis?.hasExperience
                          ? "default"
                          : "destructive"
                      }
                    >
                      {structureAnalysis?.hasExperience
                        ? "Complete"
                        : "Missing"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full ${structureAnalysis?.hasSkills ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span>Skills Section</span>
                    </div>
                    <Badge
                      variant={
                        structureAnalysis?.hasSkills ? "default" : "destructive"
                      }
                    >
                      {structureAnalysis?.hasSkills ? "Complete" : "Missing"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-4 w-4 rounded-full ${structureAnalysis?.hasEducation ? "bg-green-500" : "bg-red-500"}`}
                      />
                      <span>Education Background</span>
                    </div>
                    <Badge
                      variant={
                        structureAnalysis?.hasEducation
                          ? "default"
                          : "destructive"
                      }
                    >
                      {structureAnalysis?.hasEducation ? "Complete" : "Missing"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="readability" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Readability & Engagement Analysis</CardTitle>
                <CardDescription>
                  Overall readability score:{" "}
                  {readabilityScore?.readabilityScore || 0}/100
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Sentence Count</span>
                      <Badge variant="outline">
                        {readabilityScore?.sentenceCount || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Avg. Sentence Length</span>
                      <Badge variant="outline">
                        {readabilityScore?.avgSentenceLength || 0} words
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Action Verbs</span>
                      <Badge
                        variant={
                          readabilityScore?.activeVerbCount >= 5
                            ? "default"
                            : "destructive"
                        }
                      >
                        {readabilityScore?.activeVerbCount || 0}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Quantifiable Metrics</span>
                      <Badge
                        variant={
                          readabilityScore?.metricsCount >= 3
                            ? "default"
                            : "destructive"
                        }
                      >
                        {readabilityScore?.metricsCount || 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Jargon Score</span>
                      <Badge
                        variant={
                          readabilityScore?.jargonScore <= 5
                            ? "default"
                            : "destructive"
                        }
                      >
                        {readabilityScore?.jargonScore || 0}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid gap-4">
              {report.headlineSuggestions?.map(
                (suggestion: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Target className="text-primary h-5 w-5" />
                        Headline Optimization
                        <Badge
                          variant={
                            suggestion.priority === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {suggestion.priority}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground mb-2">
                        {suggestion.suggestion}
                      </p>
                      {suggestion.example && (
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-muted-foreground mb-1 text-sm">
                            Example:
                          </p>
                          <p className="text-sm font-medium">
                            {suggestion.example}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}

              {report.summarySuggestions?.map(
                (suggestion: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <FileText className="text-accent h-5 w-5" />
                        Summary Enhancement
                        <Badge
                          variant={
                            suggestion.priority === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {suggestion.priority}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground mb-2">
                        {suggestion.suggestion}
                      </p>
                      {suggestion.example && (
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-muted-foreground mb-1 text-sm">
                            Example:
                          </p>
                          <p className="text-sm font-medium">
                            {suggestion.example}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}

              {report.experienceSuggestions?.map(
                (suggestion: any, index: number) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-lg">
                        <Users className="text-chart-1 h-5 w-5" />
                        Experience Improvement
                        <Badge
                          variant={
                            suggestion.priority === "high"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {suggestion.priority}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-foreground mb-2">
                        {suggestion.suggestion}
                      </p>
                      {suggestion.example && (
                        <div className="bg-muted rounded-lg p-3">
                          <p className="text-muted-foreground mb-1 text-sm">
                            Example:
                          </p>
                          <p className="text-sm font-medium">
                            {suggestion.example}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ),
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Premium Consultation CTA */}
        <Card className="border-primary/20 from-primary/5 to-accent/5 border-2 bg-gradient-to-r">
          <CardHeader className="text-center">
            <div className="mb-4 flex items-center justify-center gap-2">
              <Star className="text-accent h-8 w-8" />
              <CardTitle className="text-2xl">
                Ready to Take Your Profile to the Next Level?
              </CardTitle>
            </div>
            <CardDescription className="text-lg">
              Get personalized, expert optimization with our professional
              consultation service
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-center">
            <div className="grid gap-4 text-left md:grid-cols-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-semibold">Personal Consultation</h4>
                  <p className="text-muted-foreground text-sm">
                    One-on-one session with LinkedIn experts
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-semibold">Complete Rewrite</h4>
                  <p className="text-muted-foreground text-sm">
                    Professional rewriting of all sections
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-1 h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-semibold">Ready-to-Use Content</h4>
                  <p className="text-muted-foreground text-sm">
                    Copy-paste optimized profile content
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="px-8"
                onClick={() =>
                  handlePaymentSubmit
                }
                type="submit"
                disabled={isSubmitting}
              >
                Get Professional Optimization - R2,000
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
              onClick={() => handleDownloadPDF()}
              variant="outline" size="lg">
                <Download className="mr-2 h-4 w-4" />
                Download Report PDF
              </Button>
            </div>

            <Alert>
              <AlertTriangle className="h-4 w-4  text-red-700" />

              <AlertDescription>
                <strong className="text-red-500">Limited Time:</strong> Book your consultation within 7
                days and receive a free LinkedIn banner design worth R500!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
