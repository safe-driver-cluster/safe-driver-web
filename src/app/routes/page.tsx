"use client"

import { useState, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from "@react-google-maps/api"
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
import {
  MapPin,
  Navigation,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Route as RouteIcon,
  Bus,
  Activity,
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  Loader2,
  Maximize2,
  BarChart3,
  Map as MapIcon,
  Plus,
  Trash2,
  ArrowRightLeft,
} from "lucide-react"
import type { Route, RouteStop, HazardZone } from "@/lib/route-types"
import type { Vehicle } from "@/lib/fleet-types"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/components/language-provider"
import { motion, AnimatePresence } from "framer-motion"
import { ThreeDMap } from "@/components/3d-map"
import { Progress } from "@/components/ui/progress"
import { hazardService } from "@/lib/hazard-service"
import { TransitSearchPanel } from "@/components/transit-search-panel"

export default function RouteMonitoring() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])

  // Polyline decoder helper
  const decodePolyline = (encoded: string) => {
    if (!encoded) return [];
    let points = [];
    let index = 0, len = encoded.length;
    let lat = 0, lng = 0;
    while (index < len) {
      let b, shift = 0, result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlat = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lat += dlat;
      shift = 0; result = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      let dlng = ((result & 1) ? ~(result >> 1) : (result >> 1));
      lng += dlng;
      points.push({ lat: lat / 1E5, lng: lng / 1E5 });
    }
    return points;
  }

  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    totalVehicles: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [modalTab, setModalTab] = useState<"map" | "hazards">("map")
  const [selectedHazardInfo, setSelectedHazardInfo] = useState<HazardZone | null>(null)
  const [routeHazards, setRouteHazards] = useState<HazardZone[]>([])
  const [hazardsLoading, setHazardsLoading] = useState(false)

  const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  const { isLoaded: isMapLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null)

  // Fetch ALL hazards (no proximity filter — user placed them, they're all relevant)
  useEffect(() => {
    if (modalTab !== "hazards" || !selectedRoute) return
    const fetchHazards = async () => {
      setHazardsLoading(true)
      setSelectedHazardInfo(null)
      setMapRef(null)
      try {
        const all = await hazardService.getAllHazards()
        setRouteHazards(all)
      } catch {
        setRouteHazards([])
      } finally {
        setHazardsLoading(false)
      }
    }
    fetchHazards()
  }, [modalTab, selectedRoute])

  // Fit map bounds to show all hazards + route stop coords when map loads
  const onHazardMapLoad = (map: google.maps.Map) => {
    setMapRef(map)
    if (!selectedRoute) return
    const bounds = new window.google.maps.LatLngBounds()
    let hasPoints = false

    // Add all hazard positions
    routeHazards.forEach(h => {
      bounds.extend({ lat: h.latitude, lng: h.longitude })
      hasPoints = true
    })

    // Add route stop positions
    selectedRoute.stops.forEach(s => {
      if (s.latitude && s.longitude) {
        bounds.extend({ lat: s.latitude, lng: s.longitude })
        hasPoints = true
      }
    })

    if (hasPoints) {
      map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
    } else {
      // Fall back to Sri Lanka center
      map.setCenter({ lat: 7.8731, lng: 80.7718 })
      map.setZoom(8)
    }
  }

  // Recenter map when a hazard card is clicked
  const panToHazard = (h: HazardZone) => {
    setSelectedHazardInfo(h)
    if (mapRef) {
      mapRef.panTo({ lat: h.latitude, lng: h.longitude })
      mapRef.setZoom(14)
    }
  }

  const hazardMapCenter = { lat: 7.8731, lng: 80.7718 }
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()
  const { t } = useLanguage()
  const [viewMode, setViewMode] = useState<"grid" | "map" | "transit">("grid")
  
  // Add Route state
  const [showAddRoute, setShowAddRoute] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newRoute, setNewRoute] = useState({
    name: "",
    busNumber: "",
    startPoint: "",
    endPoint: "",
    distance: "",
    estimatedTime: "",
    stops: [
      { name: "", time: "", order: 0 },
      { name: "", time: "", order: 1 }
    ]
  })
  const [showTransitSearch, setShowTransitSearch] = useState(false)
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null)

  // Fetch routes
  const fetchRoutes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (statusFilter !== "all") {
        params.append("status", statusFilter)
      }
      if (searchTerm) {
        params.append("search", searchTerm)
      }

      const response = await fetch(`/api/routes?${params.toString()}`)
      if (!response.ok) throw new Error("Failed to fetch routes")
      const data = await response.json()
      setRoutes(data)
    } catch (error) {
      console.error("Error fetching routes:", error)
      toast({
        title: "Error",
        description: "Failed to load routes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Fetch stats
  const fetchStats = async () => {
    try {
      const response = await fetch("/api/routes/stats")
      if (!response.ok) throw new Error("Failed to fetch stats")
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  // Fetch vehicles
  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/fleet")
      if (!response.ok) throw new Error("Failed to fetch vehicles")
      const data = await response.json()
      setVehicles(data)
    } catch (error) {
      console.error("Error fetching vehicles:", error)
    }
  }

  useEffect(() => {
    fetchRoutes()
    fetchStats()
    fetchVehicles()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRoutes()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter])

  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);

  const handleSaveRoute = async () => {
    // validate
    if (!newRoute.name || !newRoute.startPoint || !newRoute.endPoint) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }

    try {
      setIsSubmitting(true);
      
      const formatLocation = (loc: string) => {
        const trimmed = loc.trim();
        if (trimmed.toLowerCase().endsWith("bus stop")) {
          return trimmed;
        }
        return `${trimmed} Bus Stop`;
      };

      const formattedStartPoint = formatLocation(newRoute.startPoint);
      const formattedEndPoint = formatLocation(newRoute.endPoint);

      // Provide default stops since the UI no longer collects them
      const defaultStops = [
        { name: formattedStartPoint, time: "00:00", order: 0, status: "upcoming" },
        { name: formattedEndPoint, time: "00:00", order: 1, status: "upcoming" }
      ];

      const payload = {
        name: newRoute.name,
        busNumber: newRoute.busNumber || "",
        startPoint: formattedStartPoint,
        endPoint: formattedEndPoint,
        distance: newRoute.distance ? Number(newRoute.distance) : 0,
        estimatedTime: newRoute.estimatedTime ? Number(newRoute.estimatedTime) : 0,
        stops: defaultStops,
      };

      const url = editingRouteId ? `/api/routes/${editingRouteId}` : "/api/routes";
      const method = editingRouteId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || `Failed to ${editingRouteId ? "update" : "create"} route`);
      }

      toast({ title: "Success", description: `Route ${editingRouteId ? "updated" : "created"} successfully!` });
      setShowAddRoute(false);
      setEditingRouteId(null);
      setNewRoute({
        name: "",
        busNumber: "",
        startPoint: "",
        endPoint: "",
        distance: "",
        estimatedTime: "",
        stops: [
          { name: "", time: "", order: 0 },
          { name: "", time: "", order: 1 }
        ]
      });
      fetchRoutes();
      if (selectedRoute && editingRouteId === selectedRoute.id) {
         setSelectedRoute(null);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleDeleteRoute = async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRouteToDelete(id);
  }

  const confirmDelete = async () => {
    if (!routeToDelete) return;
    try {
      const response = await fetch(`/api/routes/${routeToDelete}`, { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to delete route");
      toast({ title: "Success", description: "Route deleted successfully!" });
      fetchRoutes();
      if (selectedRoute?.id === routeToDelete) setSelectedRoute(null);
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setRouteToDelete(null);
    }
  }

  // Filter is now handled server-side
  const filteredRoutes = routes

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-emerald-600"
    if (performance >= 80) return "text-amber-600"
    return "text-rose-600"
  }

  const getLoadColor = (load: number) => {
    if (load >= 90) return "text-rose-600"
    if (load >= 70) return "text-amber-600"
    return "text-emerald-600"
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-[#fafafa] min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">
            {t("route_monitoring")}
          </h1>
          <p className="text-neutral-600">{t("route_monitoring_desc")}</p>
        </div>
        <Dialog open={showAddRoute} onOpenChange={(open) => {
            setShowAddRoute(open);
            if (!open) {
              setEditingRouteId(null);
                setNewRoute({
                  name: "", busNumber: "", startPoint: "", endPoint: "", distance: "", estimatedTime: "",
                  stops: []
                });
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingRouteId(null);
                setNewRoute({
                  name: "", busNumber: "", startPoint: "", endPoint: "", distance: "", estimatedTime: "",
                  stops: [{ name: "", time: "", order: 0 }, { name: "", time: "", order: 1 }]
                });
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Add New Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRouteId ? "Edit Bus Route" : "Add New Bus Route"}</DialogTitle>
                <DialogDescription>{editingRouteId ? "Update route details." : "Create a new route that will be available dynamically in the fleet management system."}</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Route Category <span className="text-red-500">*</span></Label>
                    <Select 
                      value={newRoute.name} 
                      onValueChange={value => setNewRoute({...newRoute, name: value})}
                    >
                      <SelectTrigger className="rounded-xl border-neutral-200">
                        <SelectValue placeholder="Select Route Category" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-neutral-200 shadow-xl">
                        <SelectItem value="Express Route" className="rounded-lg">Express Route</SelectItem>
                        <SelectItem value="Normal Route" className="rounded-lg">Normal Route</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Bus Number (Route No)</Label>
                    <Input placeholder="e.g., 240" value={newRoute.busNumber} onChange={e => setNewRoute({...newRoute, busNumber: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Start Point <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g., Central Station" value={newRoute.startPoint} onChange={e => setNewRoute({...newRoute, startPoint: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Point <span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g., North Terminal" value={newRoute.endPoint} onChange={e => setNewRoute({...newRoute, endPoint: e.target.value})} />
                  </div>
                </div>



                <Button onClick={handleSaveRoute} className="w-full bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Saving...</> : (editingRouteId ? "Update Route" : "Create Route")}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

      </motion.div>


      {/* Route Statistics */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8"
      >
        {[
          {
            title: t("active_routes"),
            value: stats.active,
            context: t("routes_total_context", { total: stats.total }),
            icon: RouteIcon,
            color: "text-blue-600",
            bg: "bg-blue-50",
          },
          {
            title: t("vehicles_on_routes"),
            value: stats.totalVehicles,
            context: t("currently_operating"),
            icon: Bus,
            color: "text-indigo-600",
            bg: "bg-indigo-50",
          },
        ].map((stat, idx) => (
          <motion.div key={idx} variants={itemVariants}>
            <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group relative bg-white">
              <div className={`absolute top-0 left-0 w-1.5 h-full ${stat.bg.replace("bg-", "bg-opacity-100 bg-")}`} />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform shadow-sm`}>
                  <stat.icon className="h-5 w-5" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color} mb-1 tracking-tight`}>{stat.value}</div>
                <p className="text-sm text-neutral-400 font-semibold">{stat.context}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Filters Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-8"
      >
        <Card className="border-none shadow-sm bg-white/70 backdrop-blur-xl rounded-2xl border border-white/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5 group-focus-within:text-blue-500 transition-colors" />
                <Input
                  placeholder={t("search_routes")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 border-neutral-200 focus:border-blue-500 focus:ring-blue-500 rounded-2xl bg-white shadow-inner"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-56 h-12 border-neutral-200 rounded-2xl bg-white font-semibold">
                  <SelectValue placeholder={t("status")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-neutral-200 shadow-xl p-2">
                  <SelectItem value="all" className="rounded-xl">{t("all_routes")}</SelectItem>
                  <SelectItem value="active" className="rounded-xl">{t("active")}</SelectItem>
                  <SelectItem value="inactive" className="rounded-xl">{t("inactive")}</SelectItem>
                  <SelectItem value="maintenance" className="rounded-xl">{t("route_maintenance")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Routes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[2rem] shadow-sm border border-neutral-100">
          <Loader2 className="h-20 w-20 text-blue-500 mb-8 animate-spin" />
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t("loading_routes")}</h3>
          <p className="text-neutral-500 font-medium text-lg">{t("wait_fetching")}</p>
        </div>
      ) : filteredRoutes.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-24 bg-white rounded-[2rem] shadow-sm border border-neutral-100">
          <div className="p-10 bg-neutral-50 rounded-full mb-8 shadow-inner">
            <RouteIcon className="h-20 w-20 text-neutral-200" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">{t("no_routes_found")}</h3>
          <p className="text-neutral-500 font-medium text-lg">{t("no_routes_match")}</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12"
        >
          {filteredRoutes.map((route) => (
            <motion.div key={route.id} variants={itemVariants}>
              <Card className="group hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 border-none shadow-lg overflow-hidden bg-white rounded-[2rem] relative">
                <div className={`h-2.5 w-full ${route.status === "active" ? "bg-emerald-500" : "bg-neutral-300"}`} />
                <CardHeader className="pb-6 pt-8 px-8">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <CardTitle className="text-3xl font-bold text-neutral-900 group-hover:text-blue-600 transition-colors tracking-tight flex items-baseline gap-2">
                          {route.name}
                          <span className="text-sm font-medium text-neutral-400">
                            ({route.startPoint.replace(/ Bus Stop/i, "")} - {route.endPoint.replace(/ Bus Stop/i, "")})
                          </span>
                        </CardTitle>
                        <Badge
                          variant={route.status === "active" ? "success" : "secondary"}
                          className="rounded-full px-4 py-1.5 text-[11px] uppercase font-bold tracking-widest shadow-sm"
                        >
                          {t(route.status as any)}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" className="rounded-2xl hover:bg-blue-50 hover:text-blue-600 border-neutral-200 shadow-sm h-12 w-12 shrink-0">
                      <Maximize2 className="h-6 w-6" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8 pb-10 px-8">
                  {/* Route Journey */}
                  <div className="flex items-center justify-between bg-neutral-50/80 p-5 rounded-[1.5rem] border border-neutral-100">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Terminal A</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        <span className="font-bold text-neutral-800">{route.startPoint}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center px-4 opacity-50">
                      <div className="h-[2px] w-full max-w-[40px] bg-neutral-200 rounded-full" />
                      <ArrowRightLeft className="h-4 w-4 text-neutral-400 mx-2" />
                      <div className="h-[2px] w-full max-w-[40px] bg-neutral-200 rounded-full" />
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Terminal B</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-bold text-neutral-800">{route.endPoint}</span>
                        <MapPin className="h-4 w-4 text-rose-500" />
                      </div>
                    </div>
                  </div>
                  {/* Assigned Buses Section */}
                  <div className="mt-2 bg-neutral-50 p-4 sm:p-6 rounded-[1.5rem] border border-neutral-100 shadow-inner">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-3">
                      <Bus className="h-5 w-5 text-emerald-500" />
                      Assigned Buses
                    </h3>
                    {route.vehicles && route.vehicles.length > 0 ? (
                      <div className="flex flex-wrap gap-3">
                        {route.vehicles.map((vehicleId: string, idx: number) => (
                          <Dialog key={idx}>
                            <DialogTrigger asChild>
                              <button className="flex items-center gap-2 bg-white px-4 py-3 rounded-2xl border border-neutral-200 shadow-sm transition-transform hover:-translate-y-1 hover:border-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                                <Bus className="h-4 w-4 text-neutral-400" />
                                <span className="font-bold text-sm text-neutral-800">{vehicleId}</span>
                                <Badge className="ml-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] pointer-events-none">On Route</Badge>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md rounded-[2rem] border-none shadow-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                                  <div className="p-2 bg-emerald-50 text-emerald-500 rounded-xl">
                                    <Bus className="h-6 w-6" />
                                  </div>
                                  Bus {vehicleId}
                                </DialogTitle>
                                <DialogDescription className="font-medium text-neutral-500">
                                  Live tracking and metrics for this bus on {route.name}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="col-span-2 bg-emerald-50 p-5 rounded-[1.5rem] border border-emerald-100">
                                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mb-1">Status</p>
                                  <p className="text-2xl font-bold text-emerald-700 mt-1">Active</p>
                                </div>
                                <div className="col-span-2 bg-neutral-50 p-5 rounded-[1.5rem] border border-neutral-100">
                                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Current Location</p>
                                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl shadow-sm">
                                    <div className="p-2 bg-rose-50 text-rose-500 rounded-lg">
                                      <MapPin className="h-5 w-5" />
                                    </div>
                                    <span className="font-bold text-neutral-700">En route to next stop</span>
                                  </div>
                                </div>
                              </div>
                              <div className="pt-2">
                                <Button className="w-full h-12 rounded-2xl bg-neutral-900 text-white font-bold hover:bg-neutral-800">
                                  View Full Tracking
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-neutral-400 font-bold text-sm">
                        No buses currently assigned.
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4 pt-4 border-t border-neutral-100">
                    <Button
                      variant="outline"
                      className="rounded-2xl border-neutral-200 h-14 px-8 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all font-bold text-sm uppercase tracking-wider"
                      onClick={() => setSelectedRoute(route)}
                    >
                      <MapPin className="h-5 w-5 mr-3" />
                      View Map
                    </Button>

                    <Button variant="ghost" className="rounded-2xl h-14 px-6 text-neutral-500 font-bold text-sm uppercase tracking-wider hover:text-blue-600 hover:bg-blue-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingRouteId(route.id);
                        setNewRoute({
                          name: route.name, busNumber: route.busNumber || "", startPoint: route.startPoint, endPoint: route.endPoint,
                          distance: route.distance.toString(), estimatedTime: route.estimatedTime.toString(),
                          stops: route.stops && route.stops.length > 0 ? route.stops.map((s: any) => ({ ...s, time: s.time || "" })) : [{ name: "", time: "", order: 0 }, { name: "", time: "", order: 1 }]
                        });
                        setShowAddRoute(true);
                      }}
                    >
                      Edit
                    </Button>
                    <Button variant="ghost" className="rounded-2xl h-14 px-6 text-rose-500 font-bold text-sm uppercase tracking-wider hover:text-rose-600 hover:bg-rose-50"
                      onClick={(e) => handleDeleteRoute(route.id, e)}
                    >
                      <Trash2 className="h-5 w-5 mr-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}



      {/* Route Details Modal */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl font-bold tracking-tight text-neutral-900">{selectedRoute.name}{selectedRoute.busNumber ? ` - ${selectedRoute.busNumber}` : ""}</h2>
                      <p className="text-blue-600 font-semibold text-lg">{selectedRoute.startPoint} to {selectedRoute.endPoint}</p>
                      <Badge className="bg-emerald-500 text-white font-bold px-4 py-1.5 uppercase tracking-widest text-[11px] rounded-full">Active</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 hover:bg-neutral-100" onClick={() => { setSelectedRoute(null); setModalTab("map"); setSelectedHazardInfo(null); }}>
                    <span className="text-2xl font-bold text-neutral-400 hover:text-neutral-900">✕</span>
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-neutral-100 p-1 rounded-2xl mb-6 w-fit">
                  <button
                    onClick={() => setModalTab("map")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      modalTab === "map"
                        ? "bg-white text-blue-600 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <MapIcon className="h-4 w-4" />
                    Live Map
                  </button>
                  <button
                    onClick={() => { setModalTab("hazards"); setSelectedHazardInfo(null); }}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      modalTab === "hazards"
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-neutral-500 hover:text-neutral-800"
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Hazard Zones
                    {routeHazards.length > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {routeHazards.length}
                      </span>
                    )}
                  </button>
                </div>

                {/* Live Map Tab */}
                {modalTab === "map" && (
                  <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 relative shadow-inner">
                    <iframe 
                      width="100%" 
                      height="100%" 
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen 
                      src={`https://maps.google.com/maps?saddr=${encodeURIComponent(selectedRoute.startPoint)}&daddr=${encodeURIComponent(selectedRoute.endPoint)}&dirflg=r&output=embed`}
                    ></iframe>
                  </div>
                )}

                {/* Hazard Zones Tab */}
                {modalTab === "hazards" && (
                  <div className="space-y-4">
                    {/* Hazard map */}
                    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100 shadow-inner relative">
                      {!isMapLoaded || hazardsLoading ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                          <p className="text-sm font-bold text-neutral-400">Loading hazard data...</p>
                        </div>
                      ) : routeHazards.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 bg-amber-50">
                          <div className="p-5 bg-white rounded-full shadow-sm">
                            <AlertTriangle className="h-12 w-12 text-amber-200" />
                          </div>
                          <p className="font-bold text-neutral-600 text-lg">No Hazard Zones Yet</p>
                          <p className="text-sm text-neutral-400 font-medium">Go to Hazard Monitoring to mark hazards on the map.</p>
                        </div>
                      ) : (
                        <GoogleMap
                          mapContainerStyle={{ width: "100%", height: "100%" }}
                          center={hazardMapCenter}
                          zoom={8}
                          onLoad={onHazardMapLoad}
                          options={{
                            disableDefaultUI: false,
                            zoomControl: true,
                            mapTypeControl: true,
                            mapTypeControlOptions: {
                              style: 2, // DROPDOWN_MENU
                              position: 3, // TOP_RIGHT
                            },
                            streetViewControl: false,
                            fullscreenControl: true,
                            gestureHandling: "cooperative",
                            styles: [
                              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                              { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
                            ],
                          }}
                        >
                          {routeHazards.map((hazard, i) => (
                            <div key={hazard.id ?? i}>
                              <Marker
                                position={{ lat: hazard.latitude, lng: hazard.longitude }}
                                title={hazard.name}
                                icon={{
                                  url: hazard.type === "accident"
                                    ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png"
                                    : hazard.type === "school"
                                    ? "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
                                    : hazard.type === "speed"
                                    ? "https://maps.google.com/mapfiles/ms/icons/orange-dot.png"
                                    : "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
                                  scaledSize: new window.google.maps.Size(40, 40),
                                }}
                                onClick={() => panToHazard(hazard)}
                                animation={selectedHazardInfo?.id === hazard.id ? window.google.maps.Animation.BOUNCE : undefined}
                              />
                              <Circle
                                center={{ lat: hazard.latitude, lng: hazard.longitude }}
                                radius={hazard.radius}
                                options={{
                                  fillColor: hazard.type === "accident" ? "#ef4444"
                                    : hazard.type === "school" ? "#eab308"
                                    : "#f59e0b",
                                  fillOpacity: 0.15,
                                  strokeColor: hazard.type === "accident" ? "#dc2626"
                                    : hazard.type === "school" ? "#ca8a04"
                                    : "#d97706",
                                  strokeWeight: 2.5,
                                  strokeOpacity: 0.9,
                                }}
                              />
                            </div>
                          ))}
                          {selectedHazardInfo && (
                            <InfoWindow
                              position={{ lat: selectedHazardInfo.latitude, lng: selectedHazardInfo.longitude }}
                              onCloseClick={() => setSelectedHazardInfo(null)}
                              options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
                            >
                              <div style={{ padding: "8px", minWidth: "180px", fontFamily: "system-ui" }}>
                                <p style={{ fontWeight: 900, fontSize: "14px", marginBottom: "4px", color: "#111" }}>{selectedHazardInfo.name}</p>
                                <p style={{ fontSize: "11px", color: "#666", textTransform: "capitalize", marginBottom: "6px" }}>
                                  {selectedHazardInfo.type === "other" && selectedHazardInfo.customType
                                    ? selectedHazardInfo.customType
                                    : selectedHazardInfo.type}
                                </p>
                                {selectedHazardInfo.location && (
                                  <p style={{ fontSize: "11px", color: "#888", marginBottom: "6px" }}>📍 {selectedHazardInfo.location}</p>
                                )}
                                <div style={{ display: "inline-block", background: "#fef3c7", color: "#92400e", fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "9999px" }}>
                                  {selectedHazardInfo.radius}m radius
                                </div>
                              </div>
                            </InfoWindow>
                          )}
                        </GoogleMap>
                      )}
                    </div>

                    {/* Hazard zone list */}
                    {routeHazards.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {routeHazards.map((h, i) => (
                          <button
                            key={h.id ?? i}
                            onClick={() => panToHazard(h)}
                            className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left group ${
                              selectedHazardInfo?.id === h.id
                                ? "bg-amber-50 border-amber-300 shadow-md"
                                : "bg-neutral-50 border-neutral-100 hover:border-amber-200 hover:bg-amber-50/50 hover:shadow-md"
                            }`}
                          >
                            <div className={`p-2.5 rounded-xl flex-shrink-0 group-hover:scale-110 transition-transform ${
                              h.type === "accident" ? "bg-red-50 text-red-500" : "bg-amber-50 text-amber-500"
                            }`}>
                              <AlertTriangle className="h-4 w-4" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-bold text-sm text-neutral-800 truncate">{h.name}</p>
                              <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                                {h.type === "other" && h.customType ? h.customType : h.type} · {h.radius}m
                              </p>
                            </div>
                            <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              h.type === "accident" ? "bg-red-400" : "bg-amber-400"
                            }`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-8 bg-neutral-50 border-t border-neutral-100 flex gap-4">
                <Button variant="outline" className="rounded-2xl border-rose-200 text-rose-500 h-14 px-10 font-bold hover:bg-rose-50 hover:text-rose-600 transition-all uppercase tracking-wider" onClick={() => handleDeleteRoute(selectedRoute.id)}>
                  <Trash2 className="h-5 w-5 mr-3 inline-block" />
                  Delete Route
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {showTransitSearch && (
        <TransitSearchPanel 
          onClose={() => setShowTransitSearch(false)} 
          initialOrigin={newRoute.startPoint}
          initialDestination={newRoute.endPoint}
          onSelect={(route: any) => {
            setNewRoute({
              ...newRoute,
              busNumber: route.busLine || newRoute.busNumber,
              distance: route.distance.toFixed(1),
              estimatedTime: route.duration.toString(),
              stops: route.stops.map((stop: any) => ({
                name: stop.name,
                time: "", 
                order: stop.order,
                latitude: stop.lat,
                longitude: stop.lng,
                type: stop.type,
                details: stop.details
              })),
            });
            setShowTransitSearch(false);
          }}
        />
      )}

      <AlertDialog open={!!routeToDelete} onOpenChange={(open) => !open && setRouteToDelete(null)}>
        <AlertDialogContent className="rounded-[2rem] border-none shadow-2xl p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-neutral-900 flex items-center gap-3">
              <div className="p-2 bg-rose-50 text-rose-500 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              Delete Route?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-neutral-500 text-base font-medium pt-2">
              Are you sure you want to delete this route? This action cannot be undone and will remove all associated transit data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6 gap-3">
            <AlertDialogCancel className="rounded-xl font-bold h-12 px-6 border-neutral-200 text-neutral-600 hover:bg-neutral-50">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl font-bold h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-200"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
