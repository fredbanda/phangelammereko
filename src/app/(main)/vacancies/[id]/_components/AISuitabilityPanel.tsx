"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { Brain, FileText } from "lucide-react"

interface AISuitabilityPanelProps {
  jobId: string
}

interface AnalysisResult {
  score: number
  matchCount: number
  totalKeywords: number
}

export function AISuitabilityPanel({ jobId }: AISuitabilityPanelProps) {
  const [resume, setResume] = useState("")
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeMatch = async () => {
    if (!resume.trim()) {
      alert("Please paste your resume text")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/jobs/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobId, resumeText: resume }),
      })
      
      const result = await res.json()
      setAnalysis(result)
    } catch (err) {
      console.error("Analysis failed:", err)
      alert("Analysis failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Suitability Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Paste your resume text:</label>
          <Textarea
            placeholder="Copy and paste your resume content here for analysis..."
            value={resume}
            onChange={(e) => setResume(e.target.value)}
            rows={6}
          />
        </div>
        
        <Button onClick={analyzeMatch} disabled={loading} className="w-full">
          <FileText className="h-4 w-4 mr-2" />
          {loading ? "Analyzing..." : "Analyze Match"}
        </Button>

        {analysis && (
          <div className="mt-6 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-semibold mb-3">Analysis Results</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Match Score:</span>
                <span className={`font-bold ${getScoreColor(analysis.score)}`}>
                  {analysis.score}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Keywords Matched:</span>
                <span>{analysis.matchCount} / {analysis.totalKeywords}</span>
              </div>
            </div>
            
            <div className="mt-3 text-sm text-muted-foreground">
              {analysis.score >= 80 && "🎉 Excellent match! You're highly qualified for this role."}
              {analysis.score >= 60 && analysis.score < 80 && "👍 Good match! Consider highlighting relevant skills."}
              {analysis.score < 60 && "💡 Consider developing skills mentioned in the job description."}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}