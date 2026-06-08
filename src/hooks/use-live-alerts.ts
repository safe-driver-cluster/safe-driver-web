import { useState, useEffect, useMemo } from "react"
import { realtimeDbService } from "@/lib/firebase/realtime-db"
import { initializeFirebase } from "@/lib/firebase/config"
import { DataSnapshot } from "firebase/database"
import { subscribeToVehicles, type Vehicle } from "@/lib/firebase/vehicles"

export interface FirebaseAlert {
  message: string
  tag: string
  time: string
  type: string
  number_plate?: string
}

export interface DeviceAlert {
  deviceId: string
  latest?: FirebaseAlert
  history?: Record<string, FirebaseAlert>
}

export interface Alert {
  id: string
  type: string
  severity: "high" | "medium" | "low"
  driverName: string
  driverId: string
  busNumber: string
  route: string
  location: string
  timestamp: string
  status: "active" | "acknowledged" | "resolved"
  description: string
  deviceId?: string
  tag?: string
  number_plate?: string
}

// Helper function to robustly parse various timestamp formats
export const parseTimestamp = (timestamp: string | number | undefined): Date | null => {
  if (!timestamp) return null

  try {
    // 1. Handle numeric timestamps (number or string-digit)
    if (typeof timestamp === "number" || (typeof timestamp === "string" && /^\d+$/.test(timestamp))) {
      const num = Number(timestamp)
      // Check if it's in seconds or milliseconds
      const alertTimestamp = num < 10000000000 ? num * 1000 : num
      const date = new Date(alertTimestamp)
      return isNaN(date.getTime()) ? null : date
    }

    // 2. Handle string formats
    if (typeof timestamp === "string") {
      // Try direct parsing (handles ISO, common formats)
      let date = new Date(timestamp)
      
      // If direct parsing fails, try cleaning it up
      if (isNaN(date.getTime())) {
        // Handle "YYYY-MM-DD HH:MM:SS" (common in some DBs) by adding "T"
        const cleaned = timestamp.trim().replace(/(\d{4}-\d{2}-\d{2})\s+(\d{2}:\d{2}:\d{2})/, "$1T$2")
        date = new Date(cleaned)
      }

      return isNaN(date.getTime()) ? null : date
    }

    return null
  } catch (error) {
    console.error("Error parsing timestamp:", timestamp, error)
    return null
  }
}

// Helper function to check if alert is from today
export const isToday = (timestamp: string | number | undefined): boolean => {
  const date = parseTimestamp(timestamp)
  if (!date) return false

  const now = new Date()
  return date.getFullYear() === now.getFullYear() &&
         date.getMonth() === now.getMonth() &&
         date.getDate() === now.getDate()
}

// Helper function to check if alert is within the last 24 hours
export const isWithinLast24Hours = (timestamp: string | number | undefined): boolean => {
  const date = parseTimestamp(timestamp)
  if (!date) return false
  const now = Date.now()
  return now - date.getTime() <= 24 * 60 * 60 * 1000
}

// Helper function to check if alert is within the last 30 days
export const isWithinLast30Days = (timestamp: string | number | undefined): boolean => {
  const date = parseTimestamp(timestamp)
  if (!date) return false
  const now = Date.now()
  return now - date.getTime() <= 30 * 24 * 60 * 60 * 1000
}

// Map Firebase alert types to UI alert types
const mapAlertType = (type: string, tag: string): string => {
  const lowerType = type.toLowerCase()
  const lowerTag = tag.toLowerCase()

  if (lowerType.includes("head") || lowerType.includes("turn") || lowerTag.includes("distraction")) {
    return "distraction"
  }
  if (lowerType.includes("drowsy") || lowerTag.includes("drowsiness")) {
    return "drowsiness"
  }
  if (lowerType.includes("phone") || lowerTag.includes("phone")) {
    return "phone_usage"
  }
  if (lowerType.includes("speed") || lowerTag.includes("speed")) {
    return "speeding"
  }
  if (lowerTag.includes("maintenance")) {
    return "maintenance"
  }
  return "distraction" // default
}


