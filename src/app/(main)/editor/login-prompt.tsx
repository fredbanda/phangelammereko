"use client";

import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { FileText, Lock } from "lucide-react";

export default function LoginPrompt() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-lg border bg-card p-8 text-center shadow-lg">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Sign In to Create Your Resume</h1>
          <p className="text-muted-foreground">
            You need to be logged in to create and save your resume. Sign in now to get started!
          </p>
        </div>

        <div className="space-y-4">
          <SignInButton mode="modal">
            <Button size="lg" className="w-full">
              <FileText className="mr-2 h-5 w-5" />
              Sign In to Continue
            </Button>
          </SignInButton>
          
          <p className="text-xs text-muted-foreground">
            Don't have an account? Sign up when you click the button above.
          </p>
        </div>

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
    </div>
  );
}
