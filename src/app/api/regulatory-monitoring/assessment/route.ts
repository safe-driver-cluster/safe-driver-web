import { type NextRequest, NextResponse } from "next/server"
import { regulatoryMonitoringService } from "@/lib/regulatory-monitoring-service"

export async function POST(request: NextRequest) {
  try {
    const { changeId } = await request.json()

    if (!changeId) {
      return NextResponse.json({ error: "changeId is required" }, { status: 400 })
    }

    // Get the change first
    const changes = await regulatoryMonitoringService.getRegulatoryChanges()
    const change = changes.find((c) => c.id === changeId)

    if (!change) {
      return NextResponse.json({ error: "Change not found" }, { status: 404 })
    }

    const assessment = await regulatoryMonitoringService.initiateImpactAssessment(change)
    return NextResponse.json(assessment)
  } catch (error) {
    console.error("Error creating impact assessment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
