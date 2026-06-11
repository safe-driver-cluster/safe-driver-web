"use client"

import React, { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HardwareComparison } from "@/components/hardware-comparison"
import { PerformanceSimulator } from "@/components/performance-simulator"

// Dynamically import 3D components with SSR disabled (WebGL requires browser)
const HardwareScene = dynamic(() => import("@/components/3d/hardware-scene").then(mod => ({ default: mod.HardwareScene })), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading 3D hardware scene...</p>
      </div>
    </div>
  ),
})
import {
  Camera,
  Cpu,
  Cloud,
  Smartphone,
  MapPin,
  Wifi,
  Bell,
  Shield,
  ArrowRight,
  Play,
  Pause,
  RotateCcw,
  Info,
  Zap,
  Database,
  Server,
  Layers,
  Box,
} from "lucide-react"

interface ComponentInfo {
  id: string
  name: string
  description: string
  technology: string
  features: string[]
  connections: string[]
  color: string
  icon: React.ReactNode
}

const systemComponents: Record<string, ComponentInfo> = {
  camera: {
    id: "camera",
    name: "Raspberry Pi Camera Module",
    description: "High-resolution camera module that captures real-time video of the driver for analysis.",
    technology: "Raspberry Pi Camera Module 2 NoIR",
    features: [
      "1080p video capture at 30fps",
      "Low-light performance with NoIR filter",
      "Real-time streaming capability",
      "Wide-angle lens for complete driver view",
      "Compact form factor for discreet mounting",
    ],
    connections: ["raspberry-pi"],
    color: "primary",
    icon: <Camera className="h-8 w-8" />,
  },
  "raspberry-pi": {
    id: "raspberry-pi",
    name: "Edge Computing Unit",
    description: "Main processing unit that runs AI models locally for real-time driver monitoring.",
    technology: "Raspberry Pi 4 with 8GB RAM",
    features: [
      "Local AI processing with TensorFlow Lite",
      "Real-time video analysis at 15fps",
      "GPIO control for external sensors",
      "Low latency (<100ms) detection",
      "Power-efficient operation",
    ],
    connections: ["camera", "gps", "buzzer", "cloud"],
    color: "tech",
    icon: <Cpu className="h-8 w-8" />,
  },
  gps: {
    id: "gps",
    name: "GPS Module",
    description: "Provides real-time location data and integrates with hazard mapping system.",
    technology: "NEO-6M GPS/GNSS Module",
    features: [
      "Real-time positioning with 2.5m accuracy",
      "Speed and direction monitoring",
      "Route tracking and recording",
      "Geofencing capability",
      "Low power consumption",
    ],
    connections: ["raspberry-pi"],
    color: "safety",
    icon: <MapPin className="h-8 w-8" />,
  },
  buzzer: {
    id: "buzzer",
    name: "Alert System",
    description: "Multi-modal alert system including audio buzzers and voice warnings.",
    technology: "Integrated speaker and LED system",
    features: [
      "Configurable audio alerts (65-85dB)",
      "Natural voice warnings in multiple languages",
      "Visual LED indicators",
      "Multi-level alert escalation",
      "Night mode with reduced volume",
    ],
    connections: ["raspberry-pi"],
    color: "warning",
    icon: <Bell className="h-8 w-8" />,
  },
  cloud: {
    id: "cloud",
    name: "Cloud Infrastructure",
    description: "Firebase-based backend for data storage, analytics, and communication.",
    technology: "Firebase & Google Cloud Platform",
    features: [
      "Real-time database with offline support",
      "Cloud messaging for instant alerts",
      "Data analytics and reporting",
      "Scalable architecture for fleet deployment",
      "End-to-end encryption for data security",
    ],
    connections: ["raspberry-pi", "mobile-app", "dashboard"],
    color: "primary",
    icon: <Cloud className="h-8 w-8" />,
  },
  "mobile-app": {
    id: "mobile-app",
    name: "Passenger Mobile App",
    description: "Flutter-based mobile application for passengers to monitor safety status.",
    technology: "Flutter & Firebase SDK",
    features: [
      "Real-time driver safety monitoring",
      "Push notifications for safety alerts",
      "Live location tracking with ETA",
      "Emergency reporting with one-tap access",
      "Trip history with safety records",
    ],
    connections: ["cloud"],
    color: "tech",
    icon: <Smartphone className="h-8 w-8" />,
  },
  dashboard: {
    id: "dashboard",
    name: "Authority Dashboard",
    description: "Web-based dashboard for transport authorities to monitor fleet safety.",
    technology: "Next.js with real-time updates",
    features: [
      "Fleet-wide monitoring dashboard",
      "Alert management system",
      "Advanced analytics and reporting",
      "Driver performance metrics",
      "Customizable notification settings",
    ],
    connections: ["cloud"],
    color: "alert",
    icon: <Shield className="h-8 w-8" />,
  },
}

