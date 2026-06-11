import { type NextRequest, NextResponse } from "next/server"
import { regulatoryMonitoringService } from "@/lib/regulatory-monitoring-service"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const changeId = searchParams.get("changeId")

    if (!changeId) {
      return NextResponse.json({ error: "changeId is required" }, { status: 400 })
    }

    const gaps = await regulatoryMonitoringService.identifyComplianceGaps(changeId)
    return NextResponse.json(gaps)
  } catch (error) {
    console.error("Error fetching compliance gaps:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
