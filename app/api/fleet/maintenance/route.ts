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

const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, "Please select a vehicle"),
  type: z
    .string()
    .min(1, "Maintenance type is required")
    .max(100, "Maintenance type must be 100 characters or less"),
  scheduledDate: z
    .string()
    .min(1, "Scheduled date is required")
    .refine(
      (date) => {
        const selectedDate = new Date(date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return selectedDate >= today
      },
      { message: "Scheduled date cannot be in the past" }
    ),
  priority: z.enum(["low", "medium", "high"], {
    errorMap: () => ({ message: "Priority must be low, medium, or high" }),
  }),
  estimatedCost: z
    .number({
      required_error: "Estimated cost is required",
      invalid_type_error: "Estimated cost must be a valid number",
    })
    .min(0, "Estimated cost cannot be negative")
    .max(10000000, "Estimated cost is too large"),
  description: z.string().max(500, "Description must be 500 characters or less").optional(),
})

// GET /api/fleet/maintenance - Get all maintenance schedules
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get("vehicleId") || undefined

    const schedules = await fleetService.getAllMaintenanceSchedules(vehicleId)
    return NextResponse.json(schedules)
  } catch (error: any) {
    console.error("Error in GET /api/fleet/maintenance:", error)
    const errorMessage = error?.message || "Failed to fetch maintenance schedules"

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// POST /api/fleet/maintenance - Create a new maintenance schedule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validationResult = createMaintenanceSchema.safeParse(body)
    if (!validationResult.success) {
      // Format validation errors into user-friendly messages
      const errorMessages = validationResult.error.errors.map((err) => {
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
          details: validationResult.error.errors,
          fields: validationResult.error.errors.reduce((acc, err) => {
            const field = err.path.join(".")
            acc[field] = err.message
            return acc
          }, {} as Record<string, string>)
        },
        { status: 400 },
      )
    }

    const schedule = await fleetService.createMaintenanceSchedule(validationResult.data)

    return NextResponse.json(schedule, { status: 201 })
  } catch (error: any) {
    console.error("Error in POST /api/fleet/maintenance:", error)
    const errorMessage = error?.message || "Failed to create maintenance schedule"

    if (errorMessage.includes("not found")) {
      return NextResponse.json({ error: errorMessage }, { status: 404 })
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

