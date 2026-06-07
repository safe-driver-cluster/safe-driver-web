import { firestoreService } from "./firebase/firestore"
import type { Route, CreateRouteInput, UpdateRouteInput, RouteFilters } from "./route-types"

const COLLECTION_NAME = "routes"

// Generate route ID
const generateRouteId = async (): Promise<string> => {
  const routes = await firestoreService.getCollection<Route>(COLLECTION_NAME)
  const maxId = routes.reduce((max, route) => {
    const num = parseInt(route.id.replace("RT", ""))
    return num > max ? num : max
  }, 0)
  return `RT${String(maxId + 1).padStart(3, "0")}`
}

export const routeService = {
  // Get all routes with optional filters
  getAllRoutes: async (filters?: RouteFilters): Promise<Route[]> => {
    try {
      let routes = await firestoreService.getCollection<Route>(COLLECTION_NAME, [
        firestoreService.orderByField("createdAt", "desc"),
      ])

      // Apply filters
      if (filters) {
        if (filters.status && filters.status !== "all") {
          routes = routes.filter((route) => route.status === filters.status)
        }

        if (filters.search) {
          const searchLower = filters.search.toLowerCase()
          routes = routes.filter(
            (route) =>
              route.name.toLowerCase().includes(searchLower) ||
              route.startPoint.toLowerCase().includes(searchLower) ||
              route.endPoint.toLowerCase().includes(searchLower),
          )
        }

        if (filters.minDistance !== undefined) {
          routes = routes.filter((route) => route.distance >= filters.minDistance!)
        }

        if (filters.maxDistance !== undefined) {
          routes = routes.filter((route) => route.distance <= filters.maxDistance!)
        }
      }

      return routes
    } catch (error) {
      console.error("Error fetching routes:", error)
      throw new Error("Failed to fetch routes")
    }
  },

  // Get a single route by ID
  getRouteById: async (id: string): Promise<Route | null> => {
    try {
      return await firestoreService.getDocument<Route>(COLLECTION_NAME, id)
    } catch (error) {
      console.error("Error fetching route:", error)
      throw new Error("Failed to fetch route")
    }
  },

  // Create a new route
  createRoute: async (input: CreateRouteInput): Promise<Route> => {
    try {
      const id = await generateRouteId()
      const now = new Date().toISOString()

      // Initialize stops with status
      const stops = input.stops.map((stop, index) => ({
        ...stop,
        status: index === 0 ? ("current" as const) : ("upcoming" as const),
      }))

      const route: Route = {
        id,
        name: input.name,
        busNumber: input.busNumber,
        startPoint: input.startPoint,
        endPoint: input.endPoint,
        distance: input.distance,
        estimatedTime: input.estimatedTime,
        activeVehicles: input.vehicles?.length || 0,
        totalStops: stops.length,
        status: "active",
        vehicles: input.vehicles || [],
        stops,
        hazardZones: input.hazardZones || [],
        createdAt: now,
        updatedAt: now,
      }

      await firestoreService.setDocument(COLLECTION_NAME, id, route)
      return route
    } catch (error) {
      console.error("Error creating route:", error)
      throw new Error("Failed to create route")
    }
  },

  // Update a route
  updateRoute: async (id: string, input: UpdateRouteInput): Promise<Route> => {
    try {
      const existingRoute = await routeService.getRouteById(id)
      if (!existingRoute) {
        throw new Error("Route not found")
      }

      // Update totalStops if stops are updated
      const totalStops = input.stops ? input.stops.length : existingRoute.totalStops

      const updatedRoute: Partial<Route> = {
        ...input,
        totalStops,
        updatedAt: new Date().toISOString(),
      }

      await firestoreService.updateDocument(COLLECTION_NAME, id, updatedRoute)

      return {
        ...existingRoute,
        ...updatedRoute,
      } as Route
    } catch (error) {
      console.error("Error updating route:", error)
      throw new Error("Failed to update route")
    }
  },

  // Delete a route
  deleteRoute: async (id: string): Promise<void> => {
    try {
      const route = await routeService.getRouteById(id)
      if (!route) {
        throw new Error("Route not found")
      }

      await firestoreService.deleteDocument(COLLECTION_NAME, id)
    } catch (error) {
      console.error("Error deleting route:", error)
      throw new Error("Failed to delete route")
    }
  },

  // Update route status
  updateRouteStatus: async (id: string, status: Route["status"]): Promise<Route> => {
    return routeService.updateRoute(id, { status })
  },


  // Add vehicle to route
  addVehicle: async (id: string, vehicleId: string): Promise<Route> => {
    try {
      const route = await routeService.getRouteById(id)
      if (!route) {
        throw new Error("Route not found")
      }

      if (route.vehicles.includes(vehicleId)) {
        return route // Vehicle already assigned
      }

      return routeService.updateRoute(id, {
        vehicles: [...route.vehicles, vehicleId],
        activeVehicles: route.activeVehicles + 1,
      })
    } catch (error) {
      console.error("Error adding vehicle to route:", error)
      throw new Error("Failed to add vehicle to route")
    }
  },

  // Remove vehicle from route
  removeVehicle: async (id: string, vehicleId: string): Promise<Route> => {
    try {
      const route = await routeService.getRouteById(id)
      if (!route) {
        throw new Error("Route not found")
      }

      return routeService.updateRoute(id, {
        vehicles: route.vehicles.filter((v) => v !== vehicleId),
        activeVehicles: Math.max(0, route.activeVehicles - 1),
      })
    } catch (error) {
      console.error("Error removing vehicle from route:", error)
      throw new Error("Failed to remove vehicle from route")
    }
  },

  // Get route statistics
  getRouteStats: async (): Promise<{
    total: number
    active: number
    inactive: number
    maintenance: number
    totalVehicles: number
  }> => {
    try {
      const routes = await routeService.getAllRoutes()

      const stats = {
        total: routes.length,
        active: routes.filter((r) => r.status === "active").length,
        inactive: routes.filter((r) => r.status === "inactive").length,
        maintenance: routes.filter((r) => r.status === "maintenance").length,
        totalVehicles: routes.reduce((sum, r) => sum + r.activeVehicles, 0),
      }

      return stats
    } catch (error) {
      console.error("Error fetching route stats:", error)
      throw new Error("Failed to fetch route statistics")
    }
  },
}

