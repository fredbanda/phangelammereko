"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

interface OrderSummaryProps {
  urgency: "standard" | "priority" | "urgent" | null
}

const URGENCY_CONFIG = {
  standard: {
    price: 2000,
    timeline: "5-7 days",
    label: "Standard",
    description: "Perfect for thoughtful optimization"
  },
  priority: {
    price: 2500,
    timeline: "3-4 days", 
    label: "Priority",
    description: "Faster turnaround time"
  },
  urgent: {
    price: 3000,
    timeline: "1-2 days",
    label: "Urgent",
    description: "Express service"
  }
}

export default function OrderSummary({ urgency }: OrderSummaryProps) {
  const config = urgency ? URGENCY_CONFIG[urgency] : URGENCY_CONFIG.standard

  return (
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

          {urgency && urgency !== "standard" && (
            <div className="flex justify-between items-center text-sm">
              <span className="font-medium">
                {config.label} Service ({config.timeline})
              </span>
              <span className={urgency === "urgent" ? "text-red-600 font-medium" : "text-orange-600 font-medium"}>
                +R{config.price - 2000}
              </span>
            </div>
          )}

          <hr />
          
          <div className="space-y-2">
            <div className="flex justify-between items-center text-lg font-bold">
              <span>Total</span>
              <span>R{config.price.toLocaleString()}</span>
            </div>
            
            {urgency && (
              <div className="text-xs text-muted-foreground text-right">
                {config.description} • Delivery in {config.timeline}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}