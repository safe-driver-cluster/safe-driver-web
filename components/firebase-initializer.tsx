"use client"

import { useEffect } from "react"
import { initializeAnalytics } from "@/lib/firebase/config"

export function FirebaseInitializer() {
  useEffect(() => {
    // Initialize Firebase Analytics on client side only
    if (typeof window !== "undefined") {
      initializeAnalytics().catch((error) => {
        console.warn("Failed to initialize Firebase Analytics:", error)
      })
    }
  }, [])

  return null
}

