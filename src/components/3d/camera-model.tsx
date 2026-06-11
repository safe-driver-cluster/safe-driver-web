"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Cylinder, Sphere } from "@react-three/drei"
import type { Group } from "three"

interface CameraModelProps {
  isSelected?: boolean
  autoRotate?: boolean
}

export function CameraModel({ isSelected = false, autoRotate = false }: CameraModelProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.5
    }
  })

  return (
    <group ref={groupRef} scale={isSelected ? 1.2 : 1}>
      {/* Camera body */}
      <Box args={[1.5, 0.8, 0.6]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#0ea5e9" : "#2d3748"} />
      </Box>

      {/* Camera lens */}
      <Cylinder args={[0.3, 0.3, 0.4]} position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#1e40af" : "#1a202c"} />
      </Cylinder>

      {/* Lens glass */}
      <Cylinder args={[0.25, 0.25, 0.05]} position={[0, 0, 0.72]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color="#4299e1" transparent opacity={0.8} />
      </Cylinder>

      {/* Camera mount */}
      <Box args={[0.3, 0.3, 0.8]} position={[0, -0.55, 0]}>
        <meshStandardMaterial color={isSelected ? "#0ea5e9" : "#4a5568"} />
      </Box>

      {/* Status LED */}
      <Sphere args={[0.05]} position={[0.6, 0.2, 0.3]}>
        <meshStandardMaterial
          color={isSelected ? "#10b981" : "#ef4444"}
          emissive={isSelected ? "#10b981" : "#ef4444"}
          emissiveIntensity={0.5}
        />
      </Sphere>

      {/* Cable */}
      <Cylinder args={[0.05, 0.05, 1.2]} position={[0, -1.15, 0]} rotation={[0, 0, Math.PI / 6]}>
        <meshStandardMaterial color="#2d3748" />
      </Cylinder>
    </group>
  )
}
