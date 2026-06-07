import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const updateWebhookSchema = z.object({
  name: z.string().min(1).optional(),
  url: z.string().url().optional(),
  events: z
    .array(
      z.enum([
        "sla.rule.created",
        "sla.rule.updated",
        "sla.rule.deleted",
        "sla.breach.detected",
        "sla.warning.triggered",
        "sla.escalation.triggered",
        "sla.resolved",
        "sla.acknowledged",
      ]),
    )
    .optional(),
  isActive: z.boolean().optional(),
  secret: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  retryPolicy: z
    .object({
      maxRetries: z.number().min(0).max(10),
      retryDelay: z.number().min(1000),
      backoffMultiplier: z.number().min(1),
    })
    .optional(),
})

// GET /api/sla/webhooks/[id] - Get specific webhook
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simulate database query
    const mockWebhook = {
      id,
      name: "Slack Integration",
      url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      events: ["sla.breach.detected", "sla.escalation.triggered"],
      isActive: true,
      secret: "webhook-secret-123",
      headers: {
        "Content-Type": "application/json",
      },
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2,
      },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      lastTriggered: "2024-01-15T10:25:00Z",
      totalTriggers: 45,
      successfulTriggers: 43,
      failedTriggers: 2,
      recentDeliveries: [
        {
          id: "del-001",
          event: "sla.breach.detected",
          timestamp: "2024-01-15T10:25:00Z",
          status: "success",
          responseCode: 200,
          responseTime: 150,
          retryCount: 0,
        },
        {
          id: "del-002",
          event: "sla.escalation.triggered",
          timestamp: "2024-01-15T09:15:00Z",
          status: "failed",
          responseCode: 500,
          responseTime: 5000,
          retryCount: 3,
          error: "Internal Server Error",
        },
      ],
    }

    return NextResponse.json({
      success: true,
      data: mockWebhook,
    })
  } catch (error) {
    console.error("Error fetching webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch webhook" }, { status: 500 })
  }
}

// PUT /api/sla/webhooks/[id] - Update webhook
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const validatedData = updateWebhookSchema.parse(body)

    // Simulate database update
    const updatedWebhook = {
      id,
      name: "Slack Integration",
      url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      events: ["sla.breach.detected", "sla.escalation.triggered"],
      isActive: true,
      secret: "webhook-secret-123",
      headers: {
        "Content-Type": "application/json",
      },
      retryPolicy: {
        maxRetries: 3,
        retryDelay: 5000,
        backoffMultiplier: 2,
      },
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: new Date().toISOString(),
      lastTriggered: "2024-01-15T10:25:00Z",
      totalTriggers: 45,
      successfulTriggers: 43,
      failedTriggers: 2,
      ...validatedData,
    }

    return NextResponse.json({
      success: true,
      data: updatedWebhook,
      message: "Webhook updated successfully",
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Error updating webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to update webhook" }, { status: 500 })
  }
}

// DELETE /api/sla/webhooks/[id] - Delete webhook
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Simulate database deletion
    return NextResponse.json({
      success: true,
      message: "Webhook deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to delete webhook" }, { status: 500 })
  }
}
