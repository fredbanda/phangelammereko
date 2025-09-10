import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/utils/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const reportId = searchParams.get("reportId")

    if (!reportId) {
      return NextResponse.json({ error: "Report ID is required" }, { status: 400 })
    }

    // Get the optimization report
    const report = await prisma.optimizationReport.findUnique({
      where: { id: reportId },
      include: {
        user: true,
        linkedinProfile: true,
      },
    })

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 })
    }

    // TODO: Generate PDF report using a library like Puppeteer or jsPDF
    // For now, return a JSON response with report data
    const reportData = {
      user: report.user.name || report.user.email,
      generatedAt: report.createdAt,
      overallScore: report.overallScore,
      scores: {
        headline: report.headlineScore,
        summary: report.summaryScore,
        experience: report.experienceScore,
        skills: report.skillsScore,
      },
      keywordAnalysis: report.keywordAnalysis,
      structureAnalysis: report.structureAnalysis,
      readabilityScore: report.readabilityScore,
      suggestions: {
        headline: report.headlineSuggestions,
        summary: report.summarySuggestions,
        experience: report.experienceSuggestions,
        skills: report.skillSuggestions,
      },
    }

    return NextResponse.json({
      success: true,
      report: reportData,
      downloadUrl: `/api/linkedin/download-report/pdf?reportId=${reportId}`, // Future PDF endpoint
    })
  } catch (error) {
    console.error("Download report error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
