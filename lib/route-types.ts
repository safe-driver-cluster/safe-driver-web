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

export interface Route {
  id: string
  name: string
  startPoint: string
  endPoint: string
  distance: number // in kilometers
  estimatedTime: number // in minutes
  activeVehicles: number
  totalStops: number
  status: RouteStatus
  onTimePerformance: number // percentage
  averageSpeed: number // km/h
  passengerLoad: number // percentage
  safetyIncidents: number
  vehicles: string[] // array of vehicle IDs
  stops: RouteStop[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateRouteInput {
  name: string
  startPoint: string
  endPoint: string
  distance: number
  estimatedTime: number
  stops: Omit<RouteStop, "status">[]
  vehicles?: string[]
}

export interface UpdateRouteInput {
  name?: string
  startPoint?: string
  endPoint?: string
  distance?: number
  estimatedTime?: number
  status?: RouteStatus
  activeVehicles?: number
  totalStops?: number
  onTimePerformance?: number
  averageSpeed?: number
  passengerLoad?: number
  safetyIncidents?: number
  vehicles?: string[]
  stops?: RouteStop[]
}

export interface RouteFilters {
  status?: RouteStatus | "all"
  search?: string
  minDistance?: number
  maxDistance?: number
}

