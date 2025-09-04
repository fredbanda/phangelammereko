"use server";

import { resumeSchema, ResumeValues } from "@/lib/validations";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { del, put } from "@vercel/blob";
import path from "path";


export async function saveResume(values: ResumeValues) {
  const { id } = values;

  console.log("Received values are: ", values);

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

  const { userId } = await auth();
  if (!userId) throw new Error("User not logged in");

  // Check DB connection
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✅ Database connection successful");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
    
  }

  const existingResume = id
    ? await prisma.resume.findUnique({ where: { id, userId } })
    : null;

  if (id && !existingResume) throw new Error("Resume not found");

  // ✅ Handle photo upload/deletion
  let newPhotoUrl: string | undefined | null = undefined;

  if (photo instanceof File) {
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl, {
        token: process.env.PHANGELA_MMEREKO_BLOB_READ_WRITE_TOKEN, // ✅ add token here too
      });
    }

    const blob = await put(`resume_photo/${path.extname(photo.name)}`, photo, {
      access: "public",
      token: process.env.PHANGELA_MMEREKO_BLOB_READ_WRITE_TOKEN, // ✅ keep token here
      allowOverwrite: true,
    });

    newPhotoUrl = blob.url;
  } else if (photo === null) {
    if (existingResume?.photoUrl) {
      await del(existingResume.photoUrl, {
        token: process.env.PHANGELA_MMEREKO_BLOB_READ_WRITE_TOKEN, // ✅ also here
      });
    }
    newPhotoUrl = null;
  }

  // ✅ Save/update in DB
  if (id) {
    return prisma.resume.update({
      where: { id, userId },
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
        updatedAt: new Date(),
      },
    });
  } else {
    return prisma.resume.create({
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
  }
}


