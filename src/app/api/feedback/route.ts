import { type NextRequest, NextResponse } from "next/server"
import { feedbackService } from "@/lib/feedback-service"
import { initializeFirebase } from "@/lib/firebase/config"

export const dynamic = "force-dynamic"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

// GET /api/feedback - Get all feedback with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      status: searchParams.get("status") || undefined,
      type: searchParams.get("type") || undefined,
      category: searchParams.get("category") || undefined,
      priority: searchParams.get("priority") || undefined,
      search: searchParams.get("search") || undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : 100,
    }

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined && key !== "limit") {
        delete filters[key as keyof typeof filters]
      }
    })

    const feedback = await feedbackService.getAllFeedback(filters as any)
    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error("Error in GET /api/feedback:", error)
    const errorMessage = error?.message || "Failed to fetch feedback"

    if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
      return NextResponse.json(
        {
          error: "Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.",
          details: errorMessage,
        },
        { status: 503 },
      )
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

