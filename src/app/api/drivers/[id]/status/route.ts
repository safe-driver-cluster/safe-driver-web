import { type NextRequest, NextResponse } from "next/server"
import { driverService } from "@/lib/driver-service"
import { initializeFirebase } from "@/lib/firebase/config"
import { z } from "zod"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

const updateStatusSchema = z.object({
  status: z.enum(["on_duty", "off_duty", "suspended"]),
})

// PUT /api/drivers/[id]/status - Update driver status
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

    const driver = await driverService.updateDriverStatus(params.id, validationResult.data.status)
    return NextResponse.json(driver)
  } catch (error: any) {
    console.error("Error in PUT /api/drivers/[id]/status:", error)
    if (error.message === "Driver not found") {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update driver status" }, { status: 500 })
  }
}

