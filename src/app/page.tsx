import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Target, TrendingUp, Users } from "lucide-react"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-pink-50 dark:bg-pink-50">
      {/* Hero Section */}
      <section className="py-20 px-4 dark:bg-accent">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6 text-balance">
            Professional Resume Builder & LinkedIn Optimizer
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-pretty max-w-3xl mx-auto">
            Build stunning CVs/resumes for free and optimize your LinkedIn profile with our expert analysis and professional
            consultation services.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/resumes">
                Build Your CV/Resume - Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild className="bg-pink-500 text-white hover:bg-pink-600 hover:text-white dark:bg-pink-700">
              <Link href="/linkedin-optimizer/checkout">
                Optimize Your LinkedIn Profile
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted/30 dark:bg-accent">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">
            Everything You Need for Career Success
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-pink-100 dark:bg-accent">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Free Resume Builder</CardTitle>
                <CardDescription>
                  Create professional resumes with our easy-to-use builder. Multiple templates and formats available.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-pink-100 dark:bg-accent">
              <CardHeader>
                <div className="w-12 h-12 bg-accent rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <CardTitle>LinkedIn Analysis</CardTitle>
                <CardDescription>
                  Get detailed insights on your LinkedIn profile with keyword analysis, structure review, and
                  optimization tips.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-pink-100 dark:bg-accent">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-chart-1" />
                </div>
                <CardTitle>Expert Consultation</CardTitle>
                <CardDescription>
                  Upgrade to professional consultation for personalized LinkedIn optimization by our career experts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 dark:bg-accent">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-foreground mb-6">Ready to Boost Your Career?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who have improved their career prospects with our tools and services.
          </p>
          <Button size="lg" asChild variant="destructive">
            <Link href="/linkedin-optimizer">
              Start LinkedIn Analysis
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
