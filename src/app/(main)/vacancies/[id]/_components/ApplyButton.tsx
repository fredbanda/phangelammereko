"use client"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

interface ApplyButtonProps {
  jobId: string
  companyEmail?: string | null
}

export function ApplyButton({ jobId, companyEmail }: ApplyButtonProps) {
  const handleApply = () => {
    if (companyEmail) {
      window.location.href = `mailto:${companyEmail}?subject=Job Application - Job ID: ${jobId}`
    } else {
      alert("Company contact not available")
    }
  }

  return (
    <Button className="w-full" size="lg" onClick={handleApply}>
      <ExternalLink className="h-4 w-4 mr-2" />
      Apply Now
    </Button>
  )
}