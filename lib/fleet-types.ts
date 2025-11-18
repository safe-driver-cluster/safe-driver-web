export type VehicleStatus = "active" | "maintenance" | "inactive"
export type MaintenanceStatus = "excellent" | "good" | "needs_attention" | "overdue"
export type MaintenancePriority = "low" | "medium" | "high"
export type MaintenanceScheduleStatus = "scheduled" | "in_progress" | "completed" | "overdue" | "cancelled"

export interface VehicleLocation {
  lat: number
  lng: number
  address: string
}

export interface ServiceHistoryItem {
  date: string
  type: string
  cost: number
  description: string
}

export interface Vehicle {
  id: string
  busNumberPlate?: string
  busNumber?: string
  documentId?: string
  deviceId?: string
  model: string
  year: number
  status: VehicleStatus
  location: VehicleLocation
  driverId?: string
  driverName?: string
  route?: string
  fuel: number
  mileage: number
  lastService?: string
  nextService?: string
  maintenanceStatus: MaintenanceStatus
  speed: number
  engineTemp: number
  batteryLevel: number
  safetyScore: number
  alerts: number
  serviceHistory: ServiceHistoryItem[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateVehicleInput {
  busNumberPlate: string
  busNumber?: string
  documentId?: string
  deviceId?: string
  model: string
  year: number
  driverId?: string
  driverName?: string
  route?: string
  location?: VehicleLocation
  fuel?: number
  mileage?: number
  status?: VehicleStatus
}

export interface UpdateVehicleInput {
  busNumberPlate?: string
  busNumber?: string
  documentId?: string
  deviceId?: string
  model?: string
  year?: number
  status?: VehicleStatus
  driverId?: string
  driverName?: string
  route?: string
  location?: VehicleLocation
  fuel?: number
  mileage?: number
  lastService?: string
  nextService?: string
  maintenanceStatus?: MaintenanceStatus
  speed?: number
  engineTemp?: number
  batteryLevel?: number
  safetyScore?: number
  alerts?: number
}

export interface VehicleFilters {
  status?: VehicleStatus | "all"
  maintenanceStatus?: MaintenanceStatus | "all"
  search?: string
  driverId?: string
}

export interface MaintenanceSchedule {
  id: string
  vehicleId: string
  busNumber: string
  type: string
  scheduledDate: string
  status: MaintenanceScheduleStatus
  priority: MaintenancePriority
  estimatedCost: number
  actualCost?: number
  description: string
  completedDate?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateMaintenanceScheduleInput {
  vehicleId: string
  type: string
  scheduledDate: string
  priority: MaintenancePriority
  estimatedCost: number
  description: string
}

export interface UpdateMaintenanceScheduleInput {
  type?: string
  scheduledDate?: string
  status?: MaintenanceScheduleStatus
  priority?: MaintenancePriority
  estimatedCost?: number
  actualCost?: number
  description?: string
  completedDate?: string
}

export interface ServiceHistoryInput {
  vehicleId: string
  type: string
  cost: number
  description: string
  date?: string
}

