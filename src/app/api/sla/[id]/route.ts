import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateSlaSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  category: z.string().optional(),
  customerTier: z.enum(["basic", "premium", "enterprise"]).optional(),
  businessHours: z
    .object({
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
    })
    .optional(),
  targets: z
    .object({
      firstResponse: z.number().min(1),
      resolution: z.number().min(1),
      escalation: z.number().min(1),
    })
    .optional(),
  escalationRules: z.array(z.any()).optional(),
  notifications: z.array(z.any()).optional(),
})

// GET /api/sla/[id] - Get specific SLA rule
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simulate database query
    const mockSlaRule = {
      id,
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
    }

    return NextResponse.json({
      success: true,
      data: mockSlaRule,
    })
  } catch (error) {
    console.error("Error fetching SLA rule:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch SLA rule" }, { status: 500 })
  }
}

// PUT /api/sla/[id] - Update SLA rule
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateSlaSchema.parse(body)

    // Simulate database update
    const updatedSlaRule = {
      id,
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
      updatedAt: new Date().toISOString(),
      createdBy: "admin",
      ...validatedData,
    }

    // Trigger webhook for SLA rule update
    await triggerWebhook("sla.rule.updated", {
      rule: updatedSlaRule,
      changes: validatedData,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      data: updatedSlaRule,
      message: "SLA rule updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Error updating SLA rule:", error)
    return NextResponse.json({ success: false, error: "Failed to update SLA rule" }, { status: 500 })
  }
}

// DELETE /api/sla/[id] - Delete SLA rule
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simulate database deletion
    // In real implementation, check if SLA rule is in use before deletion

    // Trigger webhook for SLA rule deletion
    await triggerWebhook("sla.rule.deleted", {
      ruleId: id,
      timestamp: new Date().toISOString(),
    })

    return NextResponse.json({
      success: true,
      message: "SLA rule deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting SLA rule:", error)
    return NextResponse.json({ success: false, error: "Failed to delete SLA rule" }, { status: 500 })
  }
}

async function triggerWebhook(event: string, data: any) {
  // Implementation for webhook triggering
  console.log(`Webhook triggered: ${event}`, data)
}
