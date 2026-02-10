import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { jobId, resumeText } = body;

  if (!jobId || !resumeText) {
    return NextResponse.json({ error: "jobId and resumeText required" }, { status: 400 });
  }

  const job = await prisma.job.findUnique({ where: { id: jobId } });
  if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

  // Placeholder analysis: basic keyword overlap
  const jobText = `${job.title || ""} ${job.description || ""} ${job.requirements || ""}`.toLowerCase();
  const resumeLower = resumeText.toLowerCase();

  const jobWords = Array.from(new Set(jobText.match(/[a-z0-9]+/g) || []));
  const matchCount = jobWords.filter((w) => resumeLower.includes(w)).length;
  const score = Math.min(100, Math.round((matchCount / Math.max(1, jobWords.length)) * 100));

  return NextResponse.json({ score, matchCount, totalKeywords: jobWords.length });
}
