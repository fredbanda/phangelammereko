import { type NextRequest, NextResponse } from "next/server"

// Mock consultant data
const mockConsultants = [
  {
    id: "consultant_1",
    name: "Michael Brown",
    email: "michael@consultants.com",
    avatar: "/placeholder.svg",
    title: "Senior LinkedIn Strategist",
    bio: "Specialized in executive profile optimization with 5+ years experience",
    specializations: ["Executive Profiles", "Tech Industry", "Leadership Branding"],
    skills: ["LinkedIn Optimization", "Personal Branding", "Content Strategy"],
    experience: 5,
    isActive: true,
    currentWorkload: 3,
    maxOrders: 5,
    hourlyRate: 150,
    totalOrders: 45,
    completedOrders: 42,
    averageRating: 4.8,
    availability: { timezone: "UTC+2", workingHours: "09:00-17:00" },
  },
  {
    id: "consultant_2",
    name: "Lisa Chen",
    email: "lisa@consultants.com",
    avatar: "/placeholder.svg",
    title: "LinkedIn Profile Expert",
    bio: "Helping professionals stand out with compelling LinkedIn profiles",
    specializations: ["Profile Writing", "Career Transitions", "Industry Pivots"],
    skills: ["Content Writing", "SEO Optimization", "Career Coaching"],
    experience: 3,
    isActive: true,
    currentWorkload: 2,
    maxOrders: 4,
    hourlyRate: 120,
    totalOrders: 28,
    completedOrders: 26,
    averageRating: 4.9,
    availability: { timezone: "UTC+2", workingHours: "08:00-16:00" },
  },
  {
    id: "consultant_3",
    name: "James Wilson",
    email: "james@consultants.com",
    avatar: "/placeholder.svg",
    title: "Digital Marketing Consultant",
    bio: "LinkedIn optimization specialist for marketing professionals",
    specializations: ["Marketing Profiles", "B2B Networking", "Lead Generation"],
    skills: ["Digital Marketing", "LinkedIn Ads", "Social Selling"],
    experience: 4,
    isActive: true,
    currentWorkload: 5,
    maxOrders: 5,
    hourlyRate: 140,
    totalOrders: 35,
    completedOrders: 33,
    averageRating: 4.7,
    availability: { timezone: "UTC+2", workingHours: "10:00-18:00" },
  },
]

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    // In a real app, you would:
    // 1. Verify admin authentication
    // 2. Query the database for consultants
    // 3. Include current workload and performance metrics

    return NextResponse.json({
      success: true,
      consultants: mockConsultants,
    })
  } catch (error) {
    console.error("Failed to fetch consultants:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch consultants" }, { status: 500 })
  }
}
