"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Map,
  Satellite,
  Layers,
  Navigation,
  MapPin,
  AlertTriangle,
  Eye,
  EyeOff,
  Maximize,
  Minimize,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Filter,
  Search,
  Settings,
} from "lucide-react"

// Mock map data
const mockMapLayers = {
  satellite: true,
  terrain: false,
  traffic: true,
  weather: false,
  heatmap: false,
}

const mockVehicleData = [
  {
    id: "V001",
    position: { lat: 6.9271, lng: 79.8612 },
    status: "active",
    driver: "Kamal Perera",
    route: "Colombo-Kandy",
    speed: 45,
    heading: 90,
    lastUpdate: new Date(),
  },
  {
    id: "V002",
    position: { lat: 6.0329, lng: 80.2168 },
    status: "warning",
    driver: "Sunil Silva",
    route: "Galle-Matara",
    speed: 65,
    heading: 180,
    lastUpdate: new Date(),
  },
]

const mockGeofenceData = [
  {
    id: "GF001",
    name: "Colombo School Zone",
    type: "school_zone",
    center: { lat: 6.9271, lng: 79.8612 },
    radius: 500,
    active: true,
    violations: 2,
  },
  {
    id: "GF002",
    name: "Highway Speed Zone",
    type: "speed_zone",
    center: { lat: 6.8, lng: 79.9 },
    radius: 1000,
    active: true,
    violations: 0,
  },
]

// Map Controls Component
function MapControls({ mapType, setMapType, layers, setLayers, onZoomIn, onZoomOut, onReset }: any) {
  return (
    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border">
      <div className="p-3">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Map Controls
        </h3>

        {/* Map Type Selector */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Map Type</label>
          <Tabs value={mapType} onValueChange={setMapType} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="roadmap" className="text-xs">
                <Map className="h-3 w-3 mr-1" />
                Road
              </TabsTrigger>
              <TabsTrigger value="satellite" className="text-xs">
                <Satellite className="h-3 w-3 mr-1" />
                Satellite
              </TabsTrigger>
              <TabsTrigger value="terrain" className="text-xs">
                <Layers className="h-3 w-3 mr-1" />
                Terrain
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Layer Controls */}
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Layers</label>
          <div className="space-y-2">
            {Object.entries(layers).map(([key, value]) => (
              <Button
                key={key}
                variant={value ? "default" : "outline"}
                size="sm"
                onClick={() => setLayers({ ...layers, [key]: !value })}
                className="w-full justify-start text-xs"
              >
                {value ? <Eye className="h-3 w-3 mr-2" /> : <EyeOff className="h-3 w-3 mr-2" />}
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onZoomIn}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onZoomOut}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

// Vehicle Marker Component
function VehicleMarker({ vehicle, onClick }: any) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "warning":
        return "bg-red-500"
      case "safe":
        return "bg-green-500"
      default:
        return "bg-blue-500"
    }
  }

  return (
    <div
      className="relative cursor-pointer transform hover:scale-110 transition-transform"
      onClick={() => onClick(vehicle)}
    >
      <div className={`w-4 h-4 rounded-full ${getStatusColor(vehicle.status)} border-2 border-white shadow-lg`}>
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse"></div>
      </div>
      <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium shadow-lg border whitespace-nowrap">
        {vehicle.id}
      </div>
    </div>
  )
}

// Geofence Overlay Component
function GeofenceOverlay({ geofence, onClick }: any) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case "school_zone":
        return "border-blue-500 bg-blue-500/20"
      case "restricted":
        return "border-red-500 bg-red-500/20"
      case "speed_zone":
        return "border-yellow-500 bg-yellow-500/20"
      default:
        return "border-gray-500 bg-gray-500/20"
    }
  }

  return (
    <div
      className={`absolute rounded-full border-2 ${getTypeColor(geofence.type)} cursor-pointer hover:opacity-80 transition-opacity`}
      style={{
        width: `${geofence.radius / 10}px`,
        height: `${geofence.radius / 10}px`,
        transform: "translate(-50%, -50%)",
      }}
      onClick={() => onClick(geofence)}
    >
      <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm rounded px-2 py-1 text-xs font-medium shadow-lg">
        {geofence.name}
      </div>
    </div>
  )
}

// Main Advanced Map Component
export function AdvancedMap() {
  const [mapType, setMapType] = useState("satellite")
  const [layers, setLayers] = useState(mockMapLayers)
  const [selectedVehicle, setSelectedVehicle] = useState<any>(null)
  const [selectedGeofence, setSelectedGeofence] = useState<any>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const mapRef = useRef<any>()

  const handleVehicleClick = (vehicle: any) => {
    setSelectedVehicle(vehicle)
    setSelectedGeofence(null)
  }

  const handleGeofenceClick = (geofence: any) => {
    setSelectedGeofence(geofence)
    setSelectedVehicle(null)
  }

  const handleZoomIn = () => {
    console.log("Zooming in")
  }

  const handleZoomOut = () => {
    console.log("Zooming out")
  }

  const handleReset = () => {
    console.log("Resetting map view")
  }

  return (
    <div className={`relative ${isFullscreen ? "fixed inset-0 z-50 bg-white" : "w-full h-[600px]"}`}>
      {/* Map Container */}
      <div className="w-full h-full bg-gradient-to-br from-green-100 via-blue-50 to-blue-100 rounded-lg overflow-hidden relative">
        {/* Simulated Map Background */}
        <div className="absolute inset-0">
          {mapType === "satellite" && (
            <div className="w-full h-full bg-gradient-to-br from-green-800 via-green-600 to-blue-800 opacity-80"></div>
          )}
          {mapType === "roadmap" && (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 via-white to-gray-200"></div>
          )}
          {mapType === "terrain" && (
            <div className="w-full h-full bg-gradient-to-br from-amber-100 via-green-100 to-blue-100"></div>
          )}

          {/* Grid overlay for reference */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                  <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#000" strokeWidth="1" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>

        {/* Vehicle Markers */}
        {mockVehicleData.map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="absolute"
            style={{
              left: `${20 + index * 150}px`,
              top: `${100 + index * 80}px`,
            }}
          >
            <VehicleMarker vehicle={vehicle} onClick={handleVehicleClick} />
          </div>
        ))}

        {/* Geofence Overlays */}
        {mockGeofenceData.map((geofence, index) => (
          <div
            key={geofence.id}
            className="absolute"
            style={{
              left: `${150 + index * 200}px`,
              top: `${200 + index * 100}px`,
            }}
          >
            <GeofenceOverlay geofence={geofence} onClick={handleGeofenceClick} />
          </div>
        ))}

        {/* Traffic Layer */}
        {layers.traffic && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 left-10 w-32 h-2 bg-red-500 opacity-60 rounded"></div>
            <div className="absolute top-40 left-40 w-24 h-2 bg-yellow-500 opacity-60 rounded"></div>
            <div className="absolute top-60 left-20 w-40 h-2 bg-green-500 opacity-60 rounded"></div>
          </div>
        )}

        {/* Weather Layer */}
        {layers.weather && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-10 right-10 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-xs">
              ☀️ 28°C Clear
            </div>
            <div className="absolute bottom-20 left-10 bg-white/80 backdrop-blur-sm rounded-lg p-2 text-xs">
              🌧️ Rain Expected
            </div>
          </div>
        )}
      </div>

      {/* Map Controls */}
      <MapControls
        mapType={mapType}
        setMapType={setMapType}
        layers={layers}
        setLayers={setLayers}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
      />

      {/* Search Bar */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-3 w-80">
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search vehicles, routes, or locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm"
          />
          <Button variant="ghost" size="sm">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Fullscreen Toggle */}
      <div className="absolute bottom-4 right-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="bg-white/90 backdrop-blur-sm"
        >
          {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
        </Button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-3">
        <h3 className="font-semibold mb-2 text-sm">Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Active Vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Warning Vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Safe Vehicle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-blue-500 bg-blue-500/20 rounded-full"></div>
            <span>School Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border-2 border-yellow-500 bg-yellow-500/20 rounded-full"></div>
            <span>Speed Zone</span>
          </div>
        </div>
      </div>

      {/* Vehicle Details Panel */}
      {selectedVehicle && (
        <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-4 w-80">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">Vehicle Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedVehicle(null)}>
              ×
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Vehicle ID:</span>
              <span>{selectedVehicle.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Driver:</span>
              <span>{selectedVehicle.driver}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Route:</span>
              <span>{selectedVehicle.route}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Speed:</span>
              <span>{selectedVehicle.speed} km/h</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={selectedVehicle.status === "warning" ? "destructive" : "default"}>
                {selectedVehicle.status}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Last Update:</span>
              <span>{selectedVehicle.lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1">
              <Navigation className="h-4 w-4 mr-1" />
              Track
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Alert
            </Button>
          </div>
        </div>
      )}

      {/* Geofence Details Panel */}
      {selectedGeofence && (
        <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-4 w-80">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-semibold">Geofence Details</h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedGeofence(null)}>
              ×
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Name:</span>
              <span>{selectedGeofence.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Type:</span>
              <span>{selectedGeofence.type.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Radius:</span>
              <span>{selectedGeofence.radius}m</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Status:</span>
              <Badge variant={selectedGeofence.active ? "default" : "secondary"}>
                {selectedGeofence.active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Violations:</span>
              <Badge variant={selectedGeofence.violations > 0 ? "destructive" : "default"}>
                {selectedGeofence.violations}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button size="sm" variant="outline" className="flex-1">
              <MapPin className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button size="sm" variant="outline" className="flex-1">
              <Eye className="h-4 w-4 mr-1" />
              Monitor
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
