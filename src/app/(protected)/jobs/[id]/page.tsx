import { notFound } from "next/navigation";
import { getJobById, isJobBookmarked, hasAppliedToJob } from "@/actions/jobs";
import { auth } from "@clerk/nextjs/server";
import JobDetailClient from "./job-detail-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  MapPin, 
  Clock, 
  DollarSign, 
  Building2, 
  Calendar,
  Eye,
  Users,
  Bookmark,
  Globe
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

interface JobDetailPageProps {
  params: {
    id: string;
  };
}

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { userId } = await auth();
  const job = await getJobById(params.id);

  if (!job) {
    notFound();
  }

  const [isBookmarked, hasApplied] = await Promise.all([
    userId ? isJobBookmarked(params.id) : false,
    userId ? hasAppliedToJob(params.id) : false
  ]);

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

  const isExpired = new Date(job.closingDate) < new Date();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h1 className="text-2xl font-bold">{job.title}</h1>
                      {job.isPromoted && (
                        <Badge variant="secondary">Featured</Badge>
                      )}
                      {isExpired && (
                        <Badge variant="destructive">Expired</Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-muted-foreground mb-4">
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

                    <div className="flex items-center gap-4 mb-4">
                      <Badge variant="outline" className="text-sm">
                        {jobTypeLabels[job.jobType as keyof typeof jobTypeLabels]}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4" />
                        {formatSalary(job.salaryMin, job.salaryMax, job.currency)}
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {job.viewCount} views
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {job._count.applications} applicants
                      </div>
                      <div className="flex items-center gap-1">
                        <Bookmark className="h-4 w-4" />
                        {job._count.bookmarks} saved
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <JobDetailClient 
                  jobId={job.id}
                  isBookmarked={isBookmarked}
                  hasApplied={hasApplied}
                  isExpired={isExpired}
                  applicationUrl={job.applicationUrl}
                />
                
                <Separator className="my-6" />
                
                {/* Job Description */}
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-3">Job Description</h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{job.description}</p>
                    </div>
                  </div>

                  {job.requirements && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Requirements</h2>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{job.requirements}</p>
                      </div>
                    </div>
                  )}

                  {job.benefits && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Benefits</h2>
                      <div className="prose prose-sm max-w-none">
                        <p className="whitespace-pre-wrap">{job.benefits}</p>
                      </div>
                    </div>
                  )}

                  {job.skills.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold mb-3">Required Skills</h2>
                      <div className="flex flex-wrap gap-2">
                        {job.skills.map((skill) => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Company Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-medium">{job.company}</h3>
                    {job.industry && (
                      <p className="text-sm text-muted-foreground">{job.industry}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{job.businessLocation}</span>
                    </div>
                    
                    {job.companyEmail && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" />
                        <span>{job.companyEmail}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Job Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Job Type:</span>
                      <span>{jobTypeLabels[job.jobType as keyof typeof jobTypeLabels]}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Salary:</span>
                      <span>{formatSalary(job.salaryMin, job.salaryMax, job.currency)}</span>
                    </div>
                    
                    {job.experienceLevel && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Experience:</span>
                        <span className="capitalize">{job.experienceLevel}</span>
                      </div>
                    )}
                    
                    {job.educationLevel && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Education:</span>
                        <span className="capitalize">{job.educationLevel}</span>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Posted:</span>
                      <span>{format(new Date(job.createdAt), 'MMM dd, yyyy')}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className={isExpired ? 'text-destructive' : ''}>
                        {format(new Date(job.closingDate), 'MMM dd, yyyy')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              {(job.firstName || job.lastName || job.companyPhone) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(job.firstName || job.lastName) && (
                      <div>
                        <span className="text-muted-foreground">Contact Person:</span>
                        <p>{[job.firstName, job.lastName].filter(Boolean).join(' ')}</p>
                        {job.posterPosition && (
                          <p className="text-muted-foreground">{job.posterPosition}</p>
                        )}
                      </div>
                    )}
                    
                    {job.companyPhone && (
                      <div>
                        <span className="text-muted-foreground">Phone:</span>
                        <p>{job.companyPhone}</p>
                      </div>
                    )}
                    
                    {job.companyEmail && (
                      <div>
                        <span className="text-muted-foreground">Email:</span>
                        <p>{job.companyEmail}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}