"use client"

import { Suspense, useState } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Environment, ContactShadows, Html } from "@react-three/drei"
import { motion, AnimatePresence } from "framer-motion"
import { CameraModel } from "./camera-model"
import { RaspberryPiModel } from "./raspberry-pi-model"
import { GpsModel } from "./gps-model"
import { BuzzerModel } from "./buzzer-model"
import { CloudModel } from "./cloud-model"
import { MobileAppModel } from "./mobile-app-model"
import { DashboardModel } from "./dashboard-model"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Play, Pause, Info } from "lucide-react"

interface HardwareSceneProps {
  selectedComponent: string | null
  onComponentSelect: (componentId: string | null) => void
}

const componentPositions = {
  camera: [-4, 2, 0],
  "raspberry-pi": [0, 0, 0],
  gps: [-4, -2, 0],
  buzzer: [4, 2, 0],
  cloud: [0, 3, 0],
  "mobile-app": [-2, -3, 0],
  dashboard: [4, -2, 0],
}

const componentInfo = {
  camera: {
    name: "Raspberry Pi Camera",
    description: "High-resolution camera module for driver monitoring",
    specs: ["1080p @ 30fps", "NoIR filter", "Wide-angle lens"],
  },
  "raspberry-pi": {
    name: "Raspberry Pi 4",
    description: "Main processing unit running AI models",
    specs: ["8GB RAM", "Quad-core ARM", "TensorFlow Lite"],
  },
  gps: {
    name: "GPS Module",
    description: "Location tracking and hazard mapping",
    specs: ["2.5m accuracy", "Real-time tracking", "Geofencing"],
  },
  buzzer: {
    name: "Alert System",
    description: "Multi-modal warning system",
    specs: ["65-85dB audio", "Voice warnings", "LED indicators"],
  },
  cloud: {
    name: "Cloud Infrastructure",
    description: "Firebase backend and analytics",
    specs: ["Real-time sync", "Scalable", "Encrypted"],
  },
  "mobile-app": {
    name: "Mobile App",
    description: "Passenger safety monitoring",
    specs: ["Real-time updates", "Emergency alerts", "Trip history"],
  },
  dashboard: {
    name: "Authority Dashboard",
    description: "Fleet monitoring and management",
    specs: ["Live monitoring", "Analytics", "Alert management"],
  },
}

function LoadingFallback() {
  return (
    <Html center>
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        <span className="ml-2 text-neutral-600">Loading 3D models...</span>
      </div>
    </Html>
  )
}

function Scene({
  selectedComponent,
  onComponentSelect,
  autoRotate,
}: {
  selectedComponent: string | null
  onComponentSelect: (id: string | null) => void
  autoRotate: boolean
}) {
  const handleComponentClick = (componentId: string) => {
    onComponentSelect(selectedComponent === componentId ? null : componentId)
  }

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.5} />

      {/* Camera */}
      <group
        position={componentPositions.camera as [number, number, number]}
        onClick={() => handleComponentClick("camera")}
      >
        <CameraModel isSelected={selectedComponent === "camera"} autoRotate={autoRotate} />
      </group>

      {/* Raspberry Pi */}
      <group
        position={componentPositions["raspberry-pi"] as [number, number, number]}
        onClick={() => handleComponentClick("raspberry-pi")}
      >
        <RaspberryPiModel isSelected={selectedComponent === "raspberry-pi"} autoRotate={autoRotate} />
      </group>

      {/* GPS */}
      <group
        position={componentPositions.gps as [number, number, number]}
        onClick={() => handleComponentClick("gps")}
      >
        <GpsModel isSelected={selectedComponent === "gps"} autoRotate={autoRotate} />
      </group>

      {/* Buzzer */}
      <group
        position={componentPositions.buzzer as [number, number, number]}
        onClick={() => handleComponentClick("buzzer")}
      >
        <BuzzerModel isSelected={selectedComponent === "buzzer"} autoRotate={autoRotate} />
      </group>

      {/* Cloud */}
      <group
        position={componentPositions.cloud as [number, number, number]}
        onClick={() => handleComponentClick("cloud")}
      >
        <CloudModel isSelected={selectedComponent === "cloud"} autoRotate={autoRotate} />
      </group>

      {/* Mobile App */}
      <group
        position={componentPositions["mobile-app"] as [number, number, number]}
        onClick={() => handleComponentClick("mobile-app")}
      >
        <MobileAppModel isSelected={selectedComponent === "mobile-app"} autoRotate={autoRotate} />
      </group>

      {/* Dashboard */}
      <group
        position={componentPositions.dashboard as [number, number, number]}
        onClick={() => handleComponentClick("dashboard")}
      >
        <DashboardModel isSelected={selectedComponent === "dashboard"} autoRotate={autoRotate} />
      </group>

      <ContactShadows position={[0, -4, 0]} opacity={0.4} scale={20} blur={2} far={4} />
    </>
  )
}

export function HardwareScene({ selectedComponent, onComponentSelect }: HardwareSceneProps) {
  const [autoRotate, setAutoRotate] = useState(false)
  const [cameraReset, setCameraReset] = useState(0)

  const resetCamera = () => {
    setCameraReset((prev) => prev + 1)
  }

  return (
    <div className="relative w-full h-[600px] bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex gap-2">
        <Button
          size="sm"
          variant={autoRotate ? "default" : "outline"}
          onClick={() => setAutoRotate(!autoRotate)}
          className="bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          {autoRotate ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
          {autoRotate ? "Stop" : "Auto Rotate"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={resetCamera}
          className="bg-white/90 backdrop-blur-sm hover:bg-white"
        >
          <RotateCcw className="h-4 w-4 mr-1" />
          Reset View
        </Button>
      </div>

      {/* Instructions */}
      <div className="absolute top-4 right-4 z-10">
        <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
          <Info className="h-3 w-3 mr-1" />
          Click & drag to rotate, scroll to zoom
        </Badge>
      </div>

      {/* 3D Canvas */}
      <Canvas key={cameraReset} camera={{ position: [8, 4, 8], fov: 50 }} shadows>
        <Suspense fallback={<LoadingFallback />}>
          <Scene selectedComponent={selectedComponent} onComponentSelect={onComponentSelect} autoRotate={autoRotate} />
          <Environment preset="studio" />
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={20}
            autoRotate={autoRotate}
            autoRotateSpeed={1}
          />
        </Suspense>
      </Canvas>

      {/* Component Info Overlay */}
      <AnimatePresence>
        {selectedComponent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-4 left-4 right-4 z-10"
          >
            <Card className="bg-white/95 backdrop-blur-sm border-neutral-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">
                  {componentInfo[selectedComponent as keyof typeof componentInfo]?.name}
                </CardTitle>
                <CardDescription>
                  {componentInfo[selectedComponent as keyof typeof componentInfo]?.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {componentInfo[selectedComponent as keyof typeof componentInfo]?.specs.map((spec, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {spec}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
