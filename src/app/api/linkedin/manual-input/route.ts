/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/linkedin/manual-input/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// Email template (keep your existing template)
const generateEmailHTML = (profileData: any, analysisResults: any) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your LinkedIn Profile Analysis</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; }
    .score-badge { display: inline-block; background: white; color: #667eea; padding: 15px 30px; border-radius: 50px; font-size: 32px; font-weight: bold; margin-top: 20px; }
    .content { padding: 30px; }
    .section { margin-bottom: 30px; }
    .section h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 20px; }
    .recommendation { background: #f8f9fa; border-left: 4px solid #667eea; padding: 15px; margin: 10px 0; border-radius: 4px; }
    .recommendation strong { color: #667eea; }
    .stats { display: table; width: 100%; margin: 20px 0; }
    .stat-item { display: table-cell; text-align: center; padding: 15px; }
    .stat-value { font-size: 32px; font-weight: bold; color: #667eea; }
    .stat-label { font-size: 14px; color: #666; }
    .cta-button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .highlight { background: #fff3cd; padding: 2px 6px; border-radius: 3px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Your LinkedIn Profile Analysis</h1>
      <div class="score-badge">${analysisResults.overallScore}/100</div>
      <p style="margin-top: 10px; font-size: 16px;">Profile Optimization Score</p>
    </div>
    
    <div class="content">
      <div class="section">
        <h2>📊 Profile Overview</h2>
        <div class="stats">
          <div class="stat-item">
            <div class="stat-value">${analysisResults.headlineScore}</div>
            <div class="stat-label">Headline</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${analysisResults.summaryScore}</div>
            <div class="stat-label">Summary</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${analysisResults.experienceScore}</div>
            <div class="stat-label">Experience</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">${analysisResults.skillsScore}</div>
            <div class="stat-label">Skills</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>💡 Key Recommendations</h2>
        ${analysisResults.recommendations.map((rec: any) => `
          <div class="recommendation">
            <strong>${rec.title}</strong>
            <p style="margin: 5px 0 0 0;">${rec.description}</p>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <h2>🎯 Priority Actions</h2>
        <ol style="line-height: 2;">
          ${analysisResults.priorityActions.map((action: string) => `<li>${action}</li>`).join('')}
        </ol>
      </div>

      <div class="section" style="text-align: center; background: #f8f9fa; padding: 30px; border-radius: 8px;">
        <h3 style="margin-top: 0;">🚀 Want Expert Help?</h3>
        <p>Our LinkedIn optimization specialists can help you implement these recommendations and achieve your career goals.</p>
        <a href="${process.env.NEXT_PUBLIC_URL}/linkedin-optimizer/premium" class="cta-button">
          Get Professional Optimization
        </a>
        <p style="font-size: 14px; color: #666; margin-top: 10px;">
          Starting at R2,000 • Delivered in 5-7 days
        </p>
      </div>

      <div class="section">
        <p style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 0;">
          <strong>💼 Did you know?</strong> Optimized LinkedIn profiles receive <span class="highlight">40% more profile views</span> and <span class="highlight">3x more connection requests</span> from recruiters.
        </p>
      </div>
    </div>

    <div class="footer">
      <p><strong>LinkedIn Profile Optimizer</strong></p>
      <p>Need help? Reply to this email or visit our website.</p>
      <p style="margin-top: 15px;">
        <a href="${process.env.NEXT_PUBLIC_URL}" style="color: #667eea; text-decoration: none;">Visit Dashboard</a>
      </p>
    </div>
  </div>
</body>
</html>
  `
}

// Analysis function (your existing logic)
const analyzeProfile = (data: any) => {
  let headlineScore = 0
  let summaryScore = 0
  let experienceScore = 0
  let skillsScore = 0

  // Headline scoring
  if (data.headline) {
    headlineScore = Math.min(100, data.headline.length * 2)
    if (data.headline.includes('|')) headlineScore += 10
    if (data.headline.length > 50) headlineScore += 10
  }

  // Summary scoring
  if (data.summary) {
    summaryScore = Math.min(100, (data.summary.length / 5))
    if (data.summary.length > 200) summaryScore += 10
    if (data.summary.includes('achieve') || data.summary.includes('led')) summaryScore += 5
  }

  // Experience scoring
  const validExperiences = data.experiences?.filter((exp: any) => exp.title && exp.company) || []
  experienceScore = Math.min(100, validExperiences.length * 20)
  validExperiences.forEach((exp: any) => {
    if (exp.description && exp.description.length > 100) experienceScore += 10
  })

  // Skills scoring
  skillsScore = Math.min(100, (data.skills?.length || 0) * 5)

  const overallScore = Math.round((headlineScore + summaryScore + experienceScore + skillsScore) / 4)

  // Generate recommendations
  const recommendations = []
  const priorityActions = []

  if (headlineScore < 70) {
    recommendations.push({
      title: '🎯 Strengthen Your Headline',
      description: 'Your headline is the first thing people see. Include your role, key skills, and value proposition. Use the "|" separator to add multiple elements.'
    })
    priorityActions.push('Rewrite your headline to include role + skills + value proposition')
  }

  if (summaryScore < 70) {
    recommendations.push({
      title: '📝 Enhance Your Summary',
      description: 'Aim for 200-300 characters. Tell your professional story, highlight achievements, and include a call-to-action.'
    })
    priorityActions.push('Expand your summary with specific achievements and quantifiable results')
  }

  if (experienceScore < 70) {
    recommendations.push({
      title: '💼 Improve Experience Descriptions',
      description: 'Use bullet points and quantify your achievements (e.g., "Increased sales by 30%"). Include keywords relevant to your industry.'
    })
    priorityActions.push('Add metrics and specific outcomes to your experience descriptions')
  }

  if (skillsScore < 70) {
    recommendations.push({
      title: '🔧 Add More Skills',
      description: 'LinkedIn profiles with 10+ skills get significantly more visibility. Include both technical and soft skills relevant to your industry.'
    })
    priorityActions.push('Add at least 10-15 industry-relevant skills to your profile')
  }

  if (recommendations.length === 0) {
    recommendations.push({
      title: '✅ Great Profile!',
      description: 'Your profile is well-optimized. Keep it updated with new achievements and continue engaging with your network.'
    })
    priorityActions.push('Engage with content in your industry regularly', 'Update your profile quarterly with new achievements')
  }

  return {
    overallScore,
    headlineScore: Math.round(headlineScore),
    summaryScore: Math.round(summaryScore),
    experienceScore: Math.round(experienceScore),
    skillsScore: Math.round(skillsScore),
    recommendations,
    priorityActions,
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()
    
    // Validate required fields
    if (!data.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Analyze the profile
    const analysisResults = analyzeProfile(data)

    // ✅ SAVE TO LEAD TABLE IN DATABASE
    const lead = await prisma.lead.create({
      data: {
        email: data.email,
        phone: data.phone || null,
        headline: data.headline || null,
        profileUrl: data.profileUrl || null,
        location: data.location || null,
        industry: data.industry || null,
        summary: data.summary || null,
        skills: data.skills || [],
        overallScore: analysisResults.overallScore,
        headlineScore: analysisResults.headlineScore,
        summaryScore: analysisResults.summaryScore,
        experienceScore: analysisResults.experienceScore,
        skillsScore: analysisResults.skillsScore,
        marketingConsent: data.marketingConsent || false,
        contacted: false,
        converted: false,
        // Create related experiences and education if provided
        experiences: data.experiences?.length > 0 ? {
          create: data.experiences.map((exp: any) => ({
            title: exp.title,
            company: exp.company,
            location: exp.location || null,
            startDate: exp.startDate || null,
            endDate: exp.endDate || null,
            current: exp.current || false,
            description: exp.description || null,
          }))
        } : undefined,
        linkEducation: data.education?.length > 0 ? {
          create: data.education.map((edu: any) => ({
            school: edu.school,
            degree: edu.degree || null,
            field: edu.field || null,
            startYear: edu.startYear || null,
            endYear: edu.endYear || null,
          }))
        } : undefined,
      },
      include: {
        experiences: true,
        linkEducation: true,
      }
    })

    console.log('✅ Lead saved to database:', lead.id)

    // Send email with results
    const emailHTML = generateEmailHTML(data, analysisResults)
    
    try {
      await transporter.sendMail({
        from: `"LinkedIn Optimizer" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject: `🎯 Your LinkedIn Profile Score: ${analysisResults.overallScore}/100`,
        html: emailHTML,
      })
      console.log('✅ Analysis email sent to:', data.email)
    } catch (emailError) {
      console.error('❌ Failed to send email:', emailError)
      // Don't fail the request if email fails
    }

    // Send internal notification for sales follow-up
    try {
      await transporter.sendMail({
        from: `"LinkedIn Optimizer" <${process.env.SMTP_USER}>`,
        to: process.env.SALES_EMAIL || process.env.SMTP_USER,
        subject: `🔥 New Lead: ${data.headline || 'Profile Analysis Request'} (Score: ${analysisResults.overallScore}/100)`,
        html: `
          <h2>🎯 New Profile Analysis Lead</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Lead Score: ${analysisResults.overallScore}/100</h3>
            <p><strong>Lead ID:</strong> ${lead.id}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Phone:</strong> ${data.phone || 'Not provided'}</p>
            <p><strong>LinkedIn:</strong> ${data.profileUrl || 'Not provided'}</p>
            <p><strong>Location:</strong> ${data.location || 'Not provided'}</p>
            <p><strong>Industry:</strong> ${data.industry || 'Not provided'}</p>
            <p><strong>Marketing Consent:</strong> ${data.marketingConsent ? '✅ YES' : '❌ No'}</p>
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Profile Details</h4>
            <p><strong>Headline:</strong> ${data.headline || 'None'}</p>
            <p><strong>Summary Length:</strong> ${data.summary?.length || 0} characters</p>
            <p><strong>Experience Entries:</strong> ${data.experiences?.length || 0}</p>
            <p><strong>Education Entries:</strong> ${data.education?.length || 0}</p>
            <p><strong>Skills:</strong> ${data.skills?.length || 0} (${data.skills?.slice(0, 5).join(', ')}${data.skills?.length > 5 ? '...' : ''})</p>
          </div>

          <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <h4 style="margin-top: 0;">Score Breakdown</h4>
            <p>📝 Headline: ${analysisResults.headlineScore}/100</p>
            <p>📄 Summary: ${analysisResults.summaryScore}/100</p>
            <p>💼 Experience: ${analysisResults.experienceScore}/100</p>
            <p>🔧 Skills: ${analysisResults.skillsScore}/100</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_URL}/admin/leads?id=${lead.id}" 
               style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
              View Lead in Dashboard
            </a>
          </div>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated notification from LinkedIn Profile Optimizer
          </p>
        `,
      })
      console.log('✅ Sales notification sent')
    } catch (notificationError) {
      console.error('❌ Failed to send sales notification:', notificationError)
    }

    return NextResponse.json({
      success: true,
      leadId: lead.id,
      profileId: lead.id, // For backward compatibility
      message: 'Analysis complete. Check your email for results!',
      analysisResults,
    })
  } catch (error) {
    console.error('❌ Error processing profile:', error)
    
    // Check if it's a unique constraint error (duplicate email)
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: 'This email has already been analyzed. Please use a different email or contact support.' },
        { status: 409 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process profile analysis' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}