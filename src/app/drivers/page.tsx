"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Phone, Mail, Activity, Plus, Search, Eye, Trash2, Loader2, Edit, MoreHorizontal, Bus, ChevronDown } from "lucide-react"
import type { Driver } from "@/lib/driver-types"
import type { Vehicle } from "@/lib/fleet-types"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { useLiveAlerts, isToday } from "@/hooks/use-live-alerts"
import { useMemo } from "react"

export default function DriversPage() {
  const { t } = useLanguage()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loadingVehicles, setLoadingVehicles] = useState(true)

  const fetchVehicles = async () => {
    try {
      setLoadingVehicles(true)
      const response = await fetch("/api/fleet")
      if (!response.ok) throw new Error("Failed to fetch vehicles")
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    } finally {
      setLoadingVehicles(false)
    }
  }
  
  // Real-time alerts integration
  const { alerts: liveAlerts } = useLiveAlerts()
  
  // Calculate real-time alert counts for each driver
  const driversWithAlertCounts = useMemo(() => {
    // Include active/acknowledged alerts (unresolved risks) and today's alerts
    const activeOrTodayAlerts = liveAlerts.filter(alert => 
      alert.status === "active" || alert.status === "acknowledged" || isToday(alert.timestamp)
    )
    
    return drivers.map(driver => {
      const count = activeOrTodayAlerts.filter(alert => 
        (alert.driverId && alert.driverId === driver.id) ||
        (alert.driverName && alert.driverName.toLowerCase().trim() === driver.name.toLowerCase().trim())
      ).length
      
      return { ...driver, alertCount: count }
    })
  }, [drivers, liveAlerts])

  const [stats, setStats] = useState({
    total: 0,
    onDuty: 0,
    offDuty: 0,
    suspended: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()
  const [newDriver, setNewDriver] = useState({
    name: "",
    licenseNumber: "",
    phone: "",
    email: "",
    busNumber: "",
    address: "",
    experience: "",
  })

  // Calculate stats from drivers data (client-side to avoid extra API call)
  const calculateStats = (driversData: Driver[]) => {
    return {
      total: driversData.length,
      onDuty: driversData.filter((d) => d.status === "on_duty").length,
      offDuty: driversData.filter((d) => d.status === "off_duty").length,
      suspended: driversData.filter((d) => d.status === "suspended").length,
    }
  }

  // Fetch drivers with timeout and optimizations
  const fetchDrivers = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }
      // Add limit to improve performance
      params.append("limit", "100")

      // Reduced timeout for faster feedback
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

      try {
        const startTime = Date.now()
        const response = await fetch(`/api/drivers?${params.toString()}`, {
          signal: controller.signal,
          cache: "no-store", // Ensure fresh data
        })
        clearTimeout(timeoutId)

        const fetchTime = Date.now() - startTime
        console.log(`Drivers fetched in ${fetchTime}ms`)

        if (!response.ok) throw new Error("Failed to fetch drivers")
        const data = await response.json()

        // Update state immediately
        setDrivers(data)
        // Calculate stats from fetched drivers (much faster than separate API call)
        setStats(calculateStats(data))
      } catch (fetchError: any) {
        clearTimeout(timeoutId)
        if (fetchError.name === "AbortError") {
          throw new Error("Request timeout: The server took too long to respond. Please check your connection.")
        }
        throw fetchError
      }
    } catch (error) {
      console.error("Error fetching drivers:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to load drivers"

      // Check if it's a Firebase configuration error
      if (errorMessage.includes("Firebase not configured") || errorMessage.includes("503")) {
        toast({
          title: "Firebase Not Configured",
          description: "Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md for instructions.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to load drivers. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial load
    fetchDrivers()
    fetchVehicles()
  }, [])

  // Refetch when filters change with debounce
  useEffect(() => {
    // Skip if this is the initial mount (already handled above)
    const timeoutId = setTimeout(() => {
      fetchDrivers()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter])

  // Filter is now handled server-side, but we can do client-side filtering for instant feedback
  const filteredDrivers = drivers

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_duty":
        return "success"
      case "off_duty":
        return "secondary"
      case "suspended":
        return "destructive"
      default:
        return "secondary"
    }
  }


  const handleAddDriver = async () => {
    if (!newDriver.name || !newDriver.licenseNumber || !newDriver.phone || !newDriver.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, License, Phone, Email).",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newDriver),
      })

      if (!response.ok) {
        let error
        try {
          error = await response.json()
        } catch (e) {
          // If response is not JSON, it might be a network error
          throw new Error("Network error: Unable to reach the server. Please check your connection and ensure the dev server is running.")
        }

        const errorMessage = error.error || error.message || "Failed to create driver"

        // Check if it's an offline error from service worker (must check this first)
        // Service worker returns 503 with { error: "Offline", offline: true } when server is unreachable
        const isOfflineError = error.offline === true || errorMessage === "Offline" || response.headers.get("X-Offline") === "true"

        if (response.status === 503 && isOfflineError) {
          throw new Error("CONNECTION_ERROR: Unable to reach the server. Please ensure the development server is running (npm run dev) and Firebase emulators are running (npm run firebase:emulators).")
        }

        // Also check for offline flag or "Offline" message regardless of status
        if (isOfflineError) {
          throw new Error("CONNECTION_ERROR: Unable to reach the server. Please ensure the development server is running (npm run dev) and Firebase emulators are running (npm run firebase:emulators).")
        }

        // Check if it's a Firebase configuration error (but not an offline error)
        if (errorMessage.includes("Firebase not configured") || errorMessage.includes("Firebase initialization failed")) {
          throw new Error("Firebase not configured. Please set up Firebase by creating .env.local file. See SETUP_GUIDE.md")
        }

        // Check for connection errors
        if (errorMessage.includes("Cannot connect to Firebase") || errorMessage.includes("ECONNREFUSED")) {
          throw new Error("Cannot connect to Firebase. Please ensure Firebase emulators are running: npm run firebase:emulators")
        }

        throw new Error(errorMessage)
      }

      const driver = await response.json()
      toast({
        title: "Success",
        description: `Driver ${driver.name} has been added successfully.`,
      })

      setNewDriver({
        name: "",
        licenseNumber: "",
        phone: "",
        email: "",
        busNumber: "",
        address: "",
        experience: "",
      })
      setIsAddDialogOpen(false)

      // Small delay to ensure Firestore write completes before fetching
      setTimeout(() => {
        fetchDrivers()
      }, 500)
    } catch (error: any) {
      console.error("Error creating driver:", error)
      const errorMessage = error?.message || error?.toString() || "Failed to create driver"

      // Check if it's a connection error (marked with CONNECTION_ERROR prefix or contains connection/offline keywords)
      if (
        errorMessage.startsWith("CONNECTION_ERROR:") ||
        errorMessage.includes("Connection issue") ||
        errorMessage.includes("Unable to reach the server") ||
        (errorMessage === "Offline" || (errorMessage.includes("Offline") && !errorMessage.includes("Connection")))
      ) {
        // Extract the message after CONNECTION_ERROR: or use a default message
        const description = errorMessage.startsWith("CONNECTION_ERROR:")
          ? errorMessage.replace("CONNECTION_ERROR:", "").trim()
          : "Unable to reach the server. Please ensure the development server is running (npm run dev) and Firebase emulators are running (npm run firebase:emulators)."

        toast({
          title: "Connection Error",
          description: description,
          variant: "destructive",
          duration: 10000,
        })
      }
      // Check if it's a fetch/network failure (fetch throws TypeError when network fails)
      else if (
        errorMessage === "Failed to fetch" ||
        errorMessage.includes("Failed to fetch") ||
        errorMessage.includes("NetworkError") ||
        errorMessage.includes("Network request failed") ||
        error?.name === "TypeError"
      ) {
        toast({
          title: "Connection Error",
          description: "Unable to reach the server. Please ensure the development server is running (npm run dev) and Firebase emulators are running (npm run firebase:emulators).",
          variant: "destructive",
          duration: 10000,
        })
      } else if (errorMessage.includes("Firebase not configured") || errorMessage.includes("Firebase initialization failed")) {
        toast({
          title: "Configuration Error",
          description: errorMessage,
          variant: "destructive",
          duration: 10000, // Show longer for important errors
        })
      } else if (errorMessage.includes("Cannot connect to Firebase") || errorMessage.includes("ECONNREFUSED")) {
        toast({
          title: "Firebase Connection Error",
          description: errorMessage,
          variant: "destructive",
          duration: 8000,
        })
      } else if (errorMessage.includes("Network error")) {
        toast({
          title: "Network Error",
          description: errorMessage,
          variant: "destructive",
          duration: 8000,
        })
      } else {
        toast({
          title: "Error",
          description: errorMessage || "Failed to create driver. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleContactDriver = (driver: any) => {
    alert(`Calling ${driver.name} at ${driver.phone}...`)
  }

  const handleToggleStatus = async (driverId: string) => {
    try {
      const driver = drivers.find((d) => d.id === driverId)
      if (!driver) return

      const newStatus = driver.status === "on_duty" ? "off_duty" : "on_duty"
      const response = await fetch(`/api/drivers/${driverId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: "Success",
        description: `Driver status updated to ${newStatus.replace("_", " ")}.`,
      })

      fetchDrivers()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update driver status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateDriverStatus = async (driverId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) throw new Error("Failed to update status")

      toast({
        title: "Success",
        description: `Driver status updated to ${newStatus.replace("_", " ")}.`,
      })

      fetchDrivers()
    } catch (error) {
      console.error("Error updating status:", error)
      toast({
        title: "Error",
        description: "Failed to update driver status. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver)
    setIsEditDialogOpen(true)
  }

  const handleUpdateDriver = async () => {
    if (!editingDriver) return

    if (!editingDriver.name || !editingDriver.licenseNumber || !editingDriver.phone || !editingDriver.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields (Name, License, Phone, Email).",
        variant: "destructive",
      })
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/drivers/${editingDriver.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editingDriver.name,
          licenseNumber: editingDriver.licenseNumber,
          phone: editingDriver.phone,
          email: editingDriver.email,
          busNumber: editingDriver.busNumber || "",
          address: editingDriver.address || "",
          experience: editingDriver.experience || "",
          status: editingDriver.status,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update driver")
      }

      toast({
        title: "Success",
        description: `Driver ${editingDriver.name} has been updated successfully.`,
      })

      setIsEditDialogOpen(false)
      setEditingDriver(null)
      fetchDrivers()
    } catch (error: any) {
      console.error("Error updating driver:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to update driver. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteClick = (driver: Driver) => {
    setDriverToDelete(driver)
    setDeleteDialogOpen(true)
  }

  const handleDeleteDriver = async () => {
    if (!driverToDelete) return

    try {
      setIsDeleting(true)
      const response = await fetch(`/api/drivers/${driverToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.message || errorData.error || "Failed to delete driver"
        throw new Error(errorMessage)
      }

      toast({
        title: "Success",
        description: `Driver ${driverToDelete.name} has been removed successfully.`,
      })

      setDeleteDialogOpen(false)
      setDriverToDelete(null)
      fetchDrivers()
    } catch (error: any) {
      console.error("Error deleting driver:", error)
      toast({
        title: "Error",
        description: error?.message || "Failed to delete driver. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t("driver_management")}</h1>
          <p className="text-muted-foreground mt-2">{t("driver_management_desc")}</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("add_new_driver")}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader className="flex-shrink-0 pb-4">
              <DialogTitle>Add New Driver</DialogTitle>
              <DialogDescription>Enter driver information to add them to the system</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 overflow-y-auto flex-1 pr-2">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <Label htmlFor="license">License Number</Label>
                <Input
                  id="license"
                  value={newDriver.licenseNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, licenseNumber: e.target.value })}
                  placeholder="B1234567"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={newDriver.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/[^\d\s+]/g, "")
                    setNewDriver({ ...newDriver, phone: val })
                  }}
                  placeholder="+94 77 123 4567"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDriver.email}
                  onChange={(e) => setNewDriver({ ...newDriver, email: e.target.value })}
                  placeholder="driver@email.com"
                />
              </div>
              <div>
                <Label htmlFor="bus">Bus Number(s)</Label>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-between font-normal text-left h-auto min-h-[40px] py-2 px-3">
                      <span className="truncate max-w-[90%] whitespace-normal">
                        {newDriver.busNumber
                          ? newDriver.busNumber
                              .split(",")
                              .map((plate) => {
                                const v = vehicles.find((veh) => veh.busNumberPlate === plate)
                                return v ? `${plate}${v.busNumber ? ` (${v.busNumber})` : ""}` : plate
                              })
                              .join(", ")
                          : "Select registered buses"}
                      </span>
                      <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[350px] max-h-[300px] overflow-y-auto">
                    <DropdownMenuLabel>Select Buses</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                      checked={!newDriver.busNumber}
                      onCheckedChange={() => setNewDriver({ ...newDriver, busNumber: "" })}
                    >
                      Unassigned
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    {vehicles.map((v) => {
                      const plate = v.busNumberPlate || ""
                      const assignedBuses = newDriver.busNumber ? newDriver.busNumber.split(",") : []
                      const isChecked = assignedBuses.includes(plate)
                      return (
                        <DropdownMenuCheckboxItem
                          key={v.id}
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            let updatedBuses
                            if (checked) {
                              updatedBuses = [...assignedBuses, plate]
                            } else {
                              updatedBuses = assignedBuses.filter((b) => b !== plate)
                            }
                            const uniqueBuses = Array.from(new Set(updatedBuses)).filter(Boolean)
                            setNewDriver({ ...newDriver, busNumber: uniqueBuses.join(",") })
                          }}
                        >
                          {v.busNumberPlate || "Unknown"} {v.busNumber ? `(${v.busNumber})` : ""}
                        </DropdownMenuCheckboxItem>
                      )
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div>
                <Label htmlFor="experience">Experience</Label>
                <Input
                  id="experience"
                  value={newDriver.experience}
                  onChange={(e) => setNewDriver({ ...newDriver, experience: e.target.value })}
                  placeholder="5 years"
                />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={newDriver.address}
                  onChange={(e) => setNewDriver({ ...newDriver, address: e.target.value })}
                  placeholder="Enter address"
                  spellCheck={false}
                />
              </div>
              <Button onClick={handleAddDriver} className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Driver"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Drivers Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_drivers")}</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("on_duty")}</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.onDuty}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("off_duty")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{stats.offDuty}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("suspended")}</CardTitle>
            <Users className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.suspended}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      < Card >
        <CardHeader>
          <CardTitle>Filter Drivers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search_drivers")}
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
                <SelectItem value="on_duty">{t("on_duty")}</SelectItem>
                <SelectItem value="off_duty">{t("off_duty")}</SelectItem>
                <SelectItem value="suspended">{t("suspended")}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card >

      {/* Drivers List */}
      {loading && drivers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-foreground mb-2">Loading drivers...</h3>
            <p className="text-muted-foreground">Please wait while we fetch driver data.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredDrivers.map((driver) => (
            <Card key={driver.id || `driver-${driver.licenseNumber}`} className="hover:shadow-lg transition-shadow overflow-visible">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{driver.name}</CardTitle>
                    <CardDescription className="flex flex-col gap-1">
                      <span className="flex items-center gap-1">
                        License: {driver.licenseNumber}
                      </span>
                      {driver.experience && (
                        <span>
                          Experience: {driver.experience}
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={getStatusColor(driver.status)}>
                      {driver.status === 'on_duty' ? t('on_duty') :
                       driver.status === 'off_duty' ? t('off_duty') :
                       driver.status === 'suspended' ? t('suspended') : 'UNKNOWN'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Bus assigned info */}
                  <div className="text-sm">
                    <div className="flex items-center gap-2">
                      <Bus className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate" title={(() => {
                        if (!driver.busNumber) return "No Bus Assigned"
                        return driver.busNumber.split(",").map((busPlate) => {
                          const v = vehicles.find((veh) => veh.busNumberPlate === busPlate)
                          return v ? `${v.busNumberPlate}${v.busNumber ? ` (${v.busNumber})` : ""}` : busPlate
                        }).join(", ")
                      })()}>
                        {(() => {
                          if (!driver.busNumber) return "No Bus Assigned"
                          return driver.busNumber.split(",").map((busPlate) => {
                            const v = vehicles.find((veh) => veh.busNumberPlate === busPlate)
                            return v ? `${v.busNumberPlate}${v.busNumber ? ` (${v.busNumber})` : ""}` : busPlate
                          }).join(", ")
                        })()}
                      </span>
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer" onClick={() => handleContactDriver(driver)}>
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-primary transition-colors">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="truncate">{driver.email}</span>
                    </div>
                  </div>

                  {/* Footer buttons */}
                  <div className="flex gap-2 pt-2 flex-wrap items-center">
                    <Button size="sm" variant="outline" onClick={() => setSelectedDriver(driver)} className="flex-shrink-0">
                      <Eye className="h-4 w-4 mr-1" />
                      {t("details")}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditDriver(driver)} className="flex-shrink-0">
                      <Edit className="h-4 w-4 mr-1" />
                      {t("edit")}
                    </Button>
                    <Select
                       value={driver.status}
                       onValueChange={(value: Driver["status"]) => {
                         if (driver.id) {
                           updateDriverStatus(driver.id, value)
                         }
                       }}
                     >
                       <SelectTrigger className="h-8 text-xs w-[120px] flex-shrink-0">
                         <div className="flex items-center gap-2">
                           <div className={`h-2 w-2 rounded-full ${
                             driver.status === 'on_duty' ? 'bg-green-500' :
                             driver.status === 'suspended' ? 'bg-red-500' : 'bg-gray-400'
                           }`} />
                           <SelectValue />
                         </div>
                       </SelectTrigger>
                       <SelectContent>
                         <SelectItem value="on_duty">
                           <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-green-500" />
                             {t("on_duty")}
                           </div>
                         </SelectItem>
                         <SelectItem value="off_duty">
                           <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-gray-400" />
                             {t("off_duty")}
                           </div>
                         </SelectItem>
                         <SelectItem value="suspended">
                           <div className="flex items-center gap-2">
                             <div className="h-2 w-2 rounded-full bg-red-500" />
                             {t("suspended")}
                           </div>
                         </SelectItem>
                       </SelectContent>
                     </Select>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteClick(driver)}
                      disabled={!driver.id}
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

      {/* Edit Driver Dialog */}
      {
        editingDriver && (
          <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
            setIsEditDialogOpen(open)
            if (!open) setEditingDriver(null)
          }}>
            <DialogContent className="max-w-md max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 pb-4">
                <DialogTitle>Edit Driver - {editingDriver.name}</DialogTitle>
                <DialogDescription>Update driver information</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-1 pr-2">
                <div>
                  <Label htmlFor="edit-name">Full Name *</Label>
                  <Input
                    id="edit-name"
                    value={editingDriver.name}
                    onChange={(e) => setEditingDriver({ ...editingDriver, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-license">License Number *</Label>
                  <Input
                    id="edit-license"
                    value={editingDriver.licenseNumber}
                    onChange={(e) => setEditingDriver({ ...editingDriver, licenseNumber: e.target.value })}
                    placeholder="B1234567"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-phone">Phone Number *</Label>
                  <Input
                    id="edit-phone"
                    value={editingDriver.phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/[^\d\s+]/g, "")
                      setEditingDriver({ ...editingDriver, phone: val })
                    }}
                    placeholder="+94 77 123 4567"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-email">Email *</Label>
                  <Input
                    id="edit-email"
                    type="email"
                    value={editingDriver.email}
                    onChange={(e) => setEditingDriver({ ...editingDriver, email: e.target.value })}
                    placeholder="driver@email.com"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-bus">Bus Number(s)</Label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="w-full justify-between font-normal text-left h-auto min-h-[40px] py-2 px-3">
                        <span className="truncate max-w-[90%] whitespace-normal">
                          {editingDriver.busNumber
                            ? editingDriver.busNumber
                                .split(",")
                                .map((plate) => {
                                  const v = vehicles.find((veh) => veh.busNumberPlate === plate)
                                  return v ? `${plate}${v.busNumber ? ` (${v.busNumber})` : ""}` : plate
                                })
                                .join(", ")
                            : "Select registered buses"}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50 flex-shrink-0" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[350px] max-h-[300px] overflow-y-auto">
                      <DropdownMenuLabel>Select Buses</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={!editingDriver.busNumber}
                        onCheckedChange={() => setEditingDriver({ ...editingDriver, busNumber: "" })}
                      >
                        Unassigned
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {vehicles.map((v) => {
                        const plate = v.busNumberPlate || ""
                        const assignedBuses = editingDriver.busNumber ? editingDriver.busNumber.split(",") : []
                        const isChecked = assignedBuses.includes(plate)
                        return (
                          <DropdownMenuCheckboxItem
                            key={v.id}
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              let updatedBuses
                              if (checked) {
                                updatedBuses = [...assignedBuses, plate]
                              } else {
                                updatedBuses = assignedBuses.filter((b) => b !== plate)
                              }
                              const uniqueBuses = Array.from(new Set(updatedBuses)).filter(Boolean)
                              setEditingDriver({ ...editingDriver, busNumber: uniqueBuses.join(",") })
                            }}
                          >
                            {v.busNumberPlate || "Unknown"} {v.busNumber ? `(${v.busNumber})` : ""}
                          </DropdownMenuCheckboxItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <div>
                  <Label htmlFor="edit-experience">Experience</Label>
                  <Input
                    id="edit-experience"
                    value={editingDriver.experience || ""}
                    onChange={(e) => setEditingDriver({ ...editingDriver, experience: e.target.value })}
                    placeholder="5 years"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-address">Address</Label>
                  <Textarea
                    id="edit-address"
                    value={editingDriver.address || ""}
                    onChange={(e) => setEditingDriver({ ...editingDriver, address: e.target.value })}
                    placeholder="Enter address"
                    spellCheck={false}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={editingDriver.status}
                    onValueChange={(value: Driver["status"]) => setEditingDriver({ ...editingDriver, status: value })}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="on_duty">{t("on_duty")}</SelectItem>
                      <SelectItem value="off_duty">{t("off_duty")}</SelectItem>
                      <SelectItem value="suspended">{t("suspended")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleUpdateDriver} className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Update Driver"
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditDialogOpen(false)
                      setEditingDriver(null)
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      {/* Driver Details Dialog */}
      {
        selectedDriver && (
          <Dialog open={!!selectedDriver} onOpenChange={() => setSelectedDriver(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Driver Details - {selectedDriver.name}</DialogTitle>
                <DialogDescription>Complete driver information</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="font-medium">{selectedDriver.name}</p>
                </div>
                <div>
                  <Label>License Number</Label>
                  <p className="font-medium">{selectedDriver.licenseNumber}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="font-medium">{selectedDriver.phone}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedDriver.email}</p>
                </div>
                <div>
                  <Label>Bus Number(s)</Label>
                  <p className="font-medium">
                    {(() => {
                      if (!selectedDriver.busNumber) return "N/A"
                      return selectedDriver.busNumber.split(",").map((busPlate) => {
                        const v = vehicles.find((veh) => veh.busNumberPlate === busPlate)
                        return v ? `${v.busNumberPlate}${v.busNumber ? ` (${v.busNumber})` : ""}` : busPlate
                      }).join(", ")
                    })()}
                  </p>
                </div>
                <div>
                  <Label>Experience</Label>
                  <p className="font-medium">{selectedDriver.experience || "N/A"}</p>
                </div>
                <div>
                  <Label>Join Date</Label>
                  <p className="font-medium">{selectedDriver.joinDate}</p>
                </div>
                <div className="col-span-2">
                  <Label>Address</Label>
                  <p className="font-medium">{selectedDriver.address || "N/A"}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )
      }

      {
        filteredDrivers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No drivers found</h3>
              <p className="text-muted-foreground">No drivers match your current filters.</p>
            </CardContent>
          </Card>
        )
      }

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Driver</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{driverToDelete?.name}</strong>? This action cannot be undone.
              {driverToDelete?.status === "on_duty" && (
                <span className="block mt-2 text-amber-600 font-medium">
                  Warning: This driver is currently on duty. Make sure to assign their vehicle to another driver first.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteDriver}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Driver"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div >
  )
}
