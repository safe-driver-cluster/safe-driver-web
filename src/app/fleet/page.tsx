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

import {
  Bus,
  MapPin,


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


  FileText,
  Loader2,
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
    driver: "",
  })



  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      setLoading(true)
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
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchVehicles()
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
      (vehicle.driverName || vehicle.driver || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">{t("fleet_management_system")}</h1>
        <p className="text-neutral-600">{t("fleet_desc")}</p>
      </div>

      {/* Fleet Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_vehicles")}</CardTitle>
            <Bus className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              {vehicles.filter((v) => v.status === "active").length} {t("active")}
            </p>
            {loading && <p className="text-xs text-gray-400 mt-1">Loading...</p>}
          </CardContent>
        </Card>





        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("safety_score")}</CardTitle>
            <Shield className="h-4 w-4 text-safety-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-safety-600">
              {vehicles.length > 0 ? Math.round(vehicles.reduce((acc, v) => acc + v.safetyScore, 0) / vehicles.length) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">{t("fleet_average")}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vehicles" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles">{t("vehicle_fleet")}</TabsTrigger>
          <TabsTrigger value="tracking">{t("live_tracking")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("fleet_analytics")}</TabsTrigger>
        </TabsList>

        {/* Vehicle Fleet Tab */}
        <TabsContent value="vehicles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>{t("fleet_overview")}</CardTitle>
                  <CardDescription>{t("fleet_overview_desc")}</CardDescription>
                </div>
                <Dialog open={showAddVehicle} onOpenChange={setShowAddVehicle}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("add_vehicle")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{t("add_new_vehicle")}</DialogTitle>
                      <DialogDescription>{t("add_vehicle_desc")}</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="busNumberPlate">
                          {t("bus_number_plate")} <span className="text-red-500">*</span>
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
                        <Label htmlFor="deviceId">{t("device_id")}</Label>
                        <Input
                          id="deviceId"
                          value={newVehicle.deviceId}
                          onChange={(e) => setNewVehicle({ ...newVehicle, deviceId: e.target.value.toUpperCase() })}
                          placeholder="e.g., DEV-001"
                        />
                        <p className="text-xs text-gray-500 mt-1">GPS/Tracking device ID (optional)</p>
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
                        <Label htmlFor="driver">{t("assigned_driver")}</Label>
                        <Input
                          id="driver"
                          value={newVehicle.driverName}
                          onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                          placeholder="Driver name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="route">{t("route_label")}</Label>
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
                            {t("loading")}
                          </>
                        ) : (
                          t("add_vehicle")
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
                              <span>{vehicle.driverName || (vehicle as any).driver || t("no_driver_assigned")}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Route className="h-4 w-4 text-muted-foreground" />
                              <span>{vehicle.route || t("no_route_assigned")}</span>
                            </div>
                          </div>

                          {/* Location */}
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{vehicle.location.address}</span>
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
                                <SelectItem value="active">{t("active")}</SelectItem>

                                <SelectItem value="inactive">{t("inactive")}</SelectItem>
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
        </TabsContent>

        {/* Live Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("real_time_tracking")}</CardTitle>
              <CardDescription>{t("real_time_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Interactive Map */}
              <div className="mb-6">
                <FleetMap
                  vehicles={vehicles.filter((v) => v.status === "active")}
                  selectedVehicle={selectedVehicle}
                  onVehicleClick={setSelectedVehicle}
                />
              </div>

              {/* Vehicle Status List */}
              <div className="space-y-3">
                <h4 className="font-semibold">{t("active_vehicles_title")}</h4>
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
                          <p className="text-gray-500">{t("speed")}</p>
                          <p className="font-medium">{Math.round(vehicle.speed)} km/h</p>
                        </div>
                        <div className="text-center">
                          <p className="text-gray-500">{t("driver")}</p>
                          <p className="font-medium">{vehicle.driverName || t("no_driver")}</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedVehicle(vehicle)}
                        >
                          <Navigation className="h-4 w-4 mr-1" />
                          {t("track")}
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
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("fleet_performance")}</CardTitle>
                <CardDescription>{t("kpi")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">


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


          </div>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Status Distribution</CardTitle>
              <CardDescription>Current status of all vehicles in the fleet</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{Math.round(selectedVehicle.speed)}</div>
                  <div className="text-sm text-gray-600">Speed (km/h)</div>
                </div>


                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedVehicle.safetyScore}%</div>
                  <div className="text-sm text-gray-600">Safety Score</div>
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
                  Bus Number Plate <span className="text-red-500">*</span>
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
              {/* <div>
                <Label htmlFor="edit-documentId">Document ID (Number Plate)</Label>
                <Input
                  id="edit-documentId"
                  value={editingVehicle.documentId || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, documentId: e.target.value.toUpperCase() })}
                  placeholder="e.g., ABC-1234"
                />
                <p className="text-xs text-gray-500 mt-1">Vehicle registration number / Number plate</p>
              </div> */}
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
              {/* <div>
                <Label htmlFor="edit-busNumber">Bus Number</Label>
                <Input
                  id="edit-busNumber"
                  value={editingVehicle.busNumber || ""}
                  onChange={(e) => setEditingVehicle({ ...editingVehicle, busNumber: e.target.value })}
                  placeholder="e.g., NB-1234"
                />
              </div> */}
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
