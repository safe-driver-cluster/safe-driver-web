import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const reportQuerySchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
  groupBy: z.enum(["priority", "category", "agent", "customerTier"]).optional(),
  format: z.enum(["json", "csv", "pdf"]).optional().default("json"),
})

// GET /api/sla/reports - Generate SLA reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = reportQuerySchema.parse(Object.fromEntries(searchParams))

    // Simulate report generation
    const mockReport = {
      period: {
        start: query.startDate,
        end: query.endDate,
      },
      overall: {
        totalTickets: 150,
        metSLA: 135,
        breachedSLA: 15,
        averageFirstResponse: 18.5,
        averageResolution: 245.3,
        complianceRate: 90.0,
      },
      byPriority: {
        critical: {
          totalTickets: 25,
          metSLA: 22,
          breachedSLA: 3,
          averageFirstResponse: 12.1,
          averageResolution: 180.5,
          complianceRate: 88.0,
        },
        high: {
          totalTickets: 45,
          metSLA: 41,
          breachedSLA: 4,
          averageFirstResponse: 15.8,
          averageResolution: 220.2,
          complianceRate: 91.1,
        },
        medium: {
          totalTickets: 55,
          metSLA: 52,
          breachedSLA: 3,
          averageFirstResponse: 22.3,
          averageResolution: 280.1,
          complianceRate: 94.5,
        },
        low: {
          totalTickets: 25,
          metSLA: 20,
          breachedSLA: 5,
          averageFirstResponse: 28.7,
          averageResolution: 320.8,
          complianceRate: 80.0,
        },
      },
      byCategory: {
        technical: {
          totalTickets: 80,
          metSLA: 72,
          breachedSLA: 8,
          averageFirstResponse: 16.2,
          averageResolution: 235.4,
          complianceRate: 90.0,
        },
        billing: {
          totalTickets: 35,
          metSLA: 33,
          breachedSLA: 2,
          averageFirstResponse: 20.1,
          averageResolution: 180.3,
          complianceRate: 94.3,
        },
        general: {
          totalTickets: 35,
          metSLA: 30,
          breachedSLA: 5,
          averageFirstResponse: 22.8,
          averageResolution: 290.7,
          complianceRate: 85.7,
        },
      },
      byAgent: {
        "agent-001": {
          totalTickets: 50,
          metSLA: 47,
          breachedSLA: 3,
          averageFirstResponse: 15.2,
          averageResolution: 220.1,
          complianceRate: 94.0,
        },
        "agent-002": {
          totalTickets: 45,
          metSLA: 40,
          breachedSLA: 5,
          averageFirstResponse: 19.8,
          averageResolution: 250.5,
          complianceRate: 88.9,
        },
        "agent-003": {
          totalTickets: 55,
          metSLA: 48,
          breachedSLA: 7,
          averageFirstResponse: 21.3,
          averageResolution: 265.8,
          complianceRate: 87.3,
        },
      },
      trends: [
        {
          date: "2024-01-01",
          complianceRate: 88.5,
          averageResponse: 19.2,
          averageResolution: 250.1,
        },
        {
          date: "2024-01-02",
          complianceRate: 91.2,
          averageResponse: 17.8,
          averageResolution: 240.3,
        },
        {
          date: "2024-01-03",
          complianceRate: 89.7,
          averageResponse: 18.5,
          averageResolution: 245.7,
        },
      ],
      generatedAt: new Date().toISOString(),
    }

    if (query.format === "csv") {
      // Convert to CSV format
      const csvData = convertToCSV(mockReport)
      return new NextResponse(csvData, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": 'attachment; filename="sla-report.csv"',
        },
      })
    }

    if (query.format === "pdf") {
      // Generate PDF (would use a PDF library in real implementation)
      return NextResponse.json({
        success: true,
        data: {
          downloadUrl: "/api/sla/reports/download/pdf/report-123.pdf",
          expiresAt: new Date(Date.now() + 3600000).toISOString(), // 1 hour
        },
      })
    }

    return NextResponse.json({
      success: true,
      data: mockReport,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.errors }, { status: 400 })
    }
    console.error("Error generating SLA report:", error)
    return NextResponse.json({ success: false, error: "Failed to generate SLA report" }, { status: 500 })
  }
}

function convertToCSV(report: any): string {
  // Simple CSV conversion for overall metrics
  const headers = ["Metric", "Value"]
  const rows = [
    ["Total Tickets", report.overall.totalTickets],
    ["Met SLA", report.overall.metSLA],
    ["Breached SLA", report.overall.breachedSLA],
    ["Average First Response (min)", report.overall.averageFirstResponse],
    ["Average Resolution (min)", report.overall.averageResolution],
    ["Compliance Rate (%)", report.overall.complianceRate],
  ]

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

  return csvContent
}
