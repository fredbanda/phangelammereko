"use server";

import { resumeSchema, ResumeValues } from "@/lib/validations";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import { revalidatePath } from "next/cache";
import path from "path";

export async function saveResume(values: ResumeValues) {
  console.log("🔥 FUNCTION CALLED - saveResume started");
  const { id } = values;

  console.log("=== DEBUGGING saveResume ===");
  console.log("1. Raw values received:", JSON.stringify(values, null, 2));
  console.log("2. Resume ID:", id);

  try {
    // ✅ Parse + extract explicitly
    const {
      photo,
      workExperiences = [],
      educations = [],
      skills = [],
      certifications = [],
      awards = [],
      projectsPublications = [],
      title,
      description,
      firstName,
      lastName,
      email,
      phone,
      address,
      location,
      city,
      country,
      linkedin,
      github,
      twitter,
      portfolioUrl,
      jobTitle,
      summary,
      colorHex,
      borderStyle,
    } = resumeSchema.parse(values);

    console.log("3. Parsed successfully");
    console.log("4. Work experiences count:", workExperiences.length);
    console.log("5. Work experiences data:", JSON.stringify(workExperiences, null, 2));

    const resumeValues = {
      title,
      description,
      firstName,
      lastName,
      email,
      phone,
      address,
      location,
      city,
      country,
      linkedin,
      github,
      twitter,
      portfolioUrl,
      jobTitle,
      summary,
      colorHex,
      borderStyle,
    };

    console.log("6. Resume base values:", JSON.stringify(resumeValues, null, 2));

    const { userId } = await auth();
    if (!userId) throw new Error("User not logged in");

    console.log("7. User ID:", userId);

    // Check DB connection
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("8. ✅ Database connection successful");
    } catch (err) {
      console.error("8. ❌ Database connection failed:", err);
      throw err;
    }

    const existingResume = id
      ? await prisma.resume.findUnique({ 
          where: { id, userId },
          include: {
            workExperiences: true,
            educations: true,
            skills: true,
            certifications: true,
            awards: true,
            projectsPublications: true,
          }
        })
      : null;

    console.log("9. Existing resume found:", !!existingResume);
    if (existingResume) {
      console.log("10. Existing resume ID:", existingResume.id);
      console.log("11. Existing work experiences count:", existingResume.workExperiences.length);
    }

    if (id && !existingResume) throw new Error("Resume not found");

    // ✅ Handle photo upload/deletion
    let newPhotoUrl: string | undefined | null = undefined;

    if (photo instanceof File) {
      console.log("12. Processing photo upload...");
      if (existingResume?.photoUrl) {
        await del(existingResume.photoUrl, {
          token: process.env.PHANGELA_MMEREKO_BLOB_READ_WRITE_TOKEN,
        });
      }

      const blob = await put(`resume_photo/${path.extname(photo.name)}`, photo, {
        access: "public",
        token: process.env.PHANGELA_MMEREKO_BLOB_READ_WRITE_TOKEN,
        allowOverwrite: true,
      });

      newPhotoUrl = blob.url;
      console.log("13. Photo uploaded:", newPhotoUrl);
    } else if (photo === null) {
      console.log("12. Deleting existing photo...");
      if (existingResume?.photoUrl) {
        await del(existingResume.photoUrl, {
          token: process.env.PHANGELA_MMEREKO_BLOB_READ_WRITE_TOKEN,
        });
      }
      newPhotoUrl = null;
    }

    // Prepare the data for Prisma operation
    const updateData = {
      ...resumeValues,
      ...(newPhotoUrl !== undefined && { photoUrl: newPhotoUrl }),
      workExperiences: {
        deleteMany: {},
        create: workExperiences.map((exp) => ({
          ...exp,
          startDate: exp.startDate ? new Date(exp.startDate) : undefined,
          endDate: exp.endDate ? new Date(exp.endDate) : undefined,
        })),
      },
      educations: {
        deleteMany: {},
        create: educations.map((edu) => ({
          ...edu,
          startDate: edu.startDate ? new Date(edu.startDate) : undefined,
          endDate: edu.endDate ? new Date(edu.endDate) : undefined,
        })),
      },
      skills: {
        deleteMany: {},
        create: skills,
      },
      certifications: {
        deleteMany: {},
        create: certifications,
      },
      awards: {
        deleteMany: {},
        create: awards,
      },
      projectsPublications: {
        deleteMany: {},
        create: projectsPublications,
      },
      updatedAt: new Date(),
    };

    console.log("14. Final update data structure:", JSON.stringify(updateData, null, 2));

    // ✅ Save/update in DB
    if (id) {
      console.log("15. Attempting to UPDATE resume...");
      const result = await prisma.resume.update({
        where: { id, userId },
        data: updateData,
      });
      console.log("16. ✅ Resume updated successfully");
      return result;
    } else {
      console.log("15. Attempting to CREATE resume...");
      const result = await prisma.resume.create({
        data: {
          ...resumeValues,
          userId,
          photoUrl: newPhotoUrl,
          workExperiences: {
            create: workExperiences.map((exp) => ({
              ...exp,
              startDate: exp.startDate ? new Date(exp.startDate) : undefined,
              endDate: exp.endDate ? new Date(exp.endDate) : undefined,
            })),
          },
          educations: {
            create: educations.map((edu) => ({
              ...edu,
              startDate: edu.startDate ? new Date(edu.startDate) : undefined,
              endDate: edu.endDate ? new Date(edu.endDate) : undefined,
            })),
          },
          skills: { create: skills },
          certifications: { create: certifications },
          awards: { create: awards },
          projectsPublications: { create: projectsPublications },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
      console.log("16. ✅ Resume created successfully");
      return result;
    }
  } catch (error) {
    console.error("❌ Error in saveResume:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    throw error;
  }
}

export async function deleteResume(id: string) {
  console.log("🔥 FUNCTION CALLED - deleteResume started");
  
  const { userId } = await auth();
  if (!userId) {
    throw new Error("Unauthorized user");
  }

  const resume = await prisma.resume.findUnique({
    where: {
      id: id,
      userId: userId,
    }
  });

  if (!resume) {
    throw new Error("Resume not found");
  }

  // Delete photo from blob storage
  if (resume.photoUrl) {
    await del(resume.photoUrl, {
      token: process.env.PHANGELA_MMEREKO_BLOB_READ_WRITE_TOKEN,
    });
  }

  // Delete all related records first to avoid foreign key constraint violations
  await prisma.$transaction(async (tx) => {
    // Delete all related records
    await tx.workExperience.deleteMany({
      where: { resumeId: id }
    });
    
    await tx.education.deleteMany({
      where: { resumeId: id }
    });
    
    await tx.skill.deleteMany({
      where: { resumeId: id }
    });
    
    await tx.certification.deleteMany({
      where: { resumeId: id }
    });
    
    await tx.award.deleteMany({
      where: { resumeId: id }
    });
    
    await tx.projectsPublication.deleteMany({
      where: { resumeId: id }
    });

    // Now delete the resume
    await tx.resume.delete({
      where: {
        id: id,
      }
    });
  });

  revalidatePath("/resumes");
}