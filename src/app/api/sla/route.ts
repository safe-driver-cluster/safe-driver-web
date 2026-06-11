import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const slaQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  status: z.enum(["active", "inactive", "all"]).optional().default("all"),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  customerTier: z.enum(["basic", "premium", "enterprise"]).optional(),
  search: z.string().optional(),
})

const createSlaSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]),
  category: z.string().optional(),
  customerTier: z.enum(["basic", "premium", "enterprise"]).optional(),
  businessHours: z.object({
    enabled: z.boolean(),
    timezone: z.string(),
    schedule: z.record(
      z.string(),
      z.object({
        start: z.string(),
        end: z.string(),
        enabled: z.boolean(),
      }),
    ),
  }),
  targets: z.object({
    firstResponse: z.number().min(1),
    resolution: z.number().min(1),
    escalation: z.number().min(1),
  }),
  escalationRules: z.array(
    z.object({
      level: z.number(),
      triggerAfter: z.number(),
      assignTo: z.array(z.string()),
      notifyContacts: z.array(z.string()),
      actions: z.array(
        z.object({
          type: z.enum(["assign", "notify", "priority_increase", "status_change", "webhook"]),
          parameters: z.record(z.string(), z.any()),
          delay: z.number(),
        }),
      ),
      isActive: z.boolean(),
    }),
  ),
  notifications: z.array(
    z.object({
      trigger: z.enum(["first_response_due", "resolution_due", "escalation", "breach"]),
      recipients: z.array(z.string()),
      channels: z.array(z.enum(["email", "sms", "slack", "webhook"])),
      template: z.string(),
      advanceNotice: z.number(),
      isActive: z.boolean(),
    }),
  ),
})

// GET /api/sla - List all SLA rules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = slaQuerySchema.parse(Object.fromEntries(searchParams))

    // Simulate database query
    const mockSlaRules = [
      {
        id: "1",
        name: "Critical Issues SLA",
        description: "SLA for critical priority tickets",
        isActive: true,
        priority: "critical",
        category: "technical",
        customerTier: "enterprise",
        businessHours: {
          enabled: true,
          timezone: "UTC",
          schedule: {
            monday: { start: "09:00", end: "17:00", enabled: true },
            tuesday: { start: "09:00", end: "17:00", enabled: true },
            wednesday: { start: "09:00", end: "17:00", enabled: true },
            thursday: { start: "09:00", end: "17:00", enabled: true },
            friday: { start: "09:00", end: "17:00", enabled: true },
            saturday: { start: "09:00", end: "17:00", enabled: false },
            sunday: { start: "09:00", end: "17:00", enabled: false },
          },
        },
        targets: {
          firstResponse: 15,
          resolution: 240,
          escalation: 60,
        },
        escalationRules: [],
        notifications: [],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        createdBy: "admin",
      },
    ]

    const page = Number.parseInt(query.page)
    const limit = Number.parseInt(query.limit)
    const offset = (page - 1) * limit

    let filteredRules = mockSlaRules

    if (query.status !== "all") {
      filteredRules = filteredRules.filter((rule) => (query.status === "active" ? rule.isActive : !rule.isActive))
    }

    if (query.priority) {
      filteredRules = filteredRules.filter((rule) => rule.priority === query.priority)
    }

    if (query.customerTier) {
      filteredRules = filteredRules.filter((rule) => rule.customerTier === query.customerTier)
    }

    if (query.search) {
      filteredRules = filteredRules.filter(
        (rule) =>
          rule.name.toLowerCase().includes(query.search!.toLowerCase()) ||
          rule.description?.toLowerCase().includes(query.search!.toLowerCase()),
      )
    }

    const paginatedRules = filteredRules.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        rules: paginatedRules,
        pagination: {
          page,
          limit,
          total: filteredRules.length,
          totalPages: Math.ceil(filteredRules.length / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching SLA rules:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch SLA rules" }, { status: 500 })
  }
}

// POST /api/sla - Create new SLA rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createSlaSchema.parse(body)

    // Simulate database creation
    const newSlaRule = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "api-user",
    }

    // Trigger webhook for SLA rule creation
    await triggerWebhook("sla.rule.created", {
      rule: newSlaRule,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json(
      {
        success: true,
        data: newSlaRule,
        message: "SLA rule created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Error creating SLA rule:", error)
    return NextResponse.json({ success: false, error: "Failed to create SLA rule" }, { status: 500 })
  }
}

async function triggerWebhook(event: string, data: any) {
  // Implementation for webhook triggering
  console.log(`Webhook triggered: ${event}`, data)
}
