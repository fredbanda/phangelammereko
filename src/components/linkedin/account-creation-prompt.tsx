/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  User, 
  Mail, 
  Phone, 
  Save, 
  Star, 
  Shield,
  CheckCircle2,
  Gift,
  Zap,
  Clock
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

interface AccountCreationPromptProps {
  isOpen: boolean
  onClose: () => void
  analysisData: AnalysisData | null
  profileData: ProfileData | null
}

export function AccountCreationPrompt({ 
  isOpen, 
  onClose, 
  analysisData, 
  profileData 
}: AccountCreationPromptProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: profileData?.email || "",
    phone: "",
    marketingConsent: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountCreated, setAccountCreated] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/users/create-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          analysisData,
          profileData,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create account")
      }

      const result = await response.json()
      setAccountCreated(true)
      toast.success("Account created successfully! Your report has been saved.")

      // Auto-close after 3 seconds
      setTimeout(() => {
        onClose()
      }, 3000)

    } catch (error) {
      console.error(error)
      toast.error("Failed to create account. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSkip = () => {
    toast.info("You can always create an account later to save future reports.")
    onClose()
  }

  if (accountCreated) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-6 h-6" />
              Account Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your LinkedIn analysis report has been saved to your account.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
              <Gift className="w-4 h-4" />
              <AlertDescription>
                <strong>Welcome bonus:</strong> You now have access to your report history and can track your profile improvements over time!
              </AlertDescription>
            </Alert>

            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This dialog will close automatically in a few seconds...
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="w-6 h-6 text-primary" />
            Save Your Analysis Report
          </DialogTitle>
          <DialogDescription>
            Create a free account to save your report and track your LinkedIn optimization progress over time.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Benefits */}
          <div className="grid grid-cols-1 gap-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <Save className="w-5 h-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-sm">Save Your Reports</h4>
                <p className="text-xs text-muted-foreground">Access your analysis anytime, anywhere</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <Clock className="w-5 h-5 text-green-600" />
              <div>
                <h4 className="font-medium text-sm">Track Progress</h4>
                <p className="text-xs text-muted-foreground">Monitor improvements over time</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <Zap className="w-5 h-5 text-purple-600" />
              <div>
                <h4 className="font-medium text-sm">Priority Support</h4>
                <p className="text-xs text-muted-foreground">Get faster responses to your questions</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="name" className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  Full Name
                </Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone" className="flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Phone Number (Optional)
                </Label>
                <Input
                  id="phone"
                  placeholder="Enter your phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing"
                checked={formData.marketingConsent}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, marketingConsent: checked as boolean }))
                }
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="marketing"
                  className="text-sm font-normal cursor-pointer"
                >
                  I&pos;d like to receive tips and updates about LinkedIn optimization
                </Label>
                <p className="text-xs text-muted-foreground">
                  You can unsubscribe at any time. We respect your privacy.
                </p>
              </div>
            </div>

            <Alert className="bg-amber-50 dark:bg-amber-950 border-amber-200">
              <Shield className="w-4 h-4" />
              <AlertDescription className="text-sm">
                <strong>Privacy guaranteed:</strong> We never share your data with third parties. Your information is secure and used only to improve your experience.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? (
                  <>
                    <Zap className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Create Free Account
                  </>
                )}
              </Button>
              
              <Button type="button" variant="outline" onClick={handleSkip} className="flex-1">
                Skip for Now
              </Button>
            </div>
          </form>

          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}