"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Cylinder, Sphere } from "@react-three/drei"
import type { Group } from "three"

interface GpsModelProps {
  isSelected?: boolean
  autoRotate?: boolean
}

export function GpsModel({ isSelected = false, autoRotate = false }: GpsModelProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.4
    }
  })

  return (
    <group ref={groupRef} scale={isSelected ? 1.2 : 1}>
      {/* Main GPS module */}
      <Box args={[1.2, 0.08, 1.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#22c55e" : "#1f2937"} />
      </Box>

      {/* GPS chip */}
      <Box args={[0.4, 0.06, 0.4]} position={[0, 0.07, 0]}>
        <meshStandardMaterial color={isSelected ? "#16a34a" : "#374151"} />
      </Box>

      {/* Antenna connector */}
      <Cylinder args={[0.08, 0.08, 0.15]} position={[0.4, 0.115, 0.4]}>
        <meshStandardMaterial color={isSelected ? "#fbbf24" : "#d97706"} />
      </Cylinder>

      {/* External antenna */}
      <Cylinder args={[0.02, 0.02, 0.8]} position={[0.4, 0.55, 0.4]}>
        <meshStandardMaterial color={isSelected ? "#f59e0b" : "#92400e"} />
      </Cylinder>

      {/* Antenna tip */}
      <Sphere args={[0.05]} position={[0.4, 0.95, 0.4]}>
        <meshStandardMaterial color={isSelected ? "#ef4444" : "#dc2626"} />
      </Sphere>

      {/* Connection pins */}
      {Array.from({ length: 4 }, (_, i) => (
        <Cylinder key={i} args={[0.015, 0.015, 0.2]} position={[-0.4 + i * 0.1, 0.14, -0.5]}>
          <meshStandardMaterial color={isSelected ? "#6366f1" : "#4f46e5"} />
        </Cylinder>
      ))}

      {/* Status LED */}
      <Sphere args={[0.03]} position={[-0.4, 0.08, 0.4]}>
        <meshStandardMaterial
          color={isSelected ? "#10b981" : "#6b7280"}
          emissive={isSelected ? "#10b981" : "#6b7280"}
          emissiveIntensity={0.7}
        />
      </Sphere>

      {/* Crystal oscillator */}
      <Box args={[0.15, 0.05, 0.1]} position={[-0.3, 0.065, 0]}>
        <meshStandardMaterial color={isSelected ? "#e5e7eb" : "#9ca3af"} />
      </Box>
    </group>
  )
}
