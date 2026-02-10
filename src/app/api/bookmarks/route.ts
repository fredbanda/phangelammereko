import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });

  const bookmarks = await prisma.bookmark.findMany({ where: { userId } });
  const jobIds = bookmarks.map((b) => b.jobId);
  const jobs = await prisma.job.findMany({ where: { id: { in: jobIds } } });

  return NextResponse.json({ data: jobs });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { userId, jobId } = body;
  if (!userId || !jobId) return NextResponse.json({ error: "userId and jobId required" }, { status: 400 });

  const existing = await prisma.bookmark.findFirst({ where: { userId, jobId } });
  if (existing) return NextResponse.json({ ok: true });

  await prisma.bookmark.create({ data: { userId, jobId } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const url = new URL(request.url);
  const userId = url.searchParams.get("userId");
  const jobId = url.searchParams.get("jobId");
  if (!userId || !jobId) return NextResponse.json({ error: "userId and jobId required" }, { status: 400 });

  await prisma.bookmark.deleteMany({ where: { userId, jobId } });
  return NextResponse.json({ ok: true });
}
