import { LinkedinProfileInput } from "@/components/linkedin/linkedin-profile-input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LinkedinOptimizerPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">LinkedIn Profile Optimization</h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              Get a comprehensive analysis of your LinkedIn profile and unlock professional opportunities with our
              expert optimization service.
            </p>
          </div>

          {/* Main Input Card */}
          <Card className="border-border shadow-lg">
            <CardHeader className="bg-card">
              <CardTitle className="text-2xl text-card-foreground">Step 1: Share Your LinkedIn Profile</CardTitle>
              <CardDescription className="text-lg">
                Choose how you&apos;d like to provide your LinkedIn information for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <LinkedinProfileInput />
            </CardContent>
          </Card>

          {/* Benefits Section */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg">Keyword Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Identify missing industry keywords and optimize your profile for better visibility
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <CardTitle className="text-lg">Profile Boost</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Get actionable suggestions to improve your headline, summary, and experience sections
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-chart-1/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-chart-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <CardTitle className="text-lg">Expert Review</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Upgrade to professional consultation for personalized optimization by our experts
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
