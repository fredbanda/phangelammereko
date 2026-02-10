/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  ExternalLink,
  Send,
  FileText,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  Lightbulb,
} from "lucide-react";

import { bookmarkJob, removeBookmark, applyToJob } from "@/actions/jobs";
import { analyzeJobSuitability } from "@/actions/ai-analysis";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import Link from "next/link";

interface JobDetailClientProps {
  jobId: string;
  isBookmarked: boolean;
  hasApplied: boolean;
  isExpired: boolean;
  applicationUrl?: string | null;
}

export default function JobDetailClient({
  jobId,
  isBookmarked: initialBookmarked,
  hasApplied,
  isExpired,
  applicationUrl,
}: JobDetailClientProps) {
  const { isSignedIn } = useAuth();

  const [isBookmarked, setIsBookmarked] = useState(initialBookmarked);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [showAIAnalysis, setShowAIAnalysis] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const [coverLetter, setCoverLetter] = useState("");
  const [selectedResume, setSelectedResume] = useState("default");

  const [isApplying, setIsApplying] = useState(false);

  const handleBookmark = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to bookmark jobs");
      return;
    }

    try {
      if (isBookmarked) {
        await removeBookmark(jobId);
        setIsBookmarked(false);
        toast.success("Job removed from bookmarks");
      } else {
        await bookmarkJob(jobId);
        setIsBookmarked(true);
        toast.success("Job bookmarked successfully");
      }
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  const handleApply = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to apply for jobs");
      return;
    }

    setIsApplying(true);
    try {
      const resumeToSubmit =
        selectedResume === "none" ? undefined : selectedResume;

      await applyToJob(jobId, resumeToSubmit, coverLetter || undefined);

      toast.success("Application submitted successfully!");
      setShowApplyDialog(false);
      window.location.reload();
    } catch (error) {
      toast.error("Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Job Opportunity",
          url: window.location.href,
        });
      } catch {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("Job link copied to clipboard");
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Job link copied to clipboard");
    }
  };

  const handleExternalApply = () => {
    if (applicationUrl) {
      window.open(applicationUrl, "_blank");
    }
  };

  const handleAIAnalysis = async () => {
    if (!isSignedIn) {
      toast.error("Please sign in to use AI analysis");
      return;
    }

    setLoadingAnalysis(true);
    try {
      const analysis = await analyzeJobSuitability(jobId);
      setAiAnalysis(analysis);
      setShowAIAnalysis(true);
    } catch (error) {
      toast.error("Failed to analyze job suitability");
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="flex flex-wrap gap-3 mb-6">
      {/* Apply Button */}
      {!isExpired && (
        <>
          {applicationUrl ? (
            <Button onClick={handleExternalApply} className="flex-1 sm:flex-none">
              <ExternalLink className="h-4 w-4 mr-2" />
              Apply Now
            </Button>
          ) : (
            <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
              <DialogTrigger asChild>
                <Button
                  disabled={hasApplied || !isSignedIn}
                  className="flex-1 sm:flex-none"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {hasApplied ? "Applied" : "Apply Now"}
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Apply for this position</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Select Resume (Optional)
                    </label>
                    <Select value={selectedResume} onValueChange={setSelectedResume}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Resume</SelectItem>
                        <SelectItem value="default">Default Resume</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Cover Letter (Optional)
                    </label>
                    <Textarea
                      placeholder="Write a brief cover letter..."
                      value={coverLetter}
                      onChange={(e) => setCoverLetter(e.target.value)}
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleApply}
                      disabled={isApplying}
                      className="flex-1"
                    >
                      {isApplying ? "Submitting..." : "Submit Application"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowApplyDialog(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}

      {/* Bookmark Button */}
      <Button
        variant="outline"
        onClick={handleBookmark}
        disabled={!isSignedIn}
      >
        {isBookmarked ? (
          <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
        ) : (
          <Bookmark className="h-4 w-4 mr-2" />
        )}
        {isBookmarked ? "Saved" : "Save"}
      </Button>

      {/* Share Button */}
      <Button variant="outline" onClick={handleShare}>
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>

      {/* AI Suitability Analysis */}
      {isSignedIn && (
        <>
          <Button
            variant="outline"
            onClick={handleAIAnalysis}
            disabled={loadingAnalysis}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {loadingAnalysis ? "Analyzing..." : "AI Analysis"}
          </Button>

          <Dialog open={showAIAnalysis} onOpenChange={setShowAIAnalysis}>
            <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>AI Suitability Analysis</DialogTitle>
              </DialogHeader>

              {aiAnalysis && (
                <div className="space-y-6">
                  {/* Match Score */}
                  <div className="p-4 bg-muted rounded-lg">
                    <h3 className="font-medium mb-3">Overall Match Score</h3>
                    <div className="flex items-center gap-3">
                      <Progress value={aiAnalysis.matchScore} className="flex-1 h-3" />
                      <span className="text-lg font-bold">{aiAnalysis.matchScore}%</span>
                    </div>
                  </div>

                  {/* Skills Analysis */}
                  {aiAnalysis.skillsMatch && (
                    <div className="space-y-3">
                      <h4 className="font-medium">Skills Analysis</h4>

                      {aiAnalysis.skillsMatch.matched?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-green-600 mb-2 flex items-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            Matching Skills ({aiAnalysis.skillsMatch.matched.length})
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {aiAnalysis.skillsMatch.matched.map((skill: string) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="bg-green-100 text-green-800"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiAnalysis.skillsMatch.missing?.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-amber-600 mb-2 flex items-center gap-1">
                            <AlertTriangle className="h-4 w-4" />
                            Skills to Develop ({aiAnalysis.skillsMatch.missing.length})
                          </h5>
                          <div className="flex flex-wrap gap-1">
                            {aiAnalysis.skillsMatch.missing.map((skill: string) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="border-amber-200 text-amber-700"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Strengths */}
                  {aiAnalysis.strengths?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-green-600 mb-2 flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Your Strengths
                      </h4>
                      <ul className="text-sm space-y-1">
                        {aiAnalysis.strengths.map((strength: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Areas to Improve */}
                  {aiAnalysis.improvements?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-amber-600 mb-2 flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4" />
                        Areas to Improve
                      </h4>
                      <ul className="text-sm space-y-1">
                        {aiAnalysis.improvements.map((improvement: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-amber-500 mt-1">•</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendations */}
                  {aiAnalysis.recommendations?.length > 0 && (
                    <div>
                      <h4 className="font-medium text-blue-600 mb-2 flex items-center gap-1">
                        <Lightbulb className="h-4 w-4" />
                        Recommendations
                      </h4>
                      <ul className="text-sm space-y-1">
                        {aiAnalysis.recommendations.map((recommendation: string, index: number) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex gap-2 pt-4 border-t">
                    <Link href="/resumes" className="flex-1">
                      <Button variant="outline" className="w-full">
                        <FileText className="h-4 w-4 mr-2" />
                        Update Resume
                      </Button>
                    </Link>
                    <Button onClick={() => setShowAIAnalysis(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  );
}