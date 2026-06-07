export type RouteStatus = "active" | "inactive" | "maintenance"

export type StopStatus = "completed" | "current" | "upcoming"

export interface RouteStop {
  name: string
  time: string
  status: StopStatus
  latitude?: number
  longitude?: number
  order: number
}

export type HazardType = "accident" | "school" | "speed" | "other"

export interface HazardZone {
  id?: string
  name: string
  location: string
  latitude: number
  longitude: number
  type: HazardType
  customType?: string
  radius: number // in meters
}

export interface Route {
  id: string
  name: string
  busNumber?: string
  startPoint: string
  endPoint: string
  distance: number // in kilometers
  estimatedTime: number // in minutes
  activeVehicles: number
  totalStops: number
  status: RouteStatus
  vehicles: string[] // array of vehicle IDs
  stops: RouteStop[]
  hazardZones?: HazardZone[]
  polyline?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateRouteInput {
  name: string
  busNumber?: string
  startPoint: string
  endPoint: string
  distance: number
  estimatedTime: number
  stops: Omit<RouteStop, "status">[]
  vehicles?: string[]
  hazardZones?: HazardZone[]
}

export interface UpdateRouteInput {
  name?: string
  busNumber?: string
  startPoint?: string
  endPoint?: string
  distance?: number
  estimatedTime?: number
  status?: RouteStatus
  activeVehicles?: number
  totalStops?: number
  vehicles?: string[]
  stops?: RouteStop[]
  hazardZones?: HazardZone[]
}

export interface RouteFilters {
  status?: RouteStatus | "all"
  search?: string
  minDistance?: number
  maxDistance?: number
}

