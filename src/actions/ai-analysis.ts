"use server";

import { auth } from "@clerk/nextjs/server";
import prisma from "@/utils/prisma";

interface JobAnalysis {
  matchScore: number;
  strengths: string[];
  improvements: string[];
  recommendations: string[];
  skillsMatch: {
    matched: string[];
    missing: string[];
  };
  experienceMatch: boolean;
  salaryMatch: boolean;
}

export async function analyzeJobSuitability(jobId: string): Promise<JobAnalysis | null> {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  try {
    // Get job details
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        title: true,
        description: true,
        requirements: true,
        skills: true,
        salaryMin: true,
        salaryMax: true,
        experienceLevel: true,
        jobType: true,
        industry: true
      }
    });

    if (!job) {
      return null;
    }

    // Get user's latest resume
    const resume = await prisma.resume.findFirst({
      where: { userId },
      include: {
        workExperiences: true,
        hardSkills: true,
        softSkills: true,
        educations: true,
        certifications: true
      },
      orderBy: { updatedAt: 'desc' }
    });

    if (!resume) {
      return {
        matchScore: 0,
        strengths: [],
        improvements: ["Create a resume to get personalized job analysis"],
        recommendations: ["Build your resume to see how well you match this position"],
        skillsMatch: { matched: [], missing: job.skills },
        experienceMatch: false,
        salaryMatch: false
      };
    }

    // Analyze skills match
    const userSkills = [
      ...resume.hardSkills.map(s => s.title?.toLowerCase() || ''),
      ...resume.softSkills.map(s => s.title?.toLowerCase() || '')
    ].filter(Boolean);

    const jobSkills = job.skills.map(s => s.toLowerCase());
    const matchedSkills = jobSkills.filter(skill => 
      userSkills.some(userSkill => 
        userSkill.includes(skill) || skill.includes(userSkill)
      )
    );
    const missingSkills = jobSkills.filter(skill => !matchedSkills.includes(skill));

    // Calculate experience match
    const totalExperience = resume.workExperiences.length;
    const experienceMatch = analyzeExperienceMatch(job.experienceLevel, totalExperience);

    // Analyze salary expectations (simplified)
    const salaryMatch = job.salaryMin ? job.salaryMin >= 30000 : true; // Basic check

    // Calculate overall match score
    const skillsScore = jobSkills.length > 0 ? (matchedSkills.length / jobSkills.length) * 40 : 40;
    const experienceScore = experienceMatch ? 30 : 15;
    const salaryScore = salaryMatch ? 20 : 10;
    const profileScore = resume.summary ? 10 : 5;

    const matchScore = Math.round(skillsScore + experienceScore + salaryScore + profileScore);

    // Generate insights
    const strengths = generateStrengths(matchedSkills, experienceMatch, resume);
    const improvements = generateImprovements(missingSkills, !experienceMatch, resume);
    const recommendations = generateRecommendations(job, resume, matchScore);

    return {
      matchScore,
      strengths,
      improvements,
      recommendations,
      skillsMatch: {
        matched: matchedSkills,
        missing: missingSkills
      },
      experienceMatch,
      salaryMatch
    };

  } catch (error) {
    console.error('Error analyzing job suitability:', error);
    return null;
  }
}

function analyzeExperienceMatch(requiredLevel: string | null, userExperience: number): boolean {
  if (!requiredLevel) return true;
  
  const level = requiredLevel.toLowerCase();
  if (level.includes('entry') && userExperience >= 0) return true;
  if (level.includes('mid') && userExperience >= 2) return true;
  if (level.includes('senior') && userExperience >= 5) return true;
  if (level.includes('executive') && userExperience >= 8) return true;
  
  return userExperience >= 1; // Default
}

function generateStrengths(matchedSkills: string[], experienceMatch: boolean, resume: any): string[] {
  const strengths = [];
  
  if (matchedSkills.length > 0) {
    strengths.push(`Strong match in ${matchedSkills.length} required skill${matchedSkills.length > 1 ? 's' : ''}`);
  }
  
  if (experienceMatch) {
    strengths.push("Experience level aligns with job requirements");
  }
  
  if (resume.workExperiences.length > 0) {
    strengths.push("Relevant work experience documented");
  }
  
  if (resume.educations.length > 0) {
    strengths.push("Educational background supports application");
  }
  
  if (resume.certifications.length > 0) {
    strengths.push("Professional certifications enhance profile");
  }
  
  return strengths.length > 0 ? strengths : ["Profile shows potential for this role"];
}

function generateImprovements(missingSkills: string[], experienceGap: boolean, resume: any): string[] {
  const improvements = [];
  
  if (missingSkills.length > 0) {
    improvements.push(`Consider developing skills in: ${missingSkills.slice(0, 3).join(', ')}`);
  }
  
  if (experienceGap) {
    improvements.push("Highlight transferable skills to bridge experience gap");
  }
  
  if (!resume.summary) {
    improvements.push("Add a professional summary to strengthen your profile");
  }
  
  if (resume.workExperiences.length === 0) {
    improvements.push("Add work experience details to improve match");
  }
  
  return improvements.length > 0 ? improvements : ["Profile looks strong for this position"];
}

function generateRecommendations(job: any, resume: any, matchScore: number): string[] {
  const recommendations = [];
  
  if (matchScore < 50) {
    recommendations.push("Consider gaining more relevant experience before applying");
    recommendations.push("Focus on developing the key skills mentioned in the job description");
  } else if (matchScore < 75) {
    recommendations.push("Tailor your cover letter to emphasize relevant experience");
    recommendations.push("Highlight specific achievements that align with job requirements");
  } else {
    recommendations.push("You're a strong candidate - apply with confidence!");
    recommendations.push("Emphasize your matching skills and experience in your application");
  }
  
  if (job.industry && resume.workExperiences.length > 0) {
    recommendations.push("Highlight any industry-specific experience in your application");
  }
  
  recommendations.push("Research the company culture and values before applying");
  
  return recommendations;
}