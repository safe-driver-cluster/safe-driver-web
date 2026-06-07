import { type NextRequest, NextResponse } from "next/server"
import { z } from "zod"

const webhookSchema = z.object({
  name: z.string().min(1, "Name is required"),
  url: z.string().url("Valid URL is required"),
  events: z.array(
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
  ),
  isActive: z.boolean().default(true),
  secret: z.string().optional(),
  headers: z.record(z.string(), z.string()).optional(),
  retryPolicy: z
    .object({
      maxRetries: z.number().min(0).max(10).default(3),
      retryDelay: z.number().min(1000).default(5000), // milliseconds
      backoffMultiplier: z.number().min(1).default(2),
    })
    .optional(),
})

const webhookQuerySchema = z.object({
  page: z.string().optional().default("1"),
  limit: z.string().optional().default("10"),
  isActive: z.boolean().optional(),
})

// GET /api/sla/webhooks - List all webhooks
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = webhookQuerySchema.parse(Object.fromEntries(searchParams))

    // Simulate database query
    const mockWebhooks = [
      {
        id: "1",
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
      },
      {
        id: "2",
        name: "External Monitoring System",
        url: "https://monitoring.example.com/webhooks/sla",
        events: ["sla.breach.detected", "sla.warning.triggered", "sla.resolved"],
        isActive: true,
        secret: "webhook-secret-456",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer token-123",
        },
        retryPolicy: {
          maxRetries: 5,
          retryDelay: 3000,
          backoffMultiplier: 1.5,
        },
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z",
        lastTriggered: "2024-01-15T09:15:00Z",
        totalTriggers: 128,
        successfulTriggers: 125,
        failedTriggers: 3,
      },
    ]

    const page = Number.parseInt(query.page)
    const limit = Number.parseInt(query.limit)
    const offset = (page - 1) * limit

    let filteredWebhooks = mockWebhooks

    if (query.isActive !== undefined) {
      filteredWebhooks = filteredWebhooks.filter((webhook) => webhook.isActive === query.isActive)
    }

    const paginatedWebhooks = filteredWebhooks.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: {
        webhooks: paginatedWebhooks,
        pagination: {
          page,
          limit,
          total: filteredWebhooks.length,
          totalPages: Math.ceil(filteredWebhooks.length / limit),
        },
      },
    })
  } catch (error) {
    console.error("Error fetching webhooks:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch webhooks" }, { status: 500 })
  }
}

// POST /api/sla/webhooks - Create new webhook
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = webhookSchema.parse(body)

    // Simulate database creation
    const newWebhook = {
      id: Math.random().toString(36).substr(2, 9),
      ...validatedData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastTriggered: null,
      totalTriggers: 0,
      successfulTriggers: 0,
      failedTriggers: 0,
    }

    // Test webhook endpoint
    const testResult = await testWebhookEndpoint(newWebhook.url, newWebhook.headers)

    return NextResponse.json(
      {
        success: true,
        data: newWebhook,
        testResult,
        message: "Webhook created successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: "Validation error", details: error.issues }, { status: 400 })
    }
    console.error("Error creating webhook:", error)
    return NextResponse.json({ success: false, error: "Failed to create webhook" }, { status: 500 })
  }
}

async function testWebhookEndpoint(url: string, headers?: Record<string, string>) {
  try {
    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: { message: "This is a test webhook" },
    }

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(testPayload),
    })

    return {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
