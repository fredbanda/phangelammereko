/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  Calendar, 
  Clock, 
  CheckCircle2,
  Zap,
  Target,
  Award,
  Shield,
  Phone,
  Mail,
  User
} from "lucide-react"
import { toast } from "sonner"

interface AnalysisData {
  profileId: string
  overallScore: number
  headlineScore: number
  summaryScore: number
  experienceScore: number
  skillsScore: number
  keywordAnalysis: {
    missingKeywords: string[]
    suggestions: string[]
  }
  recommendations: {
    headline: string[]
    summary: string[]
    experience: string[]
    skills: string[]
    aiSkills: string[]
  }
}

interface ProfileData {
  headline: string
  summary: string
  location: string
  industry: string
  experiences: any[]
  education: any[]
  skills: string[]
  profileUrl: string
  email: string
}

interface OptimizationBookingModalProps {
  isOpen: boolean
  onClose: () => void
  analysisData: AnalysisData | null
  profileData: ProfileData | null
}

const packages = [
  {
    id: "STANDARD",
    name: "Standard Optimization",
    price: 2000,
    currency: "ZAR",
    duration: "5-7 days",
    description: "Complete LinkedIn profile optimization",
    features: [
      "Professional headline rewrite",
      "Compelling summary optimization",
      "Experience section enhancement",
      "Skills optimization",
      "Keyword integration",
      "Industry-specific recommendations",
      "Before/after comparison report"
    ],
    popular: false
  },
  {
    id: "PRIORITY",
    name: "Priority Optimization",
    price: 2500,
    currency: "ZAR",
    duration: "3-4 days",
    description: "Fast-track optimization with priority support",
    features: [
      "Everything in Standard",
      "Priority processing",
      "AI skills integration",
      "Personal branding consultation",
      "LinkedIn strategy guide",
      "Follow-up review session",
      "Direct consultant contact"
    ],
    popular: true
  },
  {
    id: "URGENT",
    name: "Urgent Optimization",
    price: 3000,
    currency: "ZAR",
    duration: "1-2 days",
    description: "Express service for immediate results",
    features: [
      "Everything in Priority",
      "24-48 hour delivery",
      "Dedicated consultant",
      "Real-time updates",
      "Emergency support",
      "LinkedIn posting strategy",
      "Network growth recommendations"
    ],
    popular: false
  }
]

export function OptimizationBookingModal({ 
  isOpen, 
  onClose, 
  analysisData, 
  profileData 
}: OptimizationBookingModalProps) {
  const [selectedPackage, setSelectedPackage] = useState("PRIORITY")
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: profileData?.email || "",
    clientPhone: "",
    requirements: "",
    urgency: "standard",
    currentRole: "",
    targetRole: "",
    industry: profileData?.industry || "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingComplete, setBookingComplete] = useState(false)

  const selectedPkg = packages.find(pkg => pkg.id === selectedPackage)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/linkedin/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          packageType: selectedPackage,
          amount: selectedPkg?.price || 2500,
          currency: selectedPkg?.currency || "ZAR",
          clientName: formData.clientName,
          clientEmail: formData.clientEmail,
          clientPhone: formData.clientPhone,
          requirements: {
            personalInfo: {
              firstName: formData.clientName.split(" ")[0],
              lastName: formData.clientName.split(" ").slice(1).join(" "),
              email: formData.clientEmail,
              phone: formData.clientPhone,
            },
            requirements: {
              currentRole: formData.currentRole,
              targetRole: formData.targetRole,
              industry: formData.industry,
              urgency: formData.urgency,
              specificRequirements: formData.requirements,
            },
            analysisData,
            profileData,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const result = await response.json()
      
      // Redirect to payment
      if (result.paymentUrl) {
        window.location.href = result.paymentUrl
      } else {
        setBookingComplete(true)
        toast.success("Booking created successfully! You'll receive payment instructions via email.")
      }

    } catch (error) {
      console.error(error)
      toast.error("Failed to create booking. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (bookingComplete) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Booking Confirmed!
            </DialogTitle>
            <DialogDescription>
              Your LinkedIn optimization service has been booked successfully.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <CheckCircle2 className="w-4 h-4" />
              <AlertDescription>
                <strong>What&apos;s next:</strong> You&apos;ll receive a confirmation email with payment instructions and next steps within 5 minutes.
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <Button onClick={onClose} className="w-full">
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-6 h-6 text-primary" />
            Book LinkedIn Optimization Service
          </DialogTitle>
          <DialogDescription>
            Get professional help implementing your optimization recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Package Selection */}
          <div>
            <h3 className="font-semibold mb-4">Choose Your Package</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className={`cursor-pointer transition-all ${
                    selectedPackage === pkg.id 
                      ? "ring-2 ring-primary border-primary" 
                      : "hover:border-primary/50"
                  } ${pkg.popular ? "relative" : ""}`}
                  onClick={() => setSelectedPackage(pkg.id)}
                >
                  {pkg.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-white">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    <CardDescription>{pkg.description}</CardDescription>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">R{pkg.price.toLocaleString()}</span>
                      <span className="text-sm text-muted-foreground">ZAR</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {pkg.duration}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName" className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    Full Name *
                  </Label>
                  <Input
                    id="clientName"
                    placeholder="Enter your full name"
                    value={formData.clientName}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientName: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail" className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Email Address *
                  </Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.clientEmail}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clientPhone" className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="clientPhone"
                    placeholder="Enter your phone number"
                    value={formData.clientPhone}
                    onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Information Technology"
                    value={formData.industry}
                    onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Career Information */}
            <div>
              <h3 className="font-semibold mb-4">Career Goals</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentRole">Current Role</Label>
                  <Input
                    id="currentRole"
                    placeholder="e.g., Software Developer"
                    value={formData.currentRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentRole: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="targetRole">Target Role</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Senior Software Engineer"
                    value={formData.targetRole}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetRole: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Special Requirements */}
            <div>
              <Label htmlFor="requirements">Special Requirements (Optional)</Label>
              <Textarea
                id="requirements"
                placeholder="Any specific requirements or focus areas for your LinkedIn optimization..."
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData(prev => ({ ...prev, requirements: e.target.value }))}
              />
            </div>

            {/* Order Summary */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-primary" />
                  Order Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{selectedPkg?.name}</span>
                    <span className="font-bold">R{selectedPkg?.price.toLocaleString()} ZAR</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Delivery Time</span>
                    <span>{selectedPkg?.duration}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    <span>Your Current Score</span>
                    <span>{analysisData?.overallScore}%</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center font-bold">
                      <span>Total</span>
                      <span>R{selectedPkg?.price.toLocaleString()} ZAR</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Guarantees */}
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <Shield className="w-4 h-4" />
              <AlertDescription>
                <strong>Our Guarantee:</strong> 100% satisfaction guaranteed or your money back. We&pos;re committed to improving your LinkedIn profile score by at least 20 points.
              </AlertDescription>
            </Alert>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1" size="lg">
                {isSubmitting ? (
                  <>
                    <Zap className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 mr-2" />
                    Book Now - R{selectedPkg?.price.toLocaleString()}
                  </>
                )}
              </Button>
              
              <Button type="button" variant="outline" onClick={onClose} className="flex-1" size="lg">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}