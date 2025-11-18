import { type NextRequest, NextResponse } from "next/server"
import { routeService } from "@/lib/route-service"
import { z } from "zod"

const routeStopSchema = z.object({
  name: z.string().min(1),
  time: z.string(),
  order: z.number().min(0),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
})

const createRouteSchema = z.object({
  name: z.string().min(1, "Name is required"),
  startPoint: z.string().min(1, "Start point is required"),
  endPoint: z.string().min(1, "End point is required"),
  distance: z.number().min(0, "Distance must be positive"),
  estimatedTime: z.number().min(0, "Estimated time must be positive"),
  stops: z.array(routeStopSchema).min(2, "At least 2 stops are required"),
  vehicles: z.array(z.string()).optional(),
})

// GET /api/routes - Get all routes with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      minDistance: searchParams.get("minDistance") ? parseFloat(searchParams.get("minDistance")!) : undefined,
      maxDistance: searchParams.get("maxDistance") ? parseFloat(searchParams.get("maxDistance")!) : undefined,
    }

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const routes = await routeService.getAllRoutes(filters as any)
    return NextResponse.json(routes)
  } catch (error) {
    console.error("Error in GET /api/routes:", error)
    return NextResponse.json({ error: "Failed to fetch routes" }, { status: 500 })
  }
}

// POST /api/routes - Create a new route
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createRouteSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 },
      )
    }

    const route = await routeService.createRoute(validationResult.data)
    return NextResponse.json(route, { status: 201 })
  } catch (error) {
    console.error("Error in POST /api/routes:", error)
    return NextResponse.json({ error: "Failed to create route" }, { status: 500 })
  }
}

