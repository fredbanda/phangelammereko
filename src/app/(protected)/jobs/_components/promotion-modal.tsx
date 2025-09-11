"use client"

import type React from "react"

import { useState } from "react"
import { promoteJob } from "@/actions/jobs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Crown, Check, Zap, TrendingUp, Eye } from "lucide-react"

interface PromotionModalProps {
  jobId: string
  jobTitle: string
  children: React.ReactNode
}

export function PromotionModal({ jobId, jobTitle, children }: PromotionModalProps) {
  const [isPromoting, setIsPromoting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  const handlePromote = async (days: number) => {
    setIsPromoting(true)
    try {
      await promoteJob(jobId, days)
      setIsOpen(false)
      // In a real app, you'd show a success toast here
    } catch (error) {
      console.error("Error promoting job:", error)
      // In a real app, you'd show an error toast here
    } finally {
      setIsPromoting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-600" />
            Promote Your Job
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">Job: {jobTitle}</p>
            <p>
              Boost your job&apos;s visibility and get more qualified applicants by promoting it to the top of search
              results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Standard Promotion */}
            <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-amber-600" />
                  Standard Promotion
                </CardTitle>
                <div className="text-2xl font-bold text-amber-700">R490</div>
                <p className="text-sm text-muted-foreground">30 days promotion</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Top of search results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Premium badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>3x more visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>30-day duration</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePromote(30)}
                  disabled={isPromoting}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isPromoting ? "Processing..." : "Promote for 30 Days"}
                </Button>
              </CardContent>
            </Card>

            {/* Premium Promotion */}
            <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 relative">
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white">
                Most Popular
              </Badge>
              <CardHeader className="pt-6">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Crown className="h-5 w-5 text-purple-600" />
                  Premium Promotion
                </CardTitle>
                <div className="text-2xl font-bold text-purple-700">R890</div>
                <p className="text-sm text-muted-foreground">60 days promotion</p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Top of search results</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Premium badge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>5x more visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>60-day duration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Featured in newsletter</span>
                  </div>
                </div>

                <Button
                  onClick={() => handlePromote(60)}
                  disabled={isPromoting}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isPromoting ? "Processing..." : "Promote for 60 Days"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Separator />

          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Why promote your job?
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
              <div className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-0.5 text-blue-600" />
                <div>
                  <p className="font-medium text-foreground">Higher Visibility</p>
                  <p>Your job appears at the top of all search results</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-medium text-foreground">Premium Badge</p>
                  <p>Stand out with a distinctive promoted job badge</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <TrendingUp className="h-4 w-4 mt-0.5 text-green-600" />
                <div>
                  <p className="font-medium text-foreground">More Applications</p>
                  <p>Get 3-5x more qualified candidates</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            <p>
              * Promotion starts immediately after payment confirmation. You can track your job&apos;s performance in your
              dashboard.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
