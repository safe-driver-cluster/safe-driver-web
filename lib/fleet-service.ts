import { firestoreService } from "./firebase/firestore"
import type {
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
  VehicleFilters,
  MaintenanceSchedule,
  CreateMaintenanceScheduleInput,
  UpdateMaintenanceScheduleInput,
  ServiceHistoryInput,
} from "./fleet-types"

const VEHICLES_COLLECTION = "vehicles"
const MAINTENANCE_COLLECTION = "maintenance_schedules"

// Check if a vehicle with the given busNumberPlate already exists
const checkBusNumberPlateExists = async (busNumberPlate: string): Promise<boolean> => {
  try {
    const vehicle = await firestoreService.getDocument<Vehicle>(VEHICLES_COLLECTION, busNumberPlate)
    return vehicle !== null
  } catch (error) {
    // If document doesn't exist, return false
    return false
  }
}

// Generate maintenance schedule ID
const generateMaintenanceId = async (): Promise<string> => {
  try {
    const schedules = await firestoreService.getCollection<MaintenanceSchedule>(MAINTENANCE_COLLECTION)
    const maxId = schedules.reduce((max, schedule) => {
      const num = parseInt(schedule.id.replace("MS", ""))
      return num > max ? num : max
    }, 0)
    return `MS${String(maxId + 1).padStart(3, "0")}`
  } catch (error) {
    console.warn("Could not fetch existing maintenance schedules to generate ID, starting from MS001:", error)
    return "MS001"
  }
}

export const fleetService = {
  // Get all vehicles with optional filters
  getAllVehicles: async (filters?: VehicleFilters): Promise<Vehicle[]> => {
    try {
      const constraints: any[] = []

      // Apply status filter server-side
      if (filters?.status && filters.status !== "all") {
        constraints.push(firestoreService.where("status", "==", filters.status))
      }

      // Apply maintenance status filter server-side
      if (filters?.maintenanceStatus && filters.maintenanceStatus !== "all") {
        constraints.push(firestoreService.where("maintenanceStatus", "==", filters.maintenanceStatus))
      }

      // Apply driver filter server-side
      if (filters?.driverId) {
        constraints.push(firestoreService.where("driverId", "==", filters.driverId))
      }

      // Always order by createdAt
      constraints.push(firestoreService.orderByField("createdAt", "desc"))

      // Fetch with server-side filters
      let vehicles = await firestoreService.getCollection<Vehicle>(VEHICLES_COLLECTION, constraints)

      // Apply client-side filters that can't be done server-side (text search)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        vehicles = vehicles.filter(
          (vehicle) =>
            vehicle.busNumberPlate?.toLowerCase().includes(searchLower) ||
            vehicle.busNumber?.toLowerCase().includes(searchLower) ||
            vehicle.documentId?.toLowerCase().includes(searchLower) ||
            vehicle.deviceId?.toLowerCase().includes(searchLower) ||
            vehicle.model.toLowerCase().includes(searchLower) ||
            vehicle.driverName?.toLowerCase().includes(searchLower) ||
            vehicle.route?.toLowerCase().includes(searchLower),
        )
      }

      return vehicles
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
        throw new Error("Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.")
      }

      throw new Error(`Failed to fetch vehicles: ${errorMessage}`)
    }
  },

  // Get a single vehicle by ID
  getVehicleById: async (id: string): Promise<Vehicle | null> => {
    try {
      return await firestoreService.getDocument<Vehicle>(VEHICLES_COLLECTION, id)
    } catch (error) {
      console.error("Error fetching vehicle:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
        throw new Error("Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.")
      }

      throw new Error(`Failed to fetch vehicle: ${errorMessage}`)
    }
  },

  // Create a new vehicle
  createVehicle: async (input: CreateVehicleInput): Promise<Vehicle> => {
    try {
      // Use busNumberPlate as the document ID
      if (!input.busNumberPlate) {
        throw new Error("BUS Number Plate is required")
      }

      // Normalize busNumberPlate to uppercase
      const busNumberPlate = input.busNumberPlate.toUpperCase()

      // Check if a vehicle with this busNumberPlate already exists
      const exists = await checkBusNumberPlateExists(busNumberPlate)
      if (exists) {
        throw new Error(`A vehicle with BUS Number Plate "${busNumberPlate}" already exists`)
      }

      // Use busNumberPlate as the document ID
      const id = busNumberPlate
      const now = new Date().toISOString()
      const nextServiceDate = new Date()
      nextServiceDate.setDate(nextServiceDate.getDate() + 60) // 60 days from now

      const vehicle: Vehicle = {
        id,
        busNumberPlate: busNumberPlate,
        busNumber: input.busNumber,
        documentId: input.documentId,
        deviceId: input.deviceId,
        model: input.model,
        year: input.year,
        status: input.status || "inactive",
        location: input.location || {
          lat: 6.9271,
          lng: 79.8612,
          address: "Colombo Depot",
        },
        driverId: input.driverId,
        driverName: input.driverName,
        route: input.route || "",
        fuel: input.fuel ?? 100,
        mileage: input.mileage ?? 0,
        lastService: now.split("T")[0],
        nextService: nextServiceDate.toISOString().split("T")[0],
        maintenanceStatus: "excellent",
        speed: 0,
        engineTemp: 75,
        batteryLevel: 100,
        safetyScore: 100,
        alerts: 0,
        serviceHistory: [],
        createdAt: now,
        updatedAt: now,
      }

      const { id: _, ...vehicleData } = vehicle
      // busNumberPlate is already included in vehicleData from the vehicle object above

      await firestoreService.setDocument(VEHICLES_COLLECTION, id, vehicleData)

      return vehicle
    } catch (error) {
      console.error("Error creating vehicle:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
        throw new Error("Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.")
      }

      throw new Error(`Failed to create vehicle: ${errorMessage}`)
    }
  },

  // Update a vehicle
  updateVehicle: async (id: string, input: UpdateVehicleInput): Promise<Vehicle> => {
    try {
      const existingVehicle = await fleetService.getVehicleById(id)
      if (!existingVehicle) {
        throw new Error("Vehicle not found")
      }

      // If busNumberPlate is being changed, check if the new one already exists
      if (input.busNumberPlate && input.busNumberPlate.toUpperCase() !== id.toUpperCase()) {
        const newBusNumberPlate = input.busNumberPlate.toUpperCase()
        const exists = await checkBusNumberPlateExists(newBusNumberPlate)
        if (exists) {
          throw new Error(`A vehicle with BUS Number Plate "${newBusNumberPlate}" already exists`)
        }

        // If busNumberPlate is changing, we need to create a new document and delete the old one
        // First, create the new vehicle with updated data
        const { busNumberPlate: newId, ...updateData } = input
        const newVehicleData: Partial<Vehicle> = {
          ...existingVehicle,
          ...updateData,
          busNumberPlate: newBusNumberPlate,
          id: newBusNumberPlate,
          updatedAt: new Date().toISOString(),
        }

        // Create new document with new ID
        await firestoreService.setDocument(VEHICLES_COLLECTION, newBusNumberPlate, newVehicleData)

        // Update all maintenance schedules that reference the old vehicle ID
        try {
          const maintenanceSchedules = await fleetService.getAllMaintenanceSchedules(id)
          for (const schedule of maintenanceSchedules) {
            await firestoreService.updateDocument(MAINTENANCE_COLLECTION, schedule.id, {
              vehicleId: newBusNumberPlate,
            })
          }
        } catch (error) {
          console.warn("Failed to update maintenance schedules for vehicle ID change:", error)
          // Continue even if maintenance schedule update fails
        }

        // Delete old document
        await firestoreService.deleteDocument(VEHICLES_COLLECTION, id)

        return newVehicleData as Vehicle
      }

      // Normal update - busNumberPlate is not changing
      const { busNumberPlate: _, ...updateData } = input // Remove busNumberPlate from update if present
      const updatedVehicle: Partial<Vehicle> = {
        ...updateData,
        updatedAt: new Date().toISOString(),
      }

      await firestoreService.updateDocument(VEHICLES_COLLECTION, id, updatedVehicle)

      return {
        ...existingVehicle,
        ...updatedVehicle,
      } as Vehicle
    } catch (error) {
      console.error("Error updating vehicle:", error)
      throw new Error("Failed to update vehicle")
    }
  },

  // Delete a vehicle
  deleteVehicle: async (id: string): Promise<void> => {
    try {
      const vehicle = await fleetService.getVehicleById(id)
      if (!vehicle) {
        throw new Error("Vehicle not found")
      }

      await firestoreService.deleteDocument(VEHICLES_COLLECTION, id)
    } catch (error) {
      console.error("Error deleting vehicle:", error)
      throw new Error("Failed to delete vehicle")
    }
  },

  // Update vehicle status
  updateVehicleStatus: async (id: string, status: VehicleStatus): Promise<Vehicle> => {
    return fleetService.updateVehicle(id, { status })
  },

  // Add service history to vehicle
  addServiceHistory: async (input: ServiceHistoryInput): Promise<Vehicle> => {
    try {
      const vehicle = await fleetService.getVehicleById(input.vehicleId)
      if (!vehicle) {
        throw new Error("Vehicle not found")
      }

      const serviceDate = input.date || new Date().toISOString().split("T")[0]
      const serviceHistoryItem = {
        date: serviceDate,
        type: input.type,
        cost: input.cost,
        description: input.description,
      }

      const updatedServiceHistory = [serviceHistoryItem, ...vehicle.serviceHistory]

      // Update last service date
      const nextServiceDate = new Date(serviceDate)
      nextServiceDate.setDate(nextServiceDate.getDate() + 60) // 60 days from last service

      return fleetService.updateVehicle(input.vehicleId, {
        serviceHistory: updatedServiceHistory,
        lastService: serviceDate,
        nextService: nextServiceDate.toISOString().split("T")[0],
      })
    } catch (error) {
      console.error("Error adding service history:", error)
      throw new Error("Failed to add service history")
    }
  },

  // Maintenance Schedule Operations
  getAllMaintenanceSchedules: async (vehicleId?: string): Promise<MaintenanceSchedule[]> => {
    try {
      const constraints: any[] = []

      if (vehicleId) {
        constraints.push(firestoreService.where("vehicleId", "==", vehicleId))
      }

      constraints.push(firestoreService.orderByField("scheduledDate", "asc"))

      return await firestoreService.getCollection<MaintenanceSchedule>(MAINTENANCE_COLLECTION, constraints)
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error)
      throw new Error("Failed to fetch maintenance schedules")
    }
  },

  getMaintenanceScheduleById: async (id: string): Promise<MaintenanceSchedule | null> => {
    try {
      return await firestoreService.getDocument<MaintenanceSchedule>(MAINTENANCE_COLLECTION, id)
    } catch (error) {
      console.error("Error fetching maintenance schedule:", error)
      throw new Error("Failed to fetch maintenance schedule")
    }
  },

  createMaintenanceSchedule: async (input: CreateMaintenanceScheduleInput): Promise<MaintenanceSchedule> => {
    try {
      const vehicle = await fleetService.getVehicleById(input.vehicleId)
      if (!vehicle) {
        throw new Error("Vehicle not found")
      }

      const id = await generateMaintenanceId()
      const now = new Date().toISOString()

      const schedule: MaintenanceSchedule = {
        id,
        vehicleId: input.vehicleId,
        busNumber: vehicle.busNumberPlate || vehicle.busNumber || vehicle.documentId || vehicle.id,
        type: input.type,
        scheduledDate: input.scheduledDate,
        status: "scheduled",
        priority: input.priority,
        estimatedCost: input.estimatedCost,
        description: input.description,
        createdAt: now,
        updatedAt: now,
      }

      const { id: _, ...scheduleData } = schedule

      await firestoreService.setDocument(MAINTENANCE_COLLECTION, id, scheduleData)

      return schedule
    } catch (error) {
      console.error("Error creating maintenance schedule:", error)
      throw new Error("Failed to create maintenance schedule")
    }
  },

  updateMaintenanceSchedule: async (id: string, input: UpdateMaintenanceScheduleInput): Promise<MaintenanceSchedule> => {
    try {
      const existingSchedule = await fleetService.getMaintenanceScheduleById(id)
      if (!existingSchedule) {
        throw new Error("Maintenance schedule not found")
      }

      const updatedSchedule: Partial<MaintenanceSchedule> = {
        ...input,
        updatedAt: new Date().toISOString(),
      }

      // If status is completed, set completed date
      if (input.status === "completed" && !input.completedDate) {
        updatedSchedule.completedDate = new Date().toISOString().split("T")[0]
      }

      await firestoreService.updateDocument(MAINTENANCE_COLLECTION, id, updatedSchedule)

      return {
        ...existingSchedule,
        ...updatedSchedule,
      } as MaintenanceSchedule
    } catch (error) {
      console.error("Error updating maintenance schedule:", error)
      throw new Error("Failed to update maintenance schedule")
    }
  },

  deleteMaintenanceSchedule: async (id: string): Promise<void> => {
    try {
      const schedule = await fleetService.getMaintenanceScheduleById(id)
      if (!schedule) {
        throw new Error("Maintenance schedule not found")
      }

      await firestoreService.deleteDocument(MAINTENANCE_COLLECTION, id)
    } catch (error) {
      console.error("Error deleting maintenance schedule:", error)
      throw new Error("Failed to delete maintenance schedule")
    }
  },
}