// Map alert type to severity
const getSeverity = (type: string, tag: string): "high" | "medium" | "low" => {
  const lowerType = type.toLowerCase()
  const lowerTag = tag.toLowerCase()

  if (lowerType.includes("drowsy") || lowerTag.includes("critical") || lowerTag.includes("distraction")) {
    return "high"
  }
  if (lowerType.includes("phone") || lowerType.includes("speed")) {
    return "medium"
  }
  return "low"
}

// Device information interface (matches actual Firebase structure)
interface DeviceInfo {
  // Actual fields from Firebase
  is_registered?: boolean
  is_verified?: boolean
  last_active_date_time?: string
  last_updated_date_time?: string
  registered_date_time?: string
  status?: string
  vehicle_reg_no?: string
  number_plate?: string
  
  // Optional fields that might exist
  driverName?: string
  driverId?: string
  busNumber?: string
  route?: string
  location?: string
  [key: string]: any
}

// Transform Firebase alert to UI alert format
const transformAlert = (deviceId: string, alert: FirebaseAlert, deviceInfo?: DeviceInfo, id?: string, firestoreVehicles: Vehicle[] = []): Alert => {
  const alertType = mapAlertType(alert.type, alert.tag)
  const severity = getSeverity(alert.type, alert.tag)

  // 1. First, try to find matching vehicle in Firestore data for more accurate info
  const matchedVehicle = firestoreVehicles.find(v => 
    (v.deviceId && v.deviceId.toLowerCase() === deviceId.toLowerCase()) || 
    (v.documentId && v.documentId.toLowerCase() === (alert.number_plate || "").toLowerCase()) ||
    (v.id && v.id.toLowerCase() === (alert.number_plate || "").toLowerCase())
  )

  // Extract device info from actual Firebase structure or Firestore fallback
  const number_plate = alert.number_plate || deviceInfo?.number_plate || deviceInfo?.vehicle_reg_no?.trim() || matchedVehicle?.documentId || ""
  const busNumber = number_plate || deviceInfo?.busNumber || matchedVehicle?.busNumber || ""
  const driverName = deviceInfo?.driverName || matchedVehicle?.driver || `Driver ${deviceId.substring(0, 8)}`
  const driverId = deviceInfo?.driverId || `DRV-${deviceId.substring(0, 8)}`
  const route = deviceInfo?.route || matchedVehicle?.route || "Unknown Route"
  const location = deviceInfo?.location || (deviceInfo?.status === "online" ? "Online" : "Offline")

  // Generate unique ID that is guaranteed to be unique across all devices and events
  // We MUST incorporate the deviceId to prevent collisions between different devices using the same history keys
  const eventId = id || `evt-${alert.time || Date.now()}-${Math.random().toString(36).substring(2, 9)}`
  const alertId = `${deviceId}-${eventId}`

  return {
    id: alertId,
    type: alertType,
    severity,
    driverName,
    driverId,
    busNumber,
    route,
    location,
    timestamp: alert.time,
    status: "active",
    description: alert.message,
    deviceId,
    tag: alert.tag,
    number_plate,
  }
}

