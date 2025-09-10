import { type NextRequest, NextResponse } from "next/server"
import prisma  from "@/utils/prisma"

export async function GET() {
  try {
    const consultants = await prisma.consultant.findMany({
      include: {
        _count: {
          select: {
            consultationOrders: {
              where: {
                consultationStatus: "IN_PROGRESS",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const transformedConsultants = consultants.map((consultant) => ({
      id: consultant.id,
      name: consultant.name,
      email: consultant.email,
      phone: consultant.phone,
      avatar: consultant.avatar,
      title: consultant.title,
      bio: consultant.bio,
      specializations: (consultant.specializations as string[]) || [],
      skills: (consultant.skills as string[]) || [],
      experience: consultant.experience,
      isActive: consultant.isActive,
      maxOrders: consultant.maxOrders,
      hourlyRate: consultant.hourlyRate,
      totalOrders: consultant.totalOrders,
      completedOrders: consultant.completedOrders,
      averageRating: consultant.averageRating,
      availability: consultant.availability,
      currentOrders: consultant._count.consultationOrders,
    }))

    return NextResponse.json({ consultants: transformedConsultants })
  } catch (error) {
    console.error("Error fetching consultants:", error)
    return NextResponse.json({ error: "Failed to fetch consultants" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    const consultant = await prisma.consultant.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        title: data.title,
        bio: data.bio,
        specializations: data.specializations,
        skills: data.skills,
        experience: data.experience,
        maxOrders: data.maxOrders,
        hourlyRate: data.hourlyRate,
        isActive: true,
      },
    })

    return NextResponse.json({ consultant })
  } catch (error) {
    console.error("Error creating consultant:", error)
    return NextResponse.json({ error: "Failed to create consultant" }, { status: 500 })
  }
}
