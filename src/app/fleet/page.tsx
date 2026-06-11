"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

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
import type { Route as RouteType } from "@/lib/route-types"

import {
  Bus,
  MapPin,
  FileText,
  Loader2,
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
  Shield,
} from "lucide-react"
import type { Vehicle } from "@/lib/fleet-types"

import { useToast } from "@/hooks/use-toast"
import { FleetMap } from "@/components/fleet-map"
import { useLanguage } from "@/components/language-provider"

export default function FleetManagement() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showAddVehicle, setShowAddVehicle] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null)
  const [showEditVehicle, setShowEditVehicle] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [vehicleToDelete, setVehicleToDelete] = useState<Vehicle | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [routes, setRoutes] = useState<RouteType[]>([])
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set())
  const { toast } = useToast()
  const { t } = useLanguage()
  const [newVehicle, setNewVehicle] = useState({
    busNumberPlate: "",
    documentId: "",
    deviceId: "",
    busNumber: "",
    model: "",
    year: "",
    driverName: "",
    route: "",
    routeId: "",
    locationDepot: "",
  })

  // Fetch vehicles
  const fetchVehicles = async (silent = false) => {
    try {
      if (!silent) setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
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

  useEffect(() => {
    fetchVehicles()
    fetchRoutes()
  }, [])

  const fetchRoutes = async () => {
    try {
      const response = await fetch("/api/routes")
      if (!response.ok) throw new Error("Failed to fetch routes")
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error("Error fetching routes:", error)
    }
  }

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVehicles(true)
    }, 300)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success"
      case "inactive":
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
      (vehicle.driverName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (vehicle.route || "").toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter
    return matchesSearch && matchesStatus
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
          routeId: newVehicle.routeId?.trim() || undefined,
          locationDepot: newVehicle.locationDepot?.trim() || undefined,
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
        title: t("success"),
        description: t("vehicle_added"),
      })

      setNewVehicle({ busNumberPlate: "", documentId: "", deviceId: "", busNumber: "", model: "", year: "", driverName: "", route: "", routeId: "", locationDepot: "" })
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

  const updateVehicleStatus = async (vehicleId: string, newStatus: string) => {
    try {
      setUpdatingStatusIds(prev => new Set(prev).add(vehicleId))
      setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, status: newStatus as any } : v))

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
        description: `Vehicle status updated to ${newStatus}.`,
      })

      await fetchVehicles(true)
    } catch (error: any) {
      console.error("Error updating vehicle status:", error)
      fetchVehicles(true)
      
      toast({
        title: "Error",
        description: error?.message || "Failed to update vehicle status. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdatingStatusIds(prev => {
        const next = new Set(prev)
        next.delete(vehicleId)
        return next
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
          routeId: editingVehicle.routeId?.trim() || undefined,
          locationDepot: editingVehicle.locationDepot?.trim() || undefined,
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
        title: t("success"),
        description: t("vehicle_updated"),
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
        title: t("success"),
        description: t("vehicle_deleted"),
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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">{t("fleet_management_system")}</h1>
          <p className="text-muted-foreground">{t("fleet_desc")}</p>
        </div>
        <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add New Bus
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4">
              <DialogTitle>{t("add_new_vehicle")}</DialogTitle>
              <DialogDescription>{t("add_vehicle_desc")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <Label htmlFor="busNumberPlate">
                  {t("bus_number_plate")} <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="busNumberPlate"
                  value={newVehicle.busNumberPlate}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase()
                    if (value && !value.startsWith("NB-")) {
                      if (/^\d+$/.test(value.replace("NB-", ""))) {
                        value = "NB-" + value.replace("NB-", "")
                      }
                    }
                    if (value.length > 7) value = value.substring(0, 7)
                    setNewVehicle({ ...newVehicle, busNumberPlate: value })
                  }}
                  placeholder="NB-4565"
                  required
                  maxLength={7}
                />
                <p className="text-xs text-muted-foreground mt-1">Format: NB-XXXX (e.g., NB-4565)</p>
              </div>
              <div>
                <Label htmlFor="deviceId">{t("device_id")}</Label>
                <Input
                  id="deviceId"
                  value={newVehicle.deviceId}
                  onChange={(e) => setNewVehicle({ ...newVehicle, deviceId: e.target.value.toUpperCase() })}
                  placeholder="e.g., DEV-001"
                />
                <p className="text-xs text-muted-foreground mt-1">GPS/Tracking device ID (optional)</p>
              </div>
              <div>
                <Label htmlFor="model">{t("vehicle_model")}</Label>
                <Input
                  id="model"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  placeholder="e.g., Tata LP 1618"
                />
              </div>
              <div>
                <Label htmlFor="year">{t("year")}</Label>
                <Input
                  id="year"
                  type="number"
                  value={newVehicle.year}
                  onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })}
                  placeholder="2024"
                />
              </div>

              <div>
                <Label htmlFor="route">{t("route_label")}</Label>
                <Select
                  value={newVehicle.routeId}
                  onValueChange={(value) => {
                    const selectedRoute = routes.find((r) => r.id === value)
                    setNewVehicle({
                      ...newVehicle,
                      routeId: value,
                      route: selectedRoute ? selectedRoute.name : "",
                    })
                  }}
                >
                  <SelectTrigger id="route">
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} {route.startPoint && route.endPoint ? `(${route.startPoint.replace(/ Bus Stop/i, "")} to ${route.endPoint.replace(/ Bus Stop/i, "")})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="locationDepot">Location (Depot)</Label>
                <Input
                  id="locationDepot"
                  value={newVehicle.locationDepot || ""}
                  onChange={(e) => setNewVehicle({ ...newVehicle, locationDepot: e.target.value })}
                  placeholder="e.g., Colombo"
                />
              </div>
              <Button onClick={addVehicle} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("loading")}
                  </>
                ) : (
                  "Add New Bus"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Fleet Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_vehicles")}</CardTitle>
            <Bus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("active")}</CardTitle>
            <Bus className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {vehicles.filter((v) => v.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("inactive")}</CardTitle>
            <Bus className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {vehicles.filter((v) => v.status === "inactive").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{t("fleet_overview")}</CardTitle>
                <CardDescription>{t("fleet_overview_desc")}</CardDescription>
              </div>
            </div>
          </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground/60 h-4 w-4" />
                    <Input
                      placeholder={t("search_fleet")}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder={t("status")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("all_status")}</SelectItem>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Vehicle Grid */}
              {loading ? (
                <div className="p-12 text-center">
                  <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{t("loading")}</h3>
                  <p className="text-muted-foreground">{t("wait_fetching")}</p>
                </div>
              ) : filteredVehicles.length === 0 ? (
                <div className="p-12 text-center">
                  <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">{t("no_vehicles_found")}</h3>
                  <p className="text-muted-foreground">{searchTerm || statusFilter !== "all" ? t("no_vehicles_match") : t("get_started_vehicle")}</p>
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
                                    <span className="flex items-center gap-1 text-primary">
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
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Driver and Route Info */}
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span>{vehicle.driverName || t("no_driver_assigned")}</span>
                            </div>
                            <div className="flex items-start gap-2">
                              <Route className="h-4 w-4 text-muted-foreground mt-0.5" />
                              <div className="flex flex-col min-w-0">
                                <span className="truncate">{vehicle.route || t("no_route_assigned")}</span>
                                {vehicle.route && (() => {
                                  const r = routes.find(rt => 
                                    (vehicle.routeId && rt.id === vehicle.routeId) || 
                                    (!vehicle.routeId && rt.name === vehicle.route)
                                  );
                                  if (r && r.startPoint && r.endPoint) {
                                    return (
                                      <span className="text-xs text-muted-foreground truncate mt-0.5">
                                        {r.startPoint.replace(/ Bus Stop/i, "")} to {r.endPoint.replace(/ Bus Stop/i, "")}
                                      </span>
                                    );
                                  }
                                  return null;
                                })()}
                              </div>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{vehicle.locationDepot ? `${vehicle.locationDepot} Depot` : (vehicle.location?.address || "Colombo Depot")}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2 flex-wrap items-center">
                            <Button size="sm" variant="outline" onClick={() => setSelectedVehicle(vehicle)} className="flex-shrink-0">
                              <Eye className="h-4 w-4 mr-1" />
                              {t("details")}
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleEditVehicle(vehicle)} className="flex-shrink-0">
                              <Edit className="h-4 w-4 mr-1" />
                              {t("edit")}
                            </Button>
                            <Select
                               value={vehicle.status}
                               disabled={updatingStatusIds.has(vehicle.id)}
                               onValueChange={(value) => {
                                 if (vehicle.id) {
                                   updateVehicleStatus(vehicle.id, value)
                                 }
                               }}
                             >
                               <SelectTrigger className={`h-8 text-xs w-[120px] flex-shrink-0 ${updatingStatusIds.has(vehicle.id) ? "opacity-50 cursor-not-allowed" : ""}`}>
                                 <div className="flex items-center gap-2">
                                   {updatingStatusIds.has(vehicle.id) ? (
                                     <Loader2 className="h-3 w-3 animate-spin" />
                                   ) : (
                                     <div className={`h-2 w-2 rounded-full ${vehicle.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                                   )}
                                   <SelectValue />
                                 </div>
                               </SelectTrigger>
                               <SelectContent>
                                 <SelectItem value="active">
                                   <div className="flex items-center gap-2">
                                     <div className="h-2 w-2 rounded-full bg-green-500" />
                                     {t("active")}
                                   </div>
                                 </SelectItem>
                                 <SelectItem value="inactive">
                                   <div className="flex items-center gap-2">
                                     <div className="h-2 w-2 rounded-full bg-gray-400" />
                                     {t("inactive")}
                                   </div>
                                 </SelectItem>
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
                              {t("delete")}
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
      </div>

      {/* Vehicle Details Modal */}
      {selectedVehicle && (
        <Dialog open={!!selectedVehicle} onOpenChange={() => setSelectedVehicle(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedVehicle.busNumberPlate || selectedVehicle.busNumber || "N/A"} - Detailed Information</DialogTitle>
              <DialogDescription>
                {selectedVehicle.model} ({selectedVehicle.year})
              </DialogDescription>
            </DialogHeader>
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
                  Bus Number Plate <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-busNumberPlate"
                  value={editingVehicle.busNumberPlate || ""}
                  onChange={(e) => {
                    let value = e.target.value.toUpperCase()
                    if (value && !value.startsWith("NB-")) {
                      if (/^\d+$/.test(value.replace("NB-", ""))) {
                        value = "NB-" + value.replace("NB-", "")
                      }
                    }
                    if (value.length > 7) value = value.substring(0, 7)
                    setEditingVehicle({ ...editingVehicle, busNumberPlate: value })
                  }}
                  placeholder="NB-4565"
                  required
                  maxLength={7}
                />
                <p className="text-xs text-muted-foreground mt-1">Format: NB-XXXX (e.g., NB-4565)</p>
              </div>
              <div>
                <Label htmlFor="edit-deviceId">Device ID</Label>
                <Input
                  id="edit-deviceId"
                  value={editingVehicle.deviceId || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, deviceId: e.target.value.toUpperCase() })}
                  placeholder="e.g., DEV-001"
                />
                <p className="text-xs text-muted-foreground mt-1">GPS/Tracking device ID (optional)</p>
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
                <Label htmlFor="edit-route">Route</Label>
                <Select
                  value={editingVehicle.routeId}
                  onValueChange={(value) => {
                    const selectedRoute = routes.find((r) => r.id === value)
                    setEditingVehicle({
                      ...editingVehicle,
                      routeId: value,
                      route: selectedRoute ? selectedRoute.name : "",
                    })
                  }}
                >
                  <SelectTrigger id="edit-route">
                    <SelectValue placeholder="Select a route" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {routes.map((route) => (
                      <SelectItem key={route.id} value={route.id}>
                        {route.name} {route.startPoint && route.endPoint ? `(${route.startPoint.replace(/ Bus Stop/i, "")} to ${route.endPoint.replace(/ Bus Stop/i, "")})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="edit-locationDepot">Location (Depot)</Label>
                <Input
                  id="edit-locationDepot"
                  value={editingVehicle.locationDepot || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, locationDepot: e.target.value })}
                  placeholder="e.g., Colombo Depot"
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
