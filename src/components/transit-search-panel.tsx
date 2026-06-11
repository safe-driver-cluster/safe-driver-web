"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, MapPin, Bus, X, Search, Map as MapIcon, ArrowRightLeft, AlertTriangle } from "lucide-react"
import type { TransitResponse, TransitRouteResult } from "@/lib/maps-service"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const center = {
  lat: 7.8731, // Sri Lanka center
  lng: 80.7718
};

interface TransitSearchPanelProps {
  onClose: () => void;
  onSelect?: (route: TransitRouteResult) => void;
  initialOrigin?: string;
  initialDestination?: string;
}

export function TransitSearchPanel({ onClose, onSelect, initialOrigin = "Matara", initialDestination = "Colombo" }: TransitSearchPanelProps) {
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const layersRef = useRef<any[]>([])

  const [origin, setOrigin] = useState(initialOrigin)
  const [destination, setDestination] = useState(initialDestination)
  const [loading, setLoading] = useState(false)
  const [routes, setRoutes] = useState<TransitRouteResult[]>([])
  const [selectedRoute, setSelectedRoute] = useState<TransitRouteResult | null>(null)

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
    if (!leafletLoaded || !mapContainerRef.current || !(window as any).L || mapInstance) return

    const L = (window as any).L
    const map = L.map(mapContainerRef.current, {
      zoomControl: true,
    }).setView([center.lat, center.lng], 8)

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    setMapInstance(map)
  }, [leafletLoaded, mapInstance])

  useEffect(() => {
    return () => {
      if (mapInstance) {
        mapInstance.remove()
      }
    }
  }, [mapInstance])

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

  const { toast } = useToast()

  const handleSearch = async () => {
    if (!origin || !destination) {
      toast({ title: "Error", description: "Please enter both origin and destination", variant: "destructive" })
      return
    }

    setLoading(true)
    setRoutes([])
    setSelectedRoute(null)

    try {
      const response = await fetch("/api/maps/transit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ origin, destination }),
      })

      if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.error || "Failed to fetch route data");
      }

      const data: TransitResponse = await response.json()
      
      if (data.routes && data.routes.length > 0) {
        setRoutes(data.routes)
        setSelectedRoute(data.routes[0])
      } else {
         toast({ title: "No Routes", description: "Could not find any transit routes between these points.", variant: "destructive" })
      }
    } catch (error: any) {
      console.error("Search error:", error)
      toast({ 
        title: "Search Failed", 
        description: error.message || "Unable to find routes. Please check your connection.", 
        variant: "destructive" 
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRouteSelect = (route: TransitRouteResult) => {
      setSelectedRoute(route)
  }

  // Draw layers (route line & stop markers)
  useEffect(() => {
    if (!mapInstance || !leafletLoaded || !selectedRoute || !(window as any).L) return

    const L = (window as any).L

    // Clear old layers
    layersRef.current.forEach(layer => mapInstance.removeLayer(layer))
    layersRef.current = []

    const newLayers: any[] = []

    // Decode polyline or fallback to stops
    const pathPoints = selectedRoute.polyline 
      ? decodePolyline(selectedRoute.polyline)
      : selectedRoute.stops.map(s => ({ lat: s.lat, lng: s.lng }))

    const latLngs: Array<[number, number]> = pathPoints.map(p => [p.lat, p.lng])

    if (latLngs.length > 0) {
      // Draw route polyline
      const polyline = L.polyline(latLngs, {
        color: "#4285F4",
        weight: 6,
        opacity: 0.8,
      }).addTo(mapInstance)
      newLayers.push(polyline)

      // Fit map bounds to the polyline
      mapInstance.fitBounds(polyline.getBounds(), { padding: [50, 50] })
    }

    // Draw markers for stops
    selectedRoute.stops.forEach((stop, i) => {
      const isStart = i === 0
      const isEnd = i === selectedRoute.stops.length - 1
      const iconColor = isStart ? "#10b981" : isEnd ? "#ef4444" : "#3b82f6"

      const icon = L.divIcon({
        className: "custom-stop-marker",
        html: `
          <div style="
            background-color: ${iconColor};
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            font-weight: bold;
          ">${i + 1}</div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      const marker = L.marker([stop.lat, stop.lng], { icon }).addTo(mapInstance)
      
      marker.bindPopup(`
        <div style="font-family: sans-serif; padding: 4px;">
          <strong style="font-size: 13px; color: #1f2937;">Stop ${i + 1}: ${stop.name}</strong>
          ${stop.details ? `<div style="font-size: 11px; color: #6b7280; margin-top: 2px;">${stop.details}</div>` : ""}
        </div>
      `)

      newLayers.push(marker)
    })

    layersRef.current = newLayers
  }, [selectedRoute, mapInstance, leafletLoaded])

  return (
    <div className="fixed inset-0 z-[100] bg-neutral-900/60 backdrop-blur-md flex items-center justify-center p-6 md:p-16 animate-in fade-in duration-300">
      <div className="bg-white rounded-[2.5rem] w-full max-w-6xl h-full md:max-h-[82vh] overflow-hidden shadow-2xl flex flex-col md:flex-row border border-white/20">
        {/* Sidebar Panel - always visible, fixed size */}
        <div className="w-full md:w-[320px] lg:w-[350px] h-[40vh] md:h-full flex flex-col z-20 bg-white border-b md:border-b-0 md:border-r flex-shrink-0">
          {/* Header Search Area */}
          <div className="p-5 bg-[#4285F4] text-white flex flex-col gap-4 shadow-md shrink-0">
            <div className="flex justify-between items-center mb-0.5">
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="text-white hover:bg-white/20 rounded-xl font-bold h-8 px-2.5 gap-1.5 text-xs"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </Button>
              </div>
              <h2 className="font-bold flex items-center gap-1.5 text-base tracking-tight">
                <MapIcon className="h-4 w-4" /> Transit Search
              </h2>
            </div>

            <div className="relative pl-7 pr-0 flex flex-col gap-3">
              <div className="absolute left-0.5 top-2.5 bottom-2.5 flex flex-col items-center gap-1 w-4">
                <div className="w-2 h-2 rounded-full border-[2.5px] border-white bg-transparent"></div>
                <div className="w-0.5 flex-1 bg-white/40"></div>
                <MapPin className="h-3.5 w-3.5 text-white" />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Starting point"
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-100 focus-visible:ring-white h-9 rounded-xl text-xs shadow-inner flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
              </div>

              <div className="flex items-center gap-2">
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destination"
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-100 focus-visible:ring-white h-9 rounded-xl text-xs shadow-inner flex-1"
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-white hover:bg-white/20 rounded-full w-8 h-8 shadow-sm border border-white/10"
                  onClick={() => {
                    const temp = origin;
                    setOrigin(destination);
                    setDestination(temp);
                  }}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 rotate-90" />
                </Button>
              </div>
            </div>

            <Button
              onClick={handleSearch}
              disabled={loading}
              className="w-full bg-white text-[#4285F4] hover:bg-neutral-100 font-bold rounded-xl h-10 text-xs shadow-md hover:-translate-y-0.5 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" /> Searching...
                </>
              ) : (
                <>
                  <Search className="h-3.5 w-3.5 mr-2" /> Search Routes
                </>
              )}
            </Button>
          </div>

          {/* Results Area */}
          <div className="flex-1 overflow-y-auto bg-neutral-50 flex flex-col">
            {routes.length === 0 && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-neutral-400 p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center shadow-inner">
                  <Bus className="h-8 w-8 text-neutral-300" />
                </div>
                <p className="text-sm font-medium">
                  Enter a starting point and destination to see transit options.
                </p>
              </div>
            )}

            <div className="p-3 gap-3 flex flex-col">
              {routes.map((route, i) => (
                <Card
                  key={route.id || i}
                  className={`cursor-pointer transition-all duration-200 border-2 rounded-2xl overflow-hidden ${selectedRoute?.id === route.id ? "border-[#4285F4] shadow-md bg-blue-50/10" : "border-neutral-100 shadow-sm hover:border-blue-200"}`}
                  onClick={() => handleRouteSelect(route)}
                >
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-sm font-black text-neutral-800">
                          {route.departureTime} — {route.arrivalTime}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-bold mt-0.5">
                          From {route.stops[0]?.name || "Origin"}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-black text-blue-600">
                          {Math.floor(route.duration / 60) > 0 &&
                            `${Math.floor(route.duration / 60)} hr `}
                          {route.duration % 60} min
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="bg-neutral-100 p-1.5 rounded-lg">
                        <Bus className="h-3.5 w-3.5 text-neutral-600" />
                      </div>
                      {route.busLine && (
                        <Badge className="bg-[#4285F4] hover:bg-[#3367D6] px-2 py-0.5 text-[10px] font-bold rounded-md">
                          {route.busLine}
                        </Badge>
                      )}
                      {route.distance && (
                         <span className="text-[10px] font-bold text-neutral-400 ml-auto">
                            {route.distance.toFixed(1)} km
                         </span>
                      )}
                    </div>

                    {selectedRoute?.id === route.id && (
                      <div className="mt-2 pt-4 border-t border-neutral-100 space-y-4 animate-in slide-in-from-top-2">
                        <div className="flex justify-between items-center">
                          <h4 className="text-[10px] font-black uppercase text-neutral-400 tracking-widest">
                            Route Details
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 rounded-lg"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoute(null);
                            }}
                          >
                            Back
                          </Button>
                        </div>

                        {onSelect && (
                          <Button 
                            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest rounded-xl h-9"
                            onClick={(e) => {
                                e.stopPropagation();
                                onSelect(route);
                            }}
                          >
                            Use This Route
                          </Button>
                        )}
                        <div className="relative pl-5 space-y-5 before:absolute before:inset-y-3 before:left-[9px] before:w-0.5 before:bg-blue-100">
                          {route.stops.map((stop, idx) => (
                            <div key={idx} className="relative min-w-0">
                              <div
                                className={`absolute -left-[25px] top-1.5 w-3 h-3 rounded-full border-[3px] border-white shadow-sm ${idx === 0 || idx === route.stops.length - 1 ? "bg-blue-600 scale-110" : "bg-blue-300"}`}
                              ></div>
                              <p className="text-xs font-bold text-neutral-800 leading-tight break-words">
                                {stop.name}
                              </p>
                              {stop.details && (
                                <p className="text-[9px] text-neutral-500 mt-0.5 font-medium break-words">
                                  {stop.details}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Map Area */}
        <div className="flex-1 relative bg-neutral-100 h-[55vh] md:h-full">
          <div ref={mapContainerRef} className="w-full h-full" style={{ zIndex: 0 }} />
          {!leafletLoaded && (
            <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center z-10 border border-neutral-200">
              <div className="text-center">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin mx-auto mb-4" />
                <p className="text-neutral-600 font-bold">Loading Map...</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style jsx global>{`
        .custom-stop-marker { background: transparent; border: none; }
        .leaflet-container { height: 100%; width: 100%; z-index: 0; }
        .leaflet-popup-content-wrapper { border-radius: 1rem; border: none; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
      `}</style>
    </div>
  );
}
