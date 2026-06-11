import { type NextRequest, NextResponse } from "next/server"
import { feedbackService } from "@/lib/feedback-service"
import { initializeFirebase } from "@/lib/firebase/config"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

// POST /api/feedback/[id]/response - Add response to feedback
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { response, respondedBy } = body

    if (!response || !respondedBy) {
      return NextResponse.json(
        { error: "Response and respondedBy are required" },
        { status: 400 }
      )
    }

    const feedback = await feedbackService.addResponse(params.id, response, respondedBy)
    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error("Error in POST /api/feedback/[id]/response:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to add response" },
      { status: 500 }
    )
  }
}

