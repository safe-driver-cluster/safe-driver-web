"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin, AlertTriangle, Shield, Trash2, Save, X, Navigation } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { hazardService } from "@/lib/hazard-service"

import type { HazardZone, HazardType } from "@/lib/route-types"
import { Badge } from "@/components/ui/badge"
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
import { Edit } from "lucide-react"

const center = {
  lat: 7.8731, // Sri Lanka center
  lng: 80.7718,
}

const formatHazardType = (type: string, customType?: string) => {
  if (type === "other" && customType) return customType;
  switch (type) {
    case "accident": return "Accident Prone Zone";
    case "dangerous_bend": return "Dangerous Bend";
    case "mountain_descent": return "Mountain Descent";
    case "slippery_road": return "Slippery Road";
    case "narrow_road": return "Narrow Road";
    case "school": return "School Zone";
    case "speed": return "Speed Zone";
    default: return type.replace(/_/g, ' ');
  }
}

export function HazardMonitoringMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const layersRef = useRef<any[]>([])
  const hazardMarkersRef = useRef<{ [key: string]: any }>({})

  const [hazards, setHazards] = useState<HazardZone[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedHazard, setSelectedHazard] = useState<HazardZone | null>(null)
  const [newHazardPos, setNewHazardPos] = useState<{ lat: number; lng: number } | null>(null)
  const [hazardDetails, setHazardDetails] = useState({
    name: "",
    type: "other" as HazardType,
    radius: 500,
    location: "",
    customType: "",
  })

  const [editingHazardId, setEditingHazardId] = useState<string | null>(null)
  const [hazardToDelete, setHazardToDelete] = useState<HazardZone | null>(null)

  const { toast } = useToast()

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
        script.onload = () => setMapLoaded(true)
        document.body.appendChild(script)
      } else {
        setMapLoaded(true)
      }
    }
    loadLeaflet()
  }, [])

  // Initialize Map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !(window as any).L || mapInstance) return

    const L = (window as any).L
    const container = mapRef.current as any
    
    // Fix for "Map container is being reused by another instance"
    if (container._leaflet_id !== null && container._leaflet_id !== undefined) {
      container._leaflet_id = null
      container.innerHTML = ""
    }

    const map = L.map(container).setView([center.lat, center.lng], 8)
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    setMapInstance(map)
  }, [mapLoaded, mapInstance])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const allHazards = await hazardService.getAllHazards()
      setHazards(allHazards)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast({ title: "Error", description: "Failed to load hazards and routes", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }, [toast])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Setup click handler
  useEffect(() => {
    if (!mapInstance || !mapLoaded || !(window as any).L) return

    const L = (window as any).L

    const onMapClick = (e: any) => {
      const { lat, lng } = e.latlng
      setNewHazardPos({ lat, lng })
      setSelectedHazard(null)
      setEditingHazardId(null)
      setHazardDetails({
        name: "",
        type: "other",
        radius: 500,
        location: "Detected Location",
        customType: "",
      })
    }

    mapInstance.on("click", onMapClick)

    return () => {
      mapInstance.off("click", onMapClick)
    }
  }, [mapInstance, mapLoaded])

  const handleDeleteHazard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hazard zone?")) return

    try {
      await hazardService.deleteHazard(id)
      toast({ title: "Success", description: "Hazard zone deleted." })
      setSelectedHazard(null)
      if (editingHazardId === id) {
        setNewHazardPos(null)
        setEditingHazardId(null)
      }
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete hazard zone", variant: "destructive" })
    }
  }

  // Draw layers
  useEffect(() => {
    if (!mapInstance || !mapLoaded || !(window as any).L) return

    const L = (window as any).L

    // Clear old layers
    layersRef.current.forEach((layer) => mapInstance.removeLayer(layer))
    layersRef.current = []
    hazardMarkersRef.current = {}

    const newLayers: any[] = []

    // 1. Draw existing hazards
    hazards.forEach((hazard) => {
      const position: [number, number] = [hazard.latitude, hazard.longitude]
      const color = hazard.type === "accident" ? "#ef4444" : "#f59e0b"

      // Circle overlay
      const circle = L.circle(position, {
        radius: hazard.radius,
        fillColor: color,
        fillOpacity: 0.2,
        color: color,
        weight: 1.5,
      }).addTo(mapInstance)
      newLayers.push(circle)

      // Marker icon (custom teardrop map pin)
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

      const marker = L.marker(position, { icon }).addTo(mapInstance)

      const popupContent = `
        <div class="p-2" style="min-width: 180px; font-family: sans-serif;">
          <h3 class="font-bold text-sm mb-1" style="margin: 0 0 4px 0; font-weight: 700; font-size: 14px; color: #1f2937;">${hazard.name}</h3>
          <p class="text-xs text-muted-foreground capitalize" style="margin: 0 0 8px 0; color: #6b7280;">Type: ${formatHazardType(hazard.type, hazard.customType)}</p>
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="background: #f3f4f6; color: #374151; font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px;">${hazard.radius}m</span>
            <button
              id="delete-hazard-btn"
              data-hazard-id="${hazard.id}"
              style="
                background: none;
                border: none;
                color: #ef4444;
                cursor: pointer;
                padding: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 4px;
              "
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
            </button>
          </div>
        </div>
      `
      marker.bindPopup(popupContent)

      marker.on("click", () => {
        setSelectedHazard(hazard)
      })

      if (hazard.id) {
        hazardMarkersRef.current[hazard.id] = marker
      }

      newLayers.push(marker)
    })

    // 2. Draw new hazard marker and circle if drafting
    if (newHazardPos) {
      const position: [number, number] = [newHazardPos.lat, newHazardPos.lng]
      const color = "#3b82f6" // blue

      const circle = L.circle(position, {
        radius: hazardDetails.radius,
        fillColor: color,
        fillOpacity: 0.15,
        color: color,
        weight: 1.5,
        dashArray: "4, 4"
      }).addTo(mapInstance)
      newLayers.push(circle)

      const icon = L.divIcon({
        className: "custom-hazard-draft-marker",
        html: `
          <div style="position: relative; width: 32px; height: 32px; animation: bounce-pulse 1.5s infinite;">
            <svg viewBox="0 0 24 24" width="32" height="32" style="display: block; filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.35));">
              <path fill="${color}" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle cx="12" cy="9" r="3.5" fill="rgba(0, 0, 0, 0.4)"/>
            </svg>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      })

      const marker = L.marker(position, { icon }).addTo(mapInstance)
      newLayers.push(marker)
    }

    layersRef.current = newLayers

    const handlePopupOpen = (e: any) => {
      const container = e.popup.getElement()
      const deleteBtn = container.querySelector("#delete-hazard-btn")
      if (deleteBtn) {
        deleteBtn.onclick = () => {
          const hazardId = deleteBtn.getAttribute("data-hazard-id")
          if (hazardId) {
            handleDeleteHazard(hazardId)
          }
        }
      }
    }

    mapInstance.on("popupopen", handlePopupOpen)
    return () => {
      mapInstance.off("popupopen", handlePopupOpen)
    }
  }, [hazards, newHazardPos, hazardDetails.radius, mapInstance, mapLoaded])

  // Track selection
  useEffect(() => {
    if (!mapInstance || !selectedHazard) return
    const marker = hazardMarkersRef.current[selectedHazard.id!]
    if (marker) {
      marker.openPopup()
      mapInstance.setView([selectedHazard.latitude, selectedHazard.longitude], 14)
    }
  }, [selectedHazard, mapInstance])

  const handleSaveHazard = async () => {
    if (!newHazardPos) return

    setSaving(true)
    try {
      const hazardData = {
        name: hazardDetails.name,
        type: hazardDetails.type,
        radius: hazardDetails.radius,
        latitude: newHazardPos.lat,
        longitude: newHazardPos.lng,
        location: hazardDetails.location,
        ...(hazardDetails.type === "other" && hazardDetails.customType
          ? { customType: hazardDetails.customType }
          : {}),
      }

      if (editingHazardId) {
        await hazardService.updateHazard(editingHazardId, hazardData)
        toast({ title: "Success", description: "Hazard zone updated successfully." })
      } else {
        await hazardService.saveHazard(hazardData)
        toast({ title: "Success", description: "Hazard zone saved and associated with routes." })
      }
      
      setNewHazardPos(null)
      setEditingHazardId(null)
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save hazard zone", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteHazardConfirmed = async () => {
    if (!hazardToDelete || !hazardToDelete.id) return
    await handleDeleteHazard(hazardToDelete.id)
    setHazardToDelete(null)
  }

  const handleCancelEdit = () => {
    setNewHazardPos(null)
    setEditingHazardId(null)
  }

  const handleEditHazard = (h: HazardZone, e: React.MouseEvent) => {
    e.stopPropagation()
    setEditingHazardId(h.id!)
    setNewHazardPos({ lat: h.latitude, lng: h.longitude })
    setHazardDetails({
      name: h.name,
      type: h.type,
      radius: h.radius,
      location: h.location || "",
      customType: h.customType || "",
    })
    if (mapInstance) mapInstance.panTo([h.latitude, h.longitude])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border shadow-xl" style={{ height: "700px" }}>
        <div ref={mapRef} className="w-full h-full" style={{ zIndex: 0 }} />

        {!mapLoaded && (
          <div className="absolute inset-0 bg-neutral-100 flex items-center justify-center z-10 border border-neutral-200">
            <div className="text-center">
              <Loader2 className="h-10 w-10 text-emerald-500 animate-spin mx-auto mb-4" />
              <p className="text-neutral-600 font-bold">Loading Map...</p>
            </div>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
            <div className="text-center">
              <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-primary" />
              <p className="font-medium">Updating map data...</p>
            </div>
          </div>
        )}
      </div>

      <div className="lg:col-span-1 space-y-6">
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="bg-primary/5">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              {newHazardPos ? (editingHazardId ? "Edit Hazard Details" : "New Hazard Details") : "Hazard Monitoring"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!newHazardPos ? (
              <div className="space-y-4">
                <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-lg p-4 text-amber-800 dark:text-amber-300 text-sm">
                  <p className="font-bold mb-1">How to add a hazard:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Click anywhere on the map</li>
                    <li>Fill in the danger details</li>
                    <li>Save to notify relevant routes</li>
                  </ul>
                </div>
                
                </div>
            ) : (
              <div className="space-y-4 animate-in slide-in-from-right-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Hazard Name</label>
                  <Input
                    value={hazardDetails.name}
                    onChange={(e) => setHazardDetails({ ...hazardDetails, name: e.target.value })}
                    placeholder="e.g. Dangerous Bend - Kottawa"
                    className="h-9"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Latitude</label>
                    <Input
                      value={newHazardPos.lat.toFixed(4)}
                      disabled
                      className="h-9 bg-muted/50 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Longitude</label>
                    <Input
                      value={newHazardPos.lng.toFixed(4)}
                      disabled
                      className="h-9 bg-muted/50 font-mono text-xs cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
                  <Select
                    value={hazardDetails.type}
                    onValueChange={(val: HazardType) => setHazardDetails({ ...hazardDetails, type: val })}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="accident">Accident Prone Zone</SelectItem>
                      <SelectItem value="dangerous_bend">Dangerous Bend</SelectItem>
                      <SelectItem value="mountain_descent">Mountain Descent</SelectItem>
                      <SelectItem value="slippery_road">Slippery Road</SelectItem>
                      <SelectItem value="narrow_road">Narrow Road</SelectItem>
                      <SelectItem value="other">Other Danger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {hazardDetails.type === "other" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <label className="text-xs font-bold text-rose-500 uppercase flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3" />
                      Specify Other Danger
                    </label>
                    <Input
                      value={hazardDetails.customType}
                      onChange={(e) => setHazardDetails({ ...hazardDetails, customType: e.target.value })}
                      placeholder="e.g. Construction, Flooding, etc."
                      className="h-9 border-rose-100 focus:border-rose-300 focus:ring-rose-200"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Radius (meters)</label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={hazardDetails.radius}
                      onChange={(e) => setHazardDetails({ ...hazardDetails, radius: parseInt(e.target.value) })}
                      className="h-9"
                    />
                    <span className="text-xs text-muted-foreground font-medium">m</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Location Context</label>
                  <Input
                    value={hazardDetails.location}
                    onChange={(e) => setHazardDetails({ ...hazardDetails, location: e.target.value })}
                    placeholder="e.g. Near 105km post"
                    className="h-9"
                  />
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 font-bold"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-4 w-4 mr-2" /> Cancel
                  </Button>
                  <Button
                    className="flex-1 h-10 font-bold"
                    disabled={saving || !hazardDetails.name}
                    onClick={handleSaveHazard}
                  >
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {editingHazardId ? "Update" : "Save"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Full-width Active Zones Row */}
      <div className="lg:col-span-4 mt-2">
        <Card className="border border-border shadow-sm bg-card text-card-foreground overflow-hidden rounded-[2rem]">
          <CardHeader className="px-8 pt-8 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black text-foreground tracking-tight flex items-center gap-3">
                <div className="p-2 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Active Safety Zones ({hazards.length})
              </CardTitle>
              <Badge variant="outline" className="rounded-full px-4 py-1.5 font-bold border-border">
                Network Status: Operational
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {hazards.map((h) => (
                <div 
                  key={h.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-border hover:bg-muted/70 hover:border-amber-500/50 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedHazard(h)
                    if (mapInstance) mapInstance.panTo([h.latitude, h.longitude])
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-sm transition-transform group-hover:scale-110 ${h.type === 'accident' ? 'bg-red-50 dark:bg-red-950/20 text-red-500' : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600'}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-foreground">{h.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-0.5">
                        {formatHazardType(h.type, h.customType)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge variant="secondary" className="bg-background border-border text-[10px] font-black rounded-lg">
                      {h.radius}m
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-primary hover:bg-primary/10" onClick={(e) => handleEditHazard(h, e)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-50 hover:text-red-600" onClick={(e) => {
                        e.stopPropagation()
                        setHazardToDelete(h)
                      }}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {hazards.length === 0 && (
                <div className="col-span-full py-12 text-center bg-muted/20 rounded-[2rem] border border-dashed border-border">
                  <div className="p-4 bg-background rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-border">
                    <MapPin className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground font-bold">No safety zones have been marked yet.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Click on the map above to start marking hazards.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!hazardToDelete} onOpenChange={(open) => !open && setHazardToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the hazard "{hazardToDelete?.name}" and remove it from all associated routes. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteHazardConfirmed} className="bg-red-500 hover:bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <style jsx global>{`
        .custom-hazard-marker { background: transparent; border: none; }
        .custom-hazard-draft-marker { background: transparent; border: none; }
        .leaflet-container { height: 100%; width: 100%; z-index: 0; }
        .leaflet-popup-content-wrapper { border-radius: 1rem; border: none; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1); }
        @keyframes bounce-pulse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
