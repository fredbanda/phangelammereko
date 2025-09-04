import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileUserIcon, PenLineIcon } from "lucide-react";
import Link from "next/link";
import { steps } from "./steps";
import { SignInButton, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface FooterProps {
  currentStep: string;
  setCurrentStep: (step: string) => void;
  showSmResumePreview: boolean;
  setShowSmResumePreview: (show: boolean) => void;
  isSaving: boolean;
}

export default function Footer({
  currentStep,
  setCurrentStep,
  showSmResumePreview,
  setShowSmResumePreview,
  isSaving,
}: FooterProps) {
  const { user } = useUser();
  const [isMounted, setIsMounted] = useState(false);

  const previousStep = steps.find(
    (_, index) => steps[index + 1]?.key === currentStep,
  )?.key;

  const nextStep = steps.find(
    (_, index) => steps[index - 1]?.key === currentStep,
  )?.key;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Render a fallback that matches both server + client initially
    return <p className="text-muted-foreground opacity-0">...</p>;
  }

  return (
    <footer className="w-full border-t px-3 py-5">
      <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={
              previousStep ? () => setCurrentStep(previousStep) : undefined
            }
            disabled={!previousStep}
          >
            Previous step
          </Button>
          <Button
            onClick={nextStep ? () => setCurrentStep(nextStep) : undefined}
            disabled={!nextStep}
          >
            Next step
          </Button>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowSmResumePreview(!showSmResumePreview)}
          className="md:hidden"
          title={
            showSmResumePreview ? "Show input form" : "Show resume preview"
          }
        >
          {showSmResumePreview ? <PenLineIcon /> : <FileUserIcon />}
        </Button>
        <div className="flex items-center gap-3">
          <Button variant="secondary" asChild>
            <Link href="/resumes">Close</Link>
          </Button>

          <p
            className={cn(
              "text-muted-foreground transition-opacity",
              isSaving || !user ? "opacity-100" : "opacity-0",
            )}
          >
            {user ? (
              isSaving ? (
                "Saving..."
              ) : (
                ""
              )
            ) : (
              <SignInButton><span className="cursor-pointer font-bold">Log in to save</span></SignInButton>
            )}
          </p>
        </div>
      </div>
    </footer>
  );
}
