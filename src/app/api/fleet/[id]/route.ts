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

const updateVehicleSchema = z.object({
  busNumberPlate: z
    .string()
    .regex(/^NB-\d{4}$/, "BUS Number Plate must be in format NB-XXXX (e.g., NB-4565)")
    .transform((val) => val.toUpperCase())
    .optional(),
  busNumber: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.string().max(20, "Bus number must be 20 characters or less").optional()
    ),

  deviceId: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.string().max(50, "Device ID must be 50 characters or less").optional()
    ),
  anyDeskId: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.string().max(50, "AnyDesk ID must be 50 characters or less").optional()
    ),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  driverId: z.string().optional(),
  driverName: z.string().optional(),
  ownerName: z.string().optional(),
  route: z.string().optional(),
  routeId: z.string().optional(),
  locationDepot: z.string().optional(),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string(),
    })
    .optional(),

  mileage: z.number().min(0).optional(),

  speed: z.number().min(0).optional(),

  batteryLevel: z.number().min(0).max(100).optional(),
  alerts: z.number().min(0).optional(),
})

// GET /api/fleet/[id] - Get a single vehicle
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const vehicle = await fleetService.getVehicleById(params.id)

    if (!vehicle) {
      return NextResponse.json({ error: "Vehicle not found" }, { status: 404 })
    }

    return NextResponse.json(vehicle)
  } catch (error: any) {
    console.error("Error in GET /api/fleet/[id]:", error)
    const errorMessage = error?.message || "Failed to fetch vehicle"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// PUT /api/fleet/[id] - Update a vehicle
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = updateVehicleSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.issues },
        { status: 400 },
      )
    }

    const vehicle = await fleetService.updateVehicle(params.id, validationResult.data)

    return NextResponse.json(vehicle)
  } catch (error: any) {
    console.error("Error in PUT /api/fleet/[id]:", error)
    const errorMessage = error?.message || "Failed to update vehicle"

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE /api/fleet/[id] - Delete a vehicle
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await fleetService.deleteVehicle(params.id)

    return NextResponse.json({ message: "Vehicle deleted successfully" })
  } catch (error: any) {
    console.error("Error in DELETE /api/fleet/[id]:", error)
    const errorMessage = error?.message || "Failed to delete vehicle"

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

