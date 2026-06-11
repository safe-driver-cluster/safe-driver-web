"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Cylinder, Sphere } from "@react-three/drei"
import type { Group } from "three"

interface RaspberryPiModelProps {
  isSelected?: boolean
  autoRotate?: boolean
}

export function RaspberryPiModel({ isSelected = false, autoRotate = false }: RaspberryPiModelProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <group ref={groupRef} scale={isSelected ? 1.2 : 1}>
      {/* Main board */}
      <Box args={[2.5, 0.1, 1.8]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#a855f7" : "#22c55e"} />
      </Box>

      {/* CPU chip */}
      <Box args={[0.6, 0.15, 0.6]} position={[0.3, 0.125, 0.2]}>
        <meshStandardMaterial color={isSelected ? "#7c3aed" : "#1f2937"} />
      </Box>

      {/* RAM chips */}
      <Box args={[0.4, 0.1, 0.8]} position={[-0.5, 0.1, 0.2]}>
        <meshStandardMaterial color={isSelected ? "#7c3aed" : "#374151"} />
      </Box>

      {/* GPIO pins */}
      {Array.from({ length: 20 }, (_, i) => (
        <Cylinder
          key={i}
          args={[0.02, 0.02, 0.3]}
          position={[-0.8 + (i % 2) * 0.1, 0.2, -0.6 + Math.floor(i / 2) * 0.1]}
        >
          <meshStandardMaterial color={isSelected ? "#fbbf24" : "#d97706"} />
        </Cylinder>
      ))}

      {/* USB ports */}
      <Box args={[0.15, 0.1, 0.6]} position={[1.3, 0.1, 0.4]}>
        <meshStandardMaterial color={isSelected ? "#6366f1" : "#4b5563"} />
      </Box>
      <Box args={[0.15, 0.1, 0.6]} position={[1.3, 0.1, -0.4]}>
        <meshStandardMaterial color={isSelected ? "#6366f1" : "#4b5563"} />
      </Box>

      {/* Ethernet port */}
      <Box args={[0.15, 0.12, 0.8]} position={[1.3, 0.11, 0]}>
        <meshStandardMaterial color={isSelected ? "#8b5cf6" : "#6b7280"} />
      </Box>

      {/* Power LED */}
      <Sphere args={[0.03]} position={[0.8, 0.15, -0.7]}>
        <meshStandardMaterial
          color={isSelected ? "#10b981" : "#ef4444"}
          emissive={isSelected ? "#10b981" : "#ef4444"}
          emissiveIntensity={0.8}
        />
      </Sphere>

      {/* Activity LED */}
      <Sphere args={[0.03]} position={[0.9, 0.15, -0.7]}>
        <meshStandardMaterial
          color={isSelected ? "#f59e0b" : "#6b7280"}
          emissive={isSelected ? "#f59e0b" : "#6b7280"}
          emissiveIntensity={0.6}
        />
      </Sphere>

      {/* Heat sink */}
      <Box args={[0.8, 0.2, 0.8]} position={[0.3, 0.25, 0.2]}>
        <meshStandardMaterial color={isSelected ? "#e5e7eb" : "#9ca3af"} />
      </Box>

      {/* Heat sink fins */}
      {Array.from({ length: 8 }, (_, i) => (
        <Box key={i} args={[0.05, 0.15, 0.8]} position={[0.3 - 0.35 + i * 0.1, 0.32, 0.2]}>
          <meshStandardMaterial color={isSelected ? "#f3f4f6" : "#d1d5db"} />
        </Box>
      ))}
    </group>
  )
}
