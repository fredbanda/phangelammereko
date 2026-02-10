"use client"
import { Button } from "@/components/ui/button"
import { Bookmark, BookmarkCheck } from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"

interface BookmarkButtonProps {
  jobId: string
}

export function BookmarkButton({ jobId }: BookmarkButtonProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [loading, setLoading] = useState(false)

  // Mock user ID - replace with real auth
  const mockUserId = "user123"

  useEffect(() => {
    // Check if job is bookmarked
    const checkBookmark = async () => {
      try {
        const res = await fetch(`/api/bookmarks?userId=${mockUserId}`)
        const data = await res.json()
        const bookmarked = data.data?.some((job: { id: string }) => job.id === jobId)
        setIsBookmarked(bookmarked)
      } catch (err) {
        console.error("Failed to check bookmark status:", err)
      }
    }
    checkBookmark()
  }, [jobId])

  const toggleBookmark = async () => {
    setLoading(true)
    try {
      if (isBookmarked) {
        // Remove bookmark
        await fetch(`/api/bookmarks?userId=${mockUserId}&jobId=${jobId}`, { method: "DELETE" })
        setIsBookmarked(false)
        toast.success("Removed from saved jobs")
      } else {
        // Add bookmark
        await fetch("/api/bookmarks", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: mockUserId, jobId }),
        })
        setIsBookmarked(true)
        toast.success("Saved for later!")
      }
    } catch (err) {
      toast.error("Failed to update bookmark")
      console.error("Bookmark error:", err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={toggleBookmark} disabled={loading}>
      {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      {isBookmarked ? "Saved" : "Save"}
    </Button>
  )
}