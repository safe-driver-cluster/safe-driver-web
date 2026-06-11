"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Camera,
  Cpu,
  MapPin,
  Bell,
  Play,
  RotateCcw,
  Thermometer,
  Battery,
  Gauge,
  AlertTriangle,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Sun,
  Moon,
  Zap,
  Eye,
  Brain,
  Signal,
  Skull,
  Shield,
  Activity,
  Target,
  Flame,
  Snowflake,
  Wind,
  Droplets,
  Hammer,
  WifiOff,
} from "lucide-react"

interface HardwareConfig {
  camera: string
  processor: string
  gps: string
  alert: string
}

interface SimulationScenario {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  severity: "normal" | "challenging" | "extreme" | "critical"
  conditions: {
    lighting: number
    temperature: number
    vibration: number
    powerAvailable: number
    networkQuality: number
    humidity?: number
    dustLevel?: number
    electromagneticInterference?: number
  }
  challenges: string[]
  failureRisks: string[]
}

interface PerformanceMetrics {
  detectionAccuracy: number
  responseTime: number
  powerConsumption: number
  reliability: number
  falsePositiveRate: number
  systemLoad: number
  thermalPerformance: number
  networkLatency: number
}

interface FailureAnalysis {
  criticalFailures: FailurePoint[]
  warnings: FailurePoint[]
  operationalLimits: OperationalLimit[]
  mtbf: number // Mean Time Between Failures (hours)
  systemStability: number
  recoveryTime: number
}

interface FailurePoint {
  component: string
  condition: string
  threshold: number
  currentValue: number
  severity: "low" | "medium" | "high" | "critical"
  description: string
  mitigation: string
}

interface OperationalLimit {
  parameter: string
  safeRange: [number, number]
  currentValue: number
  status: "safe" | "warning" | "danger" | "critical"
  recommendation: string
}

interface ComponentSpecs {
  [key: string]: {
    name: string
    basePerformance: {
      processingPower: number
      accuracy: number
      powerEfficiency: number
      reliability: number
      thermalTolerance: number
      lowLightPerformance?: number
      gpsAccuracy?: number
      alertVolume?: number
    }
    environmentalFactors: {
      temperatureRange: [number, number]
      vibrationTolerance: number
      powerSensitivity: number
      humidityTolerance?: number
      dustResistance?: number
      emiTolerance?: number
    }
    failureThresholds: {
      criticalTemp: number
      maxVibration: number
      minPower: number
      maxHumidity?: number
      maxDust?: number
      maxEMI?: number
    }
  }
}

const hardwareSpecs: ComponentSpecs = {
  // Cameras
  "rpi-cam-v2": {
    name: "Raspberry Pi Camera v2",
    basePerformance: {
      processingPower: 75,
      accuracy: 85,
      powerEfficiency: 95,
      reliability: 90,
      thermalTolerance: 80,
      lowLightPerformance: 90,
    },
    environmentalFactors: {
      temperatureRange: [-30, 70],
      vibrationTolerance: 80,
      powerSensitivity: 10,
      humidityTolerance: 85,
      dustResistance: 70,
      emiTolerance: 80,
    },
    failureThresholds: {
      criticalTemp: 75,
      maxVibration: 90,
      minPower: 15,
      maxHumidity: 90,
      maxDust: 80,
      maxEMI: 85,
    },
  },
  "rpi-cam-hq": {
    name: "Raspberry Pi HQ Camera",
    basePerformance: {
      processingPower: 85,
      accuracy: 95,
      powerEfficiency: 70,
      reliability: 85,
      thermalTolerance: 85,
      lowLightPerformance: 85,
    },
    environmentalFactors: {
      temperatureRange: [-30, 70],
      vibrationTolerance: 85,
      powerSensitivity: 20,
      humidityTolerance: 80,
      dustResistance: 75,
      emiTolerance: 85,
    },
    failureThresholds: {
      criticalTemp: 70,
      maxVibration: 95,
      minPower: 20,
      maxHumidity: 85,
      maxDust: 85,
      maxEMI: 90,
    },
  },
  "usb-webcam": {
    name: "Logitech C920",
    basePerformance: {
      processingPower: 70,
      accuracy: 80,
      powerEfficiency: 60,
      reliability: 85,
      thermalTolerance: 70,
      lowLightPerformance: 75,
    },
    environmentalFactors: {
      temperatureRange: [0, 40],
      vibrationTolerance: 75,
      powerSensitivity: 30,
      humidityTolerance: 70,
      dustResistance: 60,
      emiTolerance: 70,
    },
    failureThresholds: {
      criticalTemp: 45,
      maxVibration: 85,
      minPower: 25,
      maxHumidity: 75,
      maxDust: 70,
      maxEMI: 75,
    },
  },
  // Processors
  "rpi4-8gb": {
    name: "Raspberry Pi 4 8GB",
    basePerformance: {
      processingPower: 75,
      accuracy: 80,
      powerEfficiency: 90,
      reliability: 95,
      thermalTolerance: 70,
    },
    environmentalFactors: {
      temperatureRange: [0, 50],
      vibrationTolerance: 85,
      powerSensitivity: 15,
      humidityTolerance: 80,
      dustResistance: 75,
      emiTolerance: 85,
    },
    failureThresholds: {
      criticalTemp: 85,
      maxVibration: 95,
      minPower: 10,
      maxHumidity: 85,
      maxDust: 80,
      maxEMI: 90,
    },
  },
  "jetson-nano": {
    name: "NVIDIA Jetson Nano",
    basePerformance: {
      processingPower: 95,
      accuracy: 95,
      powerEfficiency: 70,
      reliability: 85,
      thermalTolerance: 75,
    },
    environmentalFactors: {
      temperatureRange: [-25, 80],
      vibrationTolerance: 80,
      powerSensitivity: 25,
      humidityTolerance: 75,
      dustResistance: 70,
      emiTolerance: 80,
    },
    failureThresholds: {
      criticalTemp: 90,
      maxVibration: 90,
      minPower: 20,
      maxHumidity: 80,
      maxDust: 75,
      maxEMI: 85,
    },
  },
  "coral-dev": {
    name: "Google Coral Dev Board",
    basePerformance: {
      processingPower: 100,
      accuracy: 98,
      powerEfficiency: 85,
      reliability: 80,
      thermalTolerance: 65,
    },
    environmentalFactors: {
      temperatureRange: [0, 35],
      vibrationTolerance: 70,
      powerSensitivity: 20,
      humidityTolerance: 70,
      dustResistance: 65,
      emiTolerance: 75,
    },
    failureThresholds: {
      criticalTemp: 40,
      maxVibration: 80,
      minPower: 15,
      maxHumidity: 75,
      maxDust: 70,
      maxEMI: 80,
    },
  },
  // GPS modules
  "neo-6m": {
    name: "u-blox NEO-6M",
    basePerformance: {
      processingPower: 70,
      accuracy: 70,
      powerEfficiency: 90,
      reliability: 85,
      thermalTolerance: 95,
      gpsAccuracy: 70,
    },
    environmentalFactors: {
      temperatureRange: [-40, 85],
      vibrationTolerance: 90,
      powerSensitivity: 5,
      humidityTolerance: 95,
      dustResistance: 90,
      emiTolerance: 70,
    },
    failureThresholds: {
      criticalTemp: 90,
      maxVibration: 95,
      minPower: 5,
      maxHumidity: 98,
      maxDust: 95,
      maxEMI: 80,
    },
  },
  "neo-8m": {
    name: "u-blox NEO-8M",
    basePerformance: {
      processingPower: 80,
      accuracy: 85,
      powerEfficiency: 80,
      reliability: 90,
      thermalTolerance: 95,
      gpsAccuracy: 85,
    },
    environmentalFactors: {
      temperatureRange: [-40, 85],
      vibrationTolerance: 90,
      powerSensitivity: 10,
      humidityTolerance: 95,
      dustResistance: 90,
      emiTolerance: 75,
    },
    failureThresholds: {
      criticalTemp: 90,
      maxVibration: 95,
      minPower: 8,
      maxHumidity: 98,
      maxDust: 95,
      maxEMI: 85,
    },
  },
  "zed-f9p": {
    name: "u-blox ZED-F9P",
    basePerformance: {
      processingPower: 90,
      accuracy: 100,
      powerEfficiency: 70,
      reliability: 95,
      thermalTolerance: 95,
      gpsAccuracy: 100,
    },
    environmentalFactors: {
      temperatureRange: [-40, 85],
      vibrationTolerance: 95,
      powerSensitivity: 15,
      humidityTolerance: 95,
      dustResistance: 95,
      emiTolerance: 80,
    },
    failureThresholds: {
      criticalTemp: 90,
      maxVibration: 98,
      minPower: 12,
      maxHumidity: 98,
      maxDust: 98,
      maxEMI: 90,
    },
  },
  // Alert Systems
  "piezo-buzzer": {
    name: "Piezo Buzzer",
    basePerformance: {
      processingPower: 95,
      accuracy: 95,
      powerEfficiency: 95,
      reliability: 95,
      thermalTolerance: 90,
      alertVolume: 60,
    },
    environmentalFactors: {
      temperatureRange: [-20, 70],
      vibrationTolerance: 95,
      powerSensitivity: 5,
      humidityTolerance: 85,
      dustResistance: 95,
      emiTolerance: 95,
    },
    failureThresholds: {
      criticalTemp: 75,
      maxVibration: 98,
      minPower: 3,
      maxHumidity: 90,
      maxDust: 98,
      maxEMI: 98,
    },
  },
  "speaker-amp": {
    name: "Speaker + Amplifier",
    basePerformance: {
      processingPower: 85,
      accuracy: 90,
      powerEfficiency: 70,
      reliability: 85,
      thermalTolerance: 80,
      alertVolume: 85,
    },
    environmentalFactors: {
      temperatureRange: [-10, 60],
      vibrationTolerance: 85,
      powerSensitivity: 20,
      humidityTolerance: 75,
      dustResistance: 80,
      emiTolerance: 80,
    },
    failureThresholds: {
      criticalTemp: 65,
      maxVibration: 90,
      minPower: 15,
      maxHumidity: 80,
      maxDust: 85,
      maxEMI: 85,
    },
  },
  "voice-module": {
    name: "Voice Synthesis Module",
    basePerformance: {
      processingPower: 80,
      accuracy: 95,
      powerEfficiency: 75,
      reliability: 90,
      thermalTolerance: 85,
      alertVolume: 80,
    },
    environmentalFactors: {
      temperatureRange: [-20, 70],
      vibrationTolerance: 80,
      powerSensitivity: 15,
      humidityTolerance: 80,
      dustResistance: 85,
      emiTolerance: 85,
    },
    failureThresholds: {
      criticalTemp: 75,
      maxVibration: 85,
      minPower: 12,
      maxHumidity: 85,
      maxDust: 90,
      maxEMI: 90,
    },
  },
}

const simulationScenarios: SimulationScenario[] = [
  {
    id: "city-day",
    name: "City Driving - Daytime",
    description: "Urban environment with good lighting and stable power",
    icon: <Sun className="h-5 w-5" />,
    severity: "normal",
    conditions: {
      lighting: 85,
      temperature: 25,
      vibration: 30,
      powerAvailable: 90,
      networkQuality: 95,
      humidity: 60,
      dustLevel: 20,
      electromagneticInterference: 30,
    },
    challenges: ["Traffic congestion", "Frequent stops", "Pedestrian detection"],
    failureRisks: ["Minimal risk under normal conditions"],
  },
  {
    id: "highway-night",
    name: "Highway - Night",
    description: "High-speed driving in low-light conditions",
    icon: <Moon className="h-5 w-5" />,
    severity: "challenging",
    conditions: {
      lighting: 15,
      temperature: 10,
      vibration: 20,
      powerAvailable: 85,
      networkQuality: 80,
      humidity: 70,
      dustLevel: 15,
      electromagneticInterference: 25,
    },
    challenges: ["Low visibility", "High speeds", "Fatigue detection critical"],
    failureRisks: ["Camera performance degradation", "False negative risk"],
  },
  {
    id: "rural-rough",
    name: "Rural Roads - Rough Terrain",
    description: "Poor road conditions with limited connectivity",
    icon: <AlertTriangle className="h-5 w-5" />,
    severity: "challenging",
    conditions: {
      lighting: 60,
      temperature: 35,
      vibration: 80,
      powerAvailable: 70,
      networkQuality: 40,
      humidity: 45,
      dustLevel: 70,
      electromagneticInterference: 20,
    },
    challenges: ["High vibration", "Dust", "Poor network", "Temperature extremes"],
    failureRisks: ["Component loosening", "Dust ingress", "Connection failures"],
  },
  {
    id: "extreme-cold",
    name: "Arctic Conditions",
    description: "Extreme cold with potential system failures",
    icon: <Snowflake className="h-5 w-5" />,
    severity: "extreme",
    conditions: {
      lighting: 30,
      temperature: -35,
      vibration: 40,
      powerAvailable: 40,
      networkQuality: 60,
      humidity: 20,
      dustLevel: 10,
      electromagneticInterference: 15,
    },
    challenges: ["Battery failure", "Condensation", "Component brittleness", "Slow boot times"],
    failureRisks: ["Battery shutdown", "LCD failure", "Connector cracking", "Boot failure"],
  },
  {
    id: "extreme-heat",
    name: "Desert Heat Stress",
    description: "Extreme temperature with thermal shutdown risk",
    icon: <Flame className="h-5 w-5" />,
    severity: "extreme",
    conditions: {
      lighting: 95,
      temperature: 55,
      vibration: 25,
      powerAvailable: 70,
      networkQuality: 75,
      humidity: 10,
      dustLevel: 85,
      electromagneticInterference: 20,
    },
    challenges: ["Thermal throttling", "Component expansion", "Dust storms", "Solar glare"],
    failureRisks: ["Thermal shutdown", "Component failure", "Dust ingress", "Overheating"],
  },
  {
    id: "industrial-emi",
    name: "Industrial EMI Zone",
    description: "High electromagnetic interference environment",
    icon: <Zap className="h-5 w-5" />,
    severity: "extreme",
    conditions: {
      lighting: 70,
      temperature: 30,
      vibration: 60,
      powerAvailable: 85,
      networkQuality: 30,
      humidity: 65,
      dustLevel: 50,
      electromagneticInterference: 95,
    },
    challenges: ["Signal interference", "GPS jamming", "Communication disruption", "Sensor noise"],
    failureRisks: ["GPS failure", "Communication loss", "False readings", "System instability"],
  },
  {
    id: "monsoon-flood",
    name: "Monsoon/Flood Conditions",
    description: "High humidity and water ingress risk",
    icon: <Droplets className="h-5 w-5" />,
    severity: "extreme",
    conditions: {
      lighting: 25,
      temperature: 28,
      vibration: 35,
      powerAvailable: 75,
      networkQuality: 50,
      humidity: 98,
      dustLevel: 30,
      electromagneticInterference: 40,
    },
    challenges: ["Water ingress", "Corrosion", "Electrical shorts", "Visibility issues"],
    failureRisks: ["Water damage", "Corrosion", "Short circuits", "Connector failure"],
  },
  {
    id: "mining-quarry",
    name: "Mining/Quarry Operations",
    description: "Extreme dust and vibration conditions",
    icon: <Hammer className="h-5 w-5" />,
    severity: "critical",
    conditions: {
      lighting: 40,
      temperature: 40,
      vibration: 95,
      powerAvailable: 80,
      networkQuality: 20,
      humidity: 30,
      dustLevel: 98,
      electromagneticInterference: 60,
    },
    challenges: ["Extreme dust", "Constant vibration", "Heavy machinery interference", "Poor visibility"],
    failureRisks: ["Dust clogging", "Vibration damage", "Connector wear", "Filter saturation"],
  },
  {
    id: "power-failure",
    name: "Critical Power Failure",
    description: "System operating on backup power only",
    icon: <Battery className="h-5 w-5" />,
    severity: "critical",
    conditions: {
      lighting: 50,
      temperature: 20,
      vibration: 30,
      powerAvailable: 15,
      networkQuality: 85,
      humidity: 60,
      dustLevel: 25,
      electromagneticInterference: 30,
    },
    challenges: ["Critical power shortage", "System throttling", "Component shutdown", "Data loss risk"],
    failureRisks: ["System shutdown", "Data corruption", "Component damage", "Recovery failure"],
  },
  {
    id: "network-blackout",
    name: "Communication Blackout",
    description: "Complete network and GPS signal loss",
    icon: <WifiOff className="h-5 w-5" />,
    severity: "critical",
    conditions: {
      lighting: 60,
      temperature: 25,
      vibration: 40,
      powerAvailable: 85,
      networkQuality: 0,
      humidity: 55,
      dustLevel: 30,
      electromagneticInterference: 85,
    },
    challenges: ["No GPS signal", "No cloud connectivity", "Offline operation only", "No remote monitoring"],
    failureRisks: ["Navigation failure", "No cloud backup", "Isolated operation", "No remote support"],
  },
]

export function PerformanceSimulator() {
  const [selectedConfig, setSelectedConfig] = useState<HardwareConfig>({
    camera: "rpi-cam-v2",
    processor: "rpi4-8gb",
    gps: "neo-6m",
    alert: "piezo-buzzer",
  })
  const [selectedScenario, setSelectedScenario] = useState("city-day")
  const [isSimulating, setIsSimulating] = useState(false)
  const [simulationProgress, setSimulationProgress] = useState(0)
  const [results, setResults] = useState<PerformanceMetrics | null>(null)
  const [failureAnalysis, setFailureAnalysis] = useState<FailureAnalysis | null>(null)
  const [customConditions, setCustomConditions] = useState(simulationScenarios[0].conditions)
  const [activeTab, setActiveTab] = useState("scenarios")
  const [stressTestMode, setStressTestMode] = useState(false)

  const currentScenario = simulationScenarios.find((s) => s.id === selectedScenario) || simulationScenarios[0]

  // Enhanced simulation engine with failure analysis
  const calculatePerformance = (config: HardwareConfig, conditions: any): PerformanceMetrics => {
    const camera = hardwareSpecs[config.camera]
    const processor = hardwareSpecs[config.processor]
    const gps = hardwareSpecs[config.gps]
    const alert = hardwareSpecs[config.alert]

    // Base performance calculation
    let detectionAccuracy = (camera.basePerformance.accuracy + processor.basePerformance.accuracy) / 2
    let responseTime = 100 - processor.basePerformance.processingPower
    let powerConsumption =
      100 -
      (camera.basePerformance.powerEfficiency +
        processor.basePerformance.powerEfficiency +
        gps.basePerformance.powerEfficiency +
        alert.basePerformance.powerEfficiency) /
        4
    let reliability = (camera.basePerformance.reliability + processor.basePerformance.reliability) / 2
    let systemLoad = 100 - processor.basePerformance.processingPower
    let thermalPerformance = (camera.basePerformance.thermalTolerance + processor.basePerformance.thermalTolerance) / 2

    // Environmental impact calculations with failure considerations
    // Lighting impact on camera performance
    if (conditions.lighting < 30) {
      const lightingPenalty = (30 - conditions.lighting) * 0.8
      detectionAccuracy -= lightingPenalty * (1 - (camera.basePerformance.lowLightPerformance || 50) / 100)
    }

    // Temperature impact with critical failure points
    const tempOptimal = 20
    const tempDiff = Math.abs(conditions.temperature - tempOptimal)
    if (tempDiff > 10) {
      const tempPenalty = (tempDiff - 10) * 0.4
      reliability -= tempPenalty
      thermalPerformance -= tempPenalty * 2

      if (conditions.temperature > 40) {
        systemLoad += tempPenalty * 0.8 // Severe thermal throttling
        responseTime += tempPenalty * 0.5
        if (conditions.temperature > processor.failureThresholds.criticalTemp) {
          reliability -= 30 // Critical temperature reached
          systemLoad += 20
        }
      }
      if (conditions.temperature < 0) {
        powerConsumption += tempPenalty * 0.6 // Heating requirements
        responseTime += tempPenalty * 0.3 // Slower operation in cold
        if (conditions.temperature < processor.environmentalFactors.temperatureRange[0]) {
          reliability -= 25 // Below operating range
        }
      }
    }

    // Vibration impact with mechanical failure risk
    if (conditions.vibration > 50) {
      const vibrationPenalty = (conditions.vibration - 50) * 0.3
      detectionAccuracy -= vibrationPenalty * (1 - camera.environmentalFactors.vibrationTolerance / 100)
      reliability -= vibrationPenalty * 0.8
      if (conditions.vibration > camera.failureThresholds.maxVibration) {
        reliability -= 20 // Mechanical stress failure
        detectionAccuracy -= 15
      }
    }

    // Power availability impact with critical shutdown
    if (conditions.powerAvailable < 80) {
      const powerPenalty = (80 - conditions.powerAvailable) * 0.4
      systemLoad += powerPenalty
      responseTime += powerPenalty * 0.3
      if (conditions.powerAvailable < 50) {
        detectionAccuracy -= powerPenalty * 0.8 // Severe performance throttling
      }
      if (conditions.powerAvailable < processor.failureThresholds.minPower) {
        reliability -= 40 // Critical power failure
        systemLoad += 30
      }
    }

    // Humidity impact
    if (conditions.humidity && conditions.humidity > 80) {
      const humidityPenalty = (conditions.humidity - 80) * 0.2
      reliability -= humidityPenalty
      if (conditions.humidity > (camera.failureThresholds.maxHumidity || 90)) {
        reliability -= 15 // Moisture damage risk
      }
    }

    // Dust impact
    if (conditions.dustLevel && conditions.dustLevel > 60) {
      const dustPenalty = (conditions.dustLevel - 60) * 0.25
      detectionAccuracy -= dustPenalty * 0.5 // Camera lens obstruction
      thermalPerformance -= dustPenalty // Cooling obstruction
      if (conditions.dustLevel > (camera.failureThresholds.maxDust || 80)) {
        reliability -= 20 // Dust ingress failure
        thermalPerformance -= 15
      }
    }

    // EMI impact
    if (conditions.electromagneticInterference && conditions.electromagneticInterference > 70) {
      const emiPenalty = (conditions.electromagneticInterference - 70) * 0.3
      reliability -= emiPenalty
      detectionAccuracy -= emiPenalty * 0.3 // Signal interference
      if (conditions.electromagneticInterference > (gps.failureThresholds.maxEMI || 85)) {
        reliability -= 25 // GPS/communication failure
      }
    }

    // Network quality impact
    const networkLatency = 100 - conditions.networkQuality + Math.random() * 30

    // False positive calculation with stress factors
    const falsePositiveRate = Math.max(
      5,
      15 -
        detectionAccuracy * 0.1 +
        (100 - conditions.lighting) * 0.08 +
        conditions.vibration * 0.03 +
        (conditions.dustLevel || 0) * 0.02,
    )

    // Ensure values are within bounds
    return {
      detectionAccuracy: Math.max(0, Math.min(100, detectionAccuracy)),
      responseTime: Math.max(50, Math.min(2000, responseTime)),
      powerConsumption: Math.max(10, Math.min(100, powerConsumption)),
      reliability: Math.max(0, Math.min(100, reliability)),
      falsePositiveRate: Math.max(0, Math.min(50, falsePositiveRate)),
      systemLoad: Math.max(0, Math.min(100, systemLoad)),
      thermalPerformance: Math.max(0, Math.min(100, thermalPerformance)),
      networkLatency: Math.max(10, Math.min(5000, networkLatency)),
    }
  }

  // Failure analysis engine
  const analyzeFailures = (config: HardwareConfig, conditions: any, metrics: PerformanceMetrics): FailureAnalysis => {
    const camera = hardwareSpecs[config.camera]
    const processor = hardwareSpecs[config.processor]
    const gps = hardwareSpecs[config.gps]
    const alert = hardwareSpecs[config.alert]

    const criticalFailures: FailurePoint[] = []
    const warnings: FailurePoint[] = []
    const operationalLimits: OperationalLimit[] = []

    // Temperature analysis
    if (conditions.temperature > processor.failureThresholds.criticalTemp) {
      criticalFailures.push({
        component: "Processor",
        condition: "Critical Temperature",
        threshold: processor.failureThresholds.criticalTemp,
        currentValue: conditions.temperature,
        severity: "critical",
        description: "Processor temperature exceeds safe operating limits",
        mitigation: "Immediate cooling required or system shutdown",
      })
    } else if (conditions.temperature > processor.environmentalFactors.temperatureRange[1] * 0.9) {
      warnings.push({
        component: "Processor",
        condition: "High Temperature",
        threshold: processor.environmentalFactors.temperatureRange[1] * 0.9,
        currentValue: conditions.temperature,
        severity: "medium",
        description: "Processor approaching thermal limits",
        mitigation: "Improve ventilation or reduce processing load",
      })
    }

    // Power analysis
    if (conditions.powerAvailable < processor.failureThresholds.minPower) {
      criticalFailures.push({
        component: "System",
        condition: "Critical Power Level",
        threshold: processor.failureThresholds.minPower,
        currentValue: conditions.powerAvailable,
        severity: "critical",
        description: "Power level below minimum operating threshold",
        mitigation: "Connect to external power immediately",
      })
    } else if (conditions.powerAvailable < 30) {
      warnings.push({
        component: "System",
        condition: "Low Power",
        threshold: 30,
        currentValue: conditions.powerAvailable,
        severity: "high",
        description: "Power level critically low",
        mitigation: "Reduce power consumption or find charging source",
      })
    }

    // Vibration analysis
    if (conditions.vibration > camera.failureThresholds.maxVibration) {
      criticalFailures.push({
        component: "Camera",
        condition: "Excessive Vibration",
        threshold: camera.failureThresholds.maxVibration,
        currentValue: conditions.vibration,
        severity: "critical",
        description: "Vibration levels may cause mechanical damage",
        mitigation: "Install vibration dampening or relocate sensor",
      })
    }

    // Humidity analysis
    if (conditions.humidity && conditions.humidity > (camera.failureThresholds.maxHumidity || 90)) {
      criticalFailures.push({
        component: "Camera",
        condition: "High Humidity",
        threshold: camera.failureThresholds.maxHumidity || 90,
        currentValue: conditions.humidity,
        severity: "high",
        description: "Humidity levels risk moisture damage",
        mitigation: "Improve sealing or add desiccant",
      })
    }

    // Dust analysis
    if (conditions.dustLevel && conditions.dustLevel > (camera.failureThresholds.maxDust || 80)) {
      warnings.push({
        component: "Camera",
        condition: "High Dust Level",
        threshold: camera.failureThresholds.maxDust || 80,
        currentValue: conditions.dustLevel,
        severity: "medium",
        description: "Dust accumulation affecting performance",
        mitigation: "Clean lens and improve filtration",
      })
    }

    // EMI analysis
    if (
      conditions.electromagneticInterference &&
      conditions.electromagneticInterference > (gps.failureThresholds.maxEMI || 85)
    ) {
      criticalFailures.push({
        component: "GPS",
        condition: "High EMI",
        threshold: gps.failureThresholds.maxEMI || 85,
        currentValue: conditions.electromagneticInterference,
        severity: "high",
        description: "Electromagnetic interference disrupting GPS",
        mitigation: "Add shielding or relocate GPS antenna",
      })
    }

    // Operational limits
    operationalLimits.push(
      {
        parameter: "Temperature",
        safeRange: processor.environmentalFactors.temperatureRange,
        currentValue: conditions.temperature,
        status:
          conditions.temperature < processor.environmentalFactors.temperatureRange[0] ||
          conditions.temperature > processor.environmentalFactors.temperatureRange[1]
            ? "critical"
            : conditions.temperature > processor.environmentalFactors.temperatureRange[1] * 0.9
              ? "warning"
              : "safe",
        recommendation:
          conditions.temperature > processor.environmentalFactors.temperatureRange[1] * 0.9
            ? "Improve cooling system"
            : "Operating within safe limits",
      },
      {
        parameter: "Power Level",
        safeRange: [processor.failureThresholds.minPower, 100],
        currentValue: conditions.powerAvailable,
        status:
          conditions.powerAvailable < processor.failureThresholds.minPower
            ? "critical"
            : conditions.powerAvailable < 30
              ? "danger"
              : conditions.powerAvailable < 50
                ? "warning"
                : "safe",
        recommendation: conditions.powerAvailable < 50 ? "Monitor power consumption closely" : "Power level adequate",
      },
      {
        parameter: "Vibration",
        safeRange: [0, camera.failureThresholds.maxVibration],
        currentValue: conditions.vibration,
        status:
          conditions.vibration > camera.failureThresholds.maxVibration
            ? "critical"
            : conditions.vibration > camera.failureThresholds.maxVibration * 0.8
              ? "warning"
              : "safe",
        recommendation:
          conditions.vibration > camera.failureThresholds.maxVibration * 0.8
            ? "Consider vibration dampening"
            : "Vibration within acceptable limits",
      },
    )

    // Calculate MTBF based on stress factors
    const baseMTBF = 8760 // Base 1 year in hours
    const stressFactors = [
      Math.abs(conditions.temperature - 20) / 50,
      conditions.vibration / 100,
      (100 - conditions.powerAvailable) / 100,
      (conditions.humidity || 50) / 100,
      (conditions.dustLevel || 20) / 100,
      (conditions.electromagneticInterference || 30) / 100,
    ]
    const totalStress = stressFactors.reduce((sum, factor) => sum + factor, 0) / stressFactors.length
    const mtbf = baseMTBF * (1 - totalStress * 0.7)

    // System stability based on failure points
    const systemStability = Math.max(0, 100 - criticalFailures.length * 25 - warnings.length * 10 - totalStress * 20)

    // Recovery time based on failure severity
    const recoveryTime = criticalFailures.length > 0 ? 30 + criticalFailures.length * 15 : warnings.length * 5

    return {
      criticalFailures,
      warnings,
      operationalLimits,
      mtbf: Math.max(100, mtbf),
      systemStability,
      recoveryTime,
    }
  }

  const runSimulation = async () => {
    setIsSimulating(true)
    setSimulationProgress(0)
    setResults(null)
    setFailureAnalysis(null)

    // Simulate processing time with stress testing
    const steps = stressTestMode ? 150 : 100
    for (let i = 0; i <= steps; i += 5) {
      await new Promise((resolve) => setTimeout(resolve, stressTestMode ? 30 : 50))
      setSimulationProgress((i / steps) * 100)
    }

    const conditions = activeTab === "scenarios" ? currentScenario.conditions : customConditions
    const performanceResults = calculatePerformance(selectedConfig, conditions)
    const failureResults = analyzeFailures(selectedConfig, conditions, performanceResults)

    setResults(performanceResults)
    setFailureAnalysis(failureResults)
    setIsSimulating(false)
  }

  const resetSimulation = () => {
    setResults(null)
    setFailureAnalysis(null)
    setSimulationProgress(0)
    setIsSimulating(false)
  }

  const getPerformanceColor = (value: number, inverse = false) => {
    const threshold = inverse ? 100 - value : value
    if (threshold >= 80) return "text-green-600 bg-green-100"
    if (threshold >= 60) return "text-blue-600 bg-blue-100"
    if (threshold >= 40) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getPerformanceIcon = (value: number, inverse = false) => {
    const threshold = inverse ? 100 - value : value
    if (threshold >= 80) return <CheckCircle className="h-4 w-4 text-green-600" />
    if (threshold >= 60) return <TrendingUp className="h-4 w-4 text-blue-600" />
    if (threshold >= 40) return <TrendingDown className="h-4 w-4 text-yellow-600" />
    return <XCircle className="h-4 w-4 text-red-600" />
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "normal":
        return "bg-green-100 text-green-800 border-green-200"
      case "challenging":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "extreme":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "critical":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getFailureSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "text-green-600 bg-green-100"
      case "medium":
        return "text-yellow-600 bg-yellow-100"
      case "high":
        return "text-orange-600 bg-orange-100"
      case "critical":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "safe":
        return "text-green-600 bg-green-100"
      case "warning":
        return "text-yellow-600 bg-yellow-100"
      case "danger":
        return "text-orange-600 bg-orange-100"
      case "critical":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
          Performance Simulator & Failure Analysis
        </h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
          Simulate real-world performance and analyze failure points under extreme operating conditions
        </p>
      </div>

      {/* Hardware Configuration */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cpu className="h-6 w-6 text-primary-600" />
            Hardware Configuration
          </CardTitle>
          <CardDescription>Select the hardware components for simulation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                key: "camera",
                label: "Camera",
                icon: <Camera className="h-5 w-5" />,
                options: ["rpi-cam-v2", "rpi-cam-hq", "usb-webcam"],
              },
              {
                key: "processor",
                label: "Processor",
                icon: <Cpu className="h-5 w-5" />,
                options: ["rpi4-8gb", "jetson-nano", "coral-dev"],
              },
              {
                key: "gps",
                label: "GPS",
                icon: <MapPin className="h-5 w-5" />,
                options: ["neo-6m", "neo-8m", "zed-f9p"],
              },
              {
                key: "alert",
                label: "Alert System",
                icon: <Bell className="h-5 w-5" />,
                options: ["piezo-buzzer", "speaker-amp", "voice-module"],
              },
            ].map((component) => (
              <div key={component.key} className="space-y-3">
                <div className="flex items-center gap-2 font-semibold text-neutral-900 dark:text-white">
                  {component.icon}
                  {component.label}
                </div>
                <div className="space-y-2">
                  {component.options.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSelectedConfig({ ...selectedConfig, [component.key]: option })}
                      className={`w-full p-3 text-left rounded-lg border-2 transition-all duration-200 ${
                        selectedConfig[component.key as keyof HardwareConfig] === option
                          ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                          : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                      }`}
                    >
                      <div className="font-medium text-sm">{hardwareSpecs[option]?.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Scenario Selection with Severity Indicators */}
      <Card className="shadow-lg border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-6 w-6 text-primary-600" />
            Simulation Conditions & Stress Testing
          </CardTitle>
          <CardDescription>Choose scenarios including extreme conditions and failure point testing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={stressTestMode}
                onChange={(e) => setStressTestMode(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="font-medium text-neutral-900 dark:text-white">Enable Stress Testing Mode</span>
            </label>
            <Badge variant="outline" className="text-orange-600 border-orange-300">
              <Skull className="h-3 w-3 mr-1" />
              Extended Analysis
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="scenarios">Predefined Scenarios</TabsTrigger>
              <TabsTrigger value="custom">Custom Conditions</TabsTrigger>
            </TabsList>

            <TabsContent value="scenarios" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {simulationScenarios.map((scenario) => (
                  <motion.button
                    key={scenario.id}
                    onClick={() => setSelectedScenario(scenario.id)}
                    className={`p-4 text-left rounded-lg border-2 transition-all duration-200 ${
                      selectedScenario === scenario.id
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                        : "border-neutral-200 dark:border-neutral-700 hover:border-primary-300"
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                          {scenario.icon}
                        </div>
                        <h3 className="font-semibold text-neutral-900 dark:text-white">{scenario.name}</h3>
                      </div>
                      <Badge className={`text-xs ${getSeverityColor(scenario.severity)}`}>
                        {scenario.severity.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">{scenario.description}</p>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {scenario.challenges.slice(0, 2).map((challenge, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {challenge}
                          </Badge>
                        ))}
                      </div>
                      {scenario.severity !== "normal" && (
                        <div className="flex flex-wrap gap-1">
                          {scenario.failureRisks.slice(0, 2).map((risk, index) => (
                            <Badge key={index} variant="destructive" className="text-xs">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {risk}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.button>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { key: "lighting", label: "Lighting Conditions", icon: <Sun className="h-4 w-4" />, unit: "%" },
                  {
                    key: "temperature",
                    label: "Temperature",
                    icon: <Thermometer className="h-4 w-4" />,
                    unit: "°C",
                    min: -40,
                    max: 60,
                  },
                  { key: "vibration", label: "Road Vibration", icon: <AlertTriangle className="h-4 w-4" />, unit: "%" },
                  { key: "powerAvailable", label: "Power Available", icon: <Battery className="h-4 w-4" />, unit: "%" },
                  { key: "networkQuality", label: "Network Quality", icon: <Signal className="h-4 w-4" />, unit: "%" },
                  { key: "humidity", label: "Humidity", icon: <Droplets className="h-4 w-4" />, unit: "%" },
                  { key: "dustLevel", label: "Dust Level", icon: <Wind className="h-4 w-4" />, unit: "%" },
                  {
                    key: "electromagneticInterference",
                    label: "EMI Level",
                    icon: <Zap className="h-4 w-4" />,
                    unit: "%",
                  },
                ].map((condition) => (
                  <div key={condition.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {condition.icon}
                        <span className="font-medium text-neutral-900 dark:text-white">{condition.label}</span>
                      </div>
                      <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                        {customConditions[condition.key as keyof typeof customConditions]}
                        {condition.unit}
                      </span>
                    </div>
                    <Slider
                      value={[customConditions[condition.key as keyof typeof customConditions] || 0]}
                      onValueChange={(value) => setCustomConditions({ ...customConditions, [condition.key]: value[0] })}
                      min={condition.min || 0}
                      max={condition.max || 100}
                      step={1}
                      className="w-full"
                    />
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Simulation Controls */}
      <div className="flex flex-wrap justify-center gap-4">
        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          size="lg"
          className="flex items-center gap-2 shadow-md hover:shadow-lg transition-shadow"
        >
          <Play className="h-5 w-5" />
          {isSimulating
            ? stressTestMode
              ? "Running Stress Test..."
              : "Running Simulation..."
            : stressTestMode
              ? "Run Stress Test"
              : "Run Performance Simulation"}
        </Button>
        <Button
          onClick={resetSimulation}
          variant="outline"
          size="lg"
          className="shadow-sm hover:shadow-md transition-shadow"
        >
          <RotateCcw className="h-5 w-5 mr-2" />
          Reset
        </Button>
      </div>

      {/* Simulation Progress */}
      <AnimatePresence>
        {isSimulating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-lg border-0">
              <CardContent className="pt-6">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-2">
                    {stressTestMode ? "Running Stress Test Analysis..." : "Simulating Performance..."}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {stressTestMode
                      ? "Analyzing failure points and extreme condition performance"
                      : "Analyzing hardware performance under selected conditions"}
                  </p>
                </div>
                <Progress value={simulationProgress} className="w-full h-3" />
                <div className="text-center mt-2">
                  <span className="text-sm font-medium text-primary-600">{Math.round(simulationProgress)}%</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {results && failureAnalysis && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="space-y-8"
          >
            {/* Performance Results */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary-600" />
                  Performance Analysis
                </CardTitle>
                <CardDescription>
                  Performance analysis for {hardwareSpecs[selectedConfig.processor]?.name} with{" "}
                  {hardwareSpecs[selectedConfig.camera]?.name} under{" "}
                  {activeTab === "scenarios" ? currentScenario.name : "custom conditions"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    {
                      key: "detectionAccuracy",
                      label: "Detection Accuracy",
                      icon: <Brain className="h-5 w-5" />,
                      value: results.detectionAccuracy,
                      unit: "%",
                      description: "AI model accuracy in detecting drowsiness and distraction",
                    },
                    {
                      key: "responseTime",
                      label: "Response Time",
                      icon: <Zap className="h-5 w-5" />,
                      value: results.responseTime,
                      unit: "ms",
                      inverse: true,
                      description: "Time from detection to alert generation",
                    },
                    {
                      key: "powerConsumption",
                      label: "Power Consumption",
                      icon: <Battery className="h-5 w-5" />,
                      value: results.powerConsumption,
                      unit: "%",
                      inverse: true,
                      description: "Relative power usage of the system",
                    },
                    {
                      key: "reliability",
                      label: "System Reliability",
                      icon: <CheckCircle className="h-5 w-5" />,
                      value: results.reliability,
                      unit: "%",
                      description: "Overall system stability and uptime",
                    },
                    {
                      key: "falsePositiveRate",
                      label: "False Positive Rate",
                      icon: <AlertTriangle className="h-5 w-5" />,
                      value: results.falsePositiveRate,
                      unit: "%",
                      inverse: true,
                      description: "Percentage of incorrect alerts generated",
                    },
                    {
                      key: "systemLoad",
                      label: "System Load",
                      icon: <Gauge className="h-5 w-5" />,
                      value: results.systemLoad,
                      unit: "%",
                      inverse: true,
                      description: "CPU and memory utilization",
                    },
                    {
                      key: "thermalPerformance",
                      label: "Thermal Performance",
                      icon: <Thermometer className="h-5 w-5" />,
                      value: results.thermalPerformance,
                      unit: "%",
                      description: "Heat management and thermal stability",
                    },
                    {
                      key: "networkLatency",
                      label: "Network Latency",
                      icon: <Signal className="h-5 w-5" />,
                      value: results.networkLatency,
                      unit: "ms",
                      inverse: true,
                      description: "Cloud communication delay",
                    },
                  ].map((metric, index) => (
                    <motion.div
                      key={metric.key}
                      className="p-4 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600">
                            {metric.icon}
                          </div>
                          <span className="font-medium text-sm text-neutral-900 dark:text-white">{metric.label}</span>
                        </div>
                        {getPerformanceIcon(metric.value, metric.inverse)}
                      </div>
                      <div className="mb-2">
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-bold text-neutral-900 dark:text-white">
                            {Math.round(metric.value)}
                          </span>
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">{metric.unit}</span>
                        </div>
                        <Progress value={metric.inverse ? 100 - metric.value : metric.value} className="h-2 mt-1" />
                      </div>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400">{metric.description}</p>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Failure Analysis */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-red-600" />
                  Failure Point Analysis
                </CardTitle>
                <CardDescription>Critical failure points and system reliability assessment</CardDescription>
              </CardHeader>
              <CardContent>
                {/* System Health Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-primary-50 dark:from-blue-900/20 dark:to-primary-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {Math.round(failureAnalysis.systemStability)}%
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">System Stability</div>
                    <Progress value={failureAnalysis.systemStability} className="mt-2 h-2" />
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 mb-1">{Math.round(failureAnalysis.mtbf)}h</div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Mean Time Between Failures</div>
                    <div className="text-xs text-green-600 mt-1">
                      {failureAnalysis.mtbf > 4000
                        ? "Excellent"
                        : failureAnalysis.mtbf > 2000
                          ? "Good"
                          : "Needs Improvement"}
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {Math.round(failureAnalysis.recoveryTime)}min
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Recovery Time</div>
                    <div className="text-xs text-orange-600 mt-1">
                      {failureAnalysis.recoveryTime < 10
                        ? "Fast"
                        : failureAnalysis.recoveryTime < 30
                          ? "Moderate"
                          : "Slow"}
                    </div>
                  </div>
                </div>

                {/* Critical Failures */}
                {failureAnalysis.criticalFailures.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                      <Skull className="h-5 w-5" />
                      Critical Failures ({failureAnalysis.criticalFailures.length})
                    </h3>
                    <div className="space-y-3">
                      {failureAnalysis.criticalFailures.map((failure, index) => (
                        <motion.div
                          key={index}
                          className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getFailureSeverityColor(failure.severity)}`}>
                                {failure.severity.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-red-800 dark:text-red-200">
                                {failure.component} - {failure.condition}
                              </span>
                            </div>
                            <div className="text-sm text-red-600 dark:text-red-400">
                              {failure.currentValue} / {failure.threshold}
                            </div>
                          </div>
                          <p className="text-sm text-red-700 dark:text-red-300 mb-2">{failure.description}</p>
                          <div className="text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded">
                            <strong>Mitigation:</strong> {failure.mitigation}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                {failureAnalysis.warnings.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-yellow-600 mb-4 flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      Warnings ({failureAnalysis.warnings.length})
                    </h3>
                    <div className="space-y-3">
                      {failureAnalysis.warnings.map((warning, index) => (
                        <motion.div
                          key={index}
                          className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs ${getFailureSeverityColor(warning.severity)}`}>
                                {warning.severity.toUpperCase()}
                              </Badge>
                              <span className="font-semibold text-yellow-800 dark:text-yellow-200">
                                {warning.component} - {warning.condition}
                              </span>
                            </div>
                            <div className="text-sm text-yellow-600 dark:text-yellow-400">
                              {warning.currentValue} / {warning.threshold}
                            </div>
                          </div>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">{warning.description}</p>
                          <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                            <strong>Mitigation:</strong> {warning.mitigation}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Operational Limits */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-blue-600 mb-4 flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Operational Limits
                  </h3>
                  <div className="space-y-3">
                    {failureAnalysis.operationalLimits.map((limit, index) => (
                      <motion.div
                        key={index}
                        className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 + 0.6 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-blue-800 dark:text-blue-200">{limit.parameter}</span>
                            <Badge className={`text-xs ${getStatusColor(limit.status)}`}>
                              {limit.status.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            {limit.currentValue} (Safe: {limit.safeRange[0]} - {limit.safeRange[1]})
                          </div>
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400">{limit.recommendation}</div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* No Issues Found */}
                {failureAnalysis.criticalFailures.length === 0 && failureAnalysis.warnings.length === 0 && (
                  <div className="text-center p-8 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                      No Critical Issues Detected
                    </h3>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      System is operating within safe parameters under current conditions
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Performance Summary */}
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-6 w-6 text-primary-600" />
                  Performance Summary & Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {results.detectionAccuracy >= 85
                        ? "Excellent"
                        : results.detectionAccuracy >= 70
                          ? "Good"
                          : "Needs Improvement"}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Overall Performance</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {results.responseTime <= 150 ? "Fast" : results.responseTime <= 250 ? "Moderate" : "Slow"}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Response Speed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      {results.powerConsumption <= 30
                        ? "Efficient"
                        : results.powerConsumption <= 60
                          ? "Moderate"
                          : "High"}
                    </div>
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">Power Usage</div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2 flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    System Recommendations
                  </h4>
                  <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                    {results.detectionAccuracy < 80 && (
                      <li>• Consider upgrading to a higher-performance processor for better AI accuracy</li>
                    )}
                    {results.responseTime > 200 && (
                      <li>• Response time could be improved with a more powerful processing unit</li>
                    )}
                    {results.powerConsumption > 70 && (
                      <li>• High power consumption detected - consider more efficient components</li>
                    )}
                    {results.falsePositiveRate > 15 && (
                      <li>• False positive rate is high - better camera or processing may help</li>
                    )}
                    {results.thermalPerformance < 60 && (
                      <li>• Thermal performance is concerning - ensure adequate cooling</li>
                    )}
                    {failureAnalysis.criticalFailures.length > 0 && (
                      <li>• Critical failures detected - immediate attention required</li>
                    )}
                    {failureAnalysis.mtbf < 2000 && <li>• Low MTBF indicates frequent maintenance will be required</li>}
                    {failureAnalysis.systemStability < 70 && (
                      <li>• System stability is low - consider environmental protection measures</li>
                    )}
                  </ul>
                </div>

                {/* Stress Test Results */}
                {stressTestMode && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <h4 className="font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                      <Skull className="h-4 w-4" />
                      Stress Test Analysis
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium text-red-700 dark:text-red-300 mb-1">Failure Resilience</div>
                        <div className="text-red-600 dark:text-red-400">
                          {failureAnalysis.criticalFailures.length === 0
                            ? "✓ No critical failures under stress"
                            : `⚠ ${failureAnalysis.criticalFailures.length} critical failure(s) detected`}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-red-700 dark:text-red-300 mb-1">Recovery Capability</div>
                        <div className="text-red-600 dark:text-red-400">
                          {failureAnalysis.recoveryTime < 15
                            ? "✓ Fast recovery expected"
                            : failureAnalysis.recoveryTime < 30
                              ? "⚠ Moderate recovery time"
                              : "⚠ Slow recovery expected"}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-red-700 dark:text-red-300 mb-1">Operational Limits</div>
                        <div className="text-red-600 dark:text-red-400">
                          {failureAnalysis.operationalLimits.filter((l) => l.status === "critical").length === 0
                            ? "✓ Within operational limits"
                            : `⚠ ${failureAnalysis.operationalLimits.filter((l) => l.status === "critical").length} limit(s) exceeded`}
                        </div>
                      </div>
                      <div>
                        <div className="font-medium text-red-700 dark:text-red-300 mb-1">System Stability</div>
                        <div className="text-red-600 dark:text-red-400">
                          {failureAnalysis.systemStability > 80
                            ? "✓ Highly stable"
                            : failureAnalysis.systemStability > 60
                              ? "⚠ Moderately stable"
                              : "⚠ Stability concerns"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
