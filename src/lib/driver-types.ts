export type DriverStatus = "on_duty" | "off_duty" | "suspended"

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  email: string
  busNumber?: string
  route?: string
  status: DriverStatus
  alertCount: number
  lastAlert?: string
  joinDate: string
  experience: string
  address?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateDriverInput {
  name: string
  licenseNumber: string
  phone: string
  email: string
  busNumber?: string
  route?: string
  address?: string
  experience?: string
}

export interface UpdateDriverInput {
  name?: string
  licenseNumber?: string
  phone?: string
  email?: string
  busNumber?: string
  route?: string
  status?: DriverStatus
  address?: string
  experience?: string
  alertCount?: number
  lastAlert?: string
}

export interface DriverFilters {
  status?: DriverStatus | "all"
  search?: string
  limit?: number
}

