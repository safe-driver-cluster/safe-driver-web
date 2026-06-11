import { type NextRequest, NextResponse } from "next/server"
import { fleetService } from "@/lib/fleet-service"
import { initializeFirebase } from "@/lib/firebase/config"
import { z } from "zod"

// Initialize Firebase on server side
try {
  initializeFirebase()
} catch (error) {
  console.error("Firebase initialization error:", error)
}

const createVehicleSchema = z.object({
  busNumberPlate: z
    .string()
    .min(1, "BUS Number Plate is required")
    .regex(/^NB-\d{4}$/, "BUS Number Plate must be in format NB-XXXX (e.g., NB-4565)")
    .transform((val) => val.toUpperCase()),
  busNumber: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.string().max(20, "Bus number must be 20 characters or less").optional()
    ),
  model: z
    .string()
    .min(1, "Vehicle model is required")
    .max(100, "Model name must be 100 characters or less"),
  year: z
    .number({
      required_error: "Year is required",
      invalid_type_error: "Year must be a valid number",
    } as any)
    .int("Year must be a whole number")
    .min(1900, `Year must be between 1900 and ${new Date().getFullYear() + 1}`)
    .max(new Date().getFullYear() + 1, `Year cannot be greater than ${new Date().getFullYear() + 1}`),
  driverId: z.string().optional(),
  driverName: z.string().max(100, "Driver name must be 100 characters or less").optional(),
  route: z.string().max(200, "Route must be 200 characters or less").optional(),
  routeId: z.string().optional(),
  locationDepot: z.string().optional(),
  documentId: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.string().max(50, "Document ID must be 50 characters or less").optional()
    ),
  deviceId: z
    .preprocess(
      (val) => (val === "" || val === null || val === undefined ? undefined : val),
      z.string().max(50, "Device ID must be 50 characters or less").optional()
    ),
  location: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string(),
    })
    .optional(),

  mileage: z.number().min(0, "Mileage cannot be negative").optional(),
  status: z.enum(["active", "inactive"]).optional(),
})

// GET /api/fleet - Get all vehicles with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const filters = {
      status: searchParams.get("status") || undefined,

      search: searchParams.get("search") || undefined,
      driverId: searchParams.get("driverId") || undefined,
    }

    // Remove undefined values
    Object.keys(filters).forEach((key) => {
      if (filters[key as keyof typeof filters] === undefined) {
        delete filters[key as keyof typeof filters]
      }
    })

    const vehicles = await fleetService.getAllVehicles(filters as any)
    return NextResponse.json(vehicles)
  } catch (error: any) {
    console.error("Error in GET /api/fleet:", error)
    const errorMessage = error?.message || "Failed to fetch vehicles"

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

// POST /api/fleet - Create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createVehicleSchema.safeParse(body)
    if (!validationResult.success) {
      // Format validation errors into user-friendly messages
      const errorMessages = validationResult.error.issues.map((err: any) => {
        const field = err.path.join(".")
        return `${field.charAt(0).toUpperCase() + field.slice(1)}: ${err.message}`
      })

      const mainError = errorMessages.length === 1
        ? errorMessages[0]
        : `Please fix the following errors:\n${errorMessages.join("\n")}`

      return NextResponse.json(
        {
          error: "Validation failed",
          message: mainError,
          details: validationResult.error.issues,
          fields: validationResult.error.issues.reduce((acc: any, err: any) => {
            const field = err.path.join(".")
            acc[field] = err.message
            return acc
          }, {} as Record<string, string>)
        },
        { status: 400 },
      )
    }

    // Ensure Firebase is initialized
    try {
      initializeFirebase()
    } catch (initError: any) {
      console.error("Firebase initialization failed:", initError)
      return NextResponse.json(
        {
          error: "Firebase initialization failed",
          details: initError?.message || "Unknown error",
          hint: "Please check your .env.local file and ensure Firebase emulators are running",
        },
        { status: 503 },
      )
    }

    const vehicle = await fleetService.createVehicle(validationResult.data)

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/fleet:", error)
    const errorMessage = error?.message || "Failed to create vehicle"

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

