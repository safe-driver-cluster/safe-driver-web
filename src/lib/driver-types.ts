export type DriverStatus = "on_duty" | "off_duty" | "suspended"

export interface Driver {
  id: string
  name: string
  licenseNumber: string
  phone: string
  email: string
  busNumber?: string
  status: DriverStatus
  alertCount: number
  lastAlert?: string
  joinDate: string
  experience: string
  address?: string
  language?: string
  createdAt?: string
  updatedAt?: string
}

export interface CreateDriverInput {
  name: string
  licenseNumber: string
  phone: string
  email: string
  busNumber?: string
  address?: string
  experience?: string
  language?: string
}

export interface UpdateDriverInput {
  name?: string
  licenseNumber?: string
  phone?: string
  email?: string
  busNumber?: string
  status?: DriverStatus
  address?: string
  experience?: string
  language?: string
  alertCount?: number
  lastAlert?: string
}

export interface DriverFilters {
  status?: DriverStatus | "all"
  search?: string
  limit?: number
}
