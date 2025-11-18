"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Bus,
  MapPin,
  Wrench,
  CheckCircle,
  Fuel,
  Search,
  Plus,
  Eye,
  Edit,
  Trash2,
  Navigation,
  User,
  Route,
  Gauge,
  Battery,
  Thermometer,
  Shield,
  TrendingUp,
  TrendingDown,
  FileText,
  Loader2,
} from "lucide-react"
import type { Vehicle, MaintenanceSchedule } from "@/lib/fleet-types"
import { useToast } from "@/hooks/use-toast"
import { FleetMap } from "@/components/fleet-map"

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<MaintenanceSchedule[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [maintenanceFilter, setMaintenanceFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [showMaintenanceDialog, setShowMaintenanceDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceSchedule | null>(null)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showEditVehicle, setShowEditVehicle] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const [newVehicle, setNewVehicle] = useState({
    busNumberPlate: "",
    documentId: "",
    deviceId: "",
    busNumber: "",
    model: "",
    year: "",
    driverName: "",
    route: "",
    driver: "",
  })

  const [newMaintenance, setNewMaintenance] = useState({
    vehicleId: "",
    type: "",
    scheduledDate: "",
    priority: "medium" as "low" | "medium" | "high",
    estimatedCost: "",
    description: "",
  })

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (maintenanceFilter !== "all") {
        params.append("maintenanceStatus", maintenanceFilter)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)

      try {
        const response = await fetch(`/api/fleet?${params.toString()}`, {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        if (!response.ok) throw new Error("Failed to fetch vehicles")
        const data = await response.json()
        setVehicles(data)
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout: The server took too long to respond.")
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load vehicles"
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch maintenance schedules
  const fetchMaintenanceSchedules = async () => {
    try {
      const response = await fetch("/api/fleet/maintenance")
      if (!response.ok) throw new Error("Failed to fetch maintenance schedules")
      const data = await response.json()
      setMaintenanceSchedule(data)
    } catch (error) {
      console.error("Error fetching maintenance schedules:", error)
    }
  }

  useEffect(() => {
    fetchVehicles()
    fetchMaintenanceSchedules()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVehicles()
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter, maintenanceFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "maintenance":
        return "warning"
      case "inactive":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getMaintenanceStatusColor = (status: string) => {
    switch (status) {
      case "excellent":
        return "success"
      case "good":
        return "success"
      case "needs_attention":
        return "warning"
      case "overdue":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch =
      vehicle.busNumberPlate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.documentId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.deviceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.busNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.driverName || vehicle.driver || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.route || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    const matchesMaintenance = maintenanceFilter === "all" || vehicle.maintenanceStatus === maintenanceFilter
    return matchesSearch && matchesStatus && matchesMaintenance
  })

  const addVehicle = async () => {
    // Client-side validation
    const errors: string[] = []
    
    // Validate BUS Number Plate format (NB-XXXX)
    if (!newVehicle.busNumberPlate?.trim()) {
      errors.push("BUS Number Plate is required")
    } else {
      const busPlatePattern = /^NB-\d{4}$/
      if (!busPlatePattern.test(newVehicle.busNumberPlate.trim().toUpperCase())) {
        errors.push("BUS Number Plate must be in format NB-XXXX (e.g., NB-4565)")
      }
    }
    
    if (!newVehicle.model?.trim()) {
      errors.push("Vehicle model is required")
    }
    
    if (!newVehicle.year) {
      errors.push("Year is required")
    } else {
      const yearNum = parseInt(newVehicle.year)
      const currentYear = new Date().getFullYear()
      if (isNaN(yearNum)) {
        errors.push("Year must be a valid number")
      } else if (yearNum < 1900) {
        errors.push(`Year must be between 1900 and ${currentYear + 1}`)
      } else if (yearNum > currentYear + 1) {
        errors.push(`Year cannot be greater than ${currentYear + 1}`)
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.length === 1 ? errors[0] : `Please fix the following:\n${errors.join("\n")}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/fleet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busNumberPlate: newVehicle.busNumberPlate.trim().toUpperCase(),
          busNumber: newVehicle.busNumber?.trim() || undefined,
          model: newVehicle.model.trim(),
          year: parseInt(newVehicle.year),
          driverName: newVehicle.driverName?.trim() || undefined,
          route: newVehicle.route?.trim() || undefined,
          documentId: newVehicle.documentId?.trim() || undefined,
          deviceId: newVehicle.deviceId?.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to create vehicle"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Vehicle added successfully.",
      })

      setNewVehicle({ busNumberPlate: "", documentId: "", deviceId: "", busNumber: "", model: "", year: "", driverName: "", route: "", driver: "" })
      setShowAddVehicle(false)
      fetchVehicles()
    } catch (error: any) {
      console.error("Error creating vehicle:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to create vehicle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const scheduleMaintenance = async () => {
    // Client-side validation
    const errors: string[] = []
    
    if (!newMaintenance.vehicleId) {
      errors.push("Please select a vehicle")
    }
    
    if (!newMaintenance.type?.trim()) {
      errors.push("Maintenance type is required")
    }
    
    if (!newMaintenance.scheduledDate) {
      errors.push("Scheduled date is required")
    } else {
      const selectedDate = new Date(newMaintenance.scheduledDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        errors.push("Scheduled date cannot be in the past")
      }
    }

    if (newMaintenance.estimatedCost && isNaN(parseInt(newMaintenance.estimatedCost))) {
      errors.push("Estimated cost must be a valid number")
    } else if (newMaintenance.estimatedCost && parseInt(newMaintenance.estimatedCost) < 0) {
      errors.push("Estimated cost cannot be negative")
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.length === 1 ? errors[0] : `Please fix the following:\n${errors.join("\n")}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/fleet/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          vehicleId: newMaintenance.vehicleId,
          type: newMaintenance.type.trim(),
          scheduledDate: newMaintenance.scheduledDate,
          priority: newMaintenance.priority,
          estimatedCost: parseInt(newMaintenance.estimatedCost) || 0,
          description: newMaintenance.description?.trim() || "",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to schedule maintenance"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Maintenance scheduled successfully.",
      })

      setNewMaintenance({
        vehicleId: "",
        type: "",
        scheduledDate: "",
        priority: "medium",
        estimatedCost: "",
        description: "",
      })
      setShowMaintenanceDialog(false)
      fetchMaintenanceSchedules()
    } catch (error: any) {
      console.error("Error scheduling maintenance:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to schedule maintenance. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateVehicleStatus = async (vehicleId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/fleet/${vehicleId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to update vehicle status"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: `Vehicle status updated to ${newStatus.replace("_", " ")}.`,
      })

      fetchVehicles()
    } catch (error: any) {
      console.error("Error updating vehicle status:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update vehicle status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle)
    setShowEditVehicle(true)
  }

  const handleUpdateVehicle = async () => {
    if (!editingVehicle) return

    // Client-side validation
    const errors: string[] = []
    
    // Validate BUS Number Plate format (NB-XXXX)
    if (!editingVehicle.busNumberPlate?.trim()) {
      errors.push("BUS Number Plate is required")
    } else {
      const busPlatePattern = /^NB-\d{4}$/
      if (!busPlatePattern.test(editingVehicle.busNumberPlate.trim().toUpperCase())) {
        errors.push("BUS Number Plate must be in format NB-XXXX (e.g., NB-4565)")
      }
    }
    
    if (!editingVehicle.model?.trim()) {
      errors.push("Vehicle model is required")
    }
    
    if (!editingVehicle.year) {
      errors.push("Year is required")
    } else {
      const currentYear = new Date().getFullYear()
      if (editingVehicle.year < 1900) {
        errors.push(`Year must be between 1900 and ${currentYear + 1}`)
      } else if (editingVehicle.year > currentYear + 1) {
        errors.push(`Year cannot be greater than ${currentYear + 1}`)
      }
    }

    if (errors.length > 0) {
      toast({
        title: "Validation Error",
        description: errors.length === 1 ? errors[0] : `Please fix the following:\n${errors.join("\n")}`,
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/fleet/${editingVehicle.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busNumberPlate: editingVehicle.busNumberPlate?.trim().toUpperCase() || undefined,
          busNumber: editingVehicle.busNumber?.trim() || undefined,
          model: editingVehicle.model.trim(),
          year: editingVehicle.year,
          driverName: editingVehicle.driverName?.trim() || undefined,
          route: editingVehicle.route?.trim() || undefined,
          documentId: editingVehicle.documentId?.trim() || undefined,
          deviceId: editingVehicle.deviceId?.trim() || undefined,
          status: editingVehicle.status,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to update vehicle"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Vehicle updated successfully.",
      })

      setShowEditVehicle(false)
      setEditingVehicle(null)
      fetchVehicles()
    } catch (error: any) {
      console.error("Error updating vehicle:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update vehicle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (vehicle: Vehicle) => {
    setVehicleToDelete(vehicle)
    setDeleteDialogOpen(true)
  }

  const deleteVehicle = async () => {
    if (!vehicleToDelete?.id) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/fleet/${vehicleToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to delete vehicle"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Vehicle deleted successfully.",
      })

      setDeleteDialogOpen(false)
      setVehicleToDelete(null)
      fetchVehicles()
    } catch (error: any) {
      console.error("Error deleting vehicle:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete vehicle. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const updateMaintenanceStatus = async (maintenanceId: string, status: string) => {
    try {
      const response = await fetch(`/api/fleet/maintenance/${maintenanceId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to update maintenance status"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: `Maintenance status updated to ${status.replace("_", " ")}.`,
      })

      fetchMaintenanceSchedules()
    } catch (error: any) {
      console.error("Error updating maintenance status:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update maintenance status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteMaintenance = async (maintenanceId: string) => {
    if (!confirm("Are you sure you want to delete this maintenance schedule? This action cannot be undone.")) return

    try {
      const response = await fetch(`/api/fleet/maintenance/${maintenanceId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to delete maintenance schedule"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: "Maintenance schedule deleted successfully.",
      })

      fetchMaintenanceSchedules()
    } catch (error: any) {
      console.error("Error deleting maintenance schedule:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete maintenance schedule. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Fleet Management System</h1>
        <p className="text-neutral-600">Comprehensive vehicle tracking, maintenance, and monitoring</p>
      </div>

      {/* Fleet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Bus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.filter((v) => v.status === "active").length} active
            </p>
            {loading && <p className="text-xs text-gray-400 mt-1">Loading...</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-warning-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-600">
              {vehicles.filter((v) => v.status === "maintenance").length}
            </div>
            <p className="text-xs text-muted-foreground">
              {maintenanceSchedule.filter((m) => m.status === "overdue").length} overdue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Fuel</CardTitle>
            <Fuel className="h-4 w-4 text-tech-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tech-600">
              {vehicles.length > 0 ? Math.round(vehicles.reduce((acc, v) => acc + v.fuel, 0) / vehicles.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Fleet average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Score</CardTitle>
            <Shield className="h-4 w-4 text-safety-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-safety-600">
              {vehicles.length > 0 ? Math.round(vehicles.reduce((acc, v) => acc + v.safetyScore, 0) / vehicles.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Fleet average</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="vehicles">Vehicle Fleet</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="analytics">Fleet Analytics</TabsTrigger>
        </TabsList>

        {/* Vehicle Fleet Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Vehicle Fleet Overview</CardTitle>
                  <CardDescription>Manage and monitor your entire vehicle fleet</CardDescription>
                </div>
                <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Vehicle
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Vehicle</DialogTitle>
                      <DialogDescription>Enter vehicle details to add to the fleet</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="busNumberPlate">
                          BUS Number Plate <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="busNumberPlate"
                          value={newVehicle.busNumberPlate}
                          onChange={(e) => {
                            let value = e.target.value.toUpperCase()
                            // Auto-format: Add NB- prefix if user types numbers
                            if (value && !value.startsWith("NB-")) {
                              if (/^\d+$/.test(value.replace("NB-", ""))) {
                                value = "NB-" + value.replace("NB-", "")
                              }
                            }
                            // Limit to format NB-XXXX
                            if (value.length > 7) value = value.substring(0, 7)
                            setNewVehicle({ ...newVehicle, busNumberPlate: value })
                          }}
                          placeholder="NB-4565"
                          required
                          maxLength={7}
                        />
                        <p className="text-xs text-gray-500 mt-1">Format: NB-XXXX (e.g., NB-4565)</p>
                      </div>
                      <div>
                        <Label htmlFor="documentId">Document ID (Number Plate)</Label>
                        <Input
                          id="documentId"
                          value={newVehicle.documentId}
                          onChange={(e) => setNewVehicle({ ...newVehicle, documentId: e.target.value.toUpperCase() })}
                          placeholder="e.g., ABC-1234"
                        />
                        <p className="text-xs text-gray-500 mt-1">Vehicle registration number / Number plate (optional)</p>
                      </div>
                      <div>
                        <Label htmlFor="deviceId">Device ID</Label>
                        <Input
                          id="deviceId"
                          value={newVehicle.deviceId}
                          onChange={(e) => setNewVehicle({ ...newVehicle, deviceId: e.target.value.toUpperCase() })}
                          placeholder="e.g., DEV-001"
                        />
                        <p className="text-xs text-gray-500 mt-1">GPS/Tracking device ID (optional)</p>
                      </div>
                      <div>
                        <Label htmlFor="model">Vehicle Model</Label>
                        <Input
                          id="model"
                          value={newVehicle.model}
                          onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                          placeholder="e.g., Tata LP 1618"
                        />
                      </div>
                      <div>
                        <Label htmlFor="year">Year</Label>
                        <Input
                          id="year"
                          type="number"
                          value={newVehicle.year}
                          onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                          placeholder="2024"
                        />
                      </div>
                      <div>
                        <Label htmlFor="driver">Assigned Driver</Label>
                        <Input
                          id="driver"
                          value={newVehicle.driverName}
                          onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                          placeholder="Driver name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="route">Route</Label>
                        <Input
                          id="route"
                          value={newVehicle.route}
                          onChange={(e) => setNewVehicle({ ...newVehicle, route: e.target.value })}
                          placeholder="e.g., Colombo - Kandy"
                        />
                      </div>
                      <Button onClick={addVehicle} className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          "Add Vehicle"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search by number plate, device ID, driver, or route..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={maintenanceFilter} onValueChange={setMaintenanceFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Maintenance" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Conditions</SelectItem>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="needs_attention">Needs Attention</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Grid */}
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Loading vehicles...</h3>
                  <p className="text-gray-600">Please wait while we fetch fleet data.</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-12 text-center">
                  <Bus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No vehicles found</h3>
                  <p className="text-gray-600">{searchTerm || statusFilter !== "all" || maintenanceFilter !== "all" ? "No vehicles match your current filters." : "Get started by adding your first vehicle to the fleet."}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {filteredVehicles.map((vehicle) => (
                    <Card key={vehicle.id || `vehicle-${vehicle.busNumberPlate || vehicle.busNumber}`} className="hover:shadow-lg transition-shadow overflow-visible">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">{vehicle.busNumberPlate || vehicle.busNumber || "N/A"}</CardTitle>
                          <CardDescription className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />
                                {vehicle.documentId || "N/A"}
                              </span>
                              {vehicle.deviceId && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 text-blue-600">
                                    <Gauge className="h-3 w-3" />
                                    {vehicle.deviceId}
                                  </span>
                                </>
                              )}
                            </div>
                            <span>
                              {vehicle.model} ({vehicle.year})
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant={getStatusColor(vehicle.status)}>{vehicle.status.toUpperCase()}</Badge>
                          <Badge variant={getMaintenanceStatusColor(vehicle.maintenanceStatus)}>
                            {vehicle.maintenanceStatus.replace("_", " ").toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {/* Driver and Route Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span>{vehicle.driverName || (vehicle as any).driver || "No driver assigned"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Route className="h-4 w-4 text-gray-500" />
                            <span>{vehicle.route || "No route assigned"}</span>
                          </div>
                        </div>

                        {/* Location */}
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{vehicle.location.address}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2 flex-wrap items-center">
                          <Button size="sm" variant="outline" onClick={() => setSelectedVehicle(vehicle)} className="flex-shrink-0">
                            <Eye className="h-4 w-4 mr-1" />
                            Details
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleEditVehicle(vehicle)} className="flex-shrink-0">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Select
                            value={vehicle.status}
                            onValueChange={(value) => {
                              if (vehicle.id) {
                                updateVehicleStatus(vehicle.id, value)
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs w-[120px] flex-shrink-0">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="maintenance">Maintenance</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleDeleteClick(vehicle)}
                            disabled={!vehicle.id || isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Vehicle Tracking</CardTitle>
              <CardDescription>Monitor live locations and status of all vehicles</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Interactive Map */}
              <div className="mb-6">
                <FleetMap
                  vehicles={vehicles.filter((v) => v.status === "active" || v.status === "maintenance")}
                  selectedVehicle={selectedVehicle}
                  onVehicleClick={setSelectedVehicle}
                />
              </div>

              {/* Vehicle Status List */}
              <div className="space-y-3">
                <h4 className="font-semibold">Active Vehicles</h4>
                {vehicles
                  .filter((v) => v.status === "active")
                  .map((vehicle) => (
                    <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <div>
                          <p className="font-medium">{vehicle.busNumberPlate || vehicle.busNumber || "N/A"}</p>
                          <p className="text-sm text-gray-600">{vehicle.location.address}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-center">
                          <p className="text-gray-500">Speed</p>
                          <p className="font-medium">{Math.round(vehicle.speed)} km/h</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">Driver</p>
                          <p className="font-medium">{vehicle.driverName || "No driver"}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          Track
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Tab */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Maintenance Schedule</CardTitle>
                  <CardDescription>Manage vehicle maintenance and service schedules</CardDescription>
                </div>
                <Dialog open={showMaintenanceDialog} onOpenChange={setShowMaintenanceDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Schedule Maintenance</DialogTitle>
                      <DialogDescription>Schedule maintenance for a vehicle</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="vehicleSelect">Vehicle</Label>
                        <Select
                          value={newMaintenance.vehicleId}
                          onValueChange={(value) => setNewMaintenance({ ...newMaintenance, vehicleId: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicles
                              .filter((vehicle) => vehicle.id)
                              .map((vehicle) => (
                                <SelectItem key={vehicle.id!} value={vehicle.id!}>
                                  {vehicle.busNumberPlate || vehicle.busNumber || "N/A"} - {vehicle.model}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="maintenanceType">Maintenance Type</Label>
                        <Input
                          id="maintenanceType"
                          value={newMaintenance.type}
                          onChange={(e) => setNewMaintenance({ ...newMaintenance, type: e.target.value })}
                          placeholder="e.g., Regular Service, Brake Repair"
                        />
                      </div>
                      <div>
                        <Label htmlFor="scheduledDate">Scheduled Date</Label>
                        <Input
                          id="scheduledDate"
                          type="date"
                          value={newMaintenance.scheduledDate}
                          onChange={(e) => setNewMaintenance({ ...newMaintenance, scheduledDate: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={newMaintenance.priority}
                          onValueChange={(value) => setNewMaintenance({ ...newMaintenance, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="estimatedCost">Estimated Cost (LKR)</Label>
                        <Input
                          id="estimatedCost"
                          type="number"
                          value={newMaintenance.estimatedCost}
                          onChange={(e) => setNewMaintenance({ ...newMaintenance, estimatedCost: e.target.value })}
                          placeholder="15000"
                        />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                          id="description"
                          value={newMaintenance.description}
                          onChange={(e) => setNewMaintenance({ ...newMaintenance, description: e.target.value })}
                          placeholder="Maintenance details..."
                        />
                      </div>
                      <Button onClick={scheduleMaintenance} className="w-full" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scheduling...
                          </>
                        ) : (
                          "Schedule Maintenance"
                        )}
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceSchedule.map((maintenance) => (
                  <div key={maintenance.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold">{maintenance.busNumber}</h4>
                        <p className="text-sm text-gray-600">{maintenance.type}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant={getPriorityColor(maintenance.priority)}>
                          {maintenance.priority.toUpperCase()}
                        </Badge>
                        <Badge
                          variant={
                            maintenance.status === "overdue"
                              ? "destructive"
                              : maintenance.status === "in_progress"
                                ? "warning"
                                : "secondary"
                          }
                        >
                          {maintenance.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Scheduled Date</p>
                        <p className="font-medium">{maintenance.scheduledDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Estimated Cost</p>
                        <p className="font-medium">LKR {maintenance.estimatedCost.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Description</p>
                        <p className="font-medium">{maintenance.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateMaintenanceStatus(maintenance.id, "completed")}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Complete
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => deleteMaintenance(maintenance.id)}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fleet Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Performance</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Fuel Efficiency</span>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-bold text-green-600">12.5 km/L</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Maintenance Cost (Monthly)</span>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="font-bold text-red-600">LKR 245,000</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span>Fleet Utilization</span>
                  <span className="font-bold text-blue-600">87%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>On-Time Performance</span>
                  <span className="font-bold text-green-600">94%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Maintenance Overview</CardTitle>
                <CardDescription>Maintenance statistics and trends</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Scheduled This Month</span>
                  <span className="font-bold text-blue-600">8</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completed This Month</span>
                  <span className="font-bold text-green-600">6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overdue</span>
                  <span className="font-bold text-red-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Cost per Service</span>
                  <span className="font-bold text-gray-900">LKR 18,500</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status Distribution</CardTitle>
              <CardDescription>Current status of all vehicles in the fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {vehicles.filter((v) => v.status === "active").length}
                  </div>
                  <p className="text-sm text-gray-600">Active Vehicles</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{
                        width: `${(vehicles.filter((v) => v.status === "active").length / vehicles.length) * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-600 mb-2">
                    {vehicles.filter((v) => v.status === "maintenance").length}
                  </div>
                  <p className="text-sm text-gray-600">In Maintenance</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 bg-yellow-500 rounded-full"
                      style={{
                        width: `${vehicles.length > 0 ? (vehicles.filter((v) => v.status === "maintenance").length / vehicles.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600 mb-2">
                    {vehicles.filter((v) => v.status === "inactive").length}
                  </div>
                  <p className="text-sm text-gray-600">Inactive</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="h-2 bg-gray-500 rounded-full"
                      style={{
                        width: `${vehicles.length > 0 ? (vehicles.filter((v) => v.status === "inactive").length / vehicles.length) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedVehicle.busNumberPlate || selectedVehicle.busNumber || "N/A"} - Detailed Information</DialogTitle>
              <DialogDescription>
                {selectedVehicle.model} ({selectedVehicle.year})
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Vehicle Status */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(selectedVehicle.speed)}</div>
                  <div className="text-sm text-gray-600">Speed (km/h)</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{Math.round(selectedVehicle.fuel)}%</div>
                  <div className="text-sm text-gray-600">Fuel Level</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(selectedVehicle.engineTemp)}°C</div>
                  <div className="text-sm text-gray-600">Engine Temp</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedVehicle.safetyScore}%</div>
                  <div className="text-sm text-gray-600">Safety Score</div>
                </div>
              </div>

              {/* Service History */}
              <div>
                <h4 className="font-semibold mb-3">Service History</h4>
                <div className="space-y-3">
                  {selectedVehicle.serviceHistory.map((service, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{service.type}</p>
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">LKR {service.cost.toLocaleString()}</p>
                          <p className="text-sm text-gray-600">{service.date}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Vehicle Dialog */}
      {editingVehicle && (
        <Dialog open={showEditVehicle} onOpenChange={(open) => {
          setShowEditVehicle(open)
          if (!open) setEditingVehicle(null)
        }}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4">
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>Update vehicle information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <Label htmlFor="edit-busNumberPlate">
                  BUS Number Plate <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-busNumberPlate"
                  value={editingVehicle.busNumberPlate || ""}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase()
                    // Auto-format: Add NB- prefix if user types numbers
                    if (value && !value.startsWith("NB-")) {
                      if (/^\d+$/.test(value.replace("NB-", ""))) {
                        value = "NB-" + value.replace("NB-", "")
                      }
                    }
                    // Limit to format NB-XXXX
                    if (value.length > 7) value = value.substring(0, 7)
                    setEditingVehicle({ ...editingVehicle, busNumberPlate: value })
                  }}
                  placeholder="NB-4565"
                  required
                  maxLength={7}
                />
                <p className="text-xs text-gray-500 mt-1">Format: NB-XXXX (e.g., NB-4565)</p>
              </div>
              <div>
                <Label htmlFor="edit-documentId">Document ID (Number Plate)</Label>
                <Input
                  id="edit-documentId"
                  value={editingVehicle.documentId || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, documentId: e.target.value.toUpperCase() })}
                  placeholder="e.g., ABC-1234"
                />
                <p className="text-xs text-gray-500 mt-1">Vehicle registration number / Number plate</p>
              </div>
              <div>
                <Label htmlFor="edit-deviceId">Device ID</Label>
                <Input
                  id="edit-deviceId"
                  value={editingVehicle.deviceId || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, deviceId: e.target.value.toUpperCase() })}
                  placeholder="e.g., DEV-001"
                />
                <p className="text-xs text-gray-500 mt-1">GPS/Tracking device ID (optional)</p>
              </div>
              <div>
                <Label htmlFor="edit-busNumber">Bus Number</Label>
                <Input
                  id="edit-busNumber"
                  value={editingVehicle.busNumber || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, busNumber: e.target.value })}
                  placeholder="e.g., NB-1234"
                />
              </div>
              <div>
                <Label htmlFor="edit-model">Vehicle Model *</Label>
                <Input
                  id="edit-model"
                  value={editingVehicle.model}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, model: e.target.value })}
                  placeholder="e.g., Tata LP 1618"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-year">Year *</Label>
                <Input
                  id="edit-year"
                  type="number"
                  value={editingVehicle.year}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, year: parseInt(e.target.value) || 0 })}
                  placeholder="2024"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-driverName">Assigned Driver</Label>
                <Input
                  id="edit-driverName"
                  value={editingVehicle.driverName || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, driverName: e.target.value })}
                  placeholder="Driver name"
                />
              </div>
              <div>
                <Label htmlFor="edit-route">Route</Label>
                <Input
                  id="edit-route"
                  value={editingVehicle.route || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, route: e.target.value })}
                  placeholder="e.g., Colombo - Kandy"
                />
              </div>
              <div>
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editingVehicle.status}
                  onValueChange={(value: Vehicle["status"]) => setEditingVehicle({ ...editingVehicle, status: value })}
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleUpdateVehicle} className="flex-1" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Vehicle"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditVehicle(false)
                    setEditingVehicle(null)
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Vehicle</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{vehicleToDelete?.busNumberPlate || vehicleToDelete?.busNumber || vehicleToDelete?.documentId || vehicleToDelete?.id}</strong>? This action cannot be undone.
              {vehicleToDelete?.status === "active" && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: This vehicle is currently active. Make sure to update its status first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteVehicle}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Vehicle"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
