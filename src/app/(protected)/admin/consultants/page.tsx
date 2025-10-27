/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"
export const dynamic = "force-dynamic";

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Search, Star, Clock, TrendingUp, Mail, Phone } from "lucide-react"

interface Consultant {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  title?: string
  bio?: string
  specializations: string[]
  skills: string[]
  experience?: number
  isActive: boolean
  maxOrders: number
  hourlyRate?: number
  totalOrders: number
  completedOrders: number
  averageRating?: number
  availability?: any
  currentOrders: number
}

export default function ConsultantsManagement() {
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [newConsultant, setNewConsultant] = useState({
    name: "",
    email: "",
    phone: "",
    title: "",
    bio: "",
    specializations: "",
    skills: "",
    experience: "",
    maxOrders: "5",
    hourlyRate: "",
  })

  useEffect(() => {
    fetchConsultants()
  }, [])

  const fetchConsultants = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/consultants")
      const data = await response.json()
      setConsultants(data.consultants || [])
    } catch (error) {
      console.error("Failed to fetch consultants:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddConsultant = async () => {
    try {
      const consultantData = {
        ...newConsultant,
        specializations: newConsultant.specializations
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        skills: newConsultant.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        experience: newConsultant.experience ? Number.parseInt(newConsultant.experience) : undefined,
        maxOrders: Number.parseInt(newConsultant.maxOrders),
        hourlyRate: newConsultant.hourlyRate ? Number.parseInt(newConsultant.hourlyRate) * 100 : undefined, // Convert to cents
      }

      const response = await fetch("/api/admin/consultants", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultantData),
      })

      if (response.ok) {
        setShowAddDialog(false)
        setNewConsultant({
          name: "",
          email: "",
          phone: "",
          title: "",
          bio: "",
          specializations: "",
          skills: "",
          experience: "",
          maxOrders: "5",
          hourlyRate: "",
        })
        fetchConsultants()
      }
    } catch (error) {
      console.error("Failed to add consultant:", error)
    }
  }

  const toggleConsultantStatus = async (consultantId: string, isActive: boolean) => {
    try {
      await fetch(`/api/admin/consultants/${consultantId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      })
      fetchConsultants()
    } catch (error) {
      console.error("Failed to update consultant status:", error)
    }
  }

  const filteredConsultants = consultants.filter(
    (consultant) =>
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.specializations.some((spec) => spec.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: "ZAR",
    }).format(amount / 100)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Consultant Management</h1>
          <p className="text-muted-foreground">Manage your LinkedIn optimization consultants</p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-accent hover:bg-accent/90">
              <Plus className="h-4 w-4 mr-2" />
              Add Consultant
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Consultant</DialogTitle>
              <DialogDescription>Add a new consultant to your LinkedIn optimization team</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newConsultant.name}
                  onChange={(e) => setNewConsultant({ ...newConsultant, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newConsultant.email}
                  onChange={(e) => setNewConsultant({ ...newConsultant, email: e.target.value })}
                  placeholder="john@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newConsultant.phone}
                  onChange={(e) => setNewConsultant({ ...newConsultant, phone: e.target.value })}
                  placeholder="+27 123 456 789"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={newConsultant.title}
                  onChange={(e) => setNewConsultant({ ...newConsultant, title: e.target.value })}
                  placeholder="Senior LinkedIn Strategist"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={newConsultant.bio}
                  onChange={(e) => setNewConsultant({ ...newConsultant, bio: e.target.value })}
                  placeholder="Professional background and expertise..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="specializations">Specializations (comma-separated)</Label>
                <Input
                  id="specializations"
                  value={newConsultant.specializations}
                  onChange={(e) => setNewConsultant({ ...newConsultant, specializations: e.target.value })}
                  placeholder="Executive Profiles, Tech Industry, Sales"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skills">Skills (comma-separated)</Label>
                <Input
                  id="skills"
                  value={newConsultant.skills}
                  onChange={(e) => setNewConsultant({ ...newConsultant, skills: e.target.value })}
                  placeholder="LinkedIn SEO, Personal Branding, Content Strategy"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="experience">Years of Experience</Label>
                <Input
                  id="experience"
                  type="number"
                  value={newConsultant.experience}
                  onChange={(e) => setNewConsultant({ ...newConsultant, experience: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOrders">Max Concurrent Orders</Label>
                <Input
                  id="maxOrders"
                  type="number"
                  value={newConsultant.maxOrders}
                  onChange={(e) => setNewConsultant({ ...newConsultant, maxOrders: e.target.value })}
                  placeholder="5"
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="hourlyRate">Hourly Rate (ZAR)</Label>
                <Input
                  id="hourlyRate"
                  type="number"
                  value={newConsultant.hourlyRate}
                  onChange={(e) => setNewConsultant({ ...newConsultant, hourlyRate: e.target.value })}
                  placeholder="500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddConsultant}>Add Consultant</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Consultants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultants.length}</div>
            <p className="text-xs text-muted-foreground">{consultants.filter((c) => c.isActive).length} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{consultants.reduce((sum, c) => sum + c.currentOrders, 0)}</div>
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consultants.length > 0
                ? (consultants.reduce((sum, c) => sum + (c.averageRating || 0), 0) / consultants.length).toFixed(1)
                : "0.0"}
            </div>
            <p className="text-xs text-muted-foreground">Overall performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {consultants.length > 0
                ? Math.round(
                    (consultants.reduce((sum, c) => sum + c.completedOrders, 0) /
                      consultants.reduce((sum, c) => sum + c.totalOrders, 0)) *
                      100,
                  ) || 0
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Success rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search consultants by name, email, or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Consultants Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredConsultants.map((consultant) => (
          <Card key={consultant.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={consultant.avatar || "/placeholder.svg"} />
                  <AvatarFallback>
                    {consultant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{consultant.name}</CardTitle>
                    <Switch
                      checked={consultant.isActive}
                      onCheckedChange={(checked) => toggleConsultantStatus(consultant.id, checked)}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">{consultant.title}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">{consultant.email}</span>
              </div>

              {consultant.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{consultant.phone}</span>
                </div>
              )}

              {consultant.bio && <p className="text-sm text-muted-foreground line-clamp-2">{consultant.bio}</p>}

              <div className="flex flex-wrap gap-1">
                {consultant.specializations.slice(0, 3).map((spec, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {spec}
                  </Badge>
                ))}
                {consultant.specializations.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{consultant.specializations.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Orders</p>
                  <p className="font-medium">
                    {consultant.currentOrders}/{consultant.maxOrders}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Rating</p>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{consultant.averageRating?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>
              </div>

              {consultant.hourlyRate && (
                <div className="text-sm">
                  <p className="text-muted-foreground">Hourly Rate</p>
                  <p className="font-medium">{formatCurrency(consultant.hourlyRate)}</p>
                </div>
              )}

              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  View Profile
                </Button>
                <Button size="sm" variant="outline" className="flex-1 bg-transparent">
                  Edit
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredConsultants.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No consultants found matching your search.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
