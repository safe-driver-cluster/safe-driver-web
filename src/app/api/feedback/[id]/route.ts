import { type NextRequest, NextResponse } from "next/server"
import { feedbackService } from "@/lib/feedback-service"
import { initializeFirebase } from "@/lib/firebase/config"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

// PATCH /api/feedback/[id] - Update feedback status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 })
    }

    const feedback = await feedbackService.updateFeedbackStatus(params.id, status)
    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error("Error in PATCH /api/feedback/[id]:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to update feedback" },
      { status: 500 }
    )
  }
}

