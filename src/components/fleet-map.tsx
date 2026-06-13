"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Loader2 } from "lucide-react"
import type { Vehicle } from "@/lib/fleet-types"

interface FleetMapProps {
  vehicles: Vehicle[]
  selectedVehicle?: Vehicle | null
  onVehicleClick?: (vehicle: Vehicle) => void
  className?: string
}

export function FleetMap({ vehicles, selectedVehicle, onVehicleClick, className }: FleetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])

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
        script.onload = () => setMapLoaded(true)
        document.body.appendChild(script)
      } else {
        setMapLoaded(true)
      }
    }
    loadLeaflet()
  }, [])

  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !(window as any).L) return

    const L = (window as any).L
    const container = mapRef.current as any

    if (!mapInstance) {
      // Fix for "Map container is being reused by another instance"
      if (container._leaflet_id !== null && container._leaflet_id !== undefined) {
        container._leaflet_id = null
        container.innerHTML = ""
      }

      const map = L.map(container).setView([6.9271, 79.8612], 8)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map)
      setMapInstance(map)
    }
  }, [mapLoaded, mapInstance])

  useEffect(() => {
    if (!mapInstance || !mapLoaded || !(window as any).L) return

    const L = (window as any).L

    markers.forEach((marker) => mapInstance.removeLayer(marker))
    const newMarkers: any[] = []

    vehicles.forEach((vehicle) => {
      if (!vehicle.location) return

      const { lat, lng } = vehicle.location
      const isActive = vehicle.status === "active"
      const iconColor = isActive ? "#10b981" : "#9ca3af"

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            background-color: ${iconColor};
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          "></div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      })

      const marker = L.marker([lat, lng], { icon })
        .addTo(mapInstance)
        .bindPopup(`
          <div style="min-width: 180px; font-family: sans-serif; padding: 4px;">
            <h3 style="margin: 0 0 8px 0; font-weight: 900; font-size: 16px; color: #262626;">${vehicle.busNumberPlate || vehicle.busNumber}</h3>
            <div style="font-size: 12px; line-height: 1.6; color: #525252;">
              <div><strong style="color: #a3a3a3; font-size: 10px; text-transform: uppercase;">Model:</strong> ${vehicle.model}</div>
              <div><strong style="color: #a3a3a3; font-size: 10px; text-transform: uppercase;">Driver:</strong> ${vehicle.driverName || "N/A"}</div>
              <div><strong style="color: #a3a3a3; font-size: 10px; text-transform: uppercase;">Route:</strong> ${vehicle.route || "N/A"}</div>
              <div><strong style="color: #a3a3a3; font-size: 10px; text-transform: uppercase;">Speed:</strong> <span style="color: #2563eb; font-weight: bold;">${Math.round(vehicle.speed || 0)} km/h</span></div>
            </div>
          </div>
        `)

      marker.on("click", () => {
        if (onVehicleClick) onVehicleClick(vehicle)
      })

      newMarkers.push(marker)

      if (selectedVehicle?.id === vehicle.id) {
        marker.openPopup()
        mapInstance.setView([lat, lng], 13)
      }
    })

    setMarkers(newMarkers)

    if (vehicles.length > 0 && vehicles.some((v) => v.location) && !selectedVehicle) {
      const bounds = vehicles
        .filter((v) => v.location)
        .map((v) => [v.location!.lat, v.location!.lng] as [number, number])

      if (bounds.length > 0) {
        mapInstance.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
      }
    }
  }, [vehicles, mapInstance, mapLoaded, selectedVehicle])

  return (
    <div className={`relative w-full ${className}`} style={{ borderRadius: "1.5rem", overflow: "hidden", ...( !className ? { height: "500px" } : {} ) }}>
      <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0, minHeight: className ? "100%" : "500px" }} />
      {!mapLoaded && (
        <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center z-10 border border-neutral-200">
          <div className="text-center">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto mb-4" />
            <p className="text-neutral-600 font-bold">Loading Map...</p>
          </div>
        </div>
      )}
      <style jsx global>{`
        .custom-marker { background: transparent; border: none; }
        .leaflet-container { height: 100%; width: 100%; z-index: 0; }
        .leaflet-popup-content-wrapper { border-radius: 1rem; border: none; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
      `}</style>
    </div>
  )
}

