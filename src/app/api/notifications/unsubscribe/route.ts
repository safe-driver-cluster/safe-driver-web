import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { subscription } = await request.json()

    // In a real app, you would remove this from your database
    console.log("Removing push subscription:", subscription.endpoint)

    // Here you would typically:
    // 1. Find the subscription in your database by endpoint
    // 2. Mark it as inactive or delete it
    // 3. Clean up any associated data

    return NextResponse.json({
      success: true,
      message: "Push notification subscription removed successfully",
    })
  } catch (error) {
    console.error("Failed to remove push subscription:", error)
    return NextResponse.json({ success: false, error: "Failed to remove subscription" }, { status: 500 })
  }
}
