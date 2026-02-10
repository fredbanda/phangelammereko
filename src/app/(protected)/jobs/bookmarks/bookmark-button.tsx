"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BookmarkCheck, BookmarkX } from "lucide-react";
import { removeBookmark } from "@/actions/jobs";
import { toast } from "sonner";

interface BookmarkButtonProps {
  jobId: string;
  initialBookmarked: boolean;
}

export default function BookmarkButton({ jobId, initialBookmarked }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);

  const handleRemoveBookmark = async () => {
    try {
      await removeBookmark(jobId);
      setIsBookmarked(false);
      toast.success("Job removed from bookmarks");
    } catch (error) {
      toast.error("Failed to remove bookmark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleRemoveBookmark}
      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
    >
      <BookmarkX className="h-4 w-4" />
    </Button>
  );
}