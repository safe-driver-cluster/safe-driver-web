"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Sphere, Box } from "@react-three/drei"
import type { Group } from "three"

interface CloudModelProps {
  isSelected?: boolean
  autoRotate?: boolean
}

export function CloudModel({ isSelected = false, autoRotate = false }: CloudModelProps) {
  const groupRef = useRef<Group>(null)

  useFrame((state) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.2
    }
  })

  return (
    <group ref={groupRef} scale={isSelected ? 1.2 : 1}>
      {/* Cloud spheres */}
      <Sphere args={[0.5]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#0ea5e9" : "#e5e7eb"} transparent opacity={0.8} />
      </Sphere>
      <Sphere args={[0.4]} position={[-0.3, 0.1, 0.2]}>
        <meshStandardMaterial color={isSelected ? "#0284c7" : "#d1d5db"} transparent opacity={0.7} />
      </Sphere>
      <Sphere args={[0.35]} position={[0.3, 0.15, -0.1]}>
        <meshStandardMaterial color={isSelected ? "#0369a1" : "#d1d5db"} transparent opacity={0.7} />
      </Sphere>
      <Sphere args={[0.3]} position={[0.1, -0.2, 0.3]}>
        <meshStandardMaterial color={isSelected ? "#075985" : "#d1d5db"} transparent opacity={0.6} />
      </Sphere>
      <Sphere args={[0.25]} position={[-0.2, -0.1, -0.3]}>
        <meshStandardMaterial color={isSelected ? "#0c4a6e" : "#d1d5db"} transparent opacity={0.6} />
      </Sphere>

      {/* Data streams */}
      {Array.from({ length: 6 }, (_, i) => (
        <Box
          key={i}
          args={[0.02, 0.02, 0.8]}
          position={[Math.cos((i * Math.PI) / 3) * 0.8, Math.sin((i * Math.PI) / 3) * 0.3, 0]}
          rotation={[0, (i * Math.PI) / 3, Math.PI / 2]}
        >
          <meshStandardMaterial
            color={isSelected ? "#3b82f6" : "#9ca3af"}
            emissive={isSelected ? "#3b82f6" : "#9ca3af"}
            emissiveIntensity={0.3}
          />
        </Box>
      ))}

      {/* Server representation inside cloud */}
      <Box args={[0.3, 0.15, 0.2]} position={[0, 0, 0]}>
        <meshStandardMaterial color={isSelected ? "#1e40af" : "#6b7280"} />
      </Box>

      {/* Status lights */}
      {Array.from({ length: 3 }, (_, i) => (
        <Sphere key={i} args={[0.02]} position={[-0.1 + i * 0.1, 0.08, 0.11]}>
          <meshStandardMaterial
            color={isSelected ? "#10b981" : "#ef4444"}
            emissive={isSelected ? "#10b981" : "#ef4444"}
            emissiveIntensity={0.8}
          />
        </Sphere>
      ))}
    </group>
  )
}
