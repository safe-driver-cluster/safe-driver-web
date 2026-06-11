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

    const { subscription } = await request.json()

    const payload = {
      title: "SafeDriver Test Notification",
      body: "Push notifications are working correctly! 🎉",
      type: "general",
      icon: "/logo.png",
      badge: "/logo.png",
      tag: "test-notification",
      data: {
        url: "/",
        timestamp: Date.now(),
      },
    }

    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    }

    await webpush.sendNotification(pushSubscription, JSON.stringify(payload))

    return NextResponse.json({
      success: true,
      message: "Test notification sent successfully",
    })
  } catch (error: any) {
    console.error("Failed to send test notification:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to send test notification",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
