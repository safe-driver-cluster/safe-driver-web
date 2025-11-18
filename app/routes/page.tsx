"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MapPin,
  Navigation,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Route,
  Bus,
  Activity,
  TrendingUp,
  TrendingDown,
  Search,
  Eye,
  Loader2,
} from "lucide-react"
import type { Route } from "@/lib/route-types"
import { useToast } from "@/hooks/use-toast"

export default function RouteMonitoring() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    maintenance: 0,
    totalVehicles: 0,
    averageOnTimePerformance: 0,
    totalSafetyIncidents: 0,
  })
  const [loading, setLoading] = useState(true)
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

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

  useEffect(() => {
    fetchRoutes()
    fetchStats()
  }, [])

  // Refetch when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchRoutes()
    }, 300) // Debounce search

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, statusFilter])

  // Filter is now handled server-side
  const filteredRoutes = routes

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return "text-green-600"
    if (performance >= 80) return "text-yellow-600"
    return "text-red-600"
  }

  const getLoadColor = (load: number) => {
    if (load >= 90) return "text-red-600"
    if (load >= 70) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">Route Monitoring System</h1>
        <p className="text-neutral-600">Real-time tracking and management of bus routes</p>
      </div>

      {/* Route Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <Route className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Out of {stats.total} total routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vehicles on Routes</CardTitle>
            <Bus className="h-4 w-4 text-tech-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tech-600">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">Currently operating</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Performance</CardTitle>
            <Clock className="h-4 w-4 text-safety-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-safety-600">{stats.averageOnTimePerformance}%</div>
            <p className="text-xs text-muted-foreground">Average across all routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Safety Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning-600">{stats.totalSafetyIncidents}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search routes..."
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
                <SelectItem value="all">All Routes</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Routes Grid */}
      {loading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Loading routes...</h3>
            <p className="text-gray-600">Please wait while we fetch route data.</p>
          </CardContent>
        </Card>
      ) : filteredRoutes.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Route className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No routes found</h3>
            <p className="text-gray-600">No routes match your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {filteredRoutes.map((route) => (
          <Card key={route.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{route.name}</CardTitle>
                  <CardDescription>
                    {route.startPoint} → {route.endPoint}
                  </CardDescription>
                </div>
                <Badge variant={route.status === "active" ? "success" : "secondary"}>
                  {route.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Route Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{route.distance} km</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{route.estimatedTime} min</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bus className="h-4 w-4 text-gray-500" />
                    <span>{route.activeVehicles} vehicles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{route.totalStops} stops</span>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getPerformanceColor(route.onTimePerformance)}`}>
                      {Math.round(route.onTimePerformance)}%
                    </div>
                    <div className="text-xs text-gray-500">On-Time</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-lg font-bold ${getLoadColor(route.passengerLoad)}`}>
                      {Math.round(route.passengerLoad)}%
                    </div>
                    <div className="text-xs text-gray-500">Load</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{Math.round(route.averageSpeed)}</div>
                    <div className="text-xs text-gray-500">km/h</div>
                  </div>
                </div>

                {/* Active Vehicles */}
                <div>
                  <p className="text-sm font-medium mb-2">Active Vehicles:</p>
                  <div className="flex flex-wrap gap-1">
                    {route.vehicles.map((vehicle) => (
                      <Badge key={vehicle} variant="outline" className="text-xs">
                        {vehicle}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Safety Status */}
                {route.safetyIncidents > 0 && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm text-red-700">
                      {route.safetyIncidents} safety incident{route.safetyIncidents > 1 ? "s" : ""} this week
                    </span>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => setSelectedRoute(route)}>
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <Navigation className="h-4 w-4 mr-1" />
                    Track Live
                  </Button>
                  <Button size="sm" variant="outline">
                    <Activity className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}

      {/* Route Performance Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Route Performance Trends</CardTitle>
            <CardDescription>Weekly performance comparison</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="flex justify-between items-center">
                <span className="text-sm">{route.name}</span>
                <div className="flex items-center gap-2">
                  {route.onTimePerformance >= 90 ? (
                    <TrendingUp className="h-4 w-4 text-green-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                  <span className={`text-sm font-medium ${getPerformanceColor(route.onTimePerformance)}`}>
                    {Math.round(route.onTimePerformance)}%
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Passenger Load Analysis</CardTitle>
            <CardDescription>Current capacity utilization</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {routes.map((route) => (
              <div key={route.id} className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>{route.name}</span>
                  <span className={`font-medium ${getLoadColor(route.passengerLoad)}`}>
                    {Math.round(route.passengerLoad)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      route.passengerLoad >= 90
                        ? "bg-red-500"
                        : route.passengerLoad >= 70
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    }`}
                    style={{ width: `${route.passengerLoad}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Route Details Modal */}
      {selectedRoute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold">{selectedRoute.name}</h2>
                  <p className="text-gray-600">
                    {selectedRoute.startPoint} → {selectedRoute.endPoint}
                  </p>
                </div>
                <Button variant="outline" onClick={() => setSelectedRoute(null)}>
                  ✕
                </Button>
              </div>

              {/* Route Progress */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Current Progress</h3>
                <div className="space-y-3">
                  {selectedRoute.stops.map((stop, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div
                        className={`w-4 h-4 rounded-full ${
                          stop.status === "completed"
                            ? "bg-green-500"
                            : stop.status === "current"
                              ? "bg-blue-500"
                              : "bg-gray-300"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className={`font-medium ${stop.status === "current" ? "text-blue-600" : ""}`}>
                            {stop.name}
                          </span>
                          <span className="text-sm text-gray-500">{stop.time}</span>
                        </div>
                      </div>
                      {stop.status === "completed" && <CheckCircle className="h-4 w-4 text-green-500" />}
                      {stop.status === "current" && <Activity className="h-4 w-4 text-blue-500" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Route Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{selectedRoute.distance}</div>
                  <div className="text-sm text-gray-600">Distance (km)</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedRoute.estimatedTime}</div>
                  <div className="text-sm text-gray-600">Est. Time (min)</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{selectedRoute.activeVehicles}</div>
                  <div className="text-sm text-gray-600">Active Vehicles</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{Math.round(selectedRoute.averageSpeed)}</div>
                  <div className="text-sm text-gray-600">Avg Speed (km/h)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
