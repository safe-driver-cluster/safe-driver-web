"use client"

import { useState, useEffect, useRef } from "react"
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
  const [updatingStatusIds, setUpdatingStatusIds] = useState<Set<string>>(new Set())
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [modalTab, setModalTab] = useState<"map" | "hazards">("map")
  const [selectedHazardInfo, setSelectedHazardInfo] = useState<HazardZone | null>(null)

  const routeHazards = selectedRoute?.hazardZones || []

  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapRef, setMapRef] = useState<any>(null)
  const layersRef = useRef<any[]>([])
  const hazardMarkersRef = useRef<{ [key: string]: any }>({})

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        document.head.appendChild(link)
      }

      if (!(window as any).L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.onload = () => setLeafletLoaded(true)
        document.body.appendChild(script)
      } else {
        setLeafletLoaded(true)
      }
    }
    loadLeaflet()
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!leafletLoaded || modalTab !== "hazards" || !mapContainerRef.current || !(window as any).L || mapRef) return

    const L = (window as any).L
    const container = mapContainerRef.current as any

    // Fix for "Map container is being reused by another instance"
    if (container._leaflet_id !== null && container._leaflet_id !== undefined) {
      container._leaflet_id = null
      container.innerHTML = ""
    }

    const map = L.map(container).setView([hazardMapCenter.lat, hazardMapCenter.lng], 8)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    setMapRef(map)
  }, [leafletLoaded, modalTab, mapRef])

  // Clean up map when modalTab changes, route changes or unmounts
  useEffect(() => {
    if (modalTab !== "hazards" && mapRef) {
      mapRef.remove()
      setMapRef(null)
    }
  }, [modalTab, mapRef])

  useEffect(() => {
    if (!selectedRoute && mapRef) {
      mapRef.remove()
      setMapRef(null)
    }
  }, [selectedRoute, mapRef])

  useEffect(() => {
    return () => {
      if (mapRef) {
        mapRef.remove()
        setMapRef(null)
      }
    }
  }, [mapRef])

  // Draw layers
  useEffect(() => {
    if (!mapRef || !leafletLoaded || !(window as any).L) return

    const L = (window as any).L

    // Clear old layers
    layersRef.current.forEach(layer => mapRef.removeLayer(layer))
    layersRef.current = []
    hazardMarkersRef.current = {}

    const newLayers: any[] = []

    // Draw existing hazards
    routeHazards.forEach(hazard => {
      const position: [number, number] = [hazard.latitude, hazard.longitude]
      const color = hazard.type === "accident" ? "#ef4444" : hazard.type === "school" ? "#eab308" : "#f59e0b"

      const circle = L.circle(position, {
        radius: hazard.radius,
        fillColor: color,
        fillOpacity: 0.15,
        color: color,
        weight: 1.5,
      }).addTo(mapRef)
      newLayers.push(circle)

      const icon = L.divIcon({
        className: "custom-hazard-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px;">
            <svg viewBox="0 0 24 24" width="32" height="32" style="display: block; filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.35));">
              <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3.5" fill="rgba(0, 0, 0, 0.4)"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      const marker = L.marker(position, { icon }).addTo(mapRef)

      const popupContent = `
        <div class="p-2" style="min-width: 180px; font-family: sans-serif;">
          <h3 class="font-bold text-sm mb-1" style="margin: 0 0 4px 0; font-weight: 700; font-size: 14px; color: #1f2937;">${hazard.name}</h3>
          <p class="text-xs text-muted-foreground capitalize" style="margin: 0 0 4px 0; color: #6b7280;">
            Type: ${hazard.type === "other" && hazard.customType ? hazard.customType : hazard.type}
          </p>
          ${hazard.location ? `<p class="text-xs text-muted-foreground" style="margin: 0 0 8px 0; color: #9ca3af;">📍 ${hazard.location}</p>` : ''}
          <div style="display: inline-block; background: #fef3c7; color: #92400e; font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 9999px;">
            ${hazard.radius}m radius
          </div>
        </div>
      `
      marker.bindPopup(popupContent)

      marker.on("click", () => {
        setSelectedHazardInfo(hazard)
      })

      if (hazard.id) {
        hazardMarkersRef.current[hazard.id] = marker
      }

      newLayers.push(marker)
    })

    // Fit bounds automatically when routeHazards or selectedRoute changes
    const bounds = L.latLngBounds()
    let hasPoints = false

    routeHazards.forEach(h => {
      bounds.extend([h.latitude, h.longitude])
      hasPoints = true
    })

    if (selectedRoute) {
      selectedRoute.stops.forEach(s => {
        if (s.latitude && s.longitude) {
          bounds.extend([s.latitude, s.longitude])
          hasPoints = true
        }
      })
    }

    if (hasPoints) {
      mapRef.fitBounds(bounds, { padding: [50, 50] })
    }

    layersRef.current = newLayers
  }, [routeHazards, selectedRoute, mapRef, leafletLoaded])

  // Recenter map when selectedHazardInfo changes
  useEffect(() => {
    if (!mapRef || !selectedHazardInfo) return
    const marker = hazardMarkersRef.current[selectedHazardInfo.id!]
    if (marker) {
      marker.openPopup()
      mapRef.setView([selectedHazardInfo.latitude, selectedHazardInfo.longitude], 14)
    }
  }, [selectedHazardInfo, mapRef])

  const panToHazard = (h: HazardZone) => {
    setSelectedHazardInfo(h)
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

  // Update route status inline
  const updateRouteStatus = async (id: string, status: string) => {
    setUpdatingStatusIds(prev => new Set(prev).add(id))
    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (!response.ok) throw new Error("Failed to update status")
      setRoutes(prev => prev.map(r => r.id === id ? { ...r, status: status as any } : r))
      fetchStats()
      toast({ title: "Status Updated", description: `Route status changed to ${status}.` })
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" })
    } finally {
      setUpdatingStatusIds(prev => { const s = new Set(prev); s.delete(id); return s })
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
    <div className="container mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("route_monitoring")}
          </h1>
          <p className="text-muted-foreground">{t("route_monitoring_desc")}</p>
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

      </div>


      {/* Route Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Routes</CardTitle>
            <RouteIcon className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("active")}</CardTitle>
            <RouteIcon className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("inactive")}</CardTitle>
            <RouteIcon className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.inactive}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("vehicles_on_routes")}</CardTitle>
            <Bus className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.totalVehicles}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Section */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("search_routes")}
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
                <SelectItem value="all">{t("all_routes")}</SelectItem>
                <SelectItem value="active">{t("active")}</SelectItem>
                <SelectItem value="inactive">{t("inactive")}</SelectItem>
                <SelectItem value="maintenance">{t("route_maintenance")}</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchRoutes} className="px-6">
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-muted-foreground/60 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t("loading_routes")}</h3>
            <p className="text-muted-foreground">{t("wait_fetching")}</p>
          </CardContent>
        </Card>
      ) : filteredRoutes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <RouteIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">{t("no_routes_found")}</h3>
            <p className="text-muted-foreground">{t("no_routes_match")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredRoutes.map((route) => (
            <Card key={route.id} className="hover:shadow-lg transition-shadow overflow-visible">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-baseline gap-1.5 flex-wrap">
                      <span className="font-bold truncate">
                        {route.startPoint.replace(/ Bus Stop/i, "")} – {route.endPoint.replace(/ Bus Stop/i, "")}
                      </span>
                      <span className="text-sm font-normal text-muted-foreground">({route.name})</span>
                    </CardTitle>
                    {route.busNumber && (
                      <CardDescription className="flex flex-col gap-1 mt-1">
                        <span>Route No: {route.busNumber}</span>
                      </CardDescription>
                    )}
                  </div>
                  <Badge variant={route.status === "active" ? "success" : "secondary"}>
                    {t(route.status as any)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Route Journey */}
                  <div className="flex items-center justify-between bg-muted/40 p-4 rounded-lg border border-border">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Terminal A</p>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-500" />
                        <span className="font-semibold text-sm text-foreground">{route.startPoint}</span>
                      </div>
                    </div>
                    <ArrowRightLeft className="h-4 w-4 text-muted-foreground mx-2" />
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Terminal B</p>
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-sm text-foreground">{route.endPoint}</span>
                        <MapPin className="h-4 w-4 text-rose-500" />
                      </div>
                    </div>
                  </div>

                  {/* Assigned Buses */}
                  <div className="text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Bus className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-muted-foreground">Assigned Buses</span>
                    </div>
                    {route.vehicles && route.vehicles.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {route.vehicles.map((vehicleId: string, idx: number) => (
                          <Dialog key={idx}>
                            <DialogTrigger asChild>
                              <button className="flex items-center gap-1.5 bg-background px-3 py-1.5 rounded-lg border border-border text-sm hover:border-primary transition-colors">
                                <Bus className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium text-foreground">{vehicleId}</span>
                                <Badge className="ml-1 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] pointer-events-none">On Route</Badge>
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-md">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Bus className="h-5 w-5" />
                                  Bus {vehicleId}
                                </DialogTitle>
                                <DialogDescription>
                                  Live tracking and metrics for this bus on {route.name}.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid grid-cols-2 gap-4 py-4">
                                <div className="col-span-2 bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">Status</p>
                                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">Active</p>
                                </div>
                                <div className="col-span-2 bg-muted/50 p-4 rounded-lg border border-border">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Current Location</p>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-rose-500" />
                                    <span className="font-medium text-foreground">En route to next stop</span>
                                  </div>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">No buses currently assigned.</p>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 flex-wrap items-center">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRoute(route)} className="flex-shrink-0">
                      <Eye className="h-4 w-4 mr-1" />
                      View Map
                    </Button>
                    <Button size="sm" variant="outline" className="flex-shrink-0"
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
                      <Activity className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Select
                      value={route.status}
                      disabled={updatingStatusIds.has(route.id)}
                      onValueChange={(value) => {
                        if (route.id) updateRouteStatus(route.id, value)
                      }}
                    >
                      <SelectTrigger className={`h-8 text-xs w-[120px] flex-shrink-0 ${updatingStatusIds.has(route.id) ? "opacity-50 cursor-not-allowed" : ""}`}>
                        <div className="flex items-center gap-2">
                          {updatingStatusIds.has(route.id) ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <div className={`h-2 w-2 rounded-full ${
                              route.status === 'active' ? 'bg-green-500' :
                              route.status === 'maintenance' ? 'bg-amber-500' : 'bg-gray-400'
                            }`} />
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
                        <SelectItem value="maintenance">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-amber-500" />
                            {t("route_maintenance")}
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => handleDeleteRoute(route.id, e)}
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



      {/* Route Details Modal */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/60 backdrop-blur-md flex items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card text-card-foreground border border-border rounded-[2.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-10 overflow-y-auto">
                {/* Header */}
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <h2 className="text-4xl font-bold tracking-tight text-foreground">{selectedRoute.name}{selectedRoute.busNumber ? ` - ${selectedRoute.busNumber}` : ""}</h2>
                      <p className="text-blue-600 dark:text-blue-400 font-semibold text-lg">{selectedRoute.startPoint} to {selectedRoute.endPoint}</p>
                      <Badge className="bg-emerald-500 text-white font-bold px-4 py-1.5 uppercase tracking-widest text-[11px] rounded-full">Active</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-2xl h-14 w-14 hover:bg-muted" onClick={() => { setSelectedRoute(null); setModalTab("map"); setSelectedHazardInfo(null); }}>
                    <span className="text-2xl font-bold text-muted-foreground hover:text-foreground">✕</span>
                  </Button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 bg-muted p-1 rounded-2xl mb-6 w-fit">
                  <button
                    onClick={() => setModalTab("map")}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      modalTab === "map"
                        ? "bg-background text-blue-600 dark:text-blue-400 shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <MapIcon className="h-4 w-4" />
                    Live Map
                  </button>
                  {routeHazards.length > 0 && (
                    <button
                      onClick={() => { setModalTab("hazards"); setSelectedHazardInfo(null); }}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                        modalTab === "hazards"
                          ? "bg-background text-amber-600 dark:text-amber-400 shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Hazard Zones
                      <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {routeHazards.length}
                      </span>
                    </button>
                  )}
                </div>

                {/* Live Map Tab */}
                {modalTab === "map" && (
                  <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-border bg-muted relative shadow-inner">
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
                    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-border bg-muted shadow-inner relative">
                      {!leafletLoaded ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                          <p className="text-sm font-bold text-muted-foreground">Loading hazard map...</p>
                        </div>
                      ) : routeHazards.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center gap-3 bg-amber-50 dark:bg-amber-950/20">
                          <div className="p-5 bg-card rounded-full shadow-sm border border-border">
                            <AlertTriangle className="h-12 w-12 text-amber-500" />
                          </div>
                          <p className="font-bold text-foreground text-lg">No Hazard Zones Yet</p>
                          <p className="text-sm text-muted-foreground font-medium">Go to Hazard Monitoring to mark hazards on the map.</p>
                        </div>
                      ) : (
                        <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />
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
        <AlertDialogContent className="rounded-[2rem] border border-border shadow-2xl p-8 bg-card text-card-foreground">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="p-2 bg-rose-50 dark:bg-rose-950/20 text-rose-500 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              Delete Route?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground text-base font-medium pt-2">
              Are you sure you want to delete this route? This action cannot be undone and will remove all associated transit data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-6 gap-3">
            <AlertDialogCancel className="rounded-xl font-bold h-12 px-6 border-border text-muted-foreground hover:bg-muted">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="rounded-xl font-bold h-12 px-8 bg-rose-500 hover:bg-rose-600 text-white shadow-lg dark:shadow-none"
            >
              Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
