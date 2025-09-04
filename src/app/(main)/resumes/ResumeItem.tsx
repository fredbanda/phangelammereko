"use client";

import { formatDate } from "date-fns";
import { ResumeServerData } from "@/utils/types";
import Link from "next/link";
import ResumePreview from "@/components/previews/resume-preview";
import { mapToResumevalues } from "@/lib/utils";
import { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVerticalIcon, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteResume } from "@/actions/actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import LoadingButton from "@/components/LoadingButton";

interface ResumeItemProps {
  resume: ResumeServerData;
}

export default function ResumeItem({ resume }: ResumeItemProps) {
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
            {formatDate(resume.updatedAt, "MMMM d, yyyy  h:mm a")}
          </p>
        </Link>
        <Link
          href={`/editor?resumeId=${resume.id}`}
          className="relative inline-block w-full"
        >
          <ResumePreview
            resumeData={mapToResumevalues(resume)}
            className="overflow-hidden shadow-sm transition-shadow group-hover:shadow-lg"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </Link>
      </div>
      <MoreMenu resumeId={resume.id} />
    </div>
  );
}

interface MoreMenuProps {
  resumeId: string;
}
function MoreMenu({ resumeId }: MoreMenuProps) {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-0.5 right-0.5 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <MoreVerticalIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent>
          <DropdownMenuItem
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
          >
            <Trash2 className="size-4 text-red-600" />
            Delete
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle> Delete Resume?</DialogTitle>
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
          >Delete</LoadingButton>
          <Button variant="default" onClick={() => onOpenChange(false)} className="w-1/2 cursor-pointer hover:bg-gray-600">
            Cancel

          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
