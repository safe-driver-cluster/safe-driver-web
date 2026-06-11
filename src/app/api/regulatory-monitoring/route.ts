import { type NextRequest, NextResponse } from "next/server"
import { regulatoryMonitoringService } from "@/lib/regulatory-monitoring-service"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get("action")

    switch (action) {
      case "sources":
        const sources = await regulatoryMonitoringService.getRegulatorySources()
        return NextResponse.json(sources)

      case "changes":
        const filters = {
          category: searchParams.get("category") || undefined,
          severity: searchParams.get("severity") || undefined,
          status: searchParams.get("status") || undefined,
          dateFrom: searchParams.get("dateFrom") || undefined,
          dateTo: searchParams.get("dateTo") || undefined,
        }
        const changes = await regulatoryMonitoringService.getRegulatoryChanges(filters)
        return NextResponse.json(changes)

      case "assessments":
        const assessments = await regulatoryMonitoringService.getImpactAssessments()
        return NextResponse.json(assessments)

      case "alerts":
        const alerts = await regulatoryMonitoringService.getMonitoringAlerts()
        return NextResponse.json(alerts)

      case "trends":
        const trends = await regulatoryMonitoringService.getRegulatoryTrends()
        return NextResponse.json(trends)

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in regulatory monitoring API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    switch (action) {
      case "monitor":
        const newChanges = await regulatoryMonitoringService.monitorRegulatorySources()
        return NextResponse.json({ success: true, newChanges })

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in regulatory monitoring POST API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
