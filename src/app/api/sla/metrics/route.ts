import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

export const dynamic = "force-dynamic"

const metricsQuerySchema = z.object({
  ticketId: z.string().optional(),
  ruleId: z.string().optional(),
  status: z.enum(["on_track", "at_risk", "breached", "met"]).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
})

// GET /api/sla/metrics - Get SLA metrics
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = metricsQuerySchema.parse(Object.fromEntries(searchParams))

    // Simulate database query
    const mockMetrics = [
      {
        id: "1",
        ticketId: "TKT-001",
        ruleId: "SLA-001",
        status: "on_track",
        firstResponseDue: "2024-01-15T10:15:00Z",
        resolutionDue: "2024-01-15T16:00:00Z",
        firstResponseTime: 12,
        resolutionTime: null,
        escalationLevel: 0,
        breaches: [],
        notifications: [],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:12:00Z",
      },
      {
        id: "2",
        ticketId: "TKT-002",
        ruleId: "SLA-001",
        status: "breached",
        firstResponseDue: "2024-01-14T10:15:00Z",
        resolutionDue: "2024-01-14T16:00:00Z",
        firstResponseTime: 25,
        resolutionTime: 480,
        escalationLevel: 2,
        breaches: [
          {
            id: "BR-001",
            type: "first_response",
            breachedAt: "2024-01-14T10:25:00Z",
            expectedAt: "2024-01-14T10:15:00Z",
            delayMinutes: 10,
            acknowledged: true,
            acknowledgedBy: "manager@company.com",
            acknowledgedAt: "2024-01-14T10:30:00Z",
          },
        ],
        notifications: [
          {
            id: "NOT-001",
            type: "breach",
            sentAt: "2024-01-14T10:25:00Z",
            channel: "email",
            recipient: "manager@company.com",
            acknowledged: true,
          },
        ],
        createdAt: "2024-01-14T10:00:00Z",
        updatedAt: "2024-01-14T18:00:00Z",
      },
    ]

    const page = Number.parseInt(query.page)
    const limit = Number.parseInt(query.limit)
    const offset = (page - 1) * limit

    let filteredMetrics = mockMetrics

    if (query.ticketId) {
      filteredMetrics = filteredMetrics.filter((metric) => metric.ticketId === query.ticketId)
    }

    if (query.ruleId) {
      filteredMetrics = filteredMetrics.filter((metric) => metric.ruleId === query.ruleId)
    }

    if (query.status) {
      filteredMetrics = filteredMetrics.filter((metric) => metric.status === query.status)
    }

    const paginatedMetrics = filteredMetrics.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        metrics: paginatedMetrics,
        pagination: {
          page,
          limit,
          total: filteredMetrics.length,
          totalPages: Math.ceil(filteredMetrics.length / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching SLA metrics:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch SLA metrics" }, { status: 500 })
  }
}
