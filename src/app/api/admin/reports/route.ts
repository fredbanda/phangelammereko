/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server"
import prisma from "@/utils/prisma"

export async function GET(request: Request, profile: unknown) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""
    const scoreFilter = searchParams.get("scoreFilter") || "all"
    const sortBy = searchParams.get("sortBy") || "newest"

    const whereClause: any = {}

    // Search filter
    if (search) {
      whereClause.OR = [
        {
          profile: {
            fullName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          profile: {
            headline: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ]
    }

    // Score filter
    if (scoreFilter !== "all") {
      switch (scoreFilter) {
        case "excellent":
          whereClause.overallScore = { gte: 80 }
          break
        case "good":
          whereClause.overallScore = { gte: 60, lt: 80 }
          break
        case "needs-work":
          whereClause.overallScore = { lt: 60 }
          break
      }
    }

    // Sort order
    let orderBy: any = { createdAt: "desc" }
    switch (sortBy) {
      case "oldest":
        orderBy = { createdAt: "asc" }
        break
      case "highest-score":
        orderBy = { overallScore: "desc" }
        break
      case "lowest-score":
        orderBy = { overallScore: "asc" }
        break
    }

    const reports = await prisma.optimizationReport.findMany({
      where: whereClause,
      orderBy,
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
          
        }
      }
    })

    return NextResponse.json(reports)
  } catch (error) {
    console.error("Reports fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 })
  }
}
