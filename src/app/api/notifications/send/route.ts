import { type NextRequest, NextResponse } from "next/server"
import webpush from "web-push"

// Configure web-push with your VAPID keys (only if valid keys are provided)
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY
const vapidEmail = process.env.VAPID_EMAIL || "mailto:your-email@example.com"

// Only set VAPID details if valid keys are provided (not placeholder values)
if (vapidPublicKey && vapidPrivateKey && 
    vapidPublicKey !== "your-vapid-public-key" && 
    vapidPrivateKey !== "your-vapid-private-key") {
  try {
    webpush.setVapidDetails(vapidEmail, vapidPublicKey, vapidPrivateKey)
  } catch (error) {
    console.warn("Failed to set VAPID details:", error)
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check if VAPID keys are configured
    if (!vapidPublicKey || !vapidPrivateKey || 
        vapidPublicKey === "your-vapid-public-key" || 
        vapidPrivateKey === "your-vapid-private-key") {
      return NextResponse.json(
        { 
          success: false, 
          error: "VAPID keys are not configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables." 
        }, 
        { status: 500 }
      )
    }

    const { subscriptions, payload, options = {} } = await request.json()

    if (!subscriptions || !Array.isArray(subscriptions)) {
      return NextResponse.json({ success: false, error: "Invalid subscriptions array" }, { status: 400 })
    }

    const results = []

    for (const subscription of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: subscription.endpoint,
          keys: subscription.keys,
        }

        const result = await webpush.sendNotification(pushSubscription, JSON.stringify(payload), {
          TTL: options.ttl || 86400, // 24 hours
          urgency: options.urgency || "normal",
          topic: options.topic,
        })

        results.push({
          endpoint: subscription.endpoint,
          success: true,
          statusCode: result.statusCode,
        })
      } catch (error: any) {
        console.error("Failed to send notification to:", subscription.endpoint, error)
        results.push({
          endpoint: subscription.endpoint,
          success: false,
          error: error.message,
          statusCode: error.statusCode,
        })

        // If subscription is invalid (410 Gone), you should remove it from database
        if (error.statusCode === 410) {
          console.log("Subscription expired, should remove from database:", subscription.endpoint)
        }
      }
    }

    const successCount = results.filter((r) => r.success).length
    const failureCount = results.length - successCount

    return NextResponse.json({
      success: true,
      results,
      summary: {
        total: results.length,
        successful: successCount,
        failed: failureCount,
      },
    })
  } catch (error) {
    console.error("Failed to send push notifications:", error)
    return NextResponse.json({ success: false, error: "Failed to send notifications" }, { status: 500 })
  }
}
