import { LinkedinAnalyzer } from "@/components/linkedin/linkedin-analyzer"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "LinkedIn Profile Analyzer - AI-Powered Optimization",
  description: "Get AI-powered insights and recommendations to optimize your LinkedIn profile for better career opportunities. Upload your profile or enter details manually for instant analysis.",
  keywords: "LinkedIn optimization, profile analysis, AI career tools, professional development, job search",
}

export default function LinkedinAnalyzerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <LinkedinAnalyzer />
    </div>
  )
}