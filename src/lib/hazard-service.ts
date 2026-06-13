import { firestoreService } from "./firebase/firestore"
import { routeService } from "./route-service"
import type { HazardZone, Route } from "./route-types"

const COLLECTION_NAME = "hazards"

// Helper to calculate distance in meters between two points (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371e3 // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

export const hazardService = {
  // Get all hazards
  getAllHazards: async (): Promise<HazardZone[]> => {
    try {
      return await firestoreService.getCollection<HazardZone>(COLLECTION_NAME, [
        firestoreService.orderByField("updatedAt", "desc"),
      ])
    } catch (error) {
      console.error("Error fetching hazards:", error)
      return []
    }
  },

  // Save a new hazard and associate with routes
  saveHazard: async (hazard: Omit<HazardZone, "id">): Promise<string> => {
    try {
      // Strip undefined values — Firestore does not accept undefined fields
      const cleanHazard = Object.fromEntries(
        Object.entries(hazard).filter(([, v]) => v !== undefined)
      ) as Omit<HazardZone, "id">

      // 1. Save hazard to global collection
      const hazardId = await firestoreService.createDocument(COLLECTION_NAME, cleanHazard)
      const fullHazard = { ...cleanHazard, id: hazardId }

      // 2. Automatically detect relevant routes
      const routes = await routeService.getAllRoutes()
      const associatedRoutes: string[] = []

      for (const route of routes) {
        // Check if hazard is near any stop or the general area of the route
        // For simplicity, we check if it's within 1km of any stop
        const isNearRoute = route.stops.some((stop) => {
          if (stop.latitude && stop.longitude) {
            const dist = calculateDistance(hazard.latitude, hazard.longitude, stop.latitude, stop.longitude)
            return dist <= 2000 // 2km threshold for "near route" stops
          }
          return false
        })

        if (isNearRoute) {
          associatedRoutes.push(route.id)
          // Update route's hazardZones
          const existingHazards = route.hazardZones || []
          await routeService.updateRoute(route.id, {
            hazardZones: [...existingHazards, fullHazard],
          })
        }
      }

      console.log(`Hazard ${hazardId} associated with routes:`, associatedRoutes)
      return hazardId
    } catch (error) {
      console.error("Error saving hazard:", error)
      throw error
    }
  },

  // Update a hazard
  updateHazard: async (hazardId: string, updates: Partial<Omit<HazardZone, "id">>): Promise<void> => {
    try {
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([, v]) => v !== undefined)
      )
      await firestoreService.updateDocument(COLLECTION_NAME, hazardId, cleanUpdates)
      
      const routes = await routeService.getAllRoutes()
      for (const route of routes) {
        if (route.hazardZones?.some((h) => h.id === hazardId)) {
          const updatedHazards = route.hazardZones.map((h) => 
            h.id === hazardId ? { ...h, ...cleanUpdates } : h
          )
          await routeService.updateRoute(route.id, {
            hazardZones: updatedHazards,
          })
        }
      }
    } catch (error) {
      console.error("Error updating hazard:", error)
      throw error
    }
  },

  // Delete a hazard
  deleteHazard: async (hazardId: string): Promise<void> => {
    try {
      // 1. Remove from global collection
      await firestoreService.deleteDocument(COLLECTION_NAME, hazardId)

      // 2. Remove from all routes
      const routes = await routeService.getAllRoutes()
      for (const route of routes) {
        if (route.hazardZones?.some((h) => h.id === hazardId)) {
          const updatedHazards = route.hazardZones.filter((h) => h.id !== hazardId)
          await routeService.updateRoute(route.id, {
            hazardZones: updatedHazards,
          })
        }
      }
    } catch (error) {
      console.error("Error deleting hazard:", error)
      throw error
    }
  },

  // Find routes near a specific point
  findRoutesNearPoint: async (lat: number, lng: number, thresholdMeters: number = 2000): Promise<Route[]> => {
    const routes = await routeService.getAllRoutes()
    return routes.filter((route) => 
      route.stops.some((stop) => {
        if (stop.latitude && stop.longitude) {
          return calculateDistance(lat, lng, stop.latitude, stop.longitude) <= thresholdMeters
        }
        return false
      })
    )
  }
}
