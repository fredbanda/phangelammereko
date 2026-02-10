"use client"
import { Button } from "@/components/ui/button"
import { Share2 } from "lucide-react"
import { toast } from "sonner"

interface ShareButtonProps {
  jobId: string
  jobTitle: string
}

export function ShareButton({ jobId, jobTitle }: ShareButtonProps) {
  const handleShare = async () => {
    const url = `${window.location.origin}/vacancies/${jobId}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: jobTitle,
          url: url,
        })
      } catch {
        console.log("Share cancelled")
      }
    } else {
      try {
        await navigator.clipboard.writeText(url)
        toast.success("Job link copied to clipboard!")
      } catch (err) {
        console.error("Failed to copy:", err)
        toast.error("Failed to copy link")
      }
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleShare}>
      <Share2 className="h-4 w-4" />
      Share
    </Button>
  )
}