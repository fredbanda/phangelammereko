"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export function JobFilters() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search */}
        <div className="space-y-2">
          <Label htmlFor="search">Search</Label>
          <Input id="search" placeholder="Job title, company..." />
        </div>

        <Separator />

        {/* Job Type */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Job Type</Label>
          <div className="space-y-2">
            {["Full-time", "Part-time", "Contract", "Remote"].map((type) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox id={type.toLowerCase()} />
                <Label htmlFor={type.toLowerCase()} className="text-sm font-normal">
                  {type}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Salary Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Salary Range</Label>
          <div className="space-y-2">
            {["Under $50k", "$50k - $75k", "$75k - $100k", "$100k - $150k", "Over $150k"].map((range) => (
              <div key={range} className="flex items-center space-x-2">
                <Checkbox id={range} />
                <Label htmlFor={range} className="text-sm font-normal">
                  {range}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <Button variant="outline" className="w-full bg-transparent">
          Clear Filters
        </Button>
      </CardContent>
    </Card>
  )
}
