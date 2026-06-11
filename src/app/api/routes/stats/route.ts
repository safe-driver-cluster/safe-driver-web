import { type NextRequest, NextResponse } from "next/server"
import { routeService } from "@/lib/route-service"

// GET /api/routes/stats - Get route statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await routeService.getRouteStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error in GET /api/routes/stats:", error)
    return NextResponse.json({ error: "Failed to fetch route statistics" }, { status: 500 })
  }
}

