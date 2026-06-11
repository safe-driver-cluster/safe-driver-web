"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Plane, Sphere } from "@react-three/drei"
import type { Group } from "three"

interface DashboardModelProps {
  isSelected?: boolean
  autoRotate?: boolean
}

export function DashboardModel({ isSelected = false, autoRotate = false }: DashboardModelProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={groupRef} scale={isSelected ? 1.2 : 1}>
      {/* Monitor base */}
      <Box args={[0.3, 0.1, 0.3]} position={[0, -0.8, 0]}>
        <meshStandardMaterial color={isSelected ? "#ef4444" : "#374151"} />
      </Box>

      {/* Monitor stand */}
      <Box args={[0.05, 0.6, 0.05]} position={[0, -0.5, 0]}>
        <meshStandardMaterial color={isSelected ? "#dc2626" : "#1f2937"} />
      </Box>

      {/* Monitor frame */}
      <Box args={[1.6, 1.0, 0.08]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#b91c1c" : "#111827"} />
      </Box>

      {/* Screen */}
      <Plane args={[1.4, 0.8]} position={[0, 0, 0.041]}>
        <meshStandardMaterial color={isSelected ? "#1e40af" : "#1f2937"} />
      </Plane>

      {/* Dashboard interface elements */}
      {/* Header bar */}
      <Box args={[1.3, 0.08, 0.001]} position={[0, 0.36, 0.042]}>
        <meshStandardMaterial color={isSelected ? "#dc2626" : "#ef4444"} />
      </Box>

      {/* Fleet status cards */}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          args={[0.35, 0.2, 0.001]}
          position={[-0.45 + (i % 3) * 0.45, 0.1 - Math.floor(i / 3) * 0.3, 0.042]}
        >
          <meshStandardMaterial color={isSelected ? "#7c2d12" : "#22c55e"} />
        </Box>
      ))}

      {/* Alert indicators */}
      {Array.from({ length: 3 }, (_, i) => (
        <Sphere key={i} args={[0.02]} position={[-0.5 + i * 0.5, -0.35, 0.042]}>
          <meshStandardMaterial
            color={i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#10b981"}
            emissive={i === 0 ? "#ef4444" : i === 1 ? "#f59e0b" : "#10b981"}
            emissiveIntensity={isSelected ? 0.8 : 0.4}
          />
        </Sphere>
      ))}

      {/* Power button */}
      <Sphere args={[0.03]} position={[0.7, -0.4, 0.041]}>
        <meshStandardMaterial
          color={isSelected ? "#10b981" : "#6b7280"}
          emissive={isSelected ? "#10b981" : "#6b7280"}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Keyboard representation */}
      <Box args={[1.2, 0.3, 0.05]} position={[0, -1.2, 0]}>
        <meshStandardMaterial color={isSelected ? "#991b1b" : "#374151"} />
      </Box>

      {/* Keys */}
      {Array.from({ length: 20 }, (_, i) => (
        <Box
          key={i}
          args={[0.08, 0.08, 0.02]}
          position={[-0.5 + (i % 10) * 0.1, -1.15 - Math.floor(i / 10) * 0.1, 0.035]}
        >
          <meshStandardMaterial color={isSelected ? "#7f1d1d" : "#1f2937"} />
        </Box>
      ))}
    </group>
  )
}
