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

const serviceHistorySchema = z.object({
  vehicleId: z.string().min(1, "Vehicle ID is required"),
  type: z.string().min(1, "Service type is required"),
  cost: z.number().min(0, "Cost must be positive"),
  description: z.string().optional(),
  date: z.string().optional(),
})

// POST /api/fleet/service-history - Add service history to a vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = serviceHistorySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const vehicle = await fleetService.addServiceHistory(validationResult.data)

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/fleet/service-history:", error)
    const errorMessage = error?.message || "Failed to add service history"

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

