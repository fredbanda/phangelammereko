import { Metadata } from "next";
import ResumeEditor from "./resume-editor";
import prisma from "@/utils/prisma";
import { auth } from "@clerk/nextjs/server";
import { resumeDataInclude } from "@/utils/types";

interface PageProps {
  searchParams?: Promise<{
    resumeId?: string;
  }>;
}

export const metadata: Metadata = {
  title: "Create your CV or Resume",
};

export default async function EditorPage({ searchParams }: PageProps) {
  // Await the searchParams since it's now a Promise in Next.js 15
  const resolvedSearchParams = await searchParams;
  const resumeId = resolvedSearchParams?.resumeId;

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const resumeToEdit = resumeId
    ? await prisma.resume.findUnique({
        where: {
          id: resumeId,
          userId,
        },
        include: resumeDataInclude,
      })
    : null;

  return <ResumeEditor resumeToEdit={resumeToEdit} />;
}