"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CreditCard, User, FileText, CheckCircle } from "lucide-react"
import {toast} from "sonner"
import { createCheckoutSession } from "../premium/actions"


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
  urgency: z.string().min(1, "Please select urgency level"),
})

const paymentSchema = z.object({
  cardNumber: z.string().min(16, "Please enter a valid card number"),
  expiryDate: z.string().min(5, "Please enter expiry date (MM/YY)"),
  cvv: z.string().min(3, "Please enter CVV"),
  cardholderName: z.string().min(2, "Please enter cardholder name"),
  billingAddress: z.string().min(5, "Please enter billing address"),
  city: z.string().min(2, "Please enter city"),
  postalCode: z.string().min(4, "Please enter postal code"),
  agreeToTerms: z.boolean().refine((val) => val === true, "You must agree to the terms and conditions"),
})

type PersonalInfo = z.infer<typeof personalInfoSchema>
type Requirements = z.infer<typeof requirementsSchema>
type Payment = z.infer<typeof paymentSchema>

export function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(false);


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
    { number: 3, title: "Payment", icon: CreditCard },
  ]

  const handlePersonalInfoSubmit = (data: PersonalInfo) => {
    console.log("Personal info:", data)
    setCurrentStep(2)
  }

  const handleRequirementsSubmit = (data: Requirements) => {
    console.log("Requirements:", data)
    setCurrentStep(3)
  }

  async function handlePremiumClick(priceId: string) {
      try {
          setLoading(true);
          const sessionUrl = await createCheckoutSession(priceId);
          window.location.href = sessionUrl;
      } catch (error) {
          console.log(error);
          toast.error("Something went wrong while creating the checkout session", {
            position: "top-right",
          });
          
      }finally{
          setLoading(false);
      }
    }

  const handlePaymentSubmit = async (data: Payment) => {
    setIsSubmitting(true)

    try {
      // Combine all form data
      const orderData = {
        personalInfo: personalForm.getValues(),
        requirements: requirementsForm.getValues(),
        payment: data,
        amount: 200000, // R2000 in cents
        currency: "ZAR",
      }

      const response = await fetch("/api/linkedin/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const result = await response.json()

    //   toast({
    //     title: "Order created successfully!",
    //     description: "You will receive a confirmation email shortly with next steps.",
    //   })

      // Redirect to success page
      window.location.href = `/linkedin-optimizer/checkout/success?orderId=${result.orderId}`
    } catch (error) {
        console.error(error)
      toast.error("Payment failed")
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = (currentStep / steps.length) * 100

  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Checkout Process</CardTitle>
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
                    step.number <= currentStep ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
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
            <form onSubmit={personalForm.handleSubmit(handlePersonalInfoSubmit)} className="space-y-4">
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
                  <Input id="phone" {...personalForm.register("phone")} />
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
            <CardDescription>
              Tell us about your goals so we can provide the most relevant optimization.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={requirementsForm.handleSubmit(handleRequirementsSubmit)} className="space-y-4">
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
                    <p className="text-sm text-destructive mt-1">
                      {requirementsForm.formState.errors.industry.message}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <select className="w-full p-2 border rounded-md" {...requirementsForm.register("experience")}>
                    <option value="">Select experience level</option>
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
                  <option value="standard">Standard (5-7 days)</option>
                  <option value="priority">Priority (3-4 days)</option>
                  <option value="urgent">Urgent (1-2 days)</option>
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
            <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Secure Payment:</strong> All payment information is encrypted and processed securely.
                </AlertDescription>
              </Alert>

              <div>
                <Label htmlFor="cardNumber">Card Number *</Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" {...paymentForm.register("cardNumber")} />
                {paymentForm.formState.errors.cardNumber && (
                  <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.cardNumber.message}</p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="expiryDate">Expiry Date *</Label>
                  <Input id="expiryDate" placeholder="MM/YY" {...paymentForm.register("expiryDate")} />
                  {paymentForm.formState.errors.expiryDate && (
                    <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.expiryDate.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="cvv">CVV *</Label>
                  <Input id="cvv" placeholder="123" {...paymentForm.register("cvv")} />
                  {paymentForm.formState.errors.cvv && (
                    <p className="text-sm text-destructive mt-1">{paymentForm.formState.errors.cvv.message}</p>
                  )}
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

              <div className="flex items-center space-x-2">
                <Checkbox id="agreeToTerms" {...paymentForm.register("agreeToTerms")} />
                <Label htmlFor="agreeToTerms" className="text-sm">
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
                <Button 
                onClick={() =>
                  handlePremiumClick(
                    process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LINKEDIN_OPTIMIZED!,
                  )
                }
                
                type="submit" disabled={isSubmitting} size="lg" className="px-8">
                  {isSubmitting ? "Processing..." : "Complete Order - R2,000"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
