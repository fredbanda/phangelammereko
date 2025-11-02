"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CreditCard, User, FileText, CheckCircle, AlertCircle, Mail } from "lucide-react"
import { toast } from "sonner"
import { createCheckoutSession } from "../premium/actions"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

// ✅ Price ID mapping based on urgency
const URGENCY_PRICE_IDS = {
  standard: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED_STANDARD!,
  priority: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED_PRIORITY!,
  urgent: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED_URGENT!,
}

const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  linkedinUrl: z.string().url("Please enter a valid LinkedIn URL"),
})

const requirementsSchema = z.object({
  currentRole: z.string().min(2, "Please enter your current role"),
  targetRole: z.string().min(2, "Please enter your target role"),
  industry: z.string().min(2, "Please enter your industry"),
  experience: z.string().min(1, "Please select your experience level"),
  specificRequirements: z.string().optional(),
  urgency: z.enum(["standard", "priority", "urgent"], {
    required_error: "Please select urgency level",
  }),
})

const paymentSchema = z.object({
  cardholderName: z.string().min(2, "Please enter cardholder name"),
  billingAddress: z.string().min(5, "Please enter billing address"),
  city: z.string().min(2, "Please enter city"),
  postalCode: z.string().min(4, "Please enter postal code"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
})

type PersonalInfo = z.infer<typeof personalInfoSchema>
type Requirements = z.infer<typeof requirementsSchema>
type Payment = z.infer<typeof paymentSchema>

export default function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const personalForm = useForm<PersonalInfo>({
    resolver: zodResolver(personalInfoSchema),
  })

  const requirementsForm = useForm<Requirements>({
    resolver: zodResolver(requirementsSchema),
  })

  const paymentForm = useForm<Payment>({
    resolver: zodResolver(paymentSchema),
  })

  const steps = [
    { number: 1, title: "Personal Information", icon: User },
    { number: 2, title: "Requirements", icon: FileText },
    { number: 3, title: "Submit Order", icon: Mail },
  ]

  const handlePersonalInfoSubmit = personalForm.handleSubmit((data) => {
    console.log("Personal info:", data)
    setCurrentStep(2)
  })

  const handleRequirementsSubmit = requirementsForm.handleSubmit((data) => {
    console.log("Requirements:", data)
    setCurrentStep(3)
  })

  // ✅ FIXED: Now uses correct price ID based on urgency
  async function handlePremiumClick() {
    try {
      setLoading(true);
      
      // Get all form data
      const personalInfo = personalForm.getValues();
      const requirements = requirementsForm.getValues();
      
      // Validate that all data is filled
      if (!personalInfo.firstName || !personalInfo.email || !requirements.currentRole || !requirements.urgency) {
        toast.error("Please fill in all required fields", { position: "top-right" });
        setLoading(false);
        return;
      }

      // ✅ Get the correct Stripe price ID based on urgency
      const priceId = URGENCY_PRICE_IDS[requirements.urgency];
      
      if (!priceId) {
        toast.error("Invalid urgency level selected", { position: "top-right" });
        setLoading(false);
        return;
      }

      console.log(`💳 Using price ID for ${requirements.urgency}:`, priceId);

      // Structure the order data correctly
      const orderData = {
        clientName: `${personalInfo.firstName} ${personalInfo.lastName}`,
        clientEmail: personalInfo.email,
        requirements: {
          personalInfo: {
            firstName: personalInfo.firstName,
            lastName: personalInfo.lastName,
            email: personalInfo.email,
            phone: personalInfo.phone,
            linkedinUrl: personalInfo.linkedinUrl,
          },
          requirements: {
            currentRole: requirements.currentRole,
            targetRole: requirements.targetRole,
            industry: requirements.industry,
            experience: requirements.experience,
            specificRequirements: requirements.specificRequirements || "",
            urgency: requirements.urgency,
          }
        }
      };

      console.log("📦 Submitting order data:", orderData);

      // ✅ Pass the correct priceId to createCheckoutSession
      const session = await createCheckoutSession(priceId, orderData);

      if (session.url) {
        // Success - redirect to Stripe
        window.location.href = session.url;
      } else if (session.requiresAuth) {
        toast.error("Please log in to continue", { position: "top-right" });
      } else {
        toast.error(
          session.error || "Something went wrong while creating the checkout session",
          { position: "top-right" }
        );
      }
    } catch (error) {
      console.error("Checkout error:", error);
      toast.error("Something went wrong while creating the checkout session", {
        position: "top-right",
      });
    } finally {
      setLoading(false);
    }
  }

  const handlePaymentSubmit = paymentForm.handleSubmit(async (data) => {
    // Validate payment form
    console.log("Payment form validated:", data);
    
    // Then proceed with checkout
    await handlePremiumClick();
  })

  const progress = (currentStep / steps.length) * 100

  // Success screen
  if (isSubmitted) {
    const personalInfo = personalForm.getValues()
    const requirements = requirementsForm.getValues()

    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Order Submitted Successfully!</CardTitle>
          <CardDescription className="text-lg">
            Your LinkedIn optimization request has been sent via email.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              An email with your order details has been prepared and should open in your default email client.
              If it didn&apos;t open automatically, please copy the order details below and send them to{" "}
              <strong>ndabegeba@gmail.com</strong>.
            </AlertDescription>
          </Alert>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">Order Summary</h4>
            <div className="space-y-1 text-sm">
              <p>
                <strong>Name:</strong> {personalInfo.firstName} {personalInfo.lastName}
              </p>
              <br />
              <p>
                <strong>Email:</strong> {personalInfo.email}
              </p>
              <p>
                <strong>Phone:</strong> {personalInfo.phone}
              </p>
              <p>
                <strong>LinkedIn:</strong> {personalInfo.linkedinUrl}
              </p>
              <p>
                <strong>Current Role:</strong> {requirements.currentRole}
              </p>
              <p>
                <strong>Target Role:</strong> {requirements.targetRole}
              </p>
              <p>
                <strong>Industry:</strong> {requirements.industry}
              </p>
              <p>
                <strong>Experience:</strong> {requirements.experience}
              </p>
              <p>
                <strong>Timeline:</strong>{" "}
                {requirements.urgency === "standard"
                  ? "Standard (5-7 days)"
                  : requirements.urgency === "priority"
                    ? "Priority (3-4 days)"
                    : "Urgent (1-2 days)"}
              </p>
              <p>
                <strong>Total:</strong> R
                {requirements.urgency === "priority" ? "2,500" : requirements.urgency === "urgent" ? "3,000" : "2,000"}
              </p>
            </div>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>What happens next?</strong>
              <br />
              1. We&apos;ll review your order and contact you within 24 hours
              <br />
              2. We&apos;ll arrange payment details with you directly
              <br />
              3. Once payment is confirmed, we&apos;ll begin your LinkedIn optimization
              <br />
              4. You&apos;ll receive your optimized profile within the selected timeline
            </AlertDescription>
          </Alert>

          <div className="flex justify-center">
            <Button
              onClick={() => {
                setIsSubmitted(false)
                setCurrentStep(1)
                personalForm.reset()
                requirementsForm.reset()
                paymentForm.reset()
              }}
            >
              Submit Another Order
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Order Submission Process</CardTitle>
            <Badge variant="outline">
              Step {currentStep} of {steps.length}
            </Badge>
          </div>
          <Progress value={progress} className="mb-4" />
          <div className="flex justify-between">
            {steps.map((step) => (
              <div
                key={step.number}
                className={`flex items-center gap-2 ${
                  step.number <= currentStep ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step.number <= currentStep
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step.number < currentStep ? <CheckCircle className="w-4 h-4" /> : step.number}
                </div>
                <span className="text-sm font-medium hidden sm:block">{step.title}</span>
              </div>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Step 1: Personal Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
            <CardDescription>
              We need your details to schedule your consultation and deliver your optimized profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePersonalInfoSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input id="firstName" {...personalForm.register("firstName")} />
                  {personalForm.formState.errors.firstName && (
                    <p className="text-sm text-destructive mt-1">{personalForm.formState.errors.firstName.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input id="lastName" {...personalForm.register("lastName")} />
                  {personalForm.formState.errors.lastName && (
                    <p className="text-sm text-destructive mt-1">{personalForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" type="email" {...personalForm.register("email")} />
                  {personalForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{personalForm.formState.errors.email.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" placeholder="e.g., 0821234567" {...personalForm.register("phone")} />
                  {personalForm.formState.errors.phone && (
                    <p className="text-sm text-destructive mt-1">{personalForm.formState.errors.phone.message}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL *</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/yourname"
                  {...personalForm.register("linkedinUrl")}
                />
                {personalForm.formState.errors.linkedinUrl && (
                  <p className="text-sm text-destructive mt-1">{personalForm.formState.errors.linkedinUrl.message}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit">
                  Continue to Requirements
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Requirements */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-accent" />
              Optimization Requirements
            </CardTitle>
            <CardDescription>Tell us about your goals so we can provide the most relevant optimization.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRequirementsSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentRole">Current Role *</Label>
                  <Input
                    id="currentRole"
                    placeholder="e.g., Software Engineer"
                    {...requirementsForm.register("currentRole")}
                  />
                  {requirementsForm.formState.errors.currentRole && (
                    <p className="text-sm text-destructive mt-1">
                      {requirementsForm.formState.errors.currentRole.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="targetRole">Target Role *</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Senior Software Engineer"
                    {...requirementsForm.register("targetRole")}
                  />
                  {requirementsForm.formState.errors.targetRole && (
                    <p className="text-sm text-destructive mt-1">
                      {requirementsForm.formState.errors.targetRole.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Information Technology"
                    {...requirementsForm.register("industry")}
                  />
                  {requirementsForm.formState.errors.industry && (
                    <p className="text-sm text-destructive mt-1">{requirementsForm.formState.errors.industry.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <select className="w-full p-2 border rounded-md" {...requirementsForm.register("experience")}>
                    <option value="">Select experience level</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-8">5-8 years</option>
                    <option value="8-12">8-12 years</option>
                    <option value="12+">12+ years</option>
                  </select>
                  {requirementsForm.formState.errors.experience && (
                    <p className="text-sm text-destructive mt-1">
                      {requirementsForm.formState.errors.experience.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="urgency">Timeline *</Label>
                <select className="w-full p-2 border rounded-md" {...requirementsForm.register("urgency")}>
                  <option value="">Select timeline</option>
                  <option value="standard">Standard (5-7 days) - R2,000</option>
                  <option value="priority">Priority (3-4 days) - R2,500</option>
                  <option value="urgent">Urgent (1-2 days) - R3,000</option>
                </select>
                {requirementsForm.formState.errors.urgency && (
                  <p className="text-sm text-destructive mt-1">{requirementsForm.formState.errors.urgency.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="specificRequirements">Specific Requirements (Optional)</Label>
                <Textarea
                  id="specificRequirements"
                  placeholder="Any specific goals, challenges, or requirements for your LinkedIn optimization..."
                  rows={4}
                  {...requirementsForm.register("specificRequirements")}
                />
              </div>

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit">
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-chart-1" />
              Payment Information
            </CardTitle>
            <CardDescription>Secure payment processing. Your information is encrypted and protected.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePaymentSubmit} className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Secure Payment:</strong> All payment information is encrypted and processed securely.
                </AlertDescription>
              </Alert>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>LinkedIn Optimization Consultation</span>
                    <span>R2,000.00</span>
                  </div>
                  {requirementsForm.watch("urgency") === "priority" && (
                    <div className="flex justify-between text-orange-600">
                      <span>Priority Service (3-4 days)</span>
                      <span>+R500.00</span>
                    </div>
                  )}
                  {requirementsForm.watch("urgency") === "urgent" && (
                    <div className="flex justify-between text-red-600">
                      <span>Urgent Service (1-2 days)</span>
                      <span>+R1,000.00</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {requirementsForm.watch("urgency") === "priority"
                        ? "R2,500.00"
                        : requirementsForm.watch("urgency") === "urgent"
                          ? "R3,000.00"
                          : "R2,000.00"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="cardholderName">Cardholder Name *</Label>
                <Input id="cardholderName" placeholder="John Doe" {...paymentForm.register("cardholderName")} />
                {paymentForm.formState.errors.cardholderName && (
                  <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.cardholderName.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="billingAddress">Billing Address *</Label>
                <Input id="billingAddress" placeholder="123 Main Street" {...paymentForm.register("billingAddress")} />
                {paymentForm.formState.errors.billingAddress && (
                  <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.billingAddress.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City *</Label>
                  <Input id="city" placeholder="Cape Town" {...paymentForm.register("city")} />
                  {paymentForm.formState.errors.city && (
                    <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.city.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="postalCode">Postal Code *</Label>
                  <Input id="postalCode" placeholder="8001" {...paymentForm.register("postalCode")} />
                  {paymentForm.formState.errors.postalCode && (
                    <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.postalCode.message}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="agreeToTerms" 
                  onCheckedChange={(checked) => {
                    paymentForm.setValue("agreeToTerms", checked === true);
                  }}
                />
                <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                  I agree to the{" "}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms and Conditions
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>
                </Label>
              </div>
              {paymentForm.formState.errors.agreeToTerms && (
                <p className="text-sm text-destructive">{paymentForm.formState.errors.agreeToTerms.message}</p>
              )}

              <div className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button type="submit" disabled={loading || isSubmitting} size="lg" className="px-8">
                  {loading || isSubmitting ? "Processing..." : "Complete Order"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}