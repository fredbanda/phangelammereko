/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q") || undefined;
  const industry = url.searchParams.get("industry") || undefined;
  const location = url.searchParams.get("location") || undefined;
  const jobType = url.searchParams.get("jobType") || undefined;
  const skills = url.searchParams.get("skills") || undefined; // comma separated
  const minSalary = url.searchParams.get("minSalary") || undefined;
  const maxSalary = url.searchParams.get("maxSalary") || undefined;
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = parseInt(url.searchParams.get("pageSize") || "12", 10);

  const where: any = {
    status: "APPROVED",
  };

  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { company: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  if (industry) where.industry = { contains: industry, mode: "insensitive" };
  if (location) where.location = { contains: location, mode: "insensitive" };
  if (jobType) where.jobType = jobType;

  if (skills) {
    const skillList = skills.split(",").map((s) => s.trim()).filter(Boolean);
    where.AND = skillList.map((skill) => ({ skills: { has: skill } }));
  }

  if (minSalary || maxSalary) {
    where.AND = where.AND || [];
    if (minSalary) where.AND.push({ salaryMax: { gte: parseFloat(minSalary) } });
    if (maxSalary) where.AND.push({ salaryMin: { lte: parseFloat(maxSalary) } });
  }

  const total = await prisma.job.count({ where });

  const jobs = await prisma.job.findMany({
    where,
    orderBy: { isPromoted: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return NextResponse.json({ data: jobs, total, page, pageSize });
}
