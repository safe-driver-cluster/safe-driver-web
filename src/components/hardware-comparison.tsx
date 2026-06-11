"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Camera,
  Cpu,
  MapPin,
  Bell,
  Shield,
  Check,
  X,
  Star,
  DollarSign,
  Gauge,
  Battery,
  Thermometer,
  Eye,
  Signal,
} from "lucide-react"

interface HardwareOption {
  id: string
  name: string
  model: string
  price: number
  rating: number
  recommended: boolean
  pros: string[]
  cons: string[]
  specifications: Record<string, string | number>
  performance: Record<string, number>
  compatibility: string[]
  powerConsumption: string
  operatingTemp: string
  dimensions: string
  weight: string
  warranty: string
  availability: "In Stock" | "Limited" | "Out of Stock"
}

interface ComponentCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  options: HardwareOption[]
}

const hardwareCategories: ComponentCategory[] = [
  {
    id: "camera",
    name: "Camera Modules",
    description: "High-resolution camera modules for driver monitoring",
    icon: <Camera className="h-6 w-6" />,
    options: [
      {
        id: "rpi-cam-v2",
        name: "Raspberry Pi Camera Module v2",
        model: "IMX219 8MP",
        price: 25,
        rating: 4.5,
        recommended: true,
        pros: [
          "Excellent low-light performance",
          "Native Raspberry Pi integration",
          "Wide community support",
          "Cost-effective solution",
        ],
        cons: ["Fixed focus lens", "Limited zoom capabilities", "Requires ribbon cable"],
        specifications: {
          Resolution: "3280 × 2464 pixels",
          Video: "1080p30, 720p60",
          Sensor: "Sony IMX219",
          "Field of View": "62.2° × 48.8°",
          Focus: "Fixed",
          Interface: "CSI-2",
        },
        performance: {
          "Image Quality": 85,
          "Low Light": 90,
          Durability: 80,
          "Ease of Use": 95,
        },
        compatibility: ["Raspberry Pi 4", "Raspberry Pi 3", "Raspberry Pi Zero"],
        powerConsumption: "250mW",
        operatingTemp: "-30°C to +70°C",
        dimensions: "25 × 24 × 9mm",
        weight: "3g",
        warranty: "1 year",
        availability: "In Stock",
      },
      {
        id: "rpi-cam-hq",
        name: "Raspberry Pi HQ Camera",
        model: "IMX477 12MP",
        price: 50,
        rating: 4.8,
        recommended: false,
        pros: [
          "Superior image quality",
          "Interchangeable lenses",
          "Professional-grade sensor",
          "Excellent dynamic range",
        ],
        cons: ["Higher cost", "Requires separate lens", "Larger form factor", "More complex setup"],
        specifications: {
          Resolution: "4056 × 3040 pixels",
          Video: "1080p50, 720p200",
          Sensor: "Sony IMX477",
          "Field of View": "Depends on lens",
          Focus: "Manual/Auto (lens dependent)",
          Interface: "CSI-2",
        },
        performance: {
          "Image Quality": 95,
          "Low Light": 85,
          Durability: 90,
          "Ease of Use": 70,
        },
        compatibility: ["Raspberry Pi 4", "Raspberry Pi 3"],
        powerConsumption: "680mW",
        operatingTemp: "-30°C to +70°C",
        dimensions: "38 × 38 × 18.4mm",
        weight: "30.4g",
        warranty: "1 year",
        availability: "In Stock",
      },
      {
        id: "usb-webcam",
        name: "Logitech C920 HD Pro",
        model: "C920",
        price: 70,
        rating: 4.3,
        recommended: false,
        pros: ["Plug-and-play setup", "Built-in autofocus", "Hardware H.264 encoding", "Wide compatibility"],
        cons: ["Higher power consumption", "USB bandwidth limitations", "Less integration", "Bulkier design"],
        specifications: {
          Resolution: "1920 × 1080 pixels",
          Video: "1080p30, 720p30",
          Sensor: "CMOS",
          "Field of View": "78°",
          Focus: "Autofocus",
          Interface: "USB 2.0",
        },
        performance: {
          "Image Quality": 80,
          "Low Light": 75,
          Durability: 85,
          "Ease of Use": 90,
        },
        compatibility: ["Any USB-enabled device", "Raspberry Pi 4", "PC", "Mac"],
        powerConsumption: "2.5W",
        operatingTemp: "0°C to +40°C",
        dimensions: "94 × 29 × 71mm",
        weight: "162g",
        warranty: "2 years",
        availability: "In Stock",
      },
    ],
  },
  {
    id: "processor",
    name: "Processing Units",
    description: "Main computing units for AI processing and system control",
    icon: <Cpu className="h-6 w-6" />,
    options: [
      {
        id: "rpi4-8gb",
        name: "Raspberry Pi 4 Model B",
        model: "8GB RAM",
        price: 75,
        rating: 4.7,
        recommended: true,
        pros: [
          "Excellent price-performance ratio",
          "Large community support",
          "GPIO pins for sensors",
          "Multiple connectivity options",
        ],
        cons: ["Limited AI acceleration", "ARM architecture limitations", "Heat generation under load"],
        specifications: {
          CPU: "Quad-core ARM Cortex-A72 1.5GHz",
          RAM: "8GB LPDDR4",
          GPU: "VideoCore VI",
          Storage: "MicroSD + USB",
          Connectivity: "WiFi, Bluetooth, Ethernet",
          GPIO: "40 pins",
        },
        performance: {
          "AI Processing": 75,
          "Power Efficiency": 90,
          Connectivity: 95,
          Expandability: 85,
        },
        compatibility: ["All Raspberry Pi accessories", "HATs", "Standard peripherals"],
        powerConsumption: "3-7W",
        operatingTemp: "0°C to +50°C",
        dimensions: "85.6 × 56.5 × 17mm",
        weight: "46g",
        warranty: "1 year",
        availability: "In Stock",
      },
      {
        id: "jetson-nano",
        name: "NVIDIA Jetson Nano",
        model: "4GB Developer Kit",
        price: 149,
        rating: 4.4,
        recommended: false,
        pros: ["Dedicated GPU for AI", "CUDA support", "Superior AI performance", "TensorRT optimization"],
        cons: ["Higher cost", "More complex setup", "Higher power consumption", "Limited GPIO"],
        specifications: {
          CPU: "Quad-core ARM Cortex-A57 1.43GHz",
          RAM: "4GB LPDDR4",
          GPU: "128-core Maxwell",
          Storage: "MicroSD",
          Connectivity: "WiFi (via USB), Ethernet",
          GPIO: "40 pins",
        },
        performance: {
          "AI Processing": 95,
          "Power Efficiency": 70,
          Connectivity: 80,
          Expandability: 75,
        },
        compatibility: ["NVIDIA ecosystem", "CUDA libraries", "TensorRT"],
        powerConsumption: "5-10W",
        operatingTemp: "-25°C to +80°C",
        dimensions: "100 × 80 × 29mm",
        weight: "140g",
        warranty: "1 year",
        availability: "Limited",
      },
      {
        id: "coral-dev",
        name: "Google Coral Dev Board",
        model: "Edge TPU",
        price: 175,
        rating: 4.2,
        recommended: false,
        pros: [
          "Dedicated Edge TPU",
          "Excellent AI inference speed",
          "TensorFlow Lite optimization",
          "Low latency processing",
        ],
        cons: ["Highest cost", "Limited model support", "Complex development", "Newer ecosystem"],
        specifications: {
          CPU: "Quad-core ARM Cortex-A53 1.5GHz",
          RAM: "1GB LPDDR4",
          "AI Accelerator": "Edge TPU",
          Storage: "8GB eMMC + MicroSD",
          Connectivity: "WiFi, Bluetooth",
          GPIO: "40 pins",
        },
        performance: {
          "AI Processing": 100,
          "Power Efficiency": 85,
          Connectivity: 85,
          Expandability: 70,
        },
        compatibility: ["TensorFlow Lite", "Edge TPU models", "Coral ecosystem"],
        powerConsumption: "2-4W",
        operatingTemp: "0°C to +35°C",
        dimensions: "88 × 60 × 24mm",
        weight: "45g",
        warranty: "1 year",
        availability: "Limited",
      },
    ],
  },
  {
    id: "gps",
    name: "GPS Modules",
    description: "Location tracking and navigation modules",
    icon: <MapPin className="h-6 w-6" />,
    options: [
      {
        id: "neo-6m",
        name: "u-blox NEO-6M",
        model: "GPS/GLONASS",
        price: 15,
        rating: 4.2,
        recommended: true,
        pros: ["Cost-effective", "Low power consumption", "Easy integration", "Reliable performance"],
        cons: ["Slower cold start", "Basic accuracy", "No RTK support", "Limited satellite systems"],
        specifications: {
          Accuracy: "2.5m CEP",
          Satellites: "GPS, GLONASS",
          Channels: "50",
          "Update Rate": "5Hz",
          "Cold Start": "27s",
          Interface: "UART",
        },
        performance: {
          Accuracy: 70,
          Speed: 75,
          Reliability: 85,
          "Power Efficiency": 90,
        },
        compatibility: ["Arduino", "Raspberry Pi", "Most microcontrollers"],
        powerConsumption: "45mW",
        operatingTemp: "-40°C to +85°C",
        dimensions: "25 × 35 × 6mm",
        weight: "9g",
        warranty: "1 year",
        availability: "In Stock",
      },
      {
        id: "neo-8m",
        name: "u-blox NEO-8M",
        model: "GPS/GLONASS/BeiDou/Galileo",
        price: 25,
        rating: 4.6,
        recommended: false,
        pros: ["Multi-constellation support", "Better accuracy", "Faster acquisition", "Improved sensitivity"],
        cons: ["Higher cost", "More complex", "Increased power usage"],
        specifications: {
          Accuracy: "2.0m CEP",
          Satellites: "GPS, GLONASS, BeiDou, Galileo",
          Channels: "72",
          "Update Rate": "10Hz",
          "Cold Start": "26s",
          Interface: "UART, I2C, SPI",
        },
        performance: {
          Accuracy: 85,
          Speed: 85,
          Reliability: 90,
          "Power Efficiency": 80,
        },
        compatibility: ["Arduino", "Raspberry Pi", "Advanced microcontrollers"],
        powerConsumption: "67mW",
        operatingTemp: "-40°C to +85°C",
        dimensions: "25 × 35 × 6mm",
        weight: "9.5g",
        warranty: "1 year",
        availability: "In Stock",
      },
      {
        id: "zed-f9p",
        name: "u-blox ZED-F9P",
        model: "RTK GNSS",
        price: 150,
        rating: 4.8,
        recommended: false,
        pros: ["Centimeter-level accuracy", "RTK support", "Multi-band reception", "Professional grade"],
        cons: ["Very high cost", "Complex setup", "Requires base station", "Overkill for basic use"],
        specifications: {
          Accuracy: "0.01m + 1ppm CEP (RTK)",
          Satellites: "GPS, GLONASS, BeiDou, Galileo",
          Channels: "184",
          "Update Rate": "20Hz",
          "Cold Start": "24s",
          Interface: "UART, I2C, SPI, USB",
        },
        performance: {
          Accuracy: 100,
          Speed: 95,
          Reliability: 95,
          "Power Efficiency": 70,
        },
        compatibility: ["Professional surveying equipment", "Advanced robotics", "Precision agriculture"],
        powerConsumption: "140mW",
        operatingTemp: "-40°C to +85°C",
        dimensions: "22 × 16 × 2.4mm",
        weight: "1.6g",
        warranty: "2 years",
        availability: "Limited",
      },
    ],
  },
  {
    id: "alert",
    name: "Alert Systems",
    description: "Audio and visual warning systems",
    icon: <Bell className="h-6 w-6" />,
    options: [
      {
        id: "piezo-buzzer",
        name: "Piezo Buzzer",
        model: "5V Active",
        price: 5,
        rating: 4.0,
        recommended: true,
        pros: ["Very low cost", "Simple integration", "Reliable", "Low power"],
        cons: ["Limited volume", "Basic sound quality", "No voice capability", "Single tone"],
        specifications: {
          Volume: "85dB @ 10cm",
          Frequency: "2300Hz ± 300Hz",
          Voltage: "3-24V DC",
          Current: "30mA",
          "Response Time": "<1ms",
          Interface: "Digital GPIO",
        },
        performance: {
          Volume: 60,
          Quality: 40,
          Reliability: 95,
          "Power Efficiency": 95,
        },
        compatibility: ["Any microcontroller", "Arduino", "Raspberry Pi"],
        powerConsumption: "150mW",
        operatingTemp: "-20°C to +70°C",
        dimensions: "12 × 9.5mm",
        weight: "2g",
        warranty: "6 months",
        availability: "In Stock",
      },
      {
        id: "speaker-amp",
        name: "Speaker + Amplifier",
        model: "3W Class D",
        price: 20,
        rating: 4.4,
        recommended: false,
        pros: ["Higher volume", "Better sound quality", "Voice capability", "Adjustable volume"],
        cons: ["Higher cost", "More complex wiring", "Higher power consumption", "Larger size"],
        specifications: {
          Volume: "95dB @ 1m",
          Power: "3W RMS",
          Frequency: "300Hz - 20kHz",
          Voltage: "5V DC",
          Current: "600mA peak",
          Interface: "I2S, Analog",
        },
        performance: {
          Volume: 85,
          Quality: 80,
          Reliability: 85,
          "Power Efficiency": 70,
        },
        compatibility: ["Raspberry Pi", "Audio-capable microcontrollers"],
        powerConsumption: "3W",
        operatingTemp: "-10°C to +60°C",
        dimensions: "40 × 40 × 10mm",
        weight: "25g",
        warranty: "1 year",
        availability: "In Stock",
      },
      {
        id: "voice-module",
        name: "Voice Synthesis Module",
        model: "Text-to-Speech",
        price: 45,
        rating: 4.7,
        recommended: false,
        pros: ["Natural voice warnings", "Multiple languages", "Custom messages", "Professional quality"],
        cons: ["Highest cost", "Complex integration", "Requires programming", "Higher power usage"],
        specifications: {
          Volume: "90dB @ 1m",
          Languages: "20+ supported",
          Storage: "16MB Flash",
          Voltage: "3.3-5V DC",
          Current: "200mA",
          Interface: "UART, I2C",
        },
        performance: {
          Volume: 80,
          Quality: 95,
          Reliability: 90,
          "Power Efficiency": 75,
        },
        compatibility: ["Advanced microcontrollers", "Raspberry Pi", "Arduino"],
        powerConsumption: "1W",
        operatingTemp: "-20°C to +70°C",
        dimensions: "50 × 30 × 8mm",
        weight: "15g",
        warranty: "1 year",
        availability: "In Stock",
      },
    ],
  },
]

export function HardwareComparison() {
  const [selectedCategory, setSelectedCategory] = useState("camera")
  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [comparisonMode, setComparisonMode] = useState<"overview" | "detailed">("overview")

  const currentCategory = hardwareCategories.find((cat) => cat.id === selectedCategory)
  const selectedHardware = currentCategory?.options.filter((option) => selectedOptions.includes(option.id)) || []

  const toggleSelection = (optionId: string) => {
    setSelectedOptions((prev) => {
      if (prev.includes(optionId)) {
        return prev.filter((id) => id !== optionId)
      } else if (prev.length < 3) {
        return [...prev, optionId]
      }
      return prev
    })
  }

  const clearSelection = () => {
    setSelectedOptions([])
  }

  const getPerformanceColor = (score: number) => {
    if (score >= 90) return "text-green-600 bg-green-100"
    if (score >= 75) return "text-blue-600 bg-blue-100"
    if (score >= 60) return "text-yellow-600 bg-yellow-100"
    return "text-red-600 bg-red-100"
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "text-green-600 bg-green-100"
      case "Limited":
        return "text-yellow-600 bg-yellow-100"
      case "Out of Stock":
        return "text-red-600 bg-red-100"
      default:
        return "text-gray-600 bg-gray-100"
    }
  }

  return (
    <div className="space-y-8">
      {/* Category Selection */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">Hardware Comparison</h2>
        <p className="text-lg text-neutral-600 dark:text-neutral-300 mb-8">
          Compare different hardware options to find the best components for your SafeDriver implementation
        </p>

        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl mx-auto">
            {hardwareCategories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                {category.icon}
                <span className="hidden sm:inline">{category.name.split(" ")[0]}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Selection Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Selected: {selectedOptions.length}/3
          </span>
          {selectedOptions.length > 0 && (
            <Button size="sm" variant="outline" onClick={clearSelection}>
              Clear Selection
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={comparisonMode === "overview" ? "default" : "outline"}
            onClick={() => setComparisonMode("overview")}
          >
            Overview
          </Button>
          <Button
            size="sm"
            variant={comparisonMode === "detailed" ? "default" : "outline"}
            onClick={() => setComparisonMode("detailed")}
          >
            Detailed
          </Button>
        </div>
      </div>

      {/* Hardware Options Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {currentCategory?.options.map((option) => (
          <motion.div
            key={option.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedOptions.includes(option.id) ? "ring-2 ring-primary-500 shadow-lg" : "hover:shadow-md"
              } ${option.recommended ? "border-green-500" : ""}`}
              onClick={() => toggleSelection(option.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {option.name}
                      {option.recommended && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          <Star className="h-3 w-3 mr-1" />
                          Recommended
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{option.model}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-600">${option.price}</div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-neutral-600">{option.rating}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Key Specifications */}
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-2">Key Specifications</h4>
                    <div className="grid grid-cols-1 gap-1 text-xs">
                      {Object.entries(option.specifications)
                        .slice(0, 3)
                        .map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-neutral-600 dark:text-neutral-400">{key}:</span>
                            <span className="font-medium text-neutral-900 dark:text-white">{value}</span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  <div>
                    <h4 className="font-semibold text-sm text-neutral-900 dark:text-white mb-2">Performance</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(option.performance).map(([metric, score]) => (
                        <div key={metric} className="text-xs">
                          <div className="flex justify-between mb-1">
                            <span className="text-neutral-600 dark:text-neutral-400">{metric}</span>
                            <span className={`font-medium ${getPerformanceColor(score)}`}>{score}%</span>
                          </div>
                          <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-1">
                            <div
                              className={`h-1 rounded-full ${
                                score >= 90
                                  ? "bg-green-500"
                                  : score >= 75
                                    ? "bg-blue-500"
                                    : score >= 60
                                      ? "bg-yellow-500"
                                      : "bg-red-500"
                              }`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="flex items-center justify-between">
                    <Badge className={getAvailabilityColor(option.availability)}>{option.availability}</Badge>
                    <span className="text-xs text-neutral-600 dark:text-neutral-400">{option.powerConsumption}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Comparison Table */}
      <AnimatePresence>
        {selectedHardware.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="shadow-xl border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-6 w-6 text-primary-600" />
                  Side-by-Side Comparison
                </CardTitle>
                <CardDescription>Detailed comparison of selected {currentCategory?.name.toLowerCase()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-200 dark:border-neutral-700">
                        <th className="text-left py-3 px-4 font-semibold text-neutral-900 dark:text-white">Feature</th>
                        {selectedHardware.map((option) => (
                          <th
                            key={option.id}
                            className="text-center py-3 px-4 font-semibold text-neutral-900 dark:text-white min-w-[200px]"
                          >
                            <div className="space-y-1">
                              <div>{option.name}</div>
                              <div className="text-sm font-normal text-neutral-600 dark:text-neutral-400">
                                {option.model}
                              </div>
                              {option.recommended && (
                                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                                  Recommended
                                </Badge>
                              )}
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Price */}
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Price
                          </div>
                        </td>
                        {selectedHardware.map((option) => (
                          <td key={option.id} className="text-center py-3 px-4">
                            <span className="text-lg font-bold text-primary-600">${option.price}</span>
                          </td>
                        ))}
                      </tr>

                      {/* Rating */}
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            Rating
                          </div>
                        </td>
                        {selectedHardware.map((option) => (
                          <td key={option.id} className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="font-medium">{option.rating}</span>
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* Performance Metrics */}
                      {Object.keys(selectedHardware[0]?.performance || {}).map((metric) => (
                        <tr key={metric} className="border-b border-neutral-100 dark:border-neutral-800">
                          <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                            <div className="flex items-center gap-2">
                              <Gauge className="h-4 w-4" />
                              {metric}
                            </div>
                          </td>
                          {selectedHardware.map((option) => (
                            <td key={option.id} className="text-center py-3 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <div className="w-16 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                                  <div
                                    className={`h-2 rounded-full ${
                                      option.performance[metric] >= 90
                                        ? "bg-green-500"
                                        : option.performance[metric] >= 75
                                          ? "bg-blue-500"
                                          : option.performance[metric] >= 60
                                            ? "bg-yellow-500"
                                            : "bg-red-500"
                                    }`}
                                    style={{ width: `${option.performance[metric]}%` }}
                                  />
                                </div>
                                <span className="text-sm font-medium">{option.performance[metric]}%</span>
                              </div>
                            </td>
                          ))}
                        </tr>
                      ))}

                      {/* Specifications */}
                      {comparisonMode === "detailed" &&
                        Object.keys(selectedHardware[0]?.specifications || {}).map((spec) => (
                          <tr key={spec} className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">{spec}</td>
                            {selectedHardware.map((option) => (
                              <td key={option.id} className="text-center py-3 px-4 text-sm">
                                {option.specifications[spec]}
                              </td>
                            ))}
                          </tr>
                        ))}

                      {/* Power Consumption */}
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Battery className="h-4 w-4" />
                            Power Consumption
                          </div>
                        </td>
                        {selectedHardware.map((option) => (
                          <td key={option.id} className="text-center py-3 px-4 text-sm">
                            {option.powerConsumption}
                          </td>
                        ))}
                      </tr>

                      {/* Operating Temperature */}
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Thermometer className="h-4 w-4" />
                            Operating Temperature
                          </div>
                        </td>
                        {selectedHardware.map((option) => (
                          <td key={option.id} className="text-center py-3 px-4 text-sm">
                            {option.operatingTemp}
                          </td>
                        ))}
                      </tr>

                      {/* Availability */}
                      <tr className="border-b border-neutral-100 dark:border-neutral-800">
                        <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                          <div className="flex items-center gap-2">
                            <Signal className="h-4 w-4" />
                            Availability
                          </div>
                        </td>
                        {selectedHardware.map((option) => (
                          <td key={option.id} className="text-center py-3 px-4">
                            <Badge className={getAvailabilityColor(option.availability)}>{option.availability}</Badge>
                          </td>
                        ))}
                      </tr>

                      {/* Pros and Cons */}
                      {comparisonMode === "detailed" && (
                        <>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <Check className="h-4 w-4 text-green-600" />
                                Pros
                              </div>
                            </td>
                            {selectedHardware.map((option) => (
                              <td key={option.id} className="py-3 px-4">
                                <ul className="text-sm space-y-1">
                                  {option.pros.slice(0, 3).map((pro, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <Check className="h-3 w-3 text-green-600 mt-0.5 flex-shrink-0" />
                                      <span>{pro}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            ))}
                          </tr>
                          <tr className="border-b border-neutral-100 dark:border-neutral-800">
                            <td className="py-3 px-4 font-medium text-neutral-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <X className="h-4 w-4 text-red-600" />
                                Cons
                              </div>
                            </td>
                            {selectedHardware.map((option) => (
                              <td key={option.id} className="py-3 px-4">
                                <ul className="text-sm space-y-1">
                                  {option.cons.slice(0, 3).map((con, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <X className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                                      <span>{con}</span>
                                    </li>
                                  ))}
                                </ul>
                              </td>
                            ))}
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recommendation Summary */}
      {selectedHardware.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-r from-primary-50 to-tech-50 dark:from-primary-900/20 dark:to-tech-900/20 border-primary-200 dark:border-primary-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary-900 dark:text-primary-100">
                <Shield className="h-6 w-6" />
                Recommendation Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">Best Value</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedHardware.reduce((best, current) => (current.price < best.price ? current : best)).name}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">Best Performance</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {
                      selectedHardware.reduce((best, current) => {
                        const currentAvg =
                          Object.values(current.performance).reduce((a, b) => a + b, 0) /
                          Object.values(current.performance).length
                        const bestAvg =
                          Object.values(best.performance).reduce((a, b) => a + b, 0) /
                          Object.values(best.performance).length
                        return currentAvg > bestAvg ? current : best
                      }).name
                    }
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary-600 mb-1">Recommended</div>
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedHardware.find((option) => option.recommended)?.name || "None selected"}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
