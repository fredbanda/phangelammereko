"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ArrowRight, CreditCard, User, FileText, CheckCircle, Shield, AlertCircle, Bug } from "lucide-react"
import PayButton from "../PaymentButton"

// Simplified validation functions instead of zod
const validatePersonalInfo = (data: any) => {
  const errors: any = {}
  if (!data.firstName || data.firstName.length < 2) errors.firstName = "First name must be at least 2 characters"
  if (!data.lastName || data.lastName.length < 2) errors.lastName = "Last name must be at least 2 characters"
  if (!data.email || !/\S+@\S+\.\S+/.test(data.email)) errors.email = "Please enter a valid email address"
  if (!data.phone || data.phone.length < 10) errors.phone = "Please enter a valid phone number"
  if (!data.linkedinUrl || !data.linkedinUrl.startsWith('http')) errors.linkedinUrl = "Please enter a valid LinkedIn URL"
  return { isValid: Object.keys(errors).length === 0, errors }
}

const validateRequirements = (data: any) => {
  const errors: any = {}
  if (!data.currentRole || data.currentRole.length < 2) errors.currentRole = "Please enter your current role"
  if (!data.targetRole || data.targetRole.length < 2) errors.targetRole = "Please enter your target role"
  if (!data.industry || data.industry.length < 2) errors.industry = "Please enter your industry"
  if (!data.experience) errors.experience = "Please select your experience level"
  if (!data.urgency) errors.urgency = "Please select urgency level"
  return { isValid: Object.keys(errors).length === 0, errors }
}

const validatePayment = (data: any) => {
  const errors: any = {}
  if (!data.agreeToTerms) errors.agreeToTerms = "You must agree to the terms and conditions"
  return { isValid: Object.keys(errors).length === 0, errors }
}

