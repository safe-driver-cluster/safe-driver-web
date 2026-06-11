import { type NextRequest, NextResponse } from "next/server"
import { driverService } from "@/lib/driver-service"
import { initializeFirebase } from "@/lib/firebase/config"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

// GET /api/drivers/stats - Get driver statistics
export async function GET(request: NextRequest) {
  try {
    // Ensure Firebase is initialized
    try {
      initializeFirebase()
    } catch (initError: any) {
      console.error("Firebase initialization failed:", initError)
      return NextResponse.json(
        { 
          error: "Firebase initialization failed",
          details: initError?.message || "Unknown error",
          hint: "Please check your .env.local file and ensure Firebase emulators are running"
        },
        { status: 503 }
      )
    }

    const stats = await driverService.getDriverStats()
    return NextResponse.json(stats)
  } catch (error: any) {
    console.error("Error in GET /api/drivers/stats:", error)
    const errorMessage = error?.message || "Failed to fetch driver statistics"
    
    // Check if it's a Firebase configuration error
    if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
      return NextResponse.json(
        { 
          error: "Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.",
          details: errorMessage
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

