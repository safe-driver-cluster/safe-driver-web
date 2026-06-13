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

const updateDriverSchema = z.object({
  name: z.string().min(1).optional(),
  licenseNumber: z.string().min(1).optional(),
  phone: z.string().min(1).optional(),
  email: z.string().email().optional(),
  busNumber: z.string().optional(),
  status: z.enum(["on_duty", "off_duty", "suspended"]).optional(),
  address: z.string().optional(),
  experience: z.string().optional(),
  languages: z.string().optional(),
  alertCount: z.number().min(0).optional(),
  lastAlert: z.string().optional(),
})

// GET /api/drivers/[id] - Get a single driver
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const driver = await driverService.getDriverById(params.id)

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }

    return NextResponse.json(driver)
  } catch (error) {
    console.error("Error in GET /api/drivers/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch driver" }, { status: 500 })
  }
}

// PUT /api/drivers/[id] - Update a driver
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = updateDriverSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const driver = await driverService.updateDriver(params.id, validationResult.data)
    return NextResponse.json(driver)
  } catch (error: any) {
    console.error("Error in PUT /api/drivers/[id]:", error)
    if (error.message === "Driver not found") {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update driver" }, { status: 500 })
  }
}

// DELETE /api/drivers/[id] - Delete a driver
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await driverService.deleteDriver(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/drivers/[id]:", error)
    if (error.message === "Driver not found") {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete driver" }, { status: 500 })
  }
}

