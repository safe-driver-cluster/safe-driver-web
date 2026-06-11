"use client"

import { useEffect } from "react"
import { initializeFirebase, initializeAnalytics } from "@/lib/firebase/config"

export function FirebaseInitializer() {
  useEffect(() => {
    // Initialize Firebase on client side only
    if (typeof window !== "undefined") {
      try {
        // Initialize all Firebase services including Realtime Database
        const services = initializeFirebase()
        console.log("✅ Firebase initialized successfully:", {
          app: !!services.app,
          auth: !!services.auth,
          firestore: !!services.firestore,
          database: !!services.database,
          storage: !!services.storage,
        })

        // Initialize Analytics separately
        initializeAnalytics().catch((error) => {
          console.warn("Failed to initialize Firebase Analytics:", error)
        })
      } catch (error) {
        console.error("❌ Failed to initialize Firebase:", error)
      }
    }
  }, [])

  return null
}

