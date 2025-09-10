import { CheckoutFlow } from "@/components/linkedin/checkout-flow"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Star, Clock, Users } from "lucide-react"

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">Professional LinkedIn Optimization</h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Get expert consultation and complete profile optimization for maximum impact
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <CheckoutFlow />
            </div>

            {/* Order Summary & Benefits */}
            <div className="space-y-6">
              {/* Order Summary */}
              <Card className="border-2 border-primary/20">
                <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-accent" />
                    Order Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">LinkedIn Profile Optimization</span>
                      <Badge variant="outline">Premium</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Personal consultation</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>Complete profile rewrite</span>
                      <span>Included</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground">
                      <span>LinkedIn banner design</span>
                      <span className="text-green-600 font-medium">Free (Limited time)</span>
                    </div>
                    <hr />
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>R2,000</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* What's Included */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What&apos;s Included</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">1-on-1 Consultation</p>
                      <p className="text-sm text-muted-foreground">45-minute session with LinkedIn expert</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Complete Profile Rewrite</p>
                      <p className="text-sm text-muted-foreground">Professional rewriting of all sections</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Keyword Optimization</p>
                      <p className="text-sm text-muted-foreground">Industry-specific keyword integration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Ready-to-Use Content</p>
                      <p className="text-sm text-muted-foreground">Copy-paste optimized profile sections</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium">LinkedIn Banner Design</p>
                      <p className="text-sm text-muted-foreground">Custom banner worth R500 (limited time)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Process Timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Clock className="w-5 h-5 text-primary" />
                    Process Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Order Confirmation</p>
                      <p className="text-sm text-muted-foreground">Immediate</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium">Consultation Scheduling</p>
                      <p className="text-sm text-muted-foreground">Within 24 hours</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-chart-1 text-white flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium">Profile Optimization</p>
                      <p className="text-sm text-muted-foreground">3-5 business days</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold">
                      4
                    </div>
                    <div>
                      <p className="font-medium">Delivery</p>
                      <p className="text-sm text-muted-foreground">Complete optimized profile</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust Indicators */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Users className="w-5 h-5 text-accent" />
                    Why Choose Us
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">500+ professionals optimized</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">Average 40% increase in profile views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">100% satisfaction guarantee</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm">LinkedIn certified experts</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