const dataFlows = [
  { from: "camera", to: "raspberry-pi", label: "Video Stream", color: "primary", icon: <Layers className="h-4 w-4" /> },
  { from: "gps", to: "raspberry-pi", label: "Location Data", color: "safety", icon: <MapPin className="h-4 w-4" /> },
  { from: "raspberry-pi", to: "buzzer", label: "Alert Signals", color: "warning", icon: <Bell className="h-4 w-4" /> },
  { from: "raspberry-pi", to: "cloud", label: "Safety Data", color: "tech", icon: <Database className="h-4 w-4" /> },
  { from: "cloud", to: "mobile-app", label: "Real-time Updates", color: "primary", icon: <Zap className="h-4 w-4" /> },
  { from: "cloud", to: "dashboard", label: "Fleet Data", color: "alert", icon: <Server className="h-4 w-4" /> },
]

export default function ArchitecturePage() {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [currentFlow, setCurrentFlow] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [hoveredComponent, setHoveredComponent] = useState<string | null>(null)

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 2000)
    return () => clearTimeout(timer)
  }, [])

  const startAnimation = () => {
    setIsAnimating(true)
    setCurrentFlow(0)
  }

  const stopAnimation = () => {
    setIsAnimating(false)
    setCurrentFlow(0)
  }

  const resetDiagram = () => {
    setSelectedComponent(null)
    setIsAnimating(false)
    setCurrentFlow(0)
  }

  // Animation effect for data flows
  React.useEffect(() => {
    if (isAnimating) {
      const interval = setInterval(() => {
        setCurrentFlow((prev) => (prev + 1) % dataFlows.length)
      }, 2000)
      return () => clearInterval(interval)
    }
  }, [isAnimating])

  const getComponentIcon = (id: string) => {
    return systemComponents[id]?.icon || <Cpu className="h-8 w-8" />
  }

  const getColorClasses = (color: string) => {
    const colors = {
      primary: "border-primary-500 bg-primary-50 text-primary-700",
      safety: "border-safety-500 bg-safety-50 text-safety-700",
      warning: "border-warning-500 bg-warning-50 text-warning-700",
      alert: "border-alert-500 bg-alert-50 text-alert-700",
      tech: "border-tech-500 bg-tech-50 text-tech-700",
      neutral: "border-neutral-500 bg-neutral-50 text-neutral-700",
    }
    return colors[color as keyof typeof colors] || colors.neutral
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-neutral-900">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8">
            {/* Animated loading circles */}
            <motion.div
              className="absolute inset-0 rounded-full border-4 border-primary-200"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute inset-2 rounded-full border-4 border-primary-300"
              initial={{ opacity: 0.5 }}
              animate={{ opacity: [0.5, 0.8, 0.5] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
            />
            <motion.div
              className="absolute inset-4 rounded-full border-4 border-primary-400"
              initial={{ opacity: 0.7 }}
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.4 }}
            />
            <motion.div
              className="absolute inset-6 rounded-full border-4 border-primary-500"
              initial={{ opacity: 0.9 }}
              animate={{ opacity: [0.9, 1, 0.9] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.6 }}
            />

            {/* Center icon */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Shield className="h-10 w-10 text-primary-600" />
            </motion.div>
          </div>

          <motion.h2
            className="text-2xl font-bold text-neutral-900 dark:text-white mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            Loading System Architecture
          </motion.h2>

          <motion.div
            className="flex space-x-1 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            <motion.div
              className="w-3 h-3 rounded-full bg-primary-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-tech-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.2 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-safety-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.4 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-warning-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.6 }}
            />
            <motion.div
              className="w-3 h-3 rounded-full bg-alert-500"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse", delay: 0.8 }}
            />
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <motion.div
        className="max-w-7xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center mb-12">
          <motion.h1
            className="text-3xl md:text-5xl font-bold mb-4 text-neutral-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-tech-600"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Interactive System Architecture
          </motion.h1>
          <motion.p
            className="text-lg text-neutral-600 dark:text-neutral-300 max-w-3xl mx-auto mb-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            Explore how the SafeDriver system components work together to provide real-time driver monitoring and
            accident prevention. Click on any component to learn more about its functionality.
          </motion.p>

          <motion.div
            className="flex flex-wrap justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <Button
              onClick={startAnimation}
              disabled={isAnimating}
              variant="gradient"
              className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Play className="h-4 w-4" />
              Start Data Flow Animation
            </Button>
            <Button
              onClick={stopAnimation}
              disabled={!isAnimating}
              variant="secondary"
              className="shadow-md hover:shadow-lg transition-shadow"
            >
              <Pause className="h-4 w-4 mr-2" />
              Stop Animation
            </Button>
            <Button onClick={resetDiagram} variant="outline" className="shadow-sm hover:shadow-md transition-shadow">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </motion.div>
        </div>

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="grid w-full max-w-4xl mx-auto grid-cols-6">
            <TabsTrigger value="overview">System Overview</TabsTrigger>
            <TabsTrigger value="3d-models">3D Hardware</TabsTrigger>
            <TabsTrigger value="comparison">Hardware Comparison</TabsTrigger>
            <TabsTrigger value="simulator">Performance Simulator</TabsTrigger>
            <TabsTrigger value="dataflow">Data Flow</TabsTrigger>
            <TabsTrigger value="workflow">System Workflow</TabsTrigger>
          </TabsList>
        </Tabs>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Interactive Diagram */}
                <motion.div
                  className="lg:col-span-2"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="p-8 bg-gradient-to-br from-white to-neutral-50 dark:from-neutral-900 dark:to-neutral-800 shadow-xl border-0 overflow-hidden">
                    <CardHeader className="text-center pb-8">
                      <CardTitle className="text-2xl font-bold text-neutral-900 dark:text-white">
                        SafeDriver System Architecture
                      </CardTitle>
                      <CardDescription>Click on components to explore their functionality</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="relative">
                        {/* SVG Diagram */}
                        <svg viewBox="0 0 800 600" className="w-full h-auto">
                          {/* Background grid */}
                          <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="1" opacity="0.3" />
                            </pattern>

                            {/* Gradient definitions */}
                            <linearGradient id="primaryGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.9" />
                            </linearGradient>

                            <linearGradient id="techGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#9333ea" stopOpacity="0.9" />
                            </linearGradient>

                            <linearGradient id="safetyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.9" />
                            </linearGradient>

                            <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#22c55e" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#16a34a" stopOpacity="0.9" />
                            </linearGradient>

                            <linearGradient id="warningGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#d97706" stopOpacity="0.9" />
                            </linearGradient>

                            <linearGradient id="alertGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#dc2626" stopOpacity="0.9" />
                            </linearGradient>

                            {/* Glow filter */}
                            <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
                              <feGaussianBlur stdDeviation="5" result="blur" />
                              <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                              </feMerge>
                            </filter>
                          </defs>
                          <rect width="800" height="600" fill="url(#grid)" />

                          {/* Data Flow Lines */}
                          {dataFlows.map((flow, index) => {
                            const isActive = isAnimating && index === currentFlow
                            const positions = {
                              camera: { x: 150, y: 100 },
                              "raspberry-pi": { x: 400, y: 200 },
                              gps: { x: 150, y: 300 },
                              buzzer: { x: 650, y: 100 },
                              cloud: { x: 400, y: 400 },
                              "mobile-app": { x: 150, y: 500 },
                              dashboard: { x: 650, y: 500 },
                            }

                            const fromPos = positions[flow.from as keyof typeof positions]
                            const toPos = positions[flow.to as keyof typeof positions]

                            // Calculate midpoint for curved path
                            const midX = (fromPos.x + toPos.x) / 2
                            const midY = (fromPos.y + toPos.y) / 2
                            // Add some curve variation based on positions
                            const curveOffset = Math.abs(fromPos.y - toPos.y) * 0.3
                            const curveMidX = midX + (fromPos.x < toPos.x ? curveOffset : -curveOffset)
                            const curveMidY = midY - curveOffset * 0.5

                            // Create curved path
                            const path = `M${fromPos.x},${fromPos.y} Q${curveMidX},${curveMidY} ${toPos.x},${toPos.y}`

                            return (
                              <g key={`${flow.from}-${flow.to}`}>
                                <path
                                  d={path}
                                  fill="none"
                                  stroke={isActive ? `url(#${flow.color}Gradient)` : "#cbd5e1"}
                                  strokeWidth={isActive ? "3" : "2"}
                                  strokeDasharray={isActive ? "5,5" : "none"}
                                  className={isActive ? "animate-pulse" : ""}
                                  filter={isActive ? "url(#glow)" : ""}
                                />
                                {isActive && (
                                  <>
                                    <circle r="6" fill={`url(#${flow.color}Gradient)`} filter="url(#glow)">
                                      <animateMotion dur="2s" repeatCount="indefinite" path={path} />
                                    </circle>
                                    <circle r="3" fill="#ffffff">
                                      <animateMotion dur="2s" repeatCount="indefinite" path={path} />
                                    </circle>
                                  </>
                                )}
                              </g>
                            )
                          })}

                          {/* Component Nodes */}
                          {Object.entries(systemComponents).map(([id, component]) => {
                            const positions = {
                              camera: { x: 150, y: 100 },
                              "raspberry-pi": { x: 400, y: 200 },
                              gps: { x: 150, y: 300 },
                              buzzer: { x: 650, y: 100 },
                              cloud: { x: 400, y: 400 },
                              "mobile-app": { x: 150, y: 500 },
                              dashboard: { x: 650, y: 500 },
                            }

                            const pos = positions[id as keyof typeof positions]
                            const isSelected = selectedComponent === id
                            const isHovered = hoveredComponent === id
                            const isConnected =
                              selectedComponent &&
                              (systemComponents[selectedComponent]?.connections.includes(id) ||
                                component.connections.includes(selectedComponent))

                            return (
                              <g
                                key={id}
                                onMouseEnter={() => setHoveredComponent(id)}
                                onMouseLeave={() => setHoveredComponent(null)}
                              >
                                {/* Pulse animation for hovered component */}
                                {isHovered && !isSelected && (
                                  <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="50"
                                    fill={`url(#${component.color}Gradient)`}
                                    opacity="0.2"
                                    className="animate-ping"
                                  />
                                )}

                                {/* Outer glow for selected component */}
                                {isSelected && (
                                  <circle
                                    cx={pos.x}
                                    cy={pos.y}
                                    r="50"
                                    fill={`url(#${component.color}Gradient)`}
                                    opacity="0.3"
                                    filter="url(#glow)"
                                  />
                                )}

                                {/* Main circle */}
                                <circle
                                  cx={pos.x}
                                  cy={pos.y}
                                  r="40"
                                  fill={
                                    isSelected
                                      ? `url(#${component.color}Gradient)`
                                      : isConnected
                                        ? `url(#safetyGradient)`
                                        : selectedComponent
                                          ? "#f8fafc"
                                          : "#ffffff"
                                  }
                                  stroke={
                                    isSelected
                                      ? `url(#${component.color}Gradient)`
                                      : isConnected
                                        ? "#16a34a"
                                        : "#cbd5e1"
                                  }
                                  strokeWidth="3"
                                  className="cursor-pointer transition-all duration-300 hover:stroke-primary-500"
                                  onClick={() => setSelectedComponent(selectedComponent === id ? null : id)}
                                  filter={isSelected || isHovered ? "url(#glow)" : ""}
                                />

                                {/* Component icon */}
                                <foreignObject x={pos.x - 20} y={pos.y - 20} width="40" height="40">
                                  <div
                                    className={`flex items-center justify-center h-full w-full ${
                                      isSelected || isConnected ? "text-white" : `text-${component.color}-600`
                                    }`}
                                  >
                                    {component.icon}
                                  </div>
                                </foreignObject>

                                {/* Component label */}
                                <text
                                  x={pos.x}
                                  y={pos.y + 60}
                                  textAnchor="middle"
                                  className={`text-sm font-semibold ${
                                    isSelected ? `fill-${component.color}-700` : "fill-neutral-700"
                                  } cursor-pointer`}
                                  onClick={() => setSelectedComponent(selectedComponent === id ? null : id)}
                                >
                                  {component.name.split(" ")[0]}
                                </text>
                              </g>
                            )
                          })}
                        </svg>

                        {/* Legend */}
                        <div className="mt-6 flex flex-wrap gap-4 justify-center">
                          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full shadow-sm">
                            <div className="w-4 h-4 rounded-full bg-primary-500"></div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Selected Component</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full shadow-sm">
                            <div className="w-4 h-4 rounded-full bg-safety-500"></div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Connected Component</span>
                          </div>
                          <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 px-3 py-1 rounded-full shadow-sm">
                            <div className="w-4 h-1 bg-primary-500"></div>
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">Data Flow</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Component Details Panel */}
                <motion.div
                  className="lg:col-span-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <Card className="sticky top-24 shadow-xl border-0 bg-white dark:bg-neutral-900">
                    <CardHeader
                      className={
                        selectedComponent
                          ? `bg-gradient-to-r from-${systemComponents[selectedComponent]?.color}-100 to-${systemComponents[selectedComponent]?.color}-50 dark:from-${systemComponents[selectedComponent]?.color}-900/30 dark:to-neutral-900`
                          : ""
                      }
                    >
                      <CardTitle className="flex items-center gap-2">
                        {selectedComponent ? (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={`p-2 rounded-full bg-${systemComponents[selectedComponent]?.color}-100 dark:bg-${systemComponents[selectedComponent]?.color}-900/50`}
                          >
                            {getComponentIcon(selectedComponent)}
                          </motion.div>
                        ) : (
                          <Shield className="h-6 w-6" />
                        )}
                        <motion.span
                          key={selectedComponent || "default"}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          {selectedComponent ? systemComponents[selectedComponent].name : "Component Details"}
                        </motion.span>
                      </CardTitle>
                      <CardDescription>
                        {selectedComponent
                          ? "Detailed information about the selected component"
                          : "Click on any component in the diagram to view its details"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="mt-4">
                      <AnimatePresence mode="wait">
                        {selectedComponent ? (
                          <motion.div
                            className="space-y-6"
                            key={selectedComponent}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div>
                              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Description</h4>
                              <p className="text-neutral-600 dark:text-neutral-300 text-sm leading-relaxed">
                                {systemComponents[selectedComponent].description}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Technology</h4>
                              <Badge
                                variant="secondary"
                                className={`text-xs bg-${systemComponents[selectedComponent].color}-100 text-${systemComponents[selectedComponent].color}-800 dark:bg-${systemComponents[selectedComponent].color}-900/30 dark:text-${systemComponents[selectedComponent].color}-300`}
                              >
                                {systemComponents[selectedComponent].technology}
                              </Badge>
                            </div>

                            <div>
                              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Key Features</h4>
                              <ul className="space-y-2">
                                {systemComponents[selectedComponent].features.map((feature, index) => (
                                  <motion.li
                                    key={index}
                                    className="flex items-start gap-2 text-sm"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full bg-${systemComponents[selectedComponent].color}-500 mt-2 flex-shrink-0`}
                                    ></div>
                                    <span className="text-neutral-600 dark:text-neutral-300">{feature}</span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>

                            <div>
                              <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Connections</h4>
                              <div className="space-y-2">
                                {systemComponents[selectedComponent].connections.map((connectionId, index) => (
                                  <motion.button
                                    key={connectionId}
                                    onClick={() => setSelectedComponent(connectionId)}
                                    className={`flex items-center gap-2 text-sm text-${systemComponents[connectionId].color}-600 hover:text-${systemComponents[connectionId].color}-700 transition-colors duration-200`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 + index * 0.1 }}
                                  >
                                    <ArrowRight className="h-3 w-3" />
                                    {systemComponents[connectionId].name}
                                  </motion.button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            className="text-center py-8"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Info className="h-16 w-16 text-neutral-300 dark:text-neutral-600 mx-auto mb-4" />
                            <p className="text-neutral-500 dark:text-neutral-400 text-sm">
                              Select a component from the diagram to view detailed information about its functionality
                              and connections.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            )}

            {activeTab === "3d-models" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Box className="h-6 w-6 text-primary-600" />
                      3D Hardware Components
                    </CardTitle>
                    <CardDescription>
                      Interactive 3D models of the SafeDriver hardware components. Click and drag to rotate, scroll to
                      zoom.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <HardwareScene selectedComponent={selectedComponent} onComponentSelect={setSelectedComponent} />
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "comparison" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <HardwareComparison />
              </motion.div>
            )}

            {activeTab === "simulator" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <PerformanceSimulator />
              </motion.div>
            )}

            {activeTab === "dataflow" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wifi className="h-6 w-6 text-primary-600" />
                      Data Flow Patterns
                    </CardTitle>
                    <CardDescription>Understanding how data moves through the SafeDriver system</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {dataFlows.map((flow, index) => (
                        <motion.div
                          key={`${flow.from}-${flow.to}`}
                          className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                            isAnimating && index === currentFlow
                              ? `border-${flow.color}-500 bg-${flow.color}-50 dark:bg-${flow.color}-900/20`
                              : "border-neutral-200 bg-white dark:bg-neutral-800 dark:border-neutral-700"
                          }`}
                          whileHover={{ scale: 1.02, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.4 }}
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div
                              className={`w-8 h-8 rounded-full bg-${flow.color}-100 dark:bg-${flow.color}-900/30 flex items-center justify-center text-${flow.color}-600 dark:text-${flow.color}-400`}
                            >
                              {flow.icon}
                            </div>
                            <h4 className="font-semibold text-neutral-900 dark:text-white">{flow.label}</h4>
                          </div>
                          <div className="flex items-center gap-2 mb-3">
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full bg-${flow.color}-100 dark:bg-${flow.color}-900/30 flex items-center justify-center`}
                            >
                              {getComponentIcon(flow.from)}
                            </div>
                            <ArrowRight className={`h-4 w-4 text-${flow.color}-500`} />
                            <div
                              className={`flex-shrink-0 w-8 h-8 rounded-full bg-${flow.color}-100 dark:bg-${flow.color}-900/30 flex items-center justify-center`}
                            >
                              {getComponentIcon(flow.to)}
                            </div>
                          </div>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">
                            <span className="font-medium">{systemComponents[flow.from].name}</span>
                            <ArrowRight className="h-3 w-3 inline mx-2" />
                            <span className="font-medium">{systemComponents[flow.to].name}</span>
                          </p>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "workflow" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
                <Card className="shadow-xl border-0">
                  <CardHeader>
                    <CardTitle>System Workflow</CardTitle>
                    <CardDescription>
                      Step-by-step process of how SafeDriver monitors and responds to driver behavior
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-12">
                      {[
                        {
                          step: 1,
                          title: "Video Capture",
                          description: "Camera continuously captures driver's face and behavior",
                          color: "primary",
                          icon: <Camera className="h-6 w-6" />,
                          details: [
                            "30fps video capture in various lighting conditions",
                            "Infrared capability for night-time monitoring",
                            "Automatic exposure adjustment",
                            "Wide-angle lens captures full driver view",
                          ],
                        },
                        {
                          step: 2,
                          title: "AI Analysis",
                          description: "Raspberry Pi processes video using computer vision and deep learning models",
                          color: "tech",
                          icon: <Cpu className="h-6 w-6" />,
                          details: [
                            "Facial landmark detection with MediaPipe",
                            "Eye aspect ratio calculation for drowsiness detection",
                            "Head pose estimation for attention monitoring",
                            "Mobile phone usage detection with CNN",
                          ],
                        },
                        {
                          step: 3,
                          title: "Risk Assessment",
                          description: "System evaluates drowsiness, distraction, and location-based hazards",
                          color: "warning",
                          icon: <Info className="h-6 w-6" />,
                          details: [
                            "PERCLOS calculation for drowsiness quantification",
                            "Distraction classification (phone, eating, etc.)",
                            "GPS correlation with accident-prone zones",
                            "Speed and road condition assessment",
                          ],
                        },
                        {
                          step: 4,
                          title: "Alert Generation",
                          description: "Multi-level alerts triggered based on severity of detected risks",
                          color: "alert",
                          icon: <Bell className="h-6 w-6" />,
                          details: [
                            "Level 1: Audio buzzer (0-5 seconds)",
                            "Level 2: Voice warnings (5-15 seconds)",
                            "Level 3: Authority notification (15+ seconds)",
                            "Level 4: Emergency response with GPS location",
                          ],
                        },
                        {
                          step: 5,
                          title: "Data Transmission",
                          description: "Safety data sent to cloud for storage and real-time monitoring",
                          color: "safety",
                          icon: <Cloud className="h-6 w-6" />,
                          details: [
                            "Encrypted data transmission via 4G/LTE",
                            "Offline caching for connectivity gaps",
                            "Bandwidth-optimized data packets",
                            "Prioritized transmission of critical alerts",
                          ],
                        },
                        {
                          step: 6,
                          title: "Stakeholder Notification",
                          description: "Passengers and authorities receive real-time safety updates",
                          color: "primary",
                          icon: <Smartphone className="h-6 w-6" />,
                          details: [
                            "Push notifications to passenger mobile app",
                            "Real-time dashboard updates for authorities",
                            "SMS alerts for critical situations",
                            "Historical data access for compliance reporting",
                          ],
                        },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          className="flex gap-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.5 }}
                          whileHover={{ x: 5 }}
                        >
                          <div
                            className={`flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-${item.color}-500 to-${item.color}-700 shadow-lg`}
                          >
                            {item.step}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-neutral-900 dark:text-white text-xl mb-1">
                                {item.title}
                              </h4>
                              <div
                                className={`p-1 rounded-full bg-${item.color}-100 dark:bg-${item.color}-900/30 text-${item.color}-600 dark:text-${item.color}-400`}
                              >
                                {item.icon}
                              </div>
                            </div>
                            <p className="text-neutral-600 dark:text-neutral-300 mb-3">{item.description}</p>

                            <div
                              className={`bg-${item.color}-50 dark:bg-${item.color}-900/10 rounded-lg p-4 border border-${item.color}-100 dark:border-${item.color}-900/20`}
                            >
                              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {item.details.map((detail, idx) => (
                                  <motion.li
                                    key={idx}
                                    className="flex items-start gap-2"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + idx * 0.1 }}
                                  >
                                    <div
                                      className={`w-1.5 h-1.5 rounded-full bg-${item.color}-500 mt-2 flex-shrink-0`}
                                    ></div>
                                    <span className={`text-sm text-${item.color}-700 dark:text-${item.color}-300`}>
                                      {detail}
                                    </span>
                                  </motion.li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
