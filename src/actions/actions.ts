"use server";

import { resumeSchema, ResumeValues } from "@/lib/validations";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import cloudinary from "@/utils/cloudinary";

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
      softSkills = [],
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

    // Check existing resume
    const existingResume = id
      ? await prisma.resume.findUnique({ 
          where: { id, userId },
          include: {
            workExperiences: true,
            educations: true,
            skills: true,
            softSkills: true,
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

    // ✅ Handle photo upload/deletion with Cloudinary
    let newPhotoUrl: string | undefined | null = undefined;

    if (photo instanceof File) {
      console.log("12. Processing photo upload...");

      // ✅ Delete old photo if exists
      if (existingResume?.photoUrl) {
        try {
          // Extract public_id from Cloudinary URL
          const urlParts = existingResume.photoUrl.split('/');
          const fileWithExtension = urlParts[urlParts.length - 1];
          const folderAndFile = urlParts.slice(urlParts.indexOf('resume_photos'));
          const publicId = folderAndFile.join('/').replace(/\.[^/.]+$/, ""); // Remove extension
          
          console.log("Deleting old photo with public_id:", publicId);
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("⚠️ Failed to delete old photo:", err);
        }
      }

      // ✅ Upload new photo using Promise-based approach
      try {
        const arrayBuffer = await photo.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64String = buffer.toString('base64');
        const dataURI = `data:${photo.type};base64,${base64String}`;

        const uploadResult = await cloudinary.uploader.upload(dataURI, {
          folder: "resume_photos",
          resource_type: "image",
          transformation: [
            { width: 400, height: 400, crop: "fill", quality: "auto" }
          ]
        });

        newPhotoUrl = uploadResult.secure_url;
        console.log("13. Photo uploaded successfully:", newPhotoUrl);
      } catch (uploadError) {
        console.error("❌ Photo upload failed:", uploadError);
        throw new Error("Failed to upload photo to Cloudinary");
      }

    } else if (photo === null) {
      console.log("12. Deleting existing photo...");
      
      // ✅ Delete existing photo from Cloudinary
      if (existingResume?.photoUrl) {
        try {
          const urlParts = existingResume.photoUrl.split('/');
          const folderAndFile = urlParts.slice(urlParts.indexOf('resume_photos'));
          const publicId = folderAndFile.join('/').replace(/\.[^/.]+$/, "");
          
          console.log("Deleting photo with public_id:", publicId);
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.warn("⚠️ Failed to delete existing photo:", err);
        }
      }
      newPhotoUrl = null;
    }

    // ✅ REMOVED convertStringToDate function - keeping dates as strings
    const updateData = {
      ...resumeValues,
      ...(newPhotoUrl !== undefined && { photoUrl: newPhotoUrl }),
      workExperiences: {
        deleteMany: {},
        create: workExperiences.map((exp) => ({
          ...exp,
          // Keep dates as strings - no conversion needed
          startDate: exp.startDate || null,
          endDate: exp.endDate || null,
        })),
      },
      educations: {
        deleteMany: {},
        create: educations.map((edu) => ({
          ...edu,
          // Keep dates as strings - no conversion needed
          startDate: edu.startDate || null,
          endDate: edu.endDate || null,
        })),
      },
      skills: {
        deleteMany: {},
        create: skills,
      },
      softSkills: {
        deleteMany: {},
        create: softSkills,
      },
      certifications: {
        deleteMany: {},
        create: certifications.map((cert) => ({
          ...cert,
          // Keep year as string - no conversion needed
          year: cert.year || null,
        })),
      },
      awards: {
        deleteMany: {},
        create: awards.map((award) => ({
          ...award,
          // Keep date as string - no conversion needed
          date: award.date || null,
        })),
      },
      projectsPublications: {
        deleteMany: {},
        create: projectsPublications.map((pub) => ({
          ...pub,
          // Keep publication date as string - no conversion needed
          publicationDate: pub.publicationDate || null,
        })),
      },
      updatedAt: new Date(), // Only system timestamps remain as Date objects
    };

    console.log("14. Final update data structure prepared");

    // ✅ Save/update in DB
    const includeOptions = {
      workExperiences: true,
      educations: true,
      skills: true,
      softSkills: true,
      certifications: true,
      awards: true,
      projectsPublications: true,
    };

    let result;
    if (id) {
      console.log("15. Attempting to UPDATE resume...");
      result = await prisma.resume.update({
        where: { id, userId },
        data: updateData,
        include: includeOptions,
      });
      console.log("16. ✅ Resume updated successfully");
    } else {
      console.log("15. Attempting to CREATE resume...");
      result = await prisma.resume.create({
        data: {
          ...resumeValues,
          userId,
          photoUrl: newPhotoUrl,
          workExperiences: {
            create: workExperiences.map((exp) => ({
              ...exp,
              // Keep dates as strings - no conversion needed
              startDate: exp.startDate || null,
              endDate: exp.endDate || null,
            })),
          },
          educations: {
            create: educations.map((edu) => ({
              ...edu,
              // Keep dates as strings - no conversion needed
              startDate: edu.startDate || null,
              endDate: edu.endDate || null,
            })),
          },
          skills: { create: skills },
          softSkills: { create: softSkills },
          certifications: { 
            create: certifications.map((cert) => ({
              ...cert,
              // Keep year as string - no conversion needed
              year: cert.year || null,
            }))
          },
          awards: { 
            create: awards.map((award) => ({
              ...award,
              // Keep date as string - no conversion needed
              date: award.date || null,
            }))
          },
          projectsPublications: { 
            create: projectsPublications.map((pub) => ({
              ...pub,
              // Keep publication date as string - no conversion needed
              publicationDate: pub.publicationDate || null,
            }))
          },
          createdAt: new Date(), // Only system timestamps remain as Date objects
          updatedAt: new Date(),
        },
        include: includeOptions,
      });
      console.log("16. ✅ Resume created successfully");
    }

    // ✅ Revalidate the path to update cached data
    revalidatePath("/resumes");

    return result;
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

    await tx.softSkill.deleteMany({
      where: {resumeId: id}
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