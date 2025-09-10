"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface UploadState {
  file: File | null
  uploading: boolean
  progress: number
  error: string | null
  success: boolean
}

export function LinkedinPdfUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    progress: 0,
    error: null,
    success: false,
  })
 

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== "application/pdf") {
      setUploadState((prev) => ({
        ...prev,
        error: "Please upload a PDF file only",
      }))
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadState((prev) => ({
        ...prev,
        error: "File size must be less than 10MB",
      }))
      return
    }

    setUploadState((prev) => ({
      ...prev,
      file,
      error: null,
      success: false,
    }))
  }, [])

  const handleUpload = useCallback(async () => {
    if (!uploadState.file) return

    setUploadState((prev) => ({ ...prev, uploading: true, progress: 0 }))

    try {
      const formData = new FormData()
      formData.append("file", uploadState.file)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadState((prev) => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90),
        }))
      }, 200)

      const response = await fetch("/api/linkedin/upload-pdf", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()

      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        progress: 100,
        success: true,
        error: null,
      }))

 toast.success("Everything went so well")

      // Redirect to analysis page after successful upload
      setTimeout(() => {
        window.location.href = `/linkedin-optimizer/analysis/${result.profileId}`
      }, 1500)
    } catch (error) {
        console.error(error)
      setUploadState((prev) => ({
        ...prev,
        uploading: false,
        progress: 0,
        error: "Upload failed. Please try again.",
      }))

      toast.error("Upload failed. Please try again.")
    }
  }, [uploadState.file])

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      const file = event.dataTransfer.files[0]

      if (file) {
        const syntheticEvent = {
            target: { files: [file] },
        } as unknown as React.ChangeEvent<HTMLInputElement>
        handleFileSelect(syntheticEvent)
      }
    },
    [handleFileSelect],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }, [])
  const fileInputRef = useRef<HTMLInputElement>(null)
  return (
    <div className="space-y-6">
      {/* Upload Area */}
  <div
    className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
    onClick={() => fileInputRef.current?.click()} // 👈 open picker on click
    onDrop={handleDrop}
    onDragOver={handleDragOver}
  >
    <div className="flex flex-col items-center gap-4">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
        <Upload className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">Drop your LinkedIn PDF here</h3>
      <p className="text-muted-foreground mb-4">or click to browse files</p>

      {/* Hidden input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf"
        onChange={handleFileSelect}
        className="hidden"
      />
      <Button variant="outline" className="cursor-pointer bg-transparent" type="button">
        Choose File
      </Button>
    </div>
  </div>

      {/* File Info */}
      {uploadState.file && (
        <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
          <FileText className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <p className="font-medium text-card-foreground">{uploadState.file.name}</p>
            <p className="text-sm text-muted-foreground">{(uploadState.file.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          {uploadState.success && <CheckCircle className="w-6 h-6 text-green-500" />}
        </div>
      )}

      {/* Progress Bar */}
      {uploadState.uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{uploadState.progress}%</span>
          </div>
          <Progress value={uploadState.progress} className="w-full" />
        </div>
      )}

      {/* Error Alert */}
      {uploadState.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadState.error}</AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {uploadState.success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            File uploaded successfully! Redirecting to analysis...
          </AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      {uploadState.file && !uploadState.success && (
        <Button onClick={handleUpload} disabled={uploadState.uploading} className="w-full" size="lg">
          {uploadState.uploading ? "Uploading..." : "Analyze My Profile"}
        </Button>
      )}

      {/* Instructions */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h4 className="font-semibold text-foreground mb-2">How to download your LinkedIn profile:</h4>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
          <li>Go to your LinkedIn profile page</li>
          <li>Click <span className="font-semibold">More</span> in your profile section</li>
          <li>Select <span className="font-semibold">Save to PDF</span></li>
          <li>Download the PDF and upload it here</li>
        </ol>
      </div>
    </div>
  )
}
