import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Briefcase, Users, TrendingUp, Plus } from "lucide-react"

export default function JobHomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            <h1 className="text-xl font-bold">JobBoard</h1>
          </div>

          <nav className="flex items-center gap-4">
            <Link href="/jobs">
              <Button variant="ghost">Browse Jobs</Button>
            </Link>
            <Link href="/jobs/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">Find Your Next Great Hire</h1>
        <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
          Connect with top talent and post your job openings to reach thousands of qualified candidates.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/jobs">
            <Button size="lg" variant="outline">
              Browse Jobs
            </Button>
          </Link>
          <Link href="/post-job">
            <Button size="lg">Post a Job</Button>
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="text-center">
              <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle>Active Jobs</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">1,200+</p>
              <p className="text-muted-foreground">Open positions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <Users className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle>Companies</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">500+</p>
              <p className="text-muted-foreground">Hiring companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
              <CardTitle>Success Rate</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold">85%</p>
              <p className="text-muted-foreground">Successful hires</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
