"use client"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html, Float, ContactShadows, Stars } from "@react-three/drei"
import { Suspense, useState, useRef, useMemo, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Navigation, AlertTriangle, Eye, EyeOff, Layers, RotateCcw, ZoomIn, ZoomOut, Bus, Map as MapIcon, Shield } from "lucide-react"
import type { Route as RouteType, HazardZone as HazardZoneType } from "@/lib/route-types"
import type { Vehicle as VehicleType } from "@/lib/fleet-types"
import * as THREE from 'three'

// GPS to 3D Coordinate conversion
const GPS_SCALE = 200 
const CENTER_LAT = 7.0 
const CENTER_LON = 79.9

function gpsTo3D(lat: number, lon: number) {
  const x = (lon - CENTER_LON) * GPS_SCALE
  const z = (CENTER_LAT - lat) * GPS_SCALE 
  return [x, 0.05, z] as [number, number, number]
}

// Glowing Pulse Material
function PulseMaterial({ color }: { color: string }) {
  const meshRef = useRef<any>()
  
  useFrame(({ clock }) => {
    if (meshRef.current) {
      const scale = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.05
      meshRef.current.scale.set(scale, 1, scale)
      meshRef.current.material.opacity = 0.2 + Math.sin(clock.getElapsedTime() * 2) * 0.1
    }
  })

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1, 32]} />
      <meshStandardMaterial color={color} transparent opacity={0.2} depthWrite={false} />
    </mesh>
  )
}

// 3D Vehicle Component
function Vehicle({ vehicle, onClick }: { vehicle: VehicleType; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const position = useMemo(() => gpsTo3D(vehicle.location.lat, vehicle.location.lng), [vehicle])
  
  const color = vehicle.alerts > 0 ? "#ef4444" : "#3b82f6"

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5} position={position}>
      <group onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        {/* Bus Body */}
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.25, 0.8]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} />
        </mesh>
        
        {/* Windows */}
        <mesh position={[0, 0.05, 0]}>
          <boxGeometry args={[0.42, 0.15, 0.7]} />
          <meshStandardMaterial color="#111" transparent opacity={0.6} />
        </mesh>

        {/* Roof Light/Status */}
        <mesh position={[0, 0.15, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
        </mesh>

        <Html position={[0, 0.8, 0]} center style={{ pointerEvents: 'none' }}>
          <div className={`transition-all duration-300 transform ${hovered ? "scale-110" : "scale-100"}`}>
            <div className={`bg-white/90 backdrop-blur-md rounded-2xl px-3 py-1.5 shadow-2xl border-2 flex flex-col items-center gap-1 min-w-[80px] ${vehicle.alerts > 0 ? "border-rose-500" : "border-blue-500"}`}>
              <span className="text-[10px] font-black text-neutral-400 uppercase tracking-tighter leading-none">Vehicle</span>
              <span className="text-xs font-black text-neutral-900">{vehicle.busNumber || vehicle.busNumberPlate}</span>
              {vehicle.speed > 0 && (
                <Badge variant="outline" className="text-[9px] h-4 font-bold bg-neutral-100 border-none">
                  {Math.round(vehicle.speed)} km/h
                </Badge>
              )}
            </div>
          </div>
        </Html>
      </group>
    </Float>
  )
}

