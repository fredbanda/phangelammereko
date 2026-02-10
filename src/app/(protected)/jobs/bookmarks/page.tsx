import { getBookmarkedJobs } from "@/actions/jobs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Eye,
  Users,
  Bookmark,
  BookmarkX
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import BookmarkButton from "./bookmark-button";

export default async function BookmarksPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const bookmarkedJobs = await getBookmarkedJobs();

  const formatSalary = (min: number | null, max: number | null, currency: string | null) => {
    const curr = currency || 'USD';
    if (min && max) {
      return `${curr} ${min.toLocaleString()} - ${max.toLocaleString()}`;
    } else if (min) {
      return `${curr} ${min.toLocaleString()}+`;
    } else if (max) {
      return `Up to ${curr} ${max.toLocaleString()}`;
    }
    return 'Salary not specified';
  };

  const jobTypeLabels = {
    FULL_TIME: 'Full-time',
    PART_TIME: 'Part-time',
    CONTRACT: 'Contract',
    REMOTE: 'Remote'
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Saved Jobs</h1>
          <p className="text-muted-foreground">
            {bookmarkedJobs.length} job{bookmarkedJobs.length !== 1 ? 's' : ''} saved for later
          </p>
        </div>

        {bookmarkedJobs.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No saved jobs yet</h3>
              <p className="text-muted-foreground mb-4">
                Start browsing jobs and save the ones you're interested in
              </p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarkedJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/jobs/${job.id}`} className="hover:underline">
                          <h3 className="font-semibold text-lg">{job.title}</h3>
                        </Link>
                        {job.isPromoted && (
                          <Badge variant="secondary" className="text-xs">
                            Featured
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <Badge variant="outline">
                          {jobTypeLabels[job.jobType as keyof typeof jobTypeLabels]}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                        </div>
                      </div>

                      {job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {job.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {job.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {job.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2 ml-4">
                      <BookmarkButton jobId={job.id} initialBookmarked={true} />
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Separator className="mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {job.viewCount} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {job._count.applications} applicants
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-3 w-3" />
                        {job._count.bookmarks} saved
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/jobs/${job.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}