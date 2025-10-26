"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, CheckCircle, Loader2 } from "lucide-react";

const paymentSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Please enter a valid card number")
    .regex(/^\d{16}$/, "Card number must be 16 digits"),
  expiryDate: z
    .string()
    .min(5, "Please enter expiry date (MM/YY)")
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format must be MM/YY"),
  cvv: z
    .string()
    .min(3, "Please enter CVV")
    .max(4, "CVV must be 3-4 digits")
    .regex(/^\d{3,4}$/, "CVV must be numeric"),
  cardholderName: z
    .string()
    .min(2, "Please enter cardholder name")
    .regex(/^[a-zA-Z\s]+$/, "Name must contain only letters"),
  billingAddress: z.string().min(5, "Please enter billing address"),
  city: z.string().min(2, "Please enter city"),
  postalCode: z.string().min(4, "Please enter postal code"),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  currency?: string;
  onSubmit: (data: PaymentFormData) => Promise<void>;
  onBack?: () => void;
}

export function PaymentForm({
  amount,
  currency = "ZAR",
  onSubmit,
  onBack,
}: PaymentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardholderName: "",
      billingAddress: "",
      city: "",
      postalCode: "",
      agreeToTerms: false,
    },
  });

  const handleSubmit = async (data: PaymentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Payment error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.slice(0, 16);
  };

  const formatExpiryDate = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return `${cleaned.slice(0, 2)}/${cleaned.slice(2, 4)}`;
    }
    return cleaned;
  };

  const formatCVV = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 4);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="text-primary h-5 w-5" />
          Payment Information
        </CardTitle>
        <CardDescription>
          Secure payment processing. Your information is encrypted and
          protected.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Secure Payment:</strong> All payment information is
              encrypted and processed securely.
            </AlertDescription>
          </Alert>

          {/* Order Summary */}
          <div className="rounded-lg bg-gray-50 p-4">
            <h4 className="mb-2 font-semibold">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>LinkedIn Optimization Service</span>
                <span>
                  {currency} {amount.toLocaleString()}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between text-base font-semibold">
                <span>Total</span>
                <span>
                  {currency} {amount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Card Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={16}
                {...form.register("cardNumber")}
                onChange={(e) => {
                  const formatted = formatCardNumber(e.target.value);
                  form.setValue("cardNumber", formatted);
                }}
              />
              {form.formState.errors.cardNumber && (
                <p className="text-destructive mt-1 text-sm">
                  {form.formState.errors.cardNumber.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  maxLength={5}
                  {...form.register("expiryDate")}
                  onChange={(e) => {
                    const formatted = formatExpiryDate(e.target.value);
                    form.setValue("expiryDate", formatted);
                  }}
                />
                {form.formState.errors.expiryDate && (
                  <p className="text-destructive mt-1 text-sm">
                    {form.formState.errors.expiryDate.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="cvv">CVV *</Label>
                <Input
                  id="cvv"
                  type="password"
                  placeholder="123"
                  maxLength={4}
                  {...form.register("cvv")}
                  onChange={(e) => {
                    const formatted = formatCVV(e.target.value);
                    form.setValue("cvv", formatted);
                  }}
                />
                {form.formState.errors.cvv && (
                  <p className="text-destructive mt-1 text-sm">
                    {form.formState.errors.cvv.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                {...form.register("cardholderName")}
              />
              {form.formState.errors.cardholderName && (
                <p className="text-destructive mt-1 text-sm">
                  {form.formState.errors.cardholderName.message}
                </p>
              )}
            </div>
          </div>

          {/* Billing Information */}
          <div className="space-y-4">
            <h4 className="font-semibold">Billing Address</h4>

            <div>
              <Label htmlFor="billingAddress">Street Address *</Label>
              <Input
                id="billingAddress"
                placeholder="123 Main Street"
                {...form.register("billingAddress")}
              />
              {form.formState.errors.billingAddress && (
                <p className="text-destructive mt-1 text-sm">
                  {form.formState.errors.billingAddress.message}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Cape Town"
                  {...form.register("city")}
                />
                {form.formState.errors.city && (
                  <p className="text-destructive mt-1 text-sm">
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="postalCode">Postal Code *</Label>
                <Input
                  id="postalCode"
                  placeholder="8001"
                  {...form.register("postalCode")}
                />
                {form.formState.errors.postalCode && (
                  <p className="text-destructive mt-1 text-sm">
                    {form.formState.errors.postalCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={form.watch("agreeToTerms")}
                onCheckedChange={(checked) => {
                  form.setValue("agreeToTerms", checked as boolean);
                }}
              />
              <Label
                htmlFor="agreeToTerms"
                className="cursor-pointer text-sm leading-relaxed"
              >
                I agree to the{" "}
                <a
                  href="/terms"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Terms and Conditions
                </a>{" "}
                and{" "}
                <a
                  href="/privacy"
                  className="text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Privacy Policy
                </a>
              </Label>
            </div>
            {form.formState.errors.agreeToTerms && (
              <p className="text-destructive ml-6 text-sm">
                {form.formState.errors.agreeToTerms.message}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            {onBack && (
              <Button
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              onClick={form.handleSubmit(handleSubmit)}
              disabled={isSubmitting}
              size="lg"
              className="ml-auto px-8"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                `Complete Payment - ${currency} ${amount.toLocaleString()}`
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