export function useLiveAlerts() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [historyAlerts, setHistoryAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [devices, setDevices] = useState<Record<string, DeviceInfo>>({})
  const [firestoreVehicles, setFirestoreVehicles] = useState<Vehicle[]>([])
  const [alertStatuses, setAlertStatuses] = useState<Record<string, "active" | "acknowledged" | "resolved">>({})

  // Load and sync alert statuses from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadStatuses = () => {
      try {
        const saved = localStorage.getItem("safedriver-alert-statuses")
        if (saved) {
          setAlertStatuses(JSON.parse(saved))
        }
      } catch (e) {
        console.error("Failed to load alert statuses", e)
      }
    }

    loadStatuses()

    window.addEventListener("storage", loadStatuses)
    window.addEventListener("safedriver-alert-status-change", loadStatuses)

    return () => {
      window.removeEventListener("storage", loadStatuses)
      window.removeEventListener("safedriver-alert-status-change", loadStatuses)
    }
  }, [])

  // Subscribe to Firestore vehicles for enriched data (routes, driver names)
  useEffect(() => {
    if (typeof window === "undefined") return

    console.log("🚛 Subscribing to Firestore vehicles...")
    const unsubscribe = subscribeToVehicles((vehiclesList) => {
      console.log(`🚛 Firestore vehicles updated: ${vehiclesList.length} vehicles`)
      setFirestoreVehicles(vehiclesList)
    })

    return () => unsubscribe()
  }, [])

  // Initialize Firebase and listen to devices for device information
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      // Initialize Firebase first
      initializeFirebase()
      console.log("✅ Firebase initialized for live alerts")

      const { unsubscribe: unsubscribeDevices } = realtimeDbService.onValue("devices", (snapshot: DataSnapshot) => {
        try {
          const devicesData = snapshot.val()
          console.log("📱 Devices data received:", devicesData)
          if (devicesData) {
            setDevices(devicesData)
          }
        } catch (err) {
          console.error("❌ Error loading devices:", err)
        }
      })

      return () => {
        unsubscribeDevices()
      }
    } catch (err) {
      console.error("❌ Error initializing Firebase:", err)
      setError(err instanceof Error ? err : new Error("Failed to initialize Firebase"))
    }
  }, [])

  // Listen to alerts
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Initialize Firebase first
      initializeFirebase()
      console.log("🔔 Setting up alerts listener...")

      // Test connection first
      console.log("🔍 Testing Firebase connection...")
      realtimeDbService.get("alerts").then((testData) => {
        console.log("🧪 Test fetch result:", testData)
        if (testData === null) {
          console.error("❌ Cannot read from /alerts path - check database rules!")
          console.error("❌ This usually means:")
          console.error("   1. Database rules don't allow read access")
          console.error("   2. Path /alerts doesn't exist")
          console.error("   3. You need to deploy database rules: firebase deploy --only database")
          setError(new Error("Cannot read from Firebase /alerts path. Check database rules allow read access."))
        } else if (testData) {
          console.log("✅ Successfully connected to Firebase!")
          console.log("✅ Found data at /alerts:", Object.keys(testData))
        }
      }).catch((err) => {
        console.error("❌ Test fetch failed:", err)
        console.error("❌ Error details:", {
          message: err.message,
          code: (err as any).code,
          stack: err.stack,
        })
        setError(err instanceof Error ? err : new Error("Failed to connect to Firebase"))
      })

      // Listen to real-time changes in the alerts path
      const { unsubscribe } = realtimeDbService.onValue("alerts", (snapshot: DataSnapshot) => {
        try {
          console.log("📡 Firebase snapshot received")
          console.log("📡 Snapshot exists:", snapshot.exists())
          console.log("📡 Snapshot key:", snapshot.key)
          
          const data = snapshot.val()
          console.log("📊 Alerts data received from Firebase:", data)
          console.log("📊 Data type:", typeof data)
          console.log("📊 Is null:", data === null)
          console.log("📊 Is undefined:", data === undefined)
          console.log("📊 Data keys:", data ? Object.keys(data) : "null")

          if (!data || data === null) {
            console.log("⚠️ No alerts data found in Firebase - path /alerts is empty or null")
            console.log("⚠️ This could mean:")
            console.log("   1. Database rules don't allow read access")
            console.log("   2. Path /alerts doesn't exist")
            console.log("   3. Path /alerts is empty")
            setAlerts([])
            setIsLoading(false)
            return
          }

          // Transform Firebase data structure to alerts array
          const deviceIds = Object.keys(data)
          console.log(`🔍 Found ${deviceIds.length} device(s):`, deviceIds)

          // Separate arrays for building the final list
          const historyAlertsList: Alert[] = []

          // Build an exhaustive map of all alerts for today
          const alertMap = new Map<string, Alert>()
          
          deviceIds.forEach((deviceId) => {
            const deviceAlert: any = data[deviceId]
            const deviceInfo = devices[deviceId]

            // 1. Process history
            if (deviceAlert && deviceAlert.history) {
              const history = deviceAlert.history
              Object.keys(history).forEach((historyKey) => {
                const historyAlert = history[historyKey] as FirebaseAlert
                if (historyAlert && historyAlert.message && historyAlert.time) {
                  const alert = transformAlert(deviceId, historyAlert, deviceInfo, historyKey, firestoreVehicles)
                  
                  const currentStatus = alertStatuses[alert.id] || (historyAlert as any).status || "active"
                  alert.status = currentStatus

                  // If it's today / last 24 hours, keep it in the primary alerts list
                  if (isToday(alert.timestamp) || isWithinLast24Hours(alert.timestamp)) {
                    alertMap.set(alert.id, alert)
                  }
                  
                  // Also add to history array for the history tab
                  const historyItem = { ...alert, status: currentStatus }
                  historyAlertsList.push(historyItem)
                }
              })
            }

            // 2. Process latest alert
            if (deviceAlert && deviceAlert.latest) {
              const latest = deviceAlert.latest
              if (latest.message && latest.time) {
                // For the latest node, we don't have a history key, so we pass undefined to generate a unique one
                const alert = transformAlert(deviceId, latest as FirebaseAlert, deviceInfo, undefined, firestoreVehicles)
                
                const currentStatus = alertStatuses[alert.id] || (latest as any).status || "active"
                alert.status = currentStatus

                // Check if this alert is already in the map (from history) by matching deviceId, timestamp, and message
                const isMapDuplicate = Array.from(alertMap.values()).some(a =>
                  a.deviceId === alert.deviceId &&
                  a.timestamp === alert.timestamp &&
                  a.description === alert.description
                )

                // Only add to the map if not already there
                if (!isMapDuplicate && !alertMap.has(alert.id)) {
                  if (isToday(alert.timestamp) || isWithinLast24Hours(alert.timestamp)) {
                    alertMap.set(alert.id, alert)
                  }
                }

                // Check if this alert is already in the history list by ID or content
                const isHistoryDuplicate = historyAlertsList.some(h => 
                  h.id === alert.id || 
                  (h.deviceId === alert.deviceId && 
                   h.timestamp === alert.timestamp && 
                   h.description === alert.description)
                )

                // Add to history list if not already there
                if (!isHistoryDuplicate) {
                  historyAlertsList.push({ ...alert, status: currentStatus })
                }
              }
            }
          })

          // Final alert list: all distinct active/today events
          const finalAlerts = Array.from(alertMap.values())

          // Helper to get time for sorting
          const getTime = (ts: any) => {
            const date = parseTimestamp(ts)
            return date ? date.getTime() : 0
          }

          // Sort both lists newest first
          finalAlerts.sort((a, b) => getTime(b.timestamp) - getTime(a.timestamp))
          historyAlertsList.sort((a, b) => getTime(b.timestamp) - getTime(a.timestamp))

          console.log(`📊 Final processed: ${finalAlerts.length} active/today, ${historyAlertsList.length} history`)

          setAlerts(finalAlerts)
          setHistoryAlerts(historyAlertsList)
          setIsLoading(false)
        } catch (err) {
          console.error("❌ Error processing alerts:", err)
          setError(err instanceof Error ? err : new Error("Unknown error"))
          setIsLoading(false)
        }
      })

      // Cleanup subscription on unmount
      return () => {
        unsubscribe()
      }
    } catch (err) {
      console.error("❌ Error setting up alerts listener:", err)
      setError(err instanceof Error ? err : new Error("Failed to set up alerts listener"))
      setIsLoading(false)
    }
  }, [devices, firestoreVehicles, alertStatuses]) // Re-run when devices, firestoreVehicles, or alertStatuses data changes

  return { alerts, historyAlerts, isLoading, error }
}

