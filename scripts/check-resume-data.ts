// Run this in your terminal: npx tsx scripts/check-resume-data.ts
// This will help debug if data is being saved to the database

import prisma from "../src/utils/prisma";

async function checkResumeData() {
  try {
    const resumes = await prisma.resume.findMany({
      include: {
        workExperiences: true,
        educations: true,
        hardSkills: true,
        softSkills: true,
        certifications: true,
        awards: true,
        projectsPublications: true,
      },
      orderBy: {
        updatedAt: 'desc'
      },
      take: 1
    });

    console.log("=== LATEST RESUME DATA ===");
    console.log(JSON.stringify(resumes, null, 2));
    
    if (resumes.length > 0) {
      const resume = resumes[0];
      console.log("\n=== SUMMARY ===");
      console.log(`Resume ID: ${resume.id}`);
      console.log(`Title: ${resume.title}`);
      console.log(`Work Experiences: ${resume.workExperiences.length}`);
      console.log(`Educations: ${resume.educations.length}`);
      console.log(`Hard Skills: ${resume.hardSkills.length}`);
      console.log(`Soft Skills: ${resume.softSkills.length}`);
      console.log(`Certifications: ${resume.certifications.length}`);
      console.log(`Awards: ${resume.awards.length}`);
      console.log(`Projects/Publications: ${resume.projectsPublications.length}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResumeData();
