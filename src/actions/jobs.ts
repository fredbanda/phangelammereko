"use server";

import prisma from "@/utils/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { JobType } from "@prisma/client";

function convertJobTypeToEnum(jobType: string): JobType {
  const jobTypeMap: Record<string, JobType> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'contract': 'CONTRACT',
    'remote': 'REMOTE'
  }
  
  return jobTypeMap[jobType] || 'FULL_TIME' // Default fallback
}

export async function createJob(formData: FormData) {
  const { userId } = await auth()
  const user = await currentUser()

  if (!userId) {
    throw new Error("Unauthorized")
  }
  const title = formData.get("title") as string;
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const company = formData.get("company") as string;
  const companyEmail = formData.get("companyEmail") as string;
  const companyPhone = formData.get("companyPhone") as string;
  const posterPosition = formData.get("posterPosition") as string;
  const businessLocation = formData.get("businessLocation") as string;
  const openingDate = new Date(formData.get("openingDate") as string);
  const closingDate = new Date(formData.get("closingDate") as string);
  const location = formData.get("location") as string;
  const salaryMin = formData.get("salaryMin") as string;
  const salaryMax = formData.get("salaryMax") as string;
  
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const benefits = formData.get("benefits") as string;

  const jobTypeRaw = formData.get("jobType") as string
  const jobType = convertJobTypeToEnum(jobTypeRaw) // Convert here

  console.log({
    title,
    company,
    firstName,
    lastName,
    companyEmail,
    companyPhone,
    posterPosition,
    businessLocation,
    openingDate,
    closingDate,
    location,
    jobType,
    salaryMin,
    salaryMax,
    description,
  });

  if (
    !title ||
    !company ||
    !firstName ||
    !lastName ||
    !companyEmail ||
    !companyPhone ||
    !posterPosition ||
    !businessLocation ||
    !openingDate ||
    !closingDate ||
    !location ||
    !description
  ) {
    throw new Error("Missing required fields");
  }

  if (closingDate <= openingDate) {
    throw new Error("Closing date must be after opening date");
  }

  try {
    await prisma.job.create({
      data: {
        title,
        company,
        firstName,
        lastName,
        companyEmail,
        companyPhone,
        posterPosition,
        businessLocation,
        openingDate,
        closingDate,
        location,
        jobType,
        salaryMin,
        salaryMax,
        description,
        requirements,
        benefits,
        userId,
        userEmail: user?.emailAddresses[0]?.emailAddress || "",
      },
    })
  } catch (error) {
    console.error("Error creating job:", error)
    throw new Error("Failed to create job")
  }

  // Move redirect outside try-catch to avoid catching redirect errors
  revalidatePath("/jobs")
  redirect("/jobs")
}

export async function getJobs() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: "APPROVED",
      },
      orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return [];
  }
}

export async function getUserJobs() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const jobs = await prisma.job.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching user jobs:", error);
    return [];
  }
}

export async function getPendingJobs() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: "PENDING",
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return jobs;
  } catch (error) {
    console.error("Error fetching pending jobs:", error);
    return [];
  }
}

export async function approveJob(jobId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.job.update({
      where: { userId, id: jobId },
      data: {
        status: "APPROVED",
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/jobs");
  } catch (error) {
    console.error("Error approving job:", error);
    throw new Error("Failed to approve job");
  }
}

export async function rejectJob(jobId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.job.update({
      where: { id: jobId, userId },
      data: { status: "REJECTED" },
    });

    revalidatePath("/admin");
  } catch (error) {
    console.error("Error rejecting job:", error);
    throw new Error("Failed to reject job");
  }
}

export async function promoteJob(jobId: string, days = 30) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const promotedUntil = new Date();
  promotedUntil.setDate(promotedUntil.getDate() + days);

  try {
    await prisma.job.update({
      where: {
        id: jobId,
        userId, // Ensure user owns the job
      },
      data: {
        isPromoted: true,
        promotedUntil,
      },
    });

    revalidatePath("/jobs");
    revalidatePath("/dashboard");
  } catch (error) {
    console.error("Error promoting job:", error);
    throw new Error("Failed to promote job");
  }
}
