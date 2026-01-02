import { NextRequest, NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profileId = searchParams.get("profileId")
    
    if (!profileId) {
      return NextResponse.json(
        { error: "Profile ID is required" },
        { status: 400 }
      )
    }

    // Get the profile and report data
    const profile = await prisma.linkedinProfile.findUnique({
      where: { id: profileId },
      include: {
        optimizationReports: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    if (!profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }

    const report = profile.optimizationReports[0]
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      )
    }

    // Generate A4-sized PDF-ready HTML report
    const htmlReport = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>LinkedIn Profile Optimization Report</title>
        <meta charset="UTF-8">
        <style>
            @page {
                size: A4;
                margin: 20mm;
            }
            * {
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                font-size: 12px;
            }
            .header {
                text-align: center;
                border-bottom: 3px solid #0066cc;
                padding-bottom: 20px;
                margin-bottom: 30px;
            }
            .logo {
                font-size: 24px;
                font-weight: bold;
                color: #0066cc;
                margin-bottom: 10px;
            }
            .score {
                font-size: 48px;
                font-weight: bold;
                color: #0066cc;
                margin: 10px 0;
            }
            .date {
                color: #666;
                font-size: 11px;
            }
            .section {
                margin-bottom: 25px;
                page-break-inside: avoid;
            }
            .section h2 {
                color: #0066cc;
                border-bottom: 2px solid #e0e0e0;
                padding-bottom: 8px;
                margin-bottom: 15px;
                font-size: 16px;
            }
            .section h3 {
                color: #333;
                font-size: 14px;
                margin-bottom: 10px;
            }
            .recommendation {
                background: #f8f9fa;
                padding: 12px;
                margin: 8px 0;
                border-left: 4px solid #0066cc;
                border-radius: 4px;
                font-size: 11px;
            }
            .score-breakdown {
                display: flex;
                justify-content: space-around;
                margin: 20px 0;
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
            }
            .score-item {
                text-align: center;
                flex: 1;
            }
            .score-value {
                font-size: 24px;
                font-weight: bold;
                color: #0066cc;
                display: block;
            }
            .score-label {
                font-size: 10px;
                color: #666;
                margin-top: 5px;
            }
            .summary-box {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
            }
            .quick-wins {
                background: #e8f5e8;
                border-left: 4px solid #28a745;
            }
            .long-term {
                background: #fff3cd;
                border-left: 4px solid #ffc107;
            }
            ul {
                margin: 8px 0;
                padding-left: 20px;
            }
            li {
                margin-bottom: 4px;
                font-size: 11px;
            }
            .footer {
                margin-top: 40px;
                padding-top: 20px;
                border-top: 1px solid #ddd;
                text-align: center;
                font-size: 10px;
                color: #666;
            }
            .page-break {
                page-break-before: always;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="logo">CareerForty</div>
            <h1>LinkedIn Profile Optimization Report</h1>
            <div class="score">${report.overallScore}%</div>
            <p><strong>Overall Profile Score</strong></p>
            <p class="date">Generated on ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</p>
        </div>

        <div class="summary-box">
            <h2 style="color: white; border: none; margin-bottom: 10px;">Executive Summary</h2>
            <p>Your LinkedIn profile has been analyzed using AI-powered insights. This report provides actionable recommendations to improve your professional presence and career opportunities.</p>
            <p><strong>Key Finding:</strong> Your profile has significant potential for improvement with targeted optimizations.</p>
        </div>

        <div class="section">
            <h2>Profile Score Breakdown</h2>
            <div class="score-breakdown">
                <div class="score-item">
                    <span class="score-value">${report.headlineScore || 0}%</span>
                    <div class="score-label">Headline</div>
                </div>
                <div class="score-item">
                    <span class="score-value">${report.summaryScore || 0}%</span>
                    <div class="score-label">Summary</div>
                </div>
                <div class="score-item">
                    <span class="score-value">${report.experienceScore || 0}%</span>
                    <div class="score-label">Experience</div>
                </div>
                <div class="score-item">
                    <span class="score-value">${report.skillsScore || 0}%</span>
                    <div class="score-label">Skills</div>
                </div>
            </div>
        </div>

        <div class="section">
            <h2>Headline Optimization</h2>
            <h3>Current Score: ${report.headlineScore || 0}%</h3>
            ${(report.headlineSuggestions as string[] || []).map(suggestion => 
              `<div class="recommendation"><strong>Recommendation:</strong> ${suggestion}</div>`
            ).join('')}
        </div>

        <div class="section">
            <h2>Summary Enhancement</h2>
            <h3>Current Score: ${report.summaryScore || 0}%</h3>
            ${(report.summarySuggestions as string[] || []).map(suggestion => 
              `<div class="recommendation"><strong>Recommendation:</strong> ${suggestion}</div>`
            ).join('')}
        </div>

        <div class="page-break"></div>

        <div class="section">
            <h2>Experience Optimization</h2>
            <h3>Current Score: ${report.experienceScore || 0}%</h3>
            ${(report.experienceSuggestions as string[] || []).map(suggestion => 
              `<div class="recommendation"><strong>Recommendation:</strong> ${suggestion}</div>`
            ).join('')}
        </div>

        <div class="section">
            <h2>Skills Enhancement</h2>
            <h3>Current Score: ${report.skillsScore || 0}%</h3>
            ${(report.skillSuggestions as string[] || []).map(suggestion => 
              `<div class="recommendation"><strong>Recommendation:</strong> ${suggestion}</div>`
            ).join('')}
        </div>

        <div class="section">
            <h2>Implementation Roadmap</h2>
            
            <div class="recommendation quick-wins">
                <h3>Quick Wins (1-2 hours)</h3>
                <ul>
                    <li>Update your headline with industry-specific keywords</li>
                    <li>Add missing skills identified in the analysis</li>
                    <li>Optimize your summary with action-oriented language</li>
                    <li>Include quantifiable achievements in experience descriptions</li>
                </ul>
            </div>
            
            <div class="recommendation long-term">
                <h3>Long-term Goals (1-3 months)</h3>
                <ul>
                    <li>Learn and add AI/ML skills to stay competitive</li>
                    <li>Expand your professional network in your industry</li>
                    <li>Regularly publish industry-relevant content</li>
                    <li>Seek recommendations from colleagues and clients</li>
                </ul>
            </div>
        </div>

        <div class="section">
            <h2>Expected Impact</h2>
            <div class="recommendation">
                <p><strong>Potential Score Improvement:</strong> +${Math.min(100 - (report.overallScore || 0), 35)}%</p>
                <p><strong>Profile Visibility:</strong> Implementing these recommendations could increase your profile views by 40-60%</p>
                <p><strong>Career Opportunities:</strong> Optimized profiles receive 3x more connection requests and job inquiries</p>
            </div>
        </div>

        <div class="footer">
            <p><strong>CareerForty - LinkedIn Optimization Services</strong></p>
            <p>Need help implementing these recommendations? Contact us for professional optimization services.</p>
            <p>Email: support@careerforty.com | Website: https://careerforty.com</p>
            <p style="margin-top: 10px; font-size: 9px;">This report was generated using AI-powered analysis. Results may vary based on individual profile characteristics and industry standards.</p>
        </div>
    </body>
    </html>
    `

    return new NextResponse(htmlReport, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="linkedin-report-${profileId}.html"`,
      },
    })

  } catch (error) {
    console.error("PDF download error:", error)
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    )
  }
}