import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Target, TrendingUp, Users } from "lucide-react"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-pink-50 dark:bg-pink-50">
      {/* Hero Section */}
      <section className="dark:bg-accent px-4 py-20">
        <div className="container mx-auto text-center">
          <h1 className="text-foreground mb-6 text-5xl font-bold text-balance">
            Professional Resume Builder & LinkedIn Optimizer
          </h1>
          <p className="text-muted-foreground mx-auto mb-8 max-w-3xl text-xl text-pretty">
            Build stunning CVs/resumes for free and optimize your LinkedIn
            profile with our expert analysis and professional consultation
            services.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/resumes">
                Build Your CV/Resume - Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              asChild
              className="bg-pink-500 text-white hover:bg-pink-600 hover:text-white dark:bg-pink-700"
            >
              <Link href="/linkedin-optimizer/checkout">
                Optimize Your LinkedIn Profile
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" asChild variant="destructive">
              <Link href="/linkedin-optimizer">
                Start LinkedIn Analysis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 dark:bg-accent px-4 py-16">
        <div className="container mx-auto">
          <h2 className="text-foreground mb-12 text-center text-3xl font-bold">
            Everything You Need for Career Success
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <Card className="dark:bg-accent bg-pink-100">
              <CardHeader>
                <div className="bg-primary/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Target className="text-primary h-6 w-6" />
                </div>
                <CardTitle>Free Resume Builder</CardTitle>
                <CardDescription>
                  Create professional resumes with our easy-to-use builder.
                  Multiple templates and formats available.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dark:bg-accent bg-pink-100">
              <CardHeader>
                <div className="bg-accent mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <TrendingUp className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>LinkedIn Analysis</CardTitle>
                <CardDescription>
                  Get detailed insights on your LinkedIn profile with keyword
                  analysis, structure review, and optimization tips.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="dark:bg-accent bg-pink-100">
              <CardHeader>
                <div className="bg-chart-1/10 mb-4 flex h-12 w-12 items-center justify-center rounded-lg">
                  <Users className="text-chart-1 h-6 w-6" />
                </div>
                <CardTitle>Expert Consultation</CardTitle>
                <CardDescription>
                  Upgrade to professional consultation for personalized LinkedIn
                  optimization by our career experts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="dark:bg-accent px-4 py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-foreground mb-6 text-3xl font-bold">
            Ready to Boost Your Career?
          </h2>
          <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg">
            Join thousands of professionals who have improved their career
            prospects with our tools and services.
          </p>
          <Button size="lg" asChild variant="destructive">
            <Link href="/linkedin-optimizer">
              Start LinkedIn Analysis
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
