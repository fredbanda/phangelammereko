"use client";

import { useRef, useState, useTransition } from "react";
import { useReactToPrint } from "react-to-print"; // Import the new print component
import { ResumeServerData } from "@/utils/types";
import Link from "next/link";
import ResumePreview from "@/components/previews/resume-preview";
import { mapToResumevalues } from "@/lib/utils";
import ResumePrintView from "@/components/previews/ResumePrintPreview";
import { deleteResume } from "@/actions/actions";
import LoadingButton from "@/components/LoadingButton";
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogFooter } from "@/components/ui/dialog";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@radix-ui/react-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@radix-ui/react-dropdown-menu";
import { MoreVerticalIcon, Trash2, Printer } from "lucide-react";
import { toast } from "sonner";

// Add this function to your ResumeItem or utils file
const formatDateWithFormat = (date: string | Date, format: string) => {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return "";

  // You can use a library like date-fns or implement your own formatting
  // For now, here's a simple implementation:
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(dateObj);
};

interface ResumeItemProps {
  resume: ResumeServerData;
}

export default function ResumeItem({ resume }: ResumeItemProps) {
  const printRef = useRef<HTMLDivElement>(null); // Rename for clarity
  const reactToPrintFn = useReactToPrint({
    contentRef: printRef, // Use the print ref
    documentTitle: resume.title || "My Resume",
  });

  const wasUpdated = resume.updatedAt !== resume.createdAt;

  return (
    <div className="group hover:border-border bg-secondary relative rounded-lg border border-transparent p-3 transition-colors">
      <div className="spacr-y-3">
        <Link
          href={`/editor?resumeId=${resume.id}`}
          className="inline-block w-full text-center"
        >
          <p className="line-clamp-1 font-semibold">
            {resume.title || "No title "}
          </p>

          {resume.description && (
            <p className="line-clamp-2 text-sm">
              {resume.description || "No description"}
            </p>
          )}

          <p className="text-muted-foreground text-xs">
            {wasUpdated ? "Updated" : "Created"} on{" "}
            {formatDateWithFormat(resume.updatedAt, "MMMM d, yyyy  h:mm a")}
          </p>
        </Link>

        <Link
          href={`/editor?resumeId=${resume.id}`}
          className="relative inline-block w-full"
        >
          {/* This is your preview - no contentRef needed here */}
          <ResumePreview
            resumeData={mapToResumevalues(resume)}
            className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </Link>
      </div>

      {/* Hidden print component */}
      <div style={{ display: "none" }}>
        <ResumePrintView
          resumeData={mapToResumevalues(resume)}
          ref={printRef}
        />
      </div>

      <MoreMenu resumeId={resume.id} onPrintClick={reactToPrintFn} />
    </div>
  );
}
interface MoreMenuProps {
  resumeId: string;
  onPrintClick: () => void;
}
function MoreMenu({ resumeId, onPrintClick }: MoreMenuProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0.5 right-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="bg-white ">
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-400 hover:text-white"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4 text-red-600 cursor-pointer" />
            Delete
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 cursor-pointer hover:bg-gray-400 hover:text-white"
            onClick={onPrintClick}
          >
            <Printer className="size-4 text-blue-600 cursor-pointer" />
            Print
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfirmationDialog
        resumeId={resumeId}
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
      />
    </>
  );
}

interface DeleteConfirmationDialogProps {
  resumeId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function DeleteConfirmationDialog({
  resumeId,
  open,
  onOpenChange,
}: DeleteConfirmationDialogProps) {
  const [isPending, startTransition] = useTransition();

  async function handleDelete() {
    startTransition(async () => {
      try {
        await deleteResume(resumeId);
        onOpenChange(false);
      } catch (error) {
        console.error(error);
        toast.error("Soemthing went wrong while deleting the resume", {
          position: "top-right",
        });
      }
    });
  }

  return (
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="max-w-lg">
    <DialogHeader>
      <DialogTitle>Delete Resume?</DialogTitle>
      <DialogDescription>
        Are you sure you want to delete this resume? This action is not
        reversible.
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <LoadingButton
        variant="destructive"
        loading={isPending}
        onClick={handleDelete}
        className="w-1/2 cursor-pointer hover:bg-red-400"
      >
        Delete
      </LoadingButton>
      <Button
        variant="default"
        onClick={() => onOpenChange(false)}
        className="w-1/2 cursor-pointer hover:bg-gray-600"
      >
        Cancel
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>

  );
}
