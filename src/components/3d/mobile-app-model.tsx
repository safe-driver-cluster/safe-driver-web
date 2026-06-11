"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Sphere, Plane } from "@react-three/drei"
import type { Group } from "three"

interface MobileAppModelProps {
  isSelected?: boolean
  autoRotate?: boolean
}

export function MobileAppModel({ isSelected = false, autoRotate = false }: MobileAppModelProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
    }
  })

  return (
    <group ref={groupRef} scale={isSelected ? 1.2 : 1}>
      {/* Phone body */}
      <Box args={[0.8, 1.6, 0.1]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#a855f7" : "#1f2937"} />
      </Box>

      {/* Screen */}
      <Plane args={[0.7, 1.4]} position={[0, 0, 0.051]}>
        <meshStandardMaterial color={isSelected ? "#3b82f6" : "#111827"} />
      </Plane>

      {/* Screen content - app interface */}
      <Box args={[0.6, 0.1, 0.001]} position={[0, 0.6, 0.052]}>
        <meshStandardMaterial color={isSelected ? "#10b981" : "#22c55e"} />
      </Box>

      {/* Safety status indicator */}
      <Sphere args={[0.08]} position={[0, 0.3, 0.052]}>
        <meshStandardMaterial
          color={isSelected ? "#10b981" : "#ef4444"}
          emissive={isSelected ? "#10b981" : "#ef4444"}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* App icons */}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          args={[0.08, 0.08, 0.001]}
          position={[-0.2 + (i % 3) * 0.2, -0.1 - Math.floor(i / 3) * 0.2, 0.052]}
        >
          <meshStandardMaterial color={isSelected ? "#8b5cf6" : "#6366f1"} />
        </Box>
      ))}

      {/* Home button */}
      <Sphere args={[0.05]} position={[0, -0.7, 0.051]}>
        <meshStandardMaterial color={isSelected ? "#e5e7eb" : "#9ca3af"} />
      </Sphere>

      {/* Camera */}
      <Sphere args={[0.03]} position={[0, 0.75, 0.051]}>
        <meshStandardMaterial color={isSelected ? "#1f2937" : "#111827"} />
      </Sphere>

      {/* Speaker */}
      <Box args={[0.15, 0.02, 0.001]} position={[0, 0.68, 0.051]}>
        <meshStandardMaterial color={isSelected ? "#374151" : "#1f2937"} />
      </Box>

      {/* Notification LED */}
      <Sphere args={[0.015]} position={[0.3, 0.75, 0.051]}>
        <meshStandardMaterial
          color={isSelected ? "#f59e0b" : "#6b7280"}
          emissive={isSelected ? "#f59e0b" : "#6b7280"}
          emissiveIntensity={0.6}
        />
      </Sphere>
    </group>
  )
}
