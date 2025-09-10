import { type NextRequest, NextResponse } from "next/server"
import  prisma  from "@/utils/prisma"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const data = await request.json()

    const consultant = await prisma.consultant.update({
      where: { id: params.id },
      data,
    })

    return NextResponse.json({ consultant })
  } catch (error) {
    console.error("Error updating consultant:", error)
    return NextResponse.json({ error: "Failed to update consultant" }, { status: 500 })
  }
}
