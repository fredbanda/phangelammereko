/* eslint-disable @typescript-eslint/no-explicit-any */
import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"
import jsPDF from 'jspdf'

// Helper function to safely parse JSON data
const safeJsonParse = (data: any) => {
  if (typeof data === 'string') {
    try {
      return JSON.parse(data)
    } catch (error) {
      console.error('Failed to parse JSON:', error)
      return null
    }
  }
  // If it's already an object, return it as is
  if (typeof data === 'object' && data !== null) {
    return data
  }
  return null
}

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

    // Generate PDF using jsPDF
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    let yPosition = 20

    // Helper function to add text with word wrapping
    const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
      doc.setFontSize(fontSize)
      doc.setFont('helvetica', isBold ? 'bold' : 'normal')
      
      if (yPosition > pageHeight - 30) {
        doc.addPage()
        yPosition = 20
      }
      
      const lines = doc.splitTextToSize(text, pageWidth - 40)
      doc.text(lines, 20, yPosition)
      yPosition += (lines.length * fontSize * 0.5) + 5
    }

    // Helper function to add a new section
    const addSection = (title: string) => {
      yPosition += 10
      if (yPosition > pageHeight - 50) {
        doc.addPage()
        yPosition = 20
      }
      doc.setFillColor(240, 240, 240)
      doc.rect(20, yPosition - 5, pageWidth - 40, 15, 'F')
      addText(title, 14, true)
      yPosition += 5
    }

    // Header
    doc.setFillColor(59, 130, 246) // Blue background
    doc.rect(0, 0, pageWidth, 40, 'F')
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont('helvetica', 'bold')
    doc.text('LinkedIn Profile Analysis Report', 20, 25)

    // Reset text color
    doc.setTextColor(0, 0, 0)
    yPosition = 60

    // User info
    addText(`Report for: ${report.user.name || report.user.email}`, 16, true)
    addText(`Generated on: ${new Date(report.createdAt).toLocaleDateString()}`, 12)
    yPosition += 10

    // Overall Score Section
    addSection('OVERALL PROFILE SCORE')
    addText(`Score: ${report.overallScore}/100`, 18, true)
    
    const getScoreLabel = (score: number) => {
      if (score >= 80) return "Excellent"
      if (score >= 60) return "Good"
      if (score >= 40) return "Needs Work"
      return "Poor"
    }
    
    addText(`Rating: ${getScoreLabel(report.overallScore)}`, 14)
    yPosition += 10

    // Individual Scores
    addSection('DETAILED SCORES')
    addText(`Headline Score: ${report.headlineScore || 0}/100`, 12)
    addText(`Summary Score: ${report.summaryScore || 0}/100`, 12)
    addText(`Experience Score: ${report.experienceScore || 0}/100`, 12)
    addText(`Skills Score: ${report.skillsScore || 0}/100`, 12)

    // Keyword Analysis
    if (report.keywordAnalysis) {
      const keywordData = safeJsonParse(report.keywordAnalysis)
      if (keywordData) {
        addSection('KEYWORD ANALYSIS')
        
        if (keywordData.missingKeywords && Array.isArray(keywordData.missingKeywords) && keywordData.missingKeywords.length > 0) {
          addText('Missing Keywords:', 12, true)
          addText(keywordData.missingKeywords.slice(0, 10).join(', '), 10)
          yPosition += 5
        }
        
        if (keywordData.underusedKeywords && Array.isArray(keywordData.underusedKeywords) && keywordData.underusedKeywords.length > 0) {
          addText('Underused Keywords:', 12, true)
          addText(keywordData.underusedKeywords.slice(0, 8).join(', '), 10)
          yPosition += 5
        }
      }
    }

    // Structure Analysis
    if (report.structureAnalysis) {
      const structureData = safeJsonParse(report.structureAnalysis)
      if (structureData) {
        addSection('PROFILE STRUCTURE')
        
        const checkMark = structureData.hasHeadline ? '✓' : '✗'
        addText(`${checkMark} Professional Headline: ${structureData.hasHeadline ? 'Complete' : 'Missing'}`, 11)
        
        const summaryCheck = structureData.hasSummary ? '✓' : '✗'
        addText(`${summaryCheck} About/Summary: ${structureData.hasSummary ? 'Complete' : 'Missing'}`, 11)
        
        const expCheck = structureData.hasExperience ? '✓' : '✗'
        addText(`${expCheck} Work Experience: ${structureData.hasExperience ? 'Complete' : 'Missing'}`, 11)
        
        const skillsCheck = structureData.hasSkills ? '✓' : '✗'
        addText(`${skillsCheck} Skills Section: ${structureData.hasSkills ? 'Complete' : 'Missing'}`, 11)
        
        addText(`Completeness Score: ${structureData.completenessScore || 0}%`, 12, true)
      }
    }

    // Readability Analysis
    if (report.readabilityScore) {
      const readabilityData = safeJsonParse(report.readabilityScore)
      if (readabilityData) {
        addSection('READABILITY ANALYSIS')
        
        addText(`Readability Score: ${readabilityData.readabilityScore || 0}/100`, 12, true)
        addText(`Sentence Count: ${readabilityData.sentenceCount || 0}`, 11)
        addText(`Average Sentence Length: ${readabilityData.avgSentenceLength || 0} words`, 11)
        addText(`Action Verbs: ${readabilityData.activeVerbCount || 0}`, 11)
        addText(`Quantifiable Metrics: ${readabilityData.metricsCount || 0}`, 11)
        addText(`Jargon Score: ${readabilityData.jargonScore || 0}%`, 11)
      }
    }

    // Suggestions
    addSection('RECOMMENDATIONS')
    
    if (report.headlineSuggestions) {
      const headlineSuggestions = safeJsonParse(report.headlineSuggestions)
      if (headlineSuggestions && Array.isArray(headlineSuggestions) && headlineSuggestions.length > 0) {
        addText('Headline Suggestions:', 12, true)
        headlineSuggestions.slice(0, 3).forEach((suggestion: any, index: number) => {
          const suggestionText = typeof suggestion === 'object' ? suggestion.suggestion : suggestion
          addText(`${index + 1}. ${suggestionText}`, 10)
        })
        yPosition += 5
      }
    }

    if (report.summarySuggestions) {
      const summarySuggestions = safeJsonParse(report.summarySuggestions)
      if (summarySuggestions && Array.isArray(summarySuggestions) && summarySuggestions.length > 0) {
        addText('Summary Suggestions:', 12, true)
        summarySuggestions.slice(0, 3).forEach((suggestion: any, index: number) => {
          const suggestionText = typeof suggestion === 'object' ? suggestion.suggestion : suggestion
          addText(`${index + 1}. ${suggestionText}`, 10)
        })
        yPosition += 5
      }
    }

    // Footer
    const totalPages = doc.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      doc.setFontSize(8)
      doc.setTextColor(128, 128, 128)
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - 40, pageHeight - 10)
      doc.text('Generated by LinkedIn Profile Analyzer', 20, pageHeight - 10)
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'))

    // Create a clean filename using user's name
    const userName = report.user.name || report.user.email?.split('@')[0] || 'user'
    const cleanUserName = userName.replace(/[^a-zA-Z0-9\s-]/g, '').replace(/\s+/g, '-').toLowerCase()
    const timestamp = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
    const filename = `linkedin-analysis-${cleanUserName}-${timestamp}.pdf`

    // Return PDF as response
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    })

  } catch (error) {
    console.error("PDF generation error:", error)
    return NextResponse.json({ error: "Failed to generate PDF report" }, { status: 500 })
  }
}