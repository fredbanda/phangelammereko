/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import prisma from "@/utils/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { JobType } from "@prisma/client";

interface JobFilters {
  search?: string;
  industry?: string;
  location?: string;
  jobType?: string;
  salaryMin?: number;
  salaryMax?: number;
  skills?: string[];
  experienceLevel?: string;
  page?: number;
  limit?: number;
}

function convertJobTypeToEnum(jobType: string): JobType {
  const jobTypeMap: Record<string, JobType> = {
    'full-time': 'FULL_TIME',
    'part-time': 'PART_TIME',
    'contract': 'CONTRACT',
    'remote': 'REMOTE'
  }
  
  return jobTypeMap[jobType] || 'FULL_TIME'
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
  const industry = formData.get("industry") as string;
  const salaryMinRaw = formData.get("salaryMin") as string | null;
  const salaryMaxRaw = formData.get("salaryMax") as string | null;
  const salaryMin = salaryMinRaw ? parseFloat(salaryMinRaw) : null;
  const salaryMax = salaryMaxRaw ? parseFloat(salaryMaxRaw) : null;
  const currency = formData.get("currency") as string || "USD";
  const skillsRaw = formData.get("skills") as string;
  const skills = skillsRaw ? skillsRaw.split(',').map(s => s.trim()) : [];
  const description = formData.get("description") as string;
  const requirements = formData.get("requirements") as string;
  const benefits = formData.get("benefits") as string;
  const experienceLevel = formData.get("experienceLevel") as string;
  const educationLevel = formData.get("educationLevel") as string;
  const applicationUrl = formData.get("applicationUrl") as string;

  const jobTypeRaw = formData.get("jobType") as string
  const jobType = convertJobTypeToEnum(jobTypeRaw)

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
        industry,
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
        salaryMin: salaryMin !== null ? salaryMin : undefined,
        salaryMax: salaryMax !== null ? salaryMax : undefined,
        currency,
        skills,
        description,
        requirements,
        benefits,
        experienceLevel,
        educationLevel,
        applicationUrl,
        userId,
        userEmail: user?.emailAddresses[0]?.emailAddress || "",
      },
    })
  } catch (error) {
    console.error("Error creating job:", error)
    throw new Error("Failed to create job")
  }

  revalidatePath("/jobs")
  redirect("/jobs")
}

export async function getJobs(filters: JobFilters = {}) {
  const {
    search,
    industry,
    location,
    jobType,
    salaryMin,
    salaryMax,
    skills,
    experienceLevel,
    page = 1,
    limit = 12
  } = filters;

  const skip = (page - 1) * limit;

  try {
    const where: any = {
      status: "APPROVED",
      closingDate: {
        gte: new Date()
      }
    };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    if (industry) {
      where.industry = { contains: industry, mode: 'insensitive' };
    }

    if (location) {
      where.location = { contains: location, mode: 'insensitive' };
    }

    if (jobType) {
      where.jobType = convertJobTypeToEnum(jobType);
    }

    if (salaryMin !== undefined) {
      where.salaryMin = { gte: salaryMin };
    }

    if (salaryMax !== undefined) {
      where.salaryMax = { lte: salaryMax };
    }

    if (skills && skills.length > 0) {
      where.skills = {
        hasSome: skills
      };
    }

    if (experienceLevel) {
      where.experienceLevel = { contains: experienceLevel, mode: 'insensitive' };
    }
    const [jobs, total] = await Promise.all([
      prisma.job.findMany({
        where,
        orderBy: [{ isPromoted: "desc" }, { createdAt: "desc" }],
        skip,
        take: limit,
        include: {
          _count: {
            select: {
              applications: true,
              bookmarks: true
            }
          }
        }
      }),
      prisma.job.count({ where })
    ]);

    return {
      jobs,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    };
  } catch (error) {
    console.error("Error fetching jobs:", error);
    return {
      jobs: [],
      total: 0,
      pages: 0,
      currentPage: 1
    };
  }
}

