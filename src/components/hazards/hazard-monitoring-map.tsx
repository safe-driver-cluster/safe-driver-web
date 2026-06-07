"use client"

import { useState, useCallback, useEffect } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, Circle } from "@react-google-maps/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, MapPin, AlertTriangle, Shield, Trash2, Save, X, Navigation } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { hazardService } from "@/lib/hazard-service"

import type { HazardZone, HazardType } from "@/lib/route-types"
import { Badge } from "@/components/ui/badge"

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

const mapContainerStyle = {
  width: "100%",
  height: "700px",
}

const center = {
  lat: 7.8731, // Sri Lanka center
  lng: 80.7718,
}

export function HazardMonitoringMap() {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  })

  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [hazards, setHazards] = useState<HazardZone[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [selectedHazard, setSelectedHazard] = useState<HazardZone | null>(null)
  const [newHazardPos, setNewHazardPos] = useState<google.maps.LatLngLiteral | null>(null)
  const [hazardDetails, setHazardDetails] = useState({
    name: "",
    type: "other" as HazardType,
    radius: 500,
    location: "",
    customType: "",
  })

  const { toast } = useToast()

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

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      setNewHazardPos({ lat: e.latLng.lat(), lng: e.latLng.lng() })
      setSelectedHazard(null)
      setHazardDetails({
        name: `Hazard at ${e.latLng.lat().toFixed(4)}, ${e.latLng.lng().toFixed(4)}`,
        type: "other",
        radius: 500,
        location: "Detected Location",
        customType: "",
      })
    }
  }, [])

  const handleSaveHazard = async () => {
    if (!newHazardPos) return

    setSaving(true)
    try {
      await hazardService.saveHazard({
        name: hazardDetails.name,
        type: hazardDetails.type,
        radius: hazardDetails.radius,
        latitude: newHazardPos.lat,
        longitude: newHazardPos.lng,
        location: hazardDetails.location,
        ...(hazardDetails.type === "other" && hazardDetails.customType
          ? { customType: hazardDetails.customType }
          : {}),
      })
      toast({ title: "Success", description: "Hazard zone saved and associated with routes." })
      setNewHazardPos(null)
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to save hazard zone", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteHazard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hazard zone?")) return

    try {
      await hazardService.deleteHazard(id)
      toast({ title: "Success", description: "Hazard zone deleted." })
      setSelectedHazard(null)
      fetchData()
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete hazard zone", variant: "destructive" })
    }
  }

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  if (!isLoaded) {
    return (
      <div className="h-[600px] flex items-center justify-center bg-muted rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3 relative rounded-2xl overflow-hidden border shadow-xl">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={8}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={onMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: true,
            streetViewControl: false,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {/* Display Existing Hazards */}
          {hazards.map((hazard) => (
            <div key={hazard.id}>
              <Marker
                position={{ lat: hazard.latitude, lng: hazard.longitude }}
                icon={{
                  url: hazard.type === "accident" ? "https://maps.google.com/mapfiles/ms/icons/red-dot.png" : "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
                }}
                onClick={() => setSelectedHazard(hazard)}
              />
              <Circle
                center={{ lat: hazard.latitude, lng: hazard.longitude }}
                radius={hazard.radius}
                options={{
                  fillColor: hazard.type === "accident" ? "#ef4444" : "#f59e0b",
                  fillOpacity: 0.2,
                  strokeColor: hazard.type === "accident" ? "#ef4444" : "#f59e0b",
                  strokeWeight: 1,
                }}
              />
            </div>
          ))}

          {/* New Hazard Marker */}
          {newHazardPos && (
            <Marker
              position={newHazardPos}
              animation={google.maps.Animation.BOUNCE}
              icon={{
                url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
              }}
            />
          )}



          {selectedHazard && (
            <InfoWindow
              position={{ lat: selectedHazard.latitude, lng: selectedHazard.longitude }}
              onCloseClick={() => setSelectedHazard(null)}
            >
              <div className="p-2 max-w-[200px]">
                <h3 className="font-bold text-sm mb-1">{selectedHazard.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 capitalize">Type: {selectedHazard.type}</p>
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{selectedHazard.radius}m</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDeleteHazard(selectedHazard.id!)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </InfoWindow>
          )}
        </GoogleMap>

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
              {newHazardPos ? "New Hazard Details" : "Hazard Monitoring"}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {!newHazardPos ? (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800 text-sm">
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
                      <SelectItem value="accident">Accident Prone</SelectItem>
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
                    onClick={() => setNewHazardPos(null)}
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
                    Save
                  </Button>
                </div>
                <p className="text-[10px] text-center text-muted-foreground mt-2">
                  Routes passing within 2km will be automatically notified.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Full-width Active Zones Row */}
      <div className="lg:col-span-4 mt-2">
        <Card className="border-none shadow-sm bg-white overflow-hidden rounded-[2rem]">
          <CardHeader className="px-8 pt-8 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
                <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                Active Safety Zones ({hazards.length})
              </CardTitle>
              <Badge variant="outline" className="rounded-full px-4 py-1.5 font-bold border-neutral-200">
                Network Status: Operational
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {hazards.map((h) => (
                <div 
                  key={h.id} 
                  className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50/50 border border-neutral-100 hover:bg-neutral-50 hover:border-amber-200 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => {
                    setSelectedHazard(h)
                    if (map) map.panTo({ lat: h.latitude, lng: h.longitude })
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl shadow-sm transition-transform group-hover:scale-110 ${h.type === 'accident' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'}`}>
                      <AlertTriangle className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-neutral-800">{h.name}</p>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-0.5">
                        {h.type === "other" && h.customType ? h.customType : h.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <Badge variant="secondary" className="bg-white border-neutral-200 text-[10px] font-black rounded-lg">
                      {h.radius}m
                    </Badge>
                  </div>
                </div>
              ))}
              {hazards.length === 0 && (
                <div className="col-span-full py-12 text-center bg-neutral-50 rounded-[2rem] border border-dashed border-neutral-200">
                  <div className="p-4 bg-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-sm">
                    <MapPin className="h-8 w-8 text-neutral-200" />
                  </div>
                  <p className="text-neutral-400 font-bold">No safety zones have been marked yet.</p>
                  <p className="text-xs text-neutral-300 mt-1">Click on the map above to start marking hazards.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
