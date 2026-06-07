import { type NextRequest, NextResponse } from "next/server"

// POST /api/sla/webhooks/[id]/test - Test webhook endpoint
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    // Get webhook details (simulate database query)
    const webhook = {
      id,
      name: "Slack Integration",
      url: "https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX",
      headers: {
        "Content-Type": "application/json",
      },
      secret: "webhook-secret-123",
    }

    // Create test payload
    const testPayload = {
      event: "webhook.test",
      timestamp: new Date().toISOString(),
      data: {
        message: "This is a test webhook from SafeDriver SLA system",
        webhookId: id,
        webhookName: webhook.name,
      },
    }

    // Add signature if secret is provided
    const headers: Record<string, string> = { ...webhook.headers }
    if (webhook.secret) {
      const signature = await generateSignature(JSON.stringify(testPayload), webhook.secret)
      headers["X-SafeDriver-Signature"] = signature
    }

    // Send test webhook
    const startTime = Date.now()
    const response = await fetch(webhook.url, {
      method: "POST",
      headers,
      body: JSON.stringify(testPayload),
    })
    const endTime = Date.now()

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      responseTime: endTime - startTime,
      timestamp: new Date().toISOString(),
      payload: testPayload,
    }

    // Log the test result (in real implementation, save to database)
    console.log(`Webhook test result for ${id}:`, result)

    return NextResponse.json({
      success: true,
      data: result,
      message: response.ok ? "Webhook test successful" : "Webhook test failed",
    })
  } catch (error) {
    console.error("Error testing webhook:", error)
    return NextResponse.json(
      {
        success: false,
        data: {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          timestamp: new Date().toISOString(),
        },
        message: "Webhook test failed",
      },
      { status: 500 },
    )
  }
}

async function generateSignature(payload: string, secret: string): Promise<string> {
  // In a real implementation, use crypto to generate HMAC signature
  // This is a simplified version
  const encoder = new TextEncoder()
  const data = encoder.encode(payload + secret)
  const hashBuffer = await crypto.subtle.digest("SHA-256", data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
  return `sha256=${hashHex}`
}
