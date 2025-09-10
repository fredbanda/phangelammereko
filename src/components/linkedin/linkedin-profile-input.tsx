"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LinkedinPdfUpload } from "./linkedin-pdf-upload"
import { LinkedinManualInput } from "./linkedin-manual-input"
import { Upload, Edit3 } from "lucide-react"

export function LinkedinProfileInput() {
  const [activeTab, setActiveTab] = useState("upload")

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6">
        <TabsTrigger value="upload" className="flex items-center gap-2">
          <Upload className="w-4 h-4" />
          PDF Upload
        </TabsTrigger>
        <TabsTrigger value="manual" className="flex items-center gap-2">
          <Edit3 className="w-4 h-4" />
          Manual Input
        </TabsTrigger>
      </TabsList>

      <TabsContent value="upload" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-primary" />
              Upload LinkedIn Profile PDF
            </CardTitle>
            <CardDescription>
              Download your LinkedIn profile as a PDF (LinkedIn → More → Save to PDF) and upload it here for quick
              analysis.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkedinPdfUpload />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manual" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-accent" />
              Enter Profile Information
            </CardTitle>
            <CardDescription>
              Manually enter your LinkedIn profile information for detailed analysis and optimization suggestions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LinkedinManualInput />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