// 3D Hazard Zone Component
function HazardZone({ hazard, onClick }: { hazard: HazardZoneType; onClick: () => void }) {
  const [hovered, setHovered] = useState(false)
  const position = useMemo(() => gpsTo3D(hazard.latitude, hazard.longitude), [hazard])
  
  const color = useMemo(() => {
    switch (hazard.type) {
      case "school": return "#3b82f6"
      case "accident": return "#ef4444"
      case "speed": return "#f59e0b"
      default: return "#8b5cf6"
    }
  }, [hazard.type])

  const radius = (hazard.radius || 200) / 1000 * (GPS_SCALE / 111) 

  return (
    <group position={position}>
      {/* Glowing Base Pulse */}
      <group scale={[radius, 1, radius]}>
        <PulseMaterial color={color} />
      </group>

      {/* Main Cylinder */}
      <mesh onClick={onClick} onPointerOver={() => setHovered(true)} onPointerOut={() => setHovered(false)}>
        <cylinderGeometry args={[radius, radius, 0.4, 32, 1, true]} />
        <meshStandardMaterial color={color} transparent opacity={hovered ? 0.3 : 0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* Top Rim Ring */}
      <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[radius - 0.05, radius, 64]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} transparent opacity={0.8} />
      </mesh>

      {/* Center Marker */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.2, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={5} />
      </mesh>

      <Html position={[0, 1.2, 0]} center>
        <div className={`group flex flex-col items-center gap-2 cursor-pointer transition-all duration-500 ${hovered ? "scale-110" : "scale-100"}`}>
          <div className="relative">
            <div className={`absolute inset-0 blur-xl opacity-40 rounded-full ${hazard.type === 'accident' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
            <div className={`relative bg-white/95 backdrop-blur-xl rounded-2xl px-4 py-2 text-[10px] font-black shadow-2xl border-2 flex items-center gap-2 whitespace-nowrap ${hovered ? "border-blue-500" : "border-white/50"}`}>
              <div className={`p-1 rounded-lg ${hazard.type === 'accident' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'}`}>
                {hazard.type === 'school' ? <Shield className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
              </div>
              <div className="flex flex-col">
                <span className="text-neutral-400 uppercase tracking-widest text-[8px] leading-none mb-0.5">{hazard.type} Zone</span>
                <span className="text-neutral-900 text-xs tracking-tight">{hazard.name}</span>
              </div>
            </div>
          </div>
        </div>
      </Html>
    </group>
  )
}

// 3D Route Component
function Route({ route }: { route: RouteType }) {
  const points = useMemo(() => {
    return route.stops
      .sort((a, b) => a.order - b.order)
      .map(stop => (stop.latitude && stop.longitude) ? gpsTo3D(stop.latitude, stop.longitude) : null)
      .filter(p => p !== null) as [number, number, number][]
  }, [route])

  if (points.length < 2) return null

  const color = "#10b981"

  return (
    <group>
      {/* Route Path (Connecting Lines) */}
      {points.map((point, i) => {
        if (i === 0) return null
        const prev = points[i-1]
        const dist = Math.sqrt(Math.pow(point[0]-prev[0], 2) + Math.pow(point[2]-prev[2], 2))
        return (
          <mesh key={i} position={[(point[0] + prev[0]) / 2, 0.02, (point[2] + prev[2]) / 2]}>
             <boxGeometry args={[dist, 0.02, 0.08]} />
             <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} transparent opacity={0.4} />
             <primitive object={new THREE.Group()} onUpdate={(self: any) => self.lookAt(point[0], 0.02, point[2])} />
          </mesh>
        )
      })}
      
      {/* Animated Flow Dots */}
      {points.map((point, i) => {
        if (i === 0) return null
        return <FlowDots key={`flow-${i}`} start={points[i-1]} end={point} color={color} />
      })}

      {/* Stop Points */}
      {points.map((point, index) => (
        <group key={index} position={point}>
          <mesh>
            <sphereGeometry args={[0.12]} />
            <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2} />
          </mesh>
          <Html position={[0, 0.4, 0]} center>
            <div className="bg-emerald-500/90 text-white text-[8px] px-2 py-0.5 rounded-full font-black whitespace-nowrap shadow-lg border border-white/20">
              {route.stops[index].name}
            </div>
          </Html>
        </group>
      ))}
    </group>
  )
}

function FlowDots({ start, end, color }: { start: number[], end: number[], color: string }) {
  const dotRef = useRef<any>()
  const dist = Math.sqrt(Math.pow(end[0]-start[0], 2) + Math.pow(end[2]-start[2], 2))
  
  useFrame(({ clock }) => {
    if (dotRef.current) {
      const t = (clock.getElapsedTime() * 0.5) % 1
      dotRef.current.position.set(
        start[0] + (end[0] - start[0]) * t,
        0.05,
        start[2] + (end[2] - start[2]) * t
      )
    }
  })

  return (
    <mesh ref={dotRef}>
      <sphereGeometry args={[0.04]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={10} />
    </mesh>
  )
}

// Main 3D Map Component
export function ThreeDMap({ routes = [], vehicles = [] }: { routes?: RouteType[], vehicles?: VehicleType[] }) {
  const [showVehicles, setShowVehicles] = useState(true)
  const [showHazards, setShowHazards] = useState(true)
  const [showRoutes, setShowRoutes] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  
  const allHazards = useMemo(() => {
    const hazards: HazardZoneType[] = []
    routes.forEach(r => { if (r.hazardZones) hazards.push(...r.hazardZones) })
    return hazards
  }, [routes])

  return (
    <div className="w-full h-full relative group">
      <div className="w-full h-[600px] bg-gradient-to-b from-sky-50 to-white rounded-[3rem] overflow-hidden border-[12px] border-white shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] relative">
        <Canvas camera={{ position: [20, 20, 20], fov: 40 }} shadows gl={{ antialias: true }}>
          <Suspense fallback={null}>
            <fog attach="fog" args={["#f0f9ff", 20, 100]} />
            
            <ambientLight intensity={0.8} />
            <directionalLight position={[20, 40, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
            <pointLight position={[0, 10, 0]} intensity={0.5} color="#3b82f6" />
            
            {/* Ground */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]} receiveShadow>
              <planeGeometry args={[200, 200]} />
              <meshStandardMaterial color="#ffffff" roughness={0.8} />
            </mesh>
            <gridHelper args={[200, 40, "#e2e8f0", "#f1f5f9"]} position={[0, -0.15, 0]} />

            {/* Routes */}
            {showRoutes && routes.map(route => <Route key={route.id} route={route} />)}

            {/* Hazard Zones */}
            {showHazards && allHazards.map((hazard, i) => (
              <HazardZone key={i} hazard={hazard} onClick={() => setSelectedItem({ type: "hazard", data: hazard })} />
            ))}

            {/* Vehicles */}
            {showVehicles && vehicles.map(vehicle => (
              <Vehicle key={vehicle.id} vehicle={vehicle} onClick={() => setSelectedItem({ type: "vehicle", data: vehicle })} />
            ))}

            <ContactShadows position={[0, -0.19, 0]} opacity={0.2} scale={100} blur={2} far={10} color="#000000" />
            <OrbitControls enablePan={true} enableZoom={true} maxPolarAngle={Math.PI / 2.2} minDistance={10} maxDistance={100} />
            <Environment preset="city" />
          </Suspense>
        </Canvas>

        {/* UI Overlay Controls */}
        <div className="absolute top-10 left-10 flex flex-col gap-4">
          <div className="bg-white/80 backdrop-blur-2xl p-2 rounded-[2rem] border border-white/50 flex flex-col gap-2 shadow-xl">
            <ControlBtn active={showRoutes} onClick={() => setShowRoutes(!showRoutes)} icon={<MapIcon className="h-4 w-4" />} label={`Routes (${routes.length})`} />
            <ControlBtn active={showHazards} onClick={() => setShowHazards(!showHazards)} icon={<AlertTriangle className="h-4 w-4" />} label={`Hazards (${allHazards.length})`} />
            <ControlBtn active={showVehicles} onClick={() => setShowVehicles(!showVehicles)} icon={<Bus className="h-4 w-4" />} label={`Buses (${vehicles.length})`} />
          </div>
        </div>

        {/* Selected Item Details Card */}
        {selectedItem && (
          <div className="absolute bottom-10 right-10 w-80 animate-in slide-in-from-bottom-8 duration-500">
            <div className="bg-white/95 backdrop-blur-3xl rounded-[2.5rem] p-8 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.3)] border border-white/50 relative overflow-hidden">
               <div className={`absolute top-0 left-0 w-full h-2 ${selectedItem.type === 'hazard' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
               <div className="flex justify-between items-start mb-6">
                 <div>
                   <Badge className="mb-2 bg-neutral-100 text-neutral-500 font-black uppercase tracking-widest text-[9px] border-none">{selectedItem.type}</Badge>
                   <h3 className="text-2xl font-black text-neutral-900 tracking-tight">{selectedItem.data.name || selectedItem.data.busNumber || selectedItem.data.busNumberPlate}</h3>
                 </div>
                 <Button variant="ghost" size="icon" className="rounded-full hover:bg-neutral-100 h-10 w-10" onClick={() => setSelectedItem(null)}>
                   <span className="text-xl font-black">×</span>
                 </Button>
               </div>
               
               <div className="space-y-4 mb-8">
                  {selectedItem.type === 'hazard' ? (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Location</span>
                        <span className="text-sm font-bold text-neutral-900">{selectedItem.data.location}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Radius</span>
                        <span className="text-sm font-bold text-neutral-900">{selectedItem.data.radius}m</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Status</span>
                        <Badge className="bg-emerald-100 text-emerald-600 border-none font-black text-[10px] uppercase">{selectedItem.data.status}</Badge>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-neutral-100">
                        <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Speed</span>
                        <span className="text-sm font-bold text-neutral-900">{Math.round(selectedItem.data.speed)} km/h</span>
                      </div>
                    </>
                  )}
               </div>
               <Button className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs bg-neutral-900 hover:bg-black text-white shadow-xl transition-all active:scale-95" onClick={() => setSelectedItem(null)}>Close Monitor</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ControlBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <Button 
      variant="ghost"
      className={`h-14 px-6 rounded-[1.5rem] flex items-center gap-4 transition-all duration-300 ${active ? "bg-blue-600 text-white shadow-xl" : "text-neutral-500 hover:text-blue-600 hover:bg-blue-50"}`}
      onClick={onClick}
    >
      <div className={`p-2 rounded-xl ${active ? "bg-white/20" : "bg-neutral-100"}`}>
        {icon}
      </div>
      <span className="font-black uppercase tracking-widest text-[10px] whitespace-nowrap">{label}</span>
    </Button>
  )
}


