import { getJobApplications } from "@/actions/jobs";
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
  FileText,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow, format } from "date-fns";

export default async function ApplicationsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const applications = await getJobApplications();

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

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
      case 'declined':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
      case 'declined':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Applications</h1>
          <p className="text-muted-foreground">
            Track your job applications and their status
          </p>
        </div>

        {applications.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Send className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No applications yet</h3>
              <p className="text-muted-foreground mb-4">
                Start applying to jobs to track your applications here
              </p>
              <Link href="/jobs">
                <Button>Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((application) => (
              <Card key={application.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Link href={`/jobs/${application.job.id}`} className="hover:underline">
                          <h3 className="font-semibold text-lg">{application.job.title}</h3>
                        </Link>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(application.status)}
                          <Badge className={getStatusColor(application.status)}>
                            {application.status}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {application.job.company}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {application.job.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          Applied {formatDistanceToNow(new Date(application.appliedAt), { addSuffix: true })}
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm mb-3">
                        <Badge variant="outline">
                          {jobTypeLabels[application.job.jobType as keyof typeof jobTypeLabels]}
                        </Badge>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <DollarSign className="h-4 w-4" />
                          {formatSalary(application.job.salaryMin, application.job.salaryMax, application.job.currency)}
                        </div>
                      </div>

                      {application.job.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {application.job.skills.slice(0, 5).map((skill) => (
                            <Badge key={skill} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {application.job.skills.length > 5 && (
                            <Badge variant="secondary" className="text-xs">
                              +{application.job.skills.length - 5} more
                            </Badge>
                          )}
                        </div>
                      )}

                      {application.coverLetter && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <h4 className="text-sm font-medium mb-1">Cover Letter</h4>
                          <p className="text-sm text-muted-foreground line-clamp-3">
                            {application.coverLetter}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <Separator className="mb-3" />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div>
                        Applied on: {format(new Date(application.appliedAt), 'MMM dd, yyyy')}
                      </div>
                      {application.resume && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          Resume attached
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Link href={`/jobs/${application.job.id}`}>
                        <Button variant="outline" size="sm">
                          View Job
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