export async function getJobById(id: string) {
  try {
    const job = await prisma.job.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            applications: true,
            bookmarks: true
          }
        }
      }
    });

    if (job) {
      // Increment view count
      await prisma.job.update({
        where: { id },
        data: { viewCount: { increment: 1 } }
      });
    }

    return job;
  } catch (error) {
    console.error("Error fetching job:", error);
    return null;
  }
}

export async function bookmarkJob(jobId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.bookmark.create({
      data: {
        userId,
        jobId
      }
    });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/jobs/bookmarks");
  } catch (error) {
    console.error("Error bookmarking job:", error);
    throw new Error("Failed to bookmark job");
  }
}

export async function removeBookmark(jobId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.bookmark.delete({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      }
    });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/jobs/bookmarks");
  } catch (error) {
    console.error("Error removing bookmark:", error);
    throw new Error("Failed to remove bookmark");
  }
}

export async function getBookmarkedJobs() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId },
      include: {
        job: {
          include: {
            _count: {
              select: {
                applications: true,
                bookmarks: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return bookmarks.map(bookmark => bookmark.job);
  } catch (error) {
    console.error("Error fetching bookmarked jobs:", error);
    // Return empty array instead of throwing to prevent page crashes
    return [];
  }
}

export async function applyToJob(jobId: string, resumeId?: string, coverLetter?: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.jobApplication.create({
      data: {
        jobId,
        userId,
        resumeId,
        coverLetter
      }
    });

    // Increment application count
    await prisma.job.update({
      where: { id: jobId },
      data: { applicationCount: { increment: 1 } }
    });

    revalidatePath(`/jobs/${jobId}`);
    revalidatePath("/jobs/applications");
  } catch (error) {
    console.error("Error applying to job:", error);
    throw new Error("Failed to apply to job");
  }
}

export async function getJobApplications() {
  const { userId } = await auth();

  if (!userId) {
    return [];
  }

  try {
    const applications = await prisma.jobApplication.findMany({
      where: { userId },
      include: {
        job: true,
        resume: true
      },
      orderBy: { appliedAt: "desc" }
    });

    return applications;
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return [];
  }
}

export async function isJobBookmarked(jobId: string) {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  try {
    const bookmark = await prisma.bookmark.findUnique({
      where: {
        userId_jobId: {
          userId,
          jobId
        }
      }
    });

    return !!bookmark;
  } catch (error) {
    console.error("Error checking bookmark status:", error);
    return false;
  }
}

export async function hasAppliedToJob(jobId: string) {
  const { userId } = await auth();

  if (!userId) {
    return false;
  }

  try {
    const application = await prisma.jobApplication.findUnique({
      where: {
        jobId_userId: {
          jobId,
          userId
        }
      }
    });

    return !!application;
  } catch (error) {
    console.error("Error checking application status:", error);
    return false;
  }
}

export async function getJobFilters() {
  try {
    const [industries, locations, skills] = await Promise.all([
      prisma.job.findMany({
        where: { status: "APPROVED", industry: { not: null } },
        select: { industry: true },
        distinct: ['industry']
      }),
      prisma.job.findMany({
        where: { status: "APPROVED", location: { not: null } },
        select: { location: true },
        distinct: ['location']
      }),
      prisma.job.findMany({
        where: { status: "APPROVED" },
        select: { skills: true }
      })
    ]);

    const uniqueSkills = [...new Set(skills.flatMap(job => job.skills))];

    return {
      industries: industries.map(job => job.industry).filter((industry): industry is string => industry !== null),
      locations: locations.map(job => job.location).filter((location): location is string => location !== null),
      skills: uniqueSkills
    };
  } catch (error) {
    console.error("Error fetching job filters:", error);
    return {
      industries: [],
      locations: [],
      skills: []
    };
  }
}

// Keep existing functions
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
      where: { id: jobId },
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
      where: { id: jobId },
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
        userId,
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