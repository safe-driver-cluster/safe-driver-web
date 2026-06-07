import { type NextRequest, NextResponse } from "next/server"
import { routeService } from "@/lib/route-service"
import { z } from "zod"

const updateStatusSchema = z.object({
  status: z.enum(["active", "inactive", "maintenance"]),
})

// PUT /api/routes/[id]/status - Update route status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = updateStatusSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const route = await routeService.updateRouteStatus(params.id, validationResult.data.status)
    return NextResponse.json(route)
  } catch (error: any) {
    console.error("Error in PUT /api/routes/[id]/status:", error)
    if (error.message === "Route not found") {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update route status" }, { status: 500 })
  }
}

