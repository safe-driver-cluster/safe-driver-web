import { type NextRequest, NextResponse } from "next/server"
import { fleetService } from "@/lib/fleet-service"
import { initializeFirebase } from "@/lib/firebase/config"
import { z } from "zod"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

const updateMaintenanceSchema = z.object({
  type: z.string().min(1).optional(),
  scheduledDate: z.string().optional(),
  status: z.enum(["scheduled", "in_progress", "completed", "overdue", "cancelled"]).optional(),
  priority: z.enum(["low", "medium", "high"]).optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  description: z.string().optional(),
  completedDate: z.string().optional(),
})

// GET /api/fleet/maintenance/[id] - Get a single maintenance schedule
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const schedule = await fleetService.getMaintenanceScheduleById(params.id)

    if (!schedule) {
      return NextResponse.json({ error: "Maintenance schedule not found" }, { status: 404 })
    }

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error("Error in GET /api/fleet/maintenance/[id]:", error)
    const errorMessage = error?.message || "Failed to fetch maintenance schedule"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PUT /api/fleet/maintenance/[id] - Update a maintenance schedule
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = updateMaintenanceSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const schedule = await fleetService.updateMaintenanceSchedule(params.id, validationResult.data)

    return NextResponse.json(schedule)
  } catch (error: any) {
    console.error("Error in PUT /api/fleet/maintenance/[id]:", error)
    const errorMessage = error?.message || "Failed to update maintenance schedule"

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE /api/fleet/maintenance/[id] - Delete a maintenance schedule
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await fleetService.deleteMaintenanceSchedule(params.id)

    return NextResponse.json({ message: "Maintenance schedule deleted successfully" })
  } catch (error: any) {
    console.error("Error in DELETE /api/fleet/maintenance/[id]:", error)
    const errorMessage = error?.message || "Failed to delete maintenance schedule"

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

