import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import JobCreateForm from "./job-create-form";

export default async function PostJobPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Post a New Job</h1>
            <p className="text-muted-foreground">
              Fill out the details below to post your job opportunity
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Job Details</CardTitle>
            </CardHeader>
            <CardContent>
              <JobCreateForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}