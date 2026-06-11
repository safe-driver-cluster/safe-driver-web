import { firestoreService } from "./firebase/firestore"
import type { Driver, CreateDriverInput, UpdateDriverInput, DriverFilters } from "./driver-types"
import { Timestamp } from "firebase/firestore"

const COLLECTION_NAME = "drivers"

// Generate driver ID
const generateDriverId = async (): Promise<string> => {
  try {
    const drivers = await firestoreService.getCollection<Driver>(COLLECTION_NAME)
    const maxId = drivers.reduce((max, driver) => {
      const num = parseInt(driver.id.replace("DRV", ""))
      return num > max ? num : max
    }, 0)
    return `DRV${String(maxId + 1).padStart(3, "0")}`
  } catch (error) {
    // If we can't fetch drivers (e.g., empty collection or error), start from DRV001
    console.warn("Could not fetch existing drivers to generate ID, starting from DRV001:", error)
    return "DRV001"
  }
}

export const driverService = {
  // Get all drivers with optional filters
  getAllDrivers: async (filters?: DriverFilters & { limit?: number }): Promise<Driver[]> => {
    try {
      // Build Firestore query constraints for server-side filtering
      const constraints: any[] = []
      
      // Order by createdAt first (required before limit in Firestore)
      constraints.push(firestoreService.orderByField("createdAt", "desc"))

      // Add limit for better performance (after ordering)
      // If filtering by status, fetch more records before filtering in memory
      const limit = filters?.limit || 100
      const fetchLimit = (filters?.status && filters.status !== "all") ? 500 : limit
      if (fetchLimit > 0) {
        constraints.push(firestoreService.limitResults(fetchLimit))
      }

      // Fetch with server-side filters
      let drivers = await firestoreService.getCollection<Driver>(COLLECTION_NAME, constraints)

      // Apply status filter in memory to avoid needing composite indexes 
      // (equality on status + order by createdAt requires composite index)
      if (filters?.status && filters.status !== "all") {
        drivers = drivers.filter(d => d.status === filters.status)
      }

      // Apply client-side filters that can't be done server-side (text search)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        drivers = drivers.filter(
          (driver) =>
            driver.name.toLowerCase().includes(searchLower) ||
            driver.licenseNumber.toLowerCase().includes(searchLower) ||
            driver.busNumber?.toLowerCase().includes(searchLower) ||
            driver.email.toLowerCase().includes(searchLower),
        )
      }

      // Ensure drivers are sorted by createdAt (descending)
      drivers.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
        return dateB - dateA // Descending order
      })

      return drivers
    } catch (error) {
      console.error("Error fetching drivers:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check if it's a Firebase configuration error
      if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
        throw new Error("Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.")
      }
      
      throw new Error(`Failed to fetch drivers: ${errorMessage}`)
    }
  },

  // Get a single driver by ID
  getDriverById: async (id: string): Promise<Driver | null> => {
    try {
      return await firestoreService.getDocument<Driver>(COLLECTION_NAME, id)
    } catch (error) {
      console.error("Error fetching driver:", error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
        throw new Error("Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.")
      }
      
      throw new Error(`Failed to fetch driver: ${errorMessage}`)
    }
  },

  // Create a new driver
  createDriver: async (input: CreateDriverInput): Promise<Driver> => {
    try {
      const id = await generateDriverId()
      const now = new Date().toISOString()

      const driver: Driver = {
        id,
        name: input.name,
        licenseNumber: input.licenseNumber,
        phone: input.phone,
        email: input.email,
        busNumber: input.busNumber || "",
        status: "off_duty",
        alertCount: 0,
        joinDate: now.split("T")[0],
        experience: input.experience || "",
        address: input.address || "",
        createdAt: now,
        updatedAt: now,
        // Note: lastAlert is optional and will be omitted if undefined (handled by firestoreService)
      }

      // Exclude 'id' from the data since it's the document ID, not a field
      const { id: _, ...driverData } = driver
      
      console.log("Saving driver to Firestore:", { collection: COLLECTION_NAME, id, data: driverData })
      await firestoreService.setDocument(COLLECTION_NAME, id, driverData)
      console.log("Driver saved successfully:", id)
      
      return driver
    } catch (error) {
      console.error("Error creating driver:", error)
      // Preserve the original error message if it's informative
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Check if it's a Firebase configuration error
      if (errorMessage.includes("Firebase not configured") || errorMessage.includes("configuration missing")) {
        throw new Error("Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.")
      }
      
      // Check for common Firestore errors
      if (errorMessage.includes("permission-denied") || errorMessage.includes("PERMISSION_DENIED")) {
        throw new Error("Permission denied. Please check your Firestore security rules or Firebase emulator connection.")
      }
      
      if (errorMessage.includes("unavailable") || errorMessage.includes("UNAVAILABLE")) {
        throw new Error("Firebase service unavailable. Please check your connection and ensure Firebase emulators are running if using emulators.")
      }
      
      // For other errors, include the original message
      throw new Error(`Failed to create driver: ${errorMessage}`)
    }
  },

  // Update a driver
  updateDriver: async (id: string, input: UpdateDriverInput): Promise<Driver> => {
    try {
      const existingDriver = await driverService.getDriverById(id)
      if (!existingDriver) {
        throw new Error("Driver not found")
      }

      const updatedDriver: Partial<Driver> = {
        ...input,
        updatedAt: new Date().toISOString(),
      }

      await firestoreService.updateDocument(COLLECTION_NAME, id, updatedDriver)

      return {
        ...existingDriver,
        ...updatedDriver,
      } as Driver
    } catch (error) {
      console.error("Error updating driver:", error)
      throw new Error("Failed to update driver")
    }
  },

  // Delete a driver
  deleteDriver: async (id: string): Promise<void> => {
    try {
      const driver = await driverService.getDriverById(id)
      if (!driver) {
        throw new Error("Driver not found")
      }

      await firestoreService.deleteDocument(COLLECTION_NAME, id)
    } catch (error) {
      console.error("Error deleting driver:", error)
      throw new Error("Failed to delete driver")
    }
  },

  // Update driver status
  updateDriverStatus: async (id: string, status: Driver["status"]): Promise<Driver> => {
    return driverService.updateDriver(id, { status })
  },

  // Increment alert count
  incrementAlertCount: async (id: string): Promise<Driver> => {
    try {
      const driver = await driverService.getDriverById(id)
      if (!driver) {
        throw new Error("Driver not found")
      }

      return driverService.updateDriver(id, {
        alertCount: driver.alertCount + 1,
        lastAlert: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error incrementing alert count:", error)
      throw new Error("Failed to update alert count")
    }
  },

  // Get drivers by status
  getDriversByStatus: async (status: Driver["status"]): Promise<Driver[]> => {
    return driverService.getAllDrivers({ status })
  },

  // Get driver statistics
  getDriverStats: async (): Promise<{
    total: number
    onDuty: number
    offDuty: number
    suspended: number
  }> => {
    try {
      const drivers = await driverService.getAllDrivers()

      const stats = {
        total: drivers.length,
        onDuty: drivers.filter((d) => d.status === "on_duty").length,
        offDuty: drivers.filter((d) => d.status === "off_duty").length,
        suspended: drivers.filter((d) => d.status === "suspended").length,
      }

      return stats
    } catch (error) {
      console.error("Error fetching driver stats:", error)
      throw new Error("Failed to fetch driver statistics")
    }
  },
}

