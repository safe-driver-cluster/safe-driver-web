import { type NextRequest, NextResponse } from "next/server"
import { fleetService } from "@/lib/fleet-service"
import { initializeFirebase } from "@/lib/firebase/config"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

// PUT /api/fleet/[id]/status - Update vehicle status
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status || !["active", "inactive"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const vehicle = await fleetService.updateVehicleStatus(params.id, status)

    return NextResponse.json(vehicle)
  } catch (error: any) {
    console.error("Error in PUT /api/fleet/[id]/status:", error)
    const errorMessage = error?.message || "Failed to update vehicle status"

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

