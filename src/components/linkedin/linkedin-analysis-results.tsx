"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  Target,
  Brain,
  Zap,
  Star,
  Award,
  Users,
  Eye,
  MessageSquare,
  Briefcase
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
}

interface LinkedinAnalysisResultsProps {
  data: AnalysisData
}

export function LinkedinAnalysisResults({ data }: LinkedinAnalysisResultsProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <TrendingUp className="w-4 h-4 text-green-600" />
    if (score >= 60) return <AlertTriangle className="w-4 h-4 text-yellow-600" />
    return <TrendingDown className="w-4 h-4 text-red-600" />
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent"
    if (score >= 60) return "Good"
    if (score >= 40) return "Needs Improvement"
    return "Poor"
  }

  return (
    <div className="space-y-6">
      {/* Overall Score Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-2">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center gap-2 mb-2">
                <Award className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold">Profile Analysis Complete</h2>
              </div>
              <p className="text-muted-foreground">
                Your LinkedIn profile has been analyzed using AI-powered insights
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">{data.overallScore}%</div>
              <div className="flex items-center gap-1">
                {getScoreIcon(data.overallScore)}
                <span className={`font-medium ${getScoreColor(data.overallScore)}`}>
                  {getScoreLabel(data.overallScore)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={data.overallScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Score Breakdown */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              Headline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{data.headlineScore}%</span>
              {getScoreIcon(data.headlineScore)}
            </div>
            <Progress value={data.headlineScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {getScoreLabel(data.headlineScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Eye className="w-4 h-4 text-green-500" />
              Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{data.summaryScore}%</span>
              {getScoreIcon(data.summaryScore)}
            </div>
            <Progress value={data.summaryScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {getScoreLabel(data.summaryScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Briefcase className="w-4 h-4 text-purple-500" />
              Experience
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{data.experienceScore}%</span>
              {getScoreIcon(data.experienceScore)}
            </div>
            <Progress value={data.experienceScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {getScoreLabel(data.experienceScore)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Zap className="w-4 h-4 text-orange-500" />
              Skills
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl font-bold">{data.skillsScore}%</span>
              {getScoreIcon(data.skillsScore)}
            </div>
            <Progress value={data.skillsScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {getScoreLabel(data.skillsScore)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Keyword Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Keyword Analysis
          </CardTitle>
          <CardDescription>
            Important keywords and phrases that could improve your profile visibility
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {data.keywordAnalysis.missingKeywords.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
                Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.keywordAnalysis.missingKeywords.map((keyword, index) => (
                  <Badge key={index} variant="destructive" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {data.keywordAnalysis.suggestions.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-blue-500" />
                Suggested Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {data.keywordAnalysis.suggestions.map((suggestion, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {suggestion}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Headline Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="w-5 h-5 text-blue-500" />
              Headline Improvements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.headline.map((rec, index) => (
                <Alert key={index} className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {rec}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Eye className="w-5 h-5 text-green-500" />
              Summary Enhancements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.summary.map((rec, index) => (
                <Alert key={index} className="bg-green-50 dark:bg-green-950 border-green-200">
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {rec}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Experience Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Briefcase className="w-5 h-5 text-purple-500" />
              Experience Optimization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recommendations.experience.map((rec, index) => (
                <Alert key={index} className="bg-purple-50 dark:bg-purple-950 border-purple-200">
                  <Lightbulb className="w-4 h-4" />
                  <AlertDescription className="text-sm">
                    {rec}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Skills & AI Skills Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="w-5 h-5 text-orange-500" />
              Skills & AI Competencies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm">General Skills</h4>
                <div className="space-y-2">
                  {data.recommendations.skills.map((rec, index) => (
                    <Alert key={index} className="bg-orange-50 dark:bg-orange-950 border-orange-200">
                      <Lightbulb className="w-4 h-4" />
                      <AlertDescription className="text-sm">
                        {rec}
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </div>

              {data.recommendations.aiSkills.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-sm flex items-center gap-1">
                    <Brain className="w-4 h-4" />
                    AI Skills to Learn
                  </h4>
                  <div className="space-y-2">
                    {data.recommendations.aiSkills.map((skill, index) => (
                      <Alert key={index} className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-cyan-200">
                        <Star className="w-4 h-4" />
                        <AlertDescription className="text-sm">
                          <strong>Learn {skill}:</strong> High-demand AI skill that can significantly boost your profile visibility and career prospects.
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Items Summary */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-600" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Quick Wins (1-2 hours)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Update headline with suggested keywords</li>
                <li>• Add missing skills to your profile</li>
                <li>• Optimize summary with action words</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Long-term Goals (1-3 months)</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Learn recommended AI skills</li>
                <li>• Quantify achievements in experience</li>
                <li>• Build industry connections</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}