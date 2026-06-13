export type VehicleStatus = "active" | "inactive"

export interface VehicleLocation {
  lat: number
  lng: number
  address: string
}

export interface Vehicle {
  id: string
  busNumberPlate?: string
  busNumber?: string
  deviceId?: string
  anyDeskId?: string
  model: string
  year: number
  status: VehicleStatus
  location: VehicleLocation
  driverId?: string
  driverName?: string
  ownerName?: string
  route?: string
  routeId?: string
  locationDepot?: string

  mileage: number
  speed: number

  batteryLevel: number
  alerts: number
  createdAt?: string
  updatedAt?: string
}

export interface CreateVehicleInput {
  busNumberPlate: string
  busNumber?: string
  deviceId?: string
  anyDeskId?: string
  model: string
  year: number
  driverId?: string
  driverName?: string
  ownerName?: string
  route?: string
  routeId?: string
  location?: VehicleLocation
  locationDepot?: string

  mileage?: number
  status?: VehicleStatus
}

export interface UpdateVehicleInput {
  busNumberPlate?: string
  busNumber?: string
  deviceId?: string
  anyDeskId?: string
  model?: string
  year?: number
  status?: VehicleStatus
  driverId?: string
  driverName?: string
  ownerName?: string
  route?: string
  routeId?: string
  location?: VehicleLocation
  locationDepot?: string

  mileage?: number
  speed?: number

  batteryLevel?: number
  alerts?: number
}

export interface VehicleFilters {
  status?: VehicleStatus | "all"
  search?: string
  driverId?: string
}


