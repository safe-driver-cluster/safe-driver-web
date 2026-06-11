"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Box, Cylinder, Sphere } from "@react-three/drei"
import type { Group } from "three"

interface BuzzerModelProps {
  isSelected?: boolean
  autoRotate?: boolean
}

export function BuzzerModel({ isSelected = false, autoRotate = false }: BuzzerModelProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.6
    }
  })

  return (
    <group ref={groupRef} scale={isSelected ? 1.2 : 1}>
      {/* Speaker housing */}
      <Cylinder args={[0.6, 0.6, 0.3]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#f59e0b" : "#1f2937"} />
      </Cylinder>

      {/* Speaker cone */}
      <Cylinder args={[0.4, 0.2, 0.15]} position={[0, 0.075, 0]}>
        <meshStandardMaterial color={isSelected ? "#d97706" : "#374151"} />
      </Cylinder>

      {/* Speaker grille */}
      {Array.from({ length: 3 }, (_, i) => (
        <Cylinder key={i} args={[0.15 + i * 0.1, 0.15 + i * 0.1, 0.02]} position={[0, 0.16, 0]}>
          <meshStandardMaterial color={isSelected ? "#92400e" : "#6b7280"} wireframe />
        </Cylinder>
      ))}

      {/* Mounting bracket */}
      <Box args={[1.2, 0.1, 0.1]} position={[0, -0.2, 0]}>
        <meshStandardMaterial color={isSelected ? "#f59e0b" : "#4b5563"} />
      </Box>

      {/* Mounting screws */}
      <Cylinder args={[0.03, 0.03, 0.08]} position={[-0.5, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#6b7280" : "#374151"} />
      </Cylinder>
      <Cylinder args={[0.03, 0.03, 0.08]} position={[0.5, -0.2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#6b7280" : "#374151"} />
      </Cylinder>

      {/* Wires */}
      <Cylinder args={[0.02, 0.02, 0.8]} position={[0.3, -0.6, 0]} rotation={[0, 0, Math.PI / 4]}>
        <meshStandardMaterial color={isSelected ? "#ef4444" : "#dc2626"} />
      </Cylinder>
      <Cylinder args={[0.02, 0.02, 0.8]} position={[-0.3, -0.6, 0]} rotation={[0, 0, -Math.PI / 4]}>
        <meshStandardMaterial color={isSelected ? "#1f2937" : "#111827"} />
      </Cylinder>

      {/* LED indicator */}
      <Sphere args={[0.04]} position={[0, 0.2, 0.5]}>
        <meshStandardMaterial
          color={isSelected ? "#10b981" : "#6b7280"}
          emissive={isSelected ? "#10b981" : "#6b7280"}
          emissiveIntensity={0.8}
        />
      </Sphere>
    </group>
  )
}
