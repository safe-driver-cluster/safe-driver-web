import { type NextRequest, NextResponse } from "next/server"
import { driverService } from "@/lib/driver-service"
import { initializeFirebase } from "@/lib/firebase/config"
import { z } from "zod"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

const createDriverSchema = z.object({
  name: z.string().min(1, "Name is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  phone: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  busNumber: z.string().optional(),
  route: z.string().optional(),
  address: z.string().optional(),
  experience: z.string().optional(),
})

// GET /api/drivers - Get all drivers with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
      minSafetyScore: searchParams.get("minSafetyScore")
        ? parseInt(searchParams.get("minSafetyScore")!)
        : undefined,
      maxSafetyScore: searchParams.get("maxSafetyScore")
        ? parseInt(searchParams.get("maxSafetyScore")!)
        : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit")!)
        : 100, // Default limit for performance
    }

    // Remove undefined values (but keep limit even if it's the default)
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined && key !== "limit") {
        delete filters[key as keyof typeof filters]
      }
    })

    const drivers = await driverService.getAllDrivers(filters as any)
    return NextResponse.json(drivers)
  } catch (error: any) {
    console.error("Error in GET /api/drivers:", error)
    const errorMessage = error?.message || "Failed to fetch drivers"
    
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

// POST /api/drivers - Create a new driver
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createDriverSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validationResult.error.errors },
        { status: 400 },
      )
    }

    // Ensure Firebase is initialized before creating driver
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

    // Add timeout to prevent hanging (increased to 15 seconds for emulator connection)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Request timeout: Firebase operation took too long. Please ensure Firebase emulators are running and accessible at http://localhost:8082")), 15000)
    })

    const driverPromise = driverService.createDriver(validationResult.data)
    const driver = await Promise.race([driverPromise, timeoutPromise]) as any

    return NextResponse.json(driver, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/drivers:", error)
    const errorMessage = error?.message || "Failed to create driver"
    
    // Check if it's a timeout error
    if (errorMessage.includes("timeout") || errorMessage.includes("took too long")) {
      return NextResponse.json(
        { 
          error: errorMessage,
          hint: "Make sure Firebase emulators are running: npm run firebase:emulators"
        },
        { status: 504 }
      )
    }
    
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
    
    // Check for connection errors
    if (errorMessage.includes("ECONNREFUSED") || errorMessage.includes("connection") || errorMessage.includes("unavailable")) {
      return NextResponse.json(
        { 
          error: "Cannot connect to Firebase. Please ensure Firebase emulators are running: npm run firebase:emulators",
          details: errorMessage
        },
        { status: 503 }
      )
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

