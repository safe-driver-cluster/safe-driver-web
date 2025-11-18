import { type NextRequest, NextResponse } from "next/server"
import { routeService } from "@/lib/route-service"
import { z } from "zod"

const routeStopSchema = z.object({
  name: z.string().min(1),
  time: z.string(),
  status: z.enum(["completed", "current", "upcoming"]),
  order: z.number().min(0),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

const updateRouteSchema = z.object({
  name: z.string().min(1).optional(),
  startPoint: z.string().min(1).optional(),
  endPoint: z.string().min(1).optional(),
  distance: z.number().min(0).optional(),
  estimatedTime: z.number().min(0).optional(),
  status: z.enum(["active", "inactive", "maintenance"]).optional(),
  activeVehicles: z.number().min(0).optional(),
  totalStops: z.number().min(0).optional(),
  onTimePerformance: z.number().min(0).max(100).optional(),
  averageSpeed: z.number().min(0).optional(),
  passengerLoad: z.number().min(0).max(100).optional(),
  safetyIncidents: z.number().min(0).optional(),
  vehicles: z.array(z.string()).optional(),
  stops: z.array(routeStopSchema).optional(),
})

// GET /api/routes/[id] - Get a single route
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const route = await routeService.getRouteById(params.id)

    if (!route) {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }

    return NextResponse.json(route)
  } catch (error) {
    console.error("Error in GET /api/routes/[id]:", error)
    return NextResponse.json({ error: "Failed to fetch route" }, { status: 500 })
  }
}

// PUT /api/routes/[id] - Update a route
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = updateRouteSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const route = await routeService.updateRoute(params.id, validationResult.data)
    return NextResponse.json(route)
  } catch (error: any) {
    console.error("Error in PUT /api/routes/[id]:", error)
    if (error.message === "Route not found") {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to update route" }, { status: 500 })
  }
}

// DELETE /api/routes/[id] - Delete a route
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await routeService.deleteRoute(params.id)
    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error in DELETE /api/routes/[id]:", error)
    if (error.message === "Route not found") {
      return NextResponse.json({ error: "Route not found" }, { status: 404 })
    }
    return NextResponse.json({ error: "Failed to delete route" }, { status: 500 })
  }
}

