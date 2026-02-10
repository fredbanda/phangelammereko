import prisma from "@/utils/prisma"
import { resumeDataInclude } from "types"
import { auth } from "@clerk/nextjs/server"
import { Metadata } from "next"
import ResumeItem from "./ResumeItem"
import CreateResumeButton from "./CreateResumeButton"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { FileText } from "lucide-react"

export const metadata: Metadata = {
  title: "Your CVs / Resumes",
  description: "Never struggle or spend money creating CVs ever again",
  keywords: "curriculum vitae cv resumes"
}

export default async function Page() {
  const {userId} = await auth()

  if(!userId){
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 text-center shadow-lg">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Sign In to Create Your Resume</h1>
            <p className="text-muted-foreground">
              You need to be logged in to create and manage your resumes. Sign in now to get started!
            </p>
          </div>

          <SignInButton mode="modal">
            <Button size="lg" className="w-full">
              <FileText className="mr-2 h-5 w-5" />
              Sign In to Continue
            </Button>
          </SignInButton>
          
          <div className="rounded-lg bg-muted p-4 text-sm">
            <p className="font-semibold mb-2">Why sign in?</p>
            <ul className="space-y-1 text-left text-muted-foreground">
              <li>✓ Save your resume progress automatically</li>
              <li>✓ Create up to 3 resumes for free</li>
              <li>✓ Access your resumes from any device</li>
              <li>✓ Download and print your resumes anytime</li>
            </ul>
          </div>
        </div>
      </main>
    );
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