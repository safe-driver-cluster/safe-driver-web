"use client"

import { useState, useEffect } from "react"
import { Search, MapPin, Map as MapIcon } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FleetMap } from "./fleet-map"
import type { Vehicle } from "@/lib/fleet-types"

interface LiveTrackingDashboardProps {
  vehicles: Vehicle[]
}

export function LiveTrackingDashboard({ vehicles: initialVehicles }: LiveTrackingDashboardProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [liveVehicles, setLiveVehicles] = useState<Vehicle[]>(initialVehicles)

  // Polling for live tracking
  useEffect(() => {
    const fetchLiveVehicles = async () => {
      try {
        const res = await fetch("/api/fleet?status=active")
        if (res.ok) {
          const data = await res.json()
          setLiveVehicles(data)
        }
      } catch (error) {
        console.error("Failed to fetch live vehicles:", error)
      }
    }

    // Initial fetch to make sure we only have active ones
    fetchLiveVehicles()

    const interval = setInterval(fetchLiveVehicles, 10000) // Poll every 10 seconds
    return () => clearInterval(interval)
  }, [])

  // Filter based on search query
  const filteredVehicles = liveVehicles.filter(v => 
    v.busNumber?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    v.busNumberPlate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.route?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Compute unique routes for pills
  const uniqueRoutes = Array.from(new Set(
    liveVehicles
      .map(v => v.route || v.routeId)
      .filter(Boolean)
  )) as string[]

  return (
    <div className="relative w-full h-[calc(100vh-220px)] rounded-[1.5rem] overflow-hidden border border-neutral-200">
      {/* Base Map Layer */}
      <FleetMap
        vehicles={filteredVehicles}
        selectedVehicle={selectedVehicle}
        onVehicleClick={setSelectedVehicle}
        className="w-full h-full"
      />

      {/* Top Left: Search & Filters Panel */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 w-full max-w-md pointer-events-none">
        {/* Search Bar Glass Panel */}
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md p-2 rounded-full shadow-lg border border-white/50 pointer-events-auto">
          <Search className="w-5 h-5 text-neutral-500 ml-3 shrink-0" />
          <Input
            placeholder="Search route or bus..."
            className="border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm font-semibold"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button variant="ghost" size="icon" className="rounded-full bg-emerald-500 text-white hover:bg-emerald-600 shrink-0 h-10 w-10">
            <MapPin className="w-4 h-4" />
          </Button>
        </div>

        {/* Route Pills Strip */}
        {uniqueRoutes.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none px-1 pointer-events-auto">
            {uniqueRoutes.map((route) => (
              <button
                key={route}
                onClick={() => setSearchQuery(route)}
                className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-sm border border-white/50 text-sm font-bold whitespace-nowrap hover:bg-neutral-50 hover:border-emerald-200 transition-colors"
              >
                <BusIcon className="w-4 h-4 text-emerald-600" />
                {route}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Top Right: Info Panels */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-4 w-72 pointer-events-none">
        {/* Stats Modules */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.5rem] shadow-lg border border-white/50 pointer-events-auto transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                <BusIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-neutral-800">Total Buses</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Active in system</p>
              </div>
            </div>
            <span className="text-3xl font-black text-blue-600">{liveVehicles.length}</span>
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-5 rounded-[1.5rem] shadow-lg border border-white/50 pointer-events-auto transition-transform hover:-translate-y-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-600">
                <MapIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-black text-neutral-800">Active Routes</p>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Currently driven</p>
              </div>
            </div>
            <span className="text-3xl font-black text-emerald-600">{uniqueRoutes.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function BusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8 6v6" />
      <path d="M15 6v6" />
      <path d="M2 12h19.6" />
      <path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" />
      <circle cx="7" cy="18" r="2" />
      <path d="M9 18h5" />
      <circle cx="16" cy="18" r="2" />
    </svg>
  )
}
