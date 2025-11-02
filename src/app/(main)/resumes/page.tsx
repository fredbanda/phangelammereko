import prisma from "@/utils/prisma"
import { resumeDataInclude } from "types"
import { auth } from "@clerk/nextjs/server"
import { Metadata } from "next"
import ResumeItem from "./ResumeItem"
import CreateResumeButton from "./CreateResumeButton"

export const metadata: Metadata = {
  title: "Your CVs / Resumes",
  description: "Never struggle or spend money creating CVs ever again",
  keywords: "curriculum vitae cv resumes"
}

export default async function Page() {
  const {userId} = await auth()

  if(!userId){
    return null;
  }

  const [resumes, totalCount] = await Promise.all([
    prisma.resume.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        updatedAt: "desc"
      },
      include: resumeDataInclude
    }),
    prisma.resume.count({
      where: {
        userId: userId
      }
    })
  ])

  //TODO: CONTROLLER
  return (
    <main className="max-w-7xl mx-auto w-full py-6 px-3 space-y-6">
        <CreateResumeButton canCreate={totalCount < 3 } />
        <div className="space-y-1">
          <h2 className="text-23xl font-bold">Your Resumes</h2>
          <p>Total: {totalCount} resumes</p>
        </div>
        <div className="flex flex-col sm:grid md:grid-cols-3 grid-cols-2 lg:grid-cols-4 w-full gap-3">
          {resumes.map((resume) => (
            <ResumeItem key={resume.id} resume={resume} />
          ))}
        </div>
    </main>
  )
}