import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { JobPostingForm } from "@/app/(protected)/jobs/_components/job-posting-form"

export default async function PostJobPage() {
  const { userId } = await auth()

  if (!userId) {
    redirect("/sign-in")
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-balance">Post a Job</h1>
        <p className="text-muted-foreground mt-2">
          Fill out the form below to post your job listing. It will be reviewed before going live.
        </p>
      </div>

      <JobPostingForm />
    </div>
  )
}
