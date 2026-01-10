"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Users, Phone, Mail, Activity, Plus, Search, Eye, Trash2, Loader2, Edit } from "lucide-react"
import type { Driver } from "@/lib/driver-types"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"

export default function DriversPage() {
  const { t } = useLanguage()
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [stats, setStats] = useState({
    total: 0,
    onDuty: 0,
    offDuty: 0,
    suspended: 0,
    highPerformers: 0,
    needAttention: 0,
    averageSafetyScore: 0,
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
    route: "",
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
      highPerformers: driversData.filter((d) => d.safetyScore >= 90).length,
      needAttention: driversData.filter((d) => d.safetyScore < 80).length,
      averageSafetyScore:
        driversData.length > 0
          ? Math.round(driversData.reduce((sum, d) => sum + d.safetyScore, 0) / driversData.length)
          : 0,
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

  const getSafetyScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 75) return "text-yellow-600"
    return "text-red-600"
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
        route: "",
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
          route: editingDriver.route || "",
          address: editingDriver.address || "",
          experience: editingDriver.experience || "",
          status: editingDriver.status,
          safetyScore: editingDriver.safetyScore,
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
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
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
                <Label htmlFor="bus">Bus Number</Label>
                <Input
                  id="bus"
                  value={newDriver.busNumber}
                  onChange={(e) => setNewDriver({ ...newDriver, busNumber: e.target.value })}
                  placeholder="NB-1234"
                />
              </div>
              <div>
                <Label htmlFor="route">Route</Label>
                <Input
                  id="route"
                  value={newDriver.route}
                  onChange={(e) => setNewDriver({ ...newDriver, route: e.target.value })}
                  placeholder="Colombo - Kandy"
                />
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

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("total_drivers")}</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("on_duty")}</p>
                <p className="text-2xl font-bold text-green-600">{stats.onDuty}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("high_performers")}</p>
                <p className="text-2xl font-bold text-green-600">{stats.highPerformers}</p>
              </div>
              <Activity className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t("need_attention")}</p>
                <p className="text-2xl font-bold text-red-600">{stats.needAttention}</p>
              </div>
              <Activity className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div >

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
      {
        loading && drivers.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 text-muted-foreground mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground mb-2">Loading drivers...</h3>
              <p className="text-muted-foreground">Please wait while we fetch driver data.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredDrivers.map((driver) => (
              <Card
                key={driver.id}
                className="group hover:shadow-lg transition-all duration-300 border-l-[6px] overflow-hidden"
                style={{
                  borderLeftColor:
                    driver.safetyScore >= 90 ? "#22c55e" : driver.safetyScore >= 75 ? "#eab308" : "#ef4444",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6 items-center lg:items-center">
                    {/* Driver Profile Section */}
                    <div className="flex-1 flex gap-5 w-full">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0 border-2 border-background shadow-sm ring-1 ring-muted">
                        <Users className="h-7 w-7 text-muted-foreground" />
                      </div>

                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-xl font-bold text-foreground leading-none truncate">
                            {driver.name}
                          </h3>
                          <Badge
                            variant={driver.status === "on_duty" ? "default" : "secondary"}
                            className={`uppercase text-[10px] tracking-wider font-bold shadow-sm ${driver.status === "on_duty"
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : driver.status === "suspended"
                                ? "bg-destructive/10 text-destructive hover:bg-destructive/20"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                              }`}
                          >
                            {driver.status.replace("_", " ")}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground/80">License:</span>
                            <span className="font-mono">{driver.licenseNumber}</span>
                          </div>
                          {(driver.busNumber || driver.route) && (
                            <div className="flex items-center gap-2 truncate">
                              {driver.busNumber && (
                                <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-xs font-semibold border border-primary/20">
                                  {driver.busNumber}
                                </span>
                              )}
                              {driver.route && <span className="text-xs text-muted-foreground truncate">{driver.route}</span>}
                            </div>
                          )}
                          <div className="flex items-center gap-3 col-span-1 sm:col-span-2 mt-1.5 pt-1.5 border-t border-dashed border-border">
                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full">
                              <Phone className="h-3 w-3" /> {driver.phone}
                            </span>
                            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-full truncate max-w-[200px]">
                              <Mail className="h-3 w-3" /> {driver.email}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Stats Section with vertical separator */}
                    <div className="flex w-full lg:w-auto items-center justify-around lg:justify-center gap-8 px-6 py-3 lg:py-0 lg:border-l lg:border-r border-y lg:border-y-0 border-border bg-muted/20 lg:bg-transparent rounded-lg lg:rounded-none">
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Safety</p>
                        <div className={`text-3xl font-black tabular-nums tracking-tight ${getSafetyScoreColor(driver.safetyScore)}`}>
                          {driver.safetyScore}
                          <span className="text-base font-bold ml-0.5">%</span>
                        </div>
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Alerts</p>
                        <div className="text-3xl font-black tabular-nums tracking-tight text-foreground">
                          {driver.alertCount}
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="w-full lg:w-[150px] flex flex-col gap-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedDriver(driver)}
                          className="h-8 border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                          title="View Details"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditDriver(driver)}
                          className="h-8 border border-border hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
                          title="Edit Driver"
                        >
                          <Edit className="h-3.5 w-3.5 mr-1.5" /> Edit
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleContactDriver(driver)}
                          className="h-8 border border-border hover:border-green-500/50 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/20"
                          title="Call Driver"
                        >
                          <Phone className="h-3.5 w-3.5 mr-1.5" /> Call
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteClick(driver)}
                          disabled={isDeleting}
                          className="h-8 border border-border hover:border-destructive/50 hover:bg-destructive/5 hover:text-destructive"
                          title="Delete Driver"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Del
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleToggleStatus(driver.id)}
                        className={`w-full h-8 text-xs font-semibold shadow-sm transition-all ${driver.status === "on_duty"
                          ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200 hover:border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800"
                          : "bg-primary text-primary-foreground hover:bg-primary/90"
                          }`}
                      >
                        {driver.status === "on_duty" ? "Set Off Duty" : "Set On Duty"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )
      }

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
                    onChange={(e) => setEditingDriver({ ...editingDriver, phone: e.target.value })}
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
                  <Label htmlFor="edit-bus">Bus Number</Label>
                  <Input
                    id="edit-bus"
                    value={editingDriver.busNumber || ""}
                    onChange={(e) => setEditingDriver({ ...editingDriver, busNumber: e.target.value })}
                    placeholder="NB-1234"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-route">Route</Label>
                  <Input
                    id="edit-route"
                    value={editingDriver.route || ""}
                    onChange={(e) => setEditingDriver({ ...editingDriver, route: e.target.value })}
                    placeholder="Colombo - Kandy"
                  />
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
                      <SelectItem value="on_duty">On Duty</SelectItem>
                      <SelectItem value="off_duty">Off Duty</SelectItem>
                      <SelectItem value="suspended">Suspended</SelectItem>
                      <SelectItem value="on_break">On Break</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-safety-score">Safety Score (0-100)</Label>
                  <Input
                    id="edit-safety-score"
                    type="number"
                    min="0"
                    max="100"
                    value={editingDriver.safetyScore}
                    onChange={(e) => setEditingDriver({ ...editingDriver, safetyScore: parseInt(e.target.value) || 0 })}
                  />
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
                <DialogDescription>Complete driver information and performance history</DialogDescription>
              </DialogHeader>
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="profile">Profile</TabsTrigger>
                  <TabsTrigger value="performance">Performance</TabsTrigger>
                  <TabsTrigger value="history">History</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
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
                      <Label>Bus Number</Label>
                      <p className="font-medium">{selectedDriver.busNumber}</p>
                    </div>
                    <div>
                      <Label>Route</Label>
                      <p className="font-medium">{selectedDriver.route}</p>
                    </div>
                    <div>
                      <Label>Experience</Label>
                      <p className="font-medium">{selectedDriver.experience}</p>
                    </div>
                    <div>
                      <Label>Join Date</Label>
                      <p className="font-medium">{selectedDriver.joinDate}</p>
                    </div>
                    <div className="col-span-2">
                      <Label>Address</Label>
                      <p className="font-medium">{selectedDriver.address}</p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="performance" className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-600">Safety Score</p>
                        <p className={`text-3xl font-bold ${getSafetyScoreColor(selectedDriver.safetyScore)}`}>
                          {selectedDriver.safetyScore}%
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-600">Total Alerts</p>
                        <p className="text-3xl font-bold">{selectedDriver.alertCount}</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <p className="text-sm text-gray-600">Status</p>
                        <Badge variant={getStatusColor(selectedDriver.status)} className="mt-2">
                          {selectedDriver.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                <TabsContent value="history" className="space-y-4">
                  <div>
                    <Label>Last Alert</Label>
                    <p className="font-medium">{selectedDriver.lastAlert || "Never"}</p>
                  </div>
                  <div>
                    <Label>Recent Activity</Label>
                    <div className="space-y-2 mt-2">
                      <p className="text-sm">• Completed route Colombo - Kandy (2 hours ago)</p>
                      <p className="text-sm">• Safety training completed (1 week ago)</p>
                      <p className="text-sm">• Vehicle inspection passed (2 weeks ago)</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )
      }

      {
        filteredDrivers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No drivers found</h3>
              <p className="text-gray-600">No drivers match your current filters.</p>
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
