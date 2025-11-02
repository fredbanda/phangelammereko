/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound, redirect } from "next/navigation";
import { AnalysisResults } from "@/components/linkedin/analysis-results";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { ProfileAnalyzer } from "@/lib/analysis/profile-analyzer";
import { Prisma } from "@prisma/client";

// Updated interface for Next.js 15 - params is now a Promise
interface AnalysisPageProps {
  params: Promise<{
    profileId: string;
  }>;
}

// Define the expected type for ProfileAnalyzer input
interface ProfileInput {
  headline: string;
  email: string;
  summary: string;
  location: string;
  industry: string;
  experiences: {
    title: string;
    company: string;
    startDate: string;
    current: boolean;
    location?: string;
    endDate?: string;
    description?: string;
  }[];
  education: {
    degree?: string;
    fieldOfStudy?: string;
    school: string;
    startDate?: string;
    endDate?: string;
  }[];
  skills: string[];
  profileUrl: string;
}

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  // Await the params Promise to get the actual parameters
  const { profileId } = await params;
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get the LinkedIn profile and latest optimization report
  const linkedinProfile = await prisma.linkedinProfile.findUnique({
    where: {
      id: profileId,
      userId: userId,
    },
    include: {
      optimizationReports: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!linkedinProfile) {
    notFound();
  }

  let latestReport = linkedinProfile.optimizationReports[0];

  // If no report exists, trigger analysis
  if (!latestReport) {
    try {
      // Transform and validate experiences
      const experiences = Array.isArray(linkedinProfile.experiences)
        ? linkedinProfile.experiences.map((exp: any) => ({
            title: String(exp.title || ""),
            company: String(exp.company || ""),
            startDate: String(exp.startDate || ""),
            current: Boolean(exp.current || false),
            location: exp.location ? String(exp.location) : undefined,
            endDate: exp.endDate ? String(exp.endDate) : undefined,
            description: exp.description ? String(exp.description) : undefined,
          }))
        : [];

      // Transform and validate education
      const education = Array.isArray(linkedinProfile.education)
        ? linkedinProfile.education.map((edu: any) => ({
            degree: edu.degree ? String(edu.degree) : undefined,
            fieldOfStudy: edu.fieldOfStudy ? String(edu.fieldOfStudy) : undefined,
            school: String(edu.school || ""),
            startDate: edu.startDate ? String(edu.startDate) : undefined,
            endDate: edu.endDate ? String(edu.endDate) : undefined,
          }))
        : [];

      // Transform and validate skills
      const skills = Array.isArray(linkedinProfile.skills)
        ? linkedinProfile.skills.map((skill: any) => String(skill))
        : [];

    
      // Construct profileInput with correct types
      const profileInput: ProfileInput = {
        headline: linkedinProfile.headline || "",
        email: linkedinProfile.email || "",
        summary: linkedinProfile.summary || "",
        location: linkedinProfile.location || "",
        industry: linkedinProfile.industry || "",
        experiences,
        education,
        skills,
        profileUrl: linkedinProfile.profileUrl || "",
      };

      // Perform analysis
      const analyzer = new ProfileAnalyzer();
      const analysisResult = await analyzer.analyze(profileInput);

      // Convert analysis objects to Prisma-compatible JSON
      const convertToJsonValue = (obj: any): Prisma.InputJsonValue => {
        return JSON.parse(JSON.stringify(obj));
      };

      // Save analysis results to database
      const optimizationReport = await prisma.optimizationReport.create({
        data: {
          userId: userId,
          email: linkedinProfile.email,
          linkedinProfileId: profileId,
          overallScore: analysisResult.overallScore,
          headlineScore: analysisResult.scores.keyword || 0,
          summaryScore: analysisResult.scores.readability || 0,
          experienceScore: analysisResult.scores.experience || 0,
          skillsScore: analysisResult.scores.structure || 0,
          keywordAnalysis: convertToJsonValue(analysisResult.keywordAnalysis || {}),
          structureAnalysis: convertToJsonValue(analysisResult.structureAnalysis || {}),
          readabilityScore: convertToJsonValue(analysisResult.readabilityAnalysis || {}),
          headlineSuggestions: convertToJsonValue(
            analysisResult.suggestions?.filter((s) => s.type === "headline") || []
          ),
          summarySuggestions: convertToJsonValue(
            analysisResult.suggestions?.filter((s) => s.type === "summary") || []
          ),
          experienceSuggestions: convertToJsonValue(
            analysisResult.suggestions?.filter((s) => s.type === "experience") || []
          ),
          skillSuggestions: convertToJsonValue(
            analysisResult.suggestions?.filter((s) => s.type === "skills") || []
          ),
          reportGenerated: true,
        },
      });

      // Update profile with analysis timestamp and score
      await prisma.linkedinProfile.update({
        where: { id: profileId },
        data: {
          lastAnalyzed: new Date(),
          profileScore: analysisResult.overallScore,
        },
      });

      // Set the latest report for rendering
      latestReport = optimizationReport;
    } catch (error) {
      console.error("Analysis error:", error);
      return (
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md">
            <div className="text-destructive text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Analysis Failed</h2>
            <p className="text-muted-foreground mb-4">
              We encountered an error while analyzing your LinkedIn profile.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              {error instanceof Error ? error.message : "Unknown error occurred"}
            </p>
            <a
              href={`/linkedin-optimizer/analysis/${profileId}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Try Again
            </a>
          </div>
        </div>
      );
    }
  }

  // Now render with the report (either existing or newly created)
  return (
    <div className="min-h-screen bg-background">
      <AnalysisResults 
        profile={{
          ...linkedinProfile, 
          profileScore: latestReport?.overallScore || linkedinProfile.profileScore || 0
        }} 
        report={latestReport} 
      />
    </div>
  );
}