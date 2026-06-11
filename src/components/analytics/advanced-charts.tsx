"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUp, ArrowDown, Minus } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface ChartData {
  labels: string[]
  datasets: Array<{
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string
    borderWidth?: number
    tension?: number
    fill?: boolean
  }>
}

interface MetricCardProps {
  title: string
  value: string | number
  change?: number
  trend?: "up" | "down" | "stable"
  icon: React.ReactNode
  color: string
  description?: string
}

export function MetricCard({ title, value, change, trend, icon, color, description }: MetricCardProps) {
  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return <ArrowUp className="h-3 w-3 text-green-600" />
      case "down":
        return <ArrowDown className="h-3 w-3 text-red-600" />
      default:
        return <Minus className="h-3 w-3 text-gray-600" />
    }
  }

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return change && change > 0 ? "text-green-600" : "text-red-600"
      case "down":
        return change && change > 0 ? "text-red-600" : "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <div className={`p-2 rounded-full ${color}`}>{icon}</div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
          {change !== undefined && (
            <div className={`flex items-center text-sm ${getTrendColor()}`}>
              {getTrendIcon()}
              <span className="ml-1">{Math.abs(change)}%</span>
              <span className="text-gray-500 ml-1">vs last period</span>
            </div>
          )}
          {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}


interface TrendChartProps {
  data: ChartData
  title: string
  height?: number
}

export function TrendChart({ data, title, height = 200 }: TrendChartProps) {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)

  // Simplified line chart implementation
  const maxValue = Math.max(...data.datasets[0].data)
  const minValue = Math.min(...data.datasets[0].data)
  const range = maxValue - minValue || 1

  const points = data.datasets[0].data.map((value, index) => {
    const x = (index / (data.labels.length - 1)) * 100
    const y = 100 - ((value - minValue) / range) * 80 - 10
    return { x, y, value, label: data.labels[index] }
  })

  const pathData = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ")

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative" style={{ height }}>
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-gray-300"
              />
            ))}

            {/* Area fill */}
            <path d={`${pathData} L 100 100 L 0 100 Z`} fill="url(#areaGradient)" className="opacity-20" />

            {/* Line */}
            <path d={pathData} fill="none" stroke="currentColor" strokeWidth="0.8" className="text-blue-500" />

            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={point.x}
                cy={point.y}
                r="1"
                fill="currentColor"
                className="text-blue-600 cursor-pointer hover:r-2 transition-all"
                onMouseEnter={() => setHoveredPoint(index)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}

            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" className="text-blue-500" />
                <stop offset="100%" stopColor="currentColor" className="text-blue-500" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredPoint !== null && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute bg-gray-900 text-white px-2 py-1 rounded text-xs pointer-events-none z-10"
                style={{
                  left: `${points[hoveredPoint].x}%`,
                  top: `${points[hoveredPoint].y}%`,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div>{points[hoveredPoint].label}</div>
                <div className="font-bold">{points[hoveredPoint].value}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          {data.labels.map((label, index) => (
            <span key={index}>{label}</span>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface HeatmapProps {
  data: Array<{
    day: string
    hour: number
    value: number
  }>
  title: string
}

export function Heatmap({ data, title }: HeatmapProps) {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const hours = Array.from({ length: 24 }, (_, i) => i)

  const maxValue = Math.max(...data.map((d) => d.value))

  const getIntensity = (value: number) => {
    const intensity = value / maxValue
    return `rgba(59, 130, 246, ${intensity})`
  }

  const getValue = (day: string, hour: number) => {
    const item = data.find((d) => d.day === day && d.hour === hour)
    return item?.value || 0
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-25 gap-1 text-xs">
          {/* Hour labels */}
          <div></div>
          {hours.map((hour) => (
            <div key={hour} className="text-center text-gray-500 text-xs">
              {hour % 6 === 0 ? hour : ""}
            </div>
          ))}

          {/* Heatmap cells */}
          {days.map((day) => (
            <div key={day} className="contents">
              <div className="text-gray-500 text-xs py-1">{day}</div>
              {hours.map((hour) => {
                const value = getValue(day, hour)
                return (
                  <div
                    key={`${day}-${hour}`}
                    className="aspect-square rounded-sm cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
                    style={{ backgroundColor: getIntensity(value) }}
                    title={`${day} ${hour}:00 - ${value} incidents`}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
          <span>Less</span>
          <div className="flex space-x-1">
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((intensity) => (
              <div
                key={intensity}
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: `rgba(59, 130, 246, ${intensity})` }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  )
}

interface RadarChartProps {
  data: Array<{
    label: string
    value: number
    maxValue: number
  }>
  title: string
}

export function RadarChart({ data, title }: RadarChartProps) {
  const centerX = 50
  const centerY = 50
  const radius = 40

  const angleStep = (2 * Math.PI) / data.length

  const points = data.map((item, index) => {
    const angle = index * angleStep - Math.PI / 2
    const normalizedValue = item.value / item.maxValue
    const x = centerX + Math.cos(angle) * radius * normalizedValue
    const y = centerY + Math.sin(angle) * radius * normalizedValue
    return { x, y, ...item }
  })

  const pathData = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ") + " Z"

  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative aspect-square">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            {/* Grid circles */}
            {gridLevels.map((level) => (
              <circle
                key={level}
                cx={centerX}
                cy={centerY}
                r={radius * level}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-gray-300"
              />
            ))}

            {/* Grid lines */}
            {data.map((_, index) => {
              const angle = index * angleStep - Math.PI / 2
              const x = centerX + Math.cos(angle) * radius
              const y = centerY + Math.sin(angle) * radius
              return (
                <line
                  key={index}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  stroke="currentColor"
                  strokeWidth="0.2"
                  className="text-gray-300"
                />
              )
            })}

            {/* Data area */}
            <path
              d={pathData}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-blue-500 opacity-30"
            />

            {/* Data line */}
            <path d={pathData} fill="none" stroke="currentColor" strokeWidth="0.8" className="text-blue-600" />

            {/* Data points */}
            {points.map((point, index) => (
              <circle key={index} cx={point.x} cy={point.y} r="1" fill="currentColor" className="text-blue-600" />
            ))}

            {/* Labels */}
            {data.map((item, index) => {
              const angle = index * angleStep - Math.PI / 2
              const labelRadius = radius + 8
              const x = centerX + Math.cos(angle) * labelRadius
              const y = centerY + Math.sin(angle) * labelRadius
              return (
                <text
                  key={index}
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-xs fill-gray-600"
                >
                  {item.label}
                </text>
              )
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  )
}
