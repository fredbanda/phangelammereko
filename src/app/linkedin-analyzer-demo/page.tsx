import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Target, 
  Sparkles, 
  BarChart3, 
  FileText, 
  ArrowRight,
  Brain,
  TrendingUp,
} from "lucide-react"

export default function LinkedinAnalyzerDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-2">
            <Target className="w-10 h-10 text-primary" />
            <h1 className="text-4xl font-bold">LinkedIn Profile Analyzer</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Get AI-powered insights and recommendations to optimize your LinkedIn profile for better career opportunities. 
            Upload your profile or enter details manually for instant analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/linkedin-analyzer">
              <Button size="lg" className="px-8">
                <Sparkles className="w-5 h-5 mr-2" />
                Start Free Analysis
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8">
              <FileText className="w-5 h-5 mr-2" />
              View Sample Report
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">AI-Powered Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Advanced AI analyzes your profile and provides personalized recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Detailed Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Get scores for headline, summary, experience, and skills with improvement tips
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Future-Ready Skills</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Learn which AI and emerging skills to add for better career prospects
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-2">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle className="text-lg">PDF Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Download comprehensive reports with actionable recommendations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">How It Works</CardTitle>
            <CardDescription className="text-center">
              Get your LinkedIn profile optimized in 3 simple steps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">1</span>
                </div>
                <h3 className="font-semibold">Upload or Enter Profile</h3>
                <p className="text-sm text-muted-foreground">
                  Upload your LinkedIn PDF or manually enter your profile information
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">2</span>
                </div>
                <h3 className="font-semibold">AI Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI analyzes your profile and generates personalized recommendations
                </p>
              </div>
              
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-2xl font-bold text-primary">3</span>
                </div>
                <h3 className="font-semibold">Get Results & Book Service</h3>
                <p className="text-sm text-muted-foreground">
                  Download your report and optionally book professional optimization services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CTA Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Ready to Optimize Your LinkedIn Profile?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of professionals who have improved their LinkedIn presence with our AI-powered analysis.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/linkedin-analyzer">
                  <Button size="lg" className="px-8">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Start Free Analysis Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}