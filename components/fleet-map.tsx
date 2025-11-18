"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation, AlertTriangle, Bus } from "lucide-react"
import type { Vehicle } from "@/lib/fleet-types"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FleetMapProps {
  vehicles: Vehicle[]
  selectedVehicle?: Vehicle | null
  onVehicleClick?: (vehicle: Vehicle) => void
}

export function FleetMap({ vehicles, selectedVehicle, onVehicleClick }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

  useEffect(() => {
    // Dynamically load Leaflet CSS and JS
    const loadLeaflet = async () => {
      if (typeof window === "undefined") return

      // Load CSS
      if (!document.querySelector('link[href*="leaflet"]')) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        link.crossOrigin = ""
        document.head.appendChild(link)
      }

      // Load JS
      if (!(window as any).L) {
        const script = document.createElement("script")
        script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"
        script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo="
        script.crossOrigin = ""
        script.onload = () => {
          setMapLoaded(true)
        }
        document.body.appendChild(script)
      } else {
        setMapLoaded(true)
      }
    }

    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || typeof window === "undefined" || !(window as any).L) return

    const L = (window as any).L

    // Initialize map centered on Sri Lanka (Colombo)
    if (!mapInstance) {
      const map = L.map(mapRef.current).setView([6.9271, 79.8612], 8)

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      setMapInstance(map)
    }

    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [mapLoaded, mapInstance])

  useEffect(() => {
    if (!mapInstance || !mapLoaded || typeof window === "undefined" || !(window as any).L) return

    const L = (window as any).L

    // Clear existing markers
    markers.forEach((marker) => {
      mapInstance.removeLayer(marker)
    })

    const newMarkers: any[] = []

    // Add markers for each vehicle
    vehicles.forEach((vehicle) => {
      if (!vehicle.location) return

      const { lat, lng } = vehicle.location

      // Choose icon color based on status
      let iconColor = "#6b7280" // inactive - gray
      if (vehicle.status === "active") {
        iconColor = "#10b981" // active - green
      } else if (vehicle.status === "maintenance") {
        iconColor = "#f59e0b" // maintenance - orange
      }

      // Create custom icon
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${iconColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            border: 3px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div style="
              transform: rotate(45deg);
              color: white;
              font-size: 16px;
              font-weight: bold;
            ">🚌</div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })

      const marker = L.marker([lat, lng], { icon })
        .addTo(mapInstance)
        .bindPopup(`
          <div style="min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold;">${vehicle.busNumber}</h3>
            <p style="margin: 4px 0;"><strong>Model:</strong> ${vehicle.model}</p>
            <p style="margin: 4px 0;"><strong>Driver:</strong> ${vehicle.driverName || "Not assigned"}</p>
            <p style="margin: 4px 0;"><strong>Route:</strong> ${vehicle.route || "Not assigned"}</p>
            <p style="margin: 4px 0;"><strong>Status:</strong> ${vehicle.status}</p>
            <p style="margin: 4px 0;"><strong>Speed:</strong> ${Math.round(vehicle.speed)} km/h</p>
            <p style="margin: 4px 0;"><strong>Fuel:</strong> ${Math.round(vehicle.fuel)}%</p>
          </div>
        `)

      marker.on("click", () => {
        if (onVehicleClick) {
          onVehicleClick(vehicle)
        }
      })

      newMarkers.push(marker)

      // Highlight selected vehicle
      if (selectedVehicle && vehicle.id === selectedVehicle.id) {
        marker.openPopup()
        mapInstance.setView([lat, lng], 13)
      }
    })

    setMarkers(newMarkers)

    // Fit map to show all vehicles if there are any
    if (vehicles.length > 0 && vehicles.some((v) => v.location)) {
      const bounds = vehicles
        .filter((v) => v.location)
        .map((v) => [v.location!.lat, v.location!.lng] as [number, number])

      if (bounds.length > 0) {
        mapInstance.fitBounds(bounds, { padding: [50, 50] })
      }
    }
  }, [vehicles, mapInstance, mapLoaded, selectedVehicle, onVehicleClick])

  return (
    <div className="relative w-full" style={{ height: "500px" }}>
      <div ref={mapRef} className="w-full h-full rounded-lg" style={{ zIndex: 0, minHeight: "500px" }} />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center z-10">
          <div className="text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-2 animate-pulse" />
            <p className="text-gray-600">Loading map...</p>
            <p className="text-sm text-gray-500 mt-1">Initializing interactive map view</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .leaflet-container {
          height: 100%;
          width: 100%;
          border-radius: 0.5rem;
          z-index: 0;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  )
}

