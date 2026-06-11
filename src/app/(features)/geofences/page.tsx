"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvancedMap } from "@/components/advanced-map"
import { Plus, Map, Box, BarChart3, Settings, AlertTriangle, MapPin, TrendingUp, Eye, Edit, Trash2 } from "lucide-react"

// Dynamically import 3D map component with SSR disabled (WebGL requires browser)
const ThreeDMap = dynamic(() => import("@/components/3d-map").then(mod => ({ default: mod.ThreeDMap })), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D map...</p>
      </div>
    </div>
  ),
})

// Mock geofence data
const mockGeofences = [
  {
    id: "GF001",
    name: "Royal College School Zone",
    type: "school_zone",
    status: "active",
    violations: 2,
    vehicles: 5,
    lastViolation: "2 hours ago",
    created: "2024-01-15",
  },
  {
    id: "GF002",
    name: "Military Restricted Area",
    type: "restricted",
    status: "active",
    violations: 0,
    vehicles: 0,
    lastViolation: "Never",
    created: "2024-01-10",
  },
  {
    id: "GF003",
    name: "Highway Speed Zone",
    type: "speed_zone",
    status: "active",
    violations: 8,
    vehicles: 12,
    lastViolation: "15 minutes ago",
    created: "2024-01-20",
  },
  {
    id: "GF004",
    name: "Depot Boundary",
    type: "depot",
    status: "inactive",
    violations: 1,
    vehicles: 3,
    lastViolation: "1 day ago",
    created: "2024-01-05",
  },
]

const mockStats = {
  totalGeofences: 4,
  activeGeofences: 3,
  totalViolations: 11,
  vehiclesMonitored: 20,
}

export default function GeofencesPage() {
  const [selectedTab, setSelectedTab] = useState("2d-map")
  const [selectedGeofence, setSelectedGeofence] = useState<any>(null)

  const getTypeColor = (type: string) => {
    switch (type) {
      case "school_zone":
        return "bg-blue-100 text-blue-800"
      case "restricted":
        return "bg-red-100 text-red-800"
      case "speed_zone":
        return "bg-yellow-100 text-yellow-800"
      case "depot":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Geofence Management</h1>
          <p className="text-gray-500 mt-1">Monitor and manage location-based alerts and zones</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Create Geofence
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Geofences</p>
                <p className="text-2xl font-bold">{mockStats.totalGeofences}</p>
              </div>
              <MapPin className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Active Zones</p>
                <p className="text-2xl font-bold text-green-600">{mockStats.activeGeofences}</p>
              </div>
              <Eye className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Violations</p>
                <p className="text-2xl font-bold text-red-600">{mockStats.totalViolations}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Vehicles Monitored</p>
                <p className="text-2xl font-bold">{mockStats.vehiclesMonitored}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Visualization */}
        <div className="lg:col-span-2">
          <Card>
            <Tabs value={selectedTab} onValueChange={setSelectedTab}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Geofence Visualization</CardTitle>
                  <TabsList>
                    <TabsTrigger value="2d-map" className="gap-2">
                      <Map className="h-4 w-4" />
                      2D Map
                    </TabsTrigger>
                    <TabsTrigger value="3d-map" className="gap-2">
                      <Box className="h-4 w-4" />
                      3D View
                    </TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="2d-map" className="m-0">
                  <AdvancedMap />
                </TabsContent>
                <TabsContent value="3d-map" className="m-0">
                  <ThreeDMap />
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>

        {/* Geofence List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Geofence List
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockGeofences.map((geofence) => (
                  <div
                    key={geofence.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedGeofence?.id === geofence.id ? "border-blue-500 bg-blue-50" : ""
                    }`}
                    onClick={() => setSelectedGeofence(geofence)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{geofence.name}</h3>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-2">
                      <Badge className={`text-xs ${getTypeColor(geofence.type)}`}>
                        {geofence.type.replace("_", " ")}
                      </Badge>
                      <Badge className={`text-xs ${getStatusColor(geofence.status)}`}>{geofence.status}</Badge>
                    </div>

                    <div className="text-xs text-gray-500 space-y-1">
                      <div className="flex justify-between">
                        <span>Violations:</span>
                        <span className={geofence.violations > 0 ? "text-red-600 font-medium" : ""}>
                          {geofence.violations}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Vehicles:</span>
                        <span>{geofence.vehicles}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Violation:</span>
                        <span>{geofence.lastViolation}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Geofence Details */}
          {selectedGeofence && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Zone Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">Name:</span>
                    <p className="text-gray-600">{selectedGeofence.name}</p>
                  </div>
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="text-gray-600">{selectedGeofence.type.replace("_", " ")}</p>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge className={`ml-2 ${getStatusColor(selectedGeofence.status)}`}>
                      {selectedGeofence.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Created:</span>
                    <p className="text-gray-600">{selectedGeofence.created}</p>
                  </div>
                  <div>
                    <span className="font-medium">Recent Activity:</span>
                    <p className="text-gray-600">
                      {selectedGeofence.violations} violations, {selectedGeofence.vehicles} vehicles monitored
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" className="flex-1">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-1" />
                    Analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