export default function CheckoutFlow() {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [errors, setErrors] = useState<any>({})
  
  const [orderData, setOrderData] = useState<{
    personalInfo?: any
    requirements?: any
  }>({})

  // Form data states
  const [personalInfo, setPersonalInfo] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedinUrl: ''
  })

  const [requirements, setRequirements] = useState({
    currentRole: '',
    targetRole: '',
    industry: '',
    experience: '',
    urgency: '',
    specificRequirements: ''
  })

  const [payment, setPayment] = useState({
    agreeToTerms: false
  })

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const steps = [
    { number: 1, title: "Personal Information", icon: User },
    { number: 2, title: "Requirements", icon: FileText },
    { number: 3, title: "Payment", icon: CreditCard },
  ]

  const handlePersonalInfoSubmit = () => {
    addDebugInfo("Personal info form submitted")
    
    const validation = validatePersonalInfo(personalInfo)
    setErrors(validation.errors)
    
    if (validation.isValid) {
      addDebugInfo("Personal info validation passed")
      setOrderData(prev => ({ ...prev, personalInfo }))
      setCurrentStep(2)
      addDebugInfo("Moved to step 2")
    } else {
      addDebugInfo("Personal info validation failed")
    }
  }

  const handleRequirementsSubmit = () => {
    addDebugInfo("Requirements form submitted")
    
    const validation = validateRequirements(requirements)
    setErrors(validation.errors)
    
    if (validation.isValid) {
      addDebugInfo("Requirements validation passed")
      setOrderData(prev => ({ ...prev, requirements }))
      setCurrentStep(3)
      addDebugInfo("Moved to step 3")
    } else {
      addDebugInfo("Requirements validation failed")
    }
  }

  const handlePaymentSubmit = async () => {
    addDebugInfo("Payment form submitted - STARTING PAYMENT PROCESS")
    
    const validation = validatePayment(payment)
    setErrors(validation.errors)
    
    if (!validation.isValid) {
      addDebugInfo("Payment validation failed")
      return
    }

    setIsSubmitting(true)
    addDebugInfo("Setting isSubmitting to true")

    try {
      const completeOrderData = {
        personalInfo: orderData.personalInfo,
        requirements: orderData.requirements,
        amount: requirements.urgency === 'priority' ? 250000 : requirements.urgency === 'urgent' ? 300000 : 200000,
        currency: "ZAR",
      }

      addDebugInfo(`Sending order data: ${JSON.stringify(completeOrderData)}`)
      addDebugInfo("About to make API call to /api/linkedin/create-order")

      const response = await fetch("/api/linkedin/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(completeOrderData),
      })

      addDebugInfo(`API response status: ${response.status}`)
      addDebugInfo(`API response ok: ${response.ok}`)

      if (!response.ok) {
        const errorText = await response.text()
        addDebugInfo(`API error response: ${errorText}`)
        throw new Error(`Failed to create order: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      addDebugInfo(`API success response: ${JSON.stringify(result)}`)

      if (result.success && result.paymentData && result.paymentUrl) {
        addDebugInfo("About to submit PayFast form")
        submitPayFastForm(result.paymentData, result.paymentUrl)
      } else {
        addDebugInfo("Invalid response from server - missing required fields")
        throw new Error("Invalid response from server")
      }
      
    } catch (error: any) {
      addDebugInfo(`Error occurred: ${error.message}`)
      console.error(error)
      alert(`Failed to process order: ${error.message}`)
    } finally {
      setIsSubmitting(false)
      addDebugInfo("Setting isSubmitting to false")
    }
  }

  const submitPayFastForm = (paymentData: any, paymentUrl: string) => {
    addDebugInfo(`Creating PayFast form with URL: ${paymentUrl}`)
    addDebugInfo(`PayFast data keys: ${Object.keys(paymentData).join(', ')}`)
    
    const form = document.createElement('form')
    form.method = 'POST'
    form.action = paymentUrl
    form.style.display = 'none'

    Object.keys(paymentData).forEach(key => {
      if (paymentData[key] !== null && paymentData[key] !== undefined && paymentData[key] !== '') {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = key
        input.value = paymentData[key].toString()
        form.appendChild(input)
        addDebugInfo(`Added form field: ${key} = ${paymentData[key]}`)
      }
    })

    document.body.appendChild(form)
    addDebugInfo("Form appended to body, about to submit")
    form.submit()
    addDebugInfo("Form submitted!")
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
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input 
                    id="firstName" 
                    value={personalInfo.firstName}
                    onChange={(e) => setPersonalInfo(prev => ({...prev, firstName: e.target.value}))}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-destructive mt-1">{errors.firstName}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input 
                    id="lastName" 
                    value={personalInfo.lastName}
                    onChange={(e) => setPersonalInfo(prev => ({...prev, lastName: e.target.value}))}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-destructive mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email Address *</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={personalInfo.email}
                    onChange={(e) => setPersonalInfo(prev => ({...prev, email: e.target.value}))}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input 
                    id="phone" 
                    placeholder="e.g., 0821234567" 
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo(prev => ({...prev, phone: e.target.value}))}
                  />
                  {errors.phone && (
                    <p className="text-sm text-destructive mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="linkedinUrl">LinkedIn Profile URL *</Label>
                <Input
                  id="linkedinUrl"
                  placeholder="https://linkedin.com/in/yourname"
                  value={personalInfo.linkedinUrl}
                  onChange={(e) => setPersonalInfo(prev => ({...prev, linkedinUrl: e.target.value}))}
                />
                {errors.linkedinUrl && (
                  <p className="text-sm text-destructive mt-1">{errors.linkedinUrl}</p>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={handlePersonalInfoSubmit}>
                  Continue to Requirements
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
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
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currentRole">Current Role *</Label>
                  <Input
                    id="currentRole"
                    placeholder="e.g., Software Engineer"
                    value={requirements.currentRole}
                    onChange={(e) => setRequirements(prev => ({...prev, currentRole: e.target.value}))}
                  />
                  {errors.currentRole && (
                    <p className="text-sm text-destructive mt-1">{errors.currentRole}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="targetRole">Target Role *</Label>
                  <Input
                    id="targetRole"
                    placeholder="e.g., Senior Software Engineer"
                    value={requirements.targetRole}
                    onChange={(e) => setRequirements(prev => ({...prev, targetRole: e.target.value}))}
                  />
                  {errors.targetRole && (
                    <p className="text-sm text-destructive mt-1">{errors.targetRole}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="industry">Industry *</Label>
                  <Input
                    id="industry"
                    placeholder="e.g., Information Technology"
                    value={requirements.industry}
                    onChange={(e) => setRequirements(prev => ({...prev, industry: e.target.value}))}
                  />
                  {errors.industry && (
                    <p className="text-sm text-destructive mt-1">{errors.industry}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <select 
                    className="w-full p-2 border rounded-md" 
                    value={requirements.experience}
                    onChange={(e) => setRequirements(prev => ({...prev, experience: e.target.value}))}
                  >
                    <option value="">Select experience level</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="5-8">5-8 years</option>
                    <option value="8-12">8-12 years</option>
                    <option value="12+">12+ years</option>
                  </select>
                  {errors.experience && (
                    <p className="text-sm text-destructive mt-1">{errors.experience}</p>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor="urgency">Timeline *</Label>
                <select 
                  className="w-full p-2 border rounded-md" 
                  value={requirements.urgency}
                  onChange={(e) => setRequirements(prev => ({...prev, urgency: e.target.value}))}
                >
                  <option value="">Select timeline</option>
                  <option value="standard">Standard (5-7 days) - R2,000</option>
                  <option value="priority">Priority (3-4 days) - R2,500</option>
                  <option value="urgent">Urgent (1-2 days) - R3,000</option>
                </select>
                {errors.urgency && (
                  <p className="text-sm text-destructive mt-1">{errors.urgency}</p>
                )}
              </div>

              <div>
                <Label htmlFor="specificRequirements">Specific Requirements (Optional)</Label>
                <Textarea
                  id="specificRequirements"
                  placeholder="Any specific goals, challenges, or requirements for your LinkedIn optimization..."
                  rows={4}
                  value={requirements.specificRequirements}
                  onChange={(e) => setRequirements(prev => ({...prev, specificRequirements: e.target.value}))}
                />
              </div>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(1)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handleRequirementsSubmit}>
                  Continue to Payment
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Payment */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-chart-1" />
              Payment with PayFast
            </CardTitle>
            <CardDescription>
              Secure payment processing via PayFast - South Africa&apos;s leading payment gateway.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  <strong>Secure PayFast Payment:</strong> Your payment will be processed securely through PayFast, 
                  South Africa&apos;s most trusted payment gateway. You can pay with credit cards, instant EFT, or other local payment methods.
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
                  {requirements.urgency === 'priority' && (
                    <div className="flex justify-between text-orange-600">
                      <span>Priority Service (3-4 days)</span>
                      <span>+R500.00</span>
                    </div>
                  )}
                  {requirements.urgency === 'urgent' && (
                    <div className="flex justify-between text-red-600">
                      <span>Urgent Service (1-2 days)</span>
                      <span>+R1,000.00</span>
                    </div>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>
                      {requirements.urgency === 'priority' ? 'R2,500.00' :
                       requirements.urgency === 'urgent' ? 'R3,000.00' : 'R2,000.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment Methods Info */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Available Payment Methods
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                  <div className="flex items-center gap-1">
                    <span>💳</span> Credit Cards
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🏧</span> Instant EFT
                  </div>
                  <div className="flex items-center gap-1">
                    <span>📱</span> SnapScan
                  </div>
                  <div className="flex items-center gap-1">
                    <span>🏪</span> Store Cards
                  </div>
                </div>
              </div>

              {/* Customer Details Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Customer Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Name:</span> {orderData.personalInfo?.firstName} {orderData.personalInfo?.lastName}
                  </div>
                  <div>
                    <span className="font-medium">Email:</span> {orderData.personalInfo?.email}
                  </div>
                  <div>
                    <span className="font-medium">Phone:</span> {orderData.personalInfo?.phone}
                  </div>
                  <div>
                    <span className="font-medium">Timeline:</span> {
                      requirements.urgency === 'standard' ? '5-7 days' :
                      requirements.urgency === 'priority' ? '3-4 days' :
                      requirements.urgency === 'urgent' ? '1-2 days' : 'Standard'
                    }
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox 
                  id="agreeToTerms" 
                  checked={payment.agreeToTerms}
                  onCheckedChange={(checked) => setPayment(prev => ({...prev, agreeToTerms: !!checked}))}
                />
                <div className="text-sm">
                  <Label htmlFor="agreeToTerms" className="text-sm cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms" target="_blank" className="text-primary hover:underline">
                      Terms and Conditions
                    </a>{" "}
                    and{" "}
                    <a href="/privacy" target="_blank" className="text-primary hover:underline">
                      Privacy Policy
                    </a>. I understand that payment will be processed through PayFast and I will be redirected to their secure payment page.
                  </Label>
                </div>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-destructive">{errors.agreeToTerms}</p>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(2)}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button onClick={handlePaymentSubmit} disabled={isSubmitting} size="lg" className="px-8">
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Proceed to PayFast - {
                        requirements.urgency === 'priority' ? 'R2,500' :
                        requirements.urgency === 'urgent' ? 'R3,000' : 'R2,000'
                      }
                    </>
                  )}
                </Button>
                <p>
                  <PayButton />
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}