import { useState, useEffect, useMemo, useRef } from "react"
import { realtimeDbService } from "@/lib/firebase/realtime-db"
import { initializeFirebase, getFirebaseFirestore } from "@/lib/firebase/config"
import { DataSnapshot } from "firebase/database"
import { subscribeToVehicles, type Vehicle } from "@/lib/firebase/vehicles"
import { collection, getDocs, query, orderBy, limit, doc, onSnapshot, QuerySnapshot, DocumentData } from "firebase/firestore"

export interface FirebaseAlert {
  message: string
  tag: string
  time: string
  type: string
  number_plate?: string
  evidence?: string
  evidence_path?: string
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
  status: "active" | "acknowledged" | "resolved" | "archived"
  description: string
  deviceId?: string
  tag?: string
  number_plate?: string
  evidence?: string
  evidence_path?: string
}

// Helper function to robustly parse various timestamp formats
export const parseTimestamp = (timestamp: any): Date | null => {
  if (!timestamp) return null

  try {
    // 0. Handle Date object
    if (timestamp instanceof Date) {
      return timestamp
    }

    // 0.1 Handle Firestore Timestamp object (seconds/nanoseconds or _seconds)
    if (typeof timestamp === "object") {
      const seconds = timestamp.seconds ?? timestamp._seconds
      if (typeof seconds === "number") {
        return new Date(seconds * 1000)
      }
    }

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

// Helper function to check if alert is within the previous 24 hours (24h to 48h ago)
export const isWithinPrevious24Hours = (timestamp: string | number | undefined): boolean => {
  const date = parseTimestamp(timestamp)
  if (!date) return false
  const now = Date.now()
  const diff = now - date.getTime()
  return diff > 24 * 60 * 60 * 1000 && diff <= 48 * 60 * 60 * 1000
}

// Map Firebase alert types to UI alert types
const mapAlertType = (type: string, tag: string, message?: string): string => {
  const lowerType = type.toLowerCase()
  const lowerTag = tag.toLowerCase()
  const lowerMessage = (message || "").toLowerCase()

  // First, check message content for mobile phone, smoking, drinking, or drowsiness to bypass generic categorization
  if (lowerMessage.includes("phone") || lowerMessage.includes("mobile")) {
    return "phone_usage"
  }
  if (lowerMessage.includes("smoke") || lowerMessage.includes("smoking")) {
    return "smoking"
  }
  if (lowerMessage.includes("drink") || lowerMessage.includes("drinking")) {
    return "drinking"
  }
  if (lowerMessage.includes("drowsy") || lowerMessage.includes("yawn") || lowerMessage.includes("sleep") || lowerMessage.includes("closur") || lowerMessage.includes("micro")) {
    return "drowsiness"
  }
  if (lowerMessage.includes("distract") || lowerMessage.includes("look away")) {
    return "distraction"
  }

  // Fallback to type/tag matches
  if (lowerType.includes("phone") || lowerTag.includes("phone")) {
    return "phone_usage"
  }
  if (lowerType.includes("smoke") || lowerTag.includes("smoke") || lowerType.includes("smoking") || lowerTag.includes("smoking")) {
    return "smoking"
  }
  if (lowerType.includes("drink") || lowerTag.includes("drink") || lowerType.includes("drinking") || lowerTag.includes("drinking")) {
    return "drinking"
  }
  if (lowerType.includes("drowsy") || lowerTag.includes("drowsiness")) {
    return "drowsiness"
  }
  if (lowerType.includes("head") || lowerType.includes("turn") || lowerTag.includes("distraction")) {
    return "distraction"
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
const getSeverity = (alertType: string, originalTag: string): "high" | "medium" | "low" => {
  const lowerTag = originalTag.toLowerCase()

  if (alertType === "drowsiness" || alertType === "distraction" || lowerTag.includes("critical")) {
    return "high"
  }
  if (alertType === "phone_usage" || alertType === "speeding" || alertType === "smoking" || alertType === "drinking") {
    return "medium"
  }
  return "low"
}

// Device information interface (matches actual Firebase structure)
interface DeviceInfo {
  is_registered?: boolean
  is_verified?: boolean
  last_active_date_time?: string
  last_updated_date_time?: string
  registered_date_time?: string
  status?: string
  vehicle_reg_no?: string
  number_plate?: string
  
  driverName?: string
  driverId?: string
  busNumber?: string
  route?: string
  location?: string
  [key: string]: any
}

// Transform Firebase alert to UI alert format
const transformAlert = (
  deviceId: string,
  alert: FirebaseAlert,
  deviceInfo?: DeviceInfo,
  id?: string,
  firestoreVehicles: Vehicle[] = [],
  firestoreRoutes: any[] = [],
  firestoreDrivers: any[] = []
): Alert => {
  const alertType = mapAlertType(alert.type, alert.tag, alert.message)
  const severity = getSeverity(alertType, alert.tag)

  // 1. First, try to find matching vehicle in Firestore data for more accurate info
  const matchedVehicle = firestoreVehicles.find(v => 
    (v.deviceId && v.deviceId.toLowerCase() === deviceId.toLowerCase()) || 
    (v.documentId && v.documentId.toLowerCase() === (alert.number_plate || "").toLowerCase()) ||
    (v.id && v.id.toLowerCase() === (alert.number_plate || "").toLowerCase())
  )

  // Extract device info from actual Firebase structure or Firestore fallback
  const number_plate = alert.number_plate || deviceInfo?.number_plate || deviceInfo?.vehicle_reg_no?.trim() || matchedVehicle?.documentId || ""
  const busNumber = number_plate || deviceInfo?.busNumber || matchedVehicle?.busNumber || ""

  // Resolve driver info: prioritize the Firestore document's driver ID
  const dbDriverId = (alert as any).driver || ""
  const matchedDriver = dbDriverId ? firestoreDrivers.find(d => d.id === dbDriverId) : null

  // If no driver in the alert document, look up via the matched vehicle's driver assignment
  let vehicleDriverId = ""
  let vehicleDriverName = ""
  if (!dbDriverId && matchedVehicle) {
    if (matchedVehicle.driverId) {
      vehicleDriverId = matchedVehicle.driverId
      const d = firestoreDrivers.find(d => d.id === matchedVehicle.driverId)
      vehicleDriverName = d?.name || matchedVehicle.driverName || ""
    } else if (matchedVehicle.driver) {
      vehicleDriverName = matchedVehicle.driver
      const d = firestoreDrivers.find(d => d.name?.toLowerCase() === matchedVehicle.driver.toLowerCase())
      vehicleDriverId = d?.id || ""
    }
  }

  const driverId = matchedDriver?.id || dbDriverId || vehicleDriverId || deviceInfo?.driverId || `DRV-${deviceId.substring(0, 8)}`
  const driverName = matchedDriver?.name || vehicleDriverName || deviceInfo?.driverName || matchedVehicle?.driver || `Driver ${deviceId.substring(0, 8)}`
  
  const rawRoute = deviceInfo?.route || matchedVehicle?.route || "Unknown Route"
  
  // Prioritize matching route by vehicle's routeId or assigned route name
  let matchedRoute = null
  if (matchedVehicle) {
    if (matchedVehicle.routeId) {
      matchedRoute = firestoreRoutes.find(r => r.id === matchedVehicle.routeId)
    }
    if (!matchedRoute && matchedVehicle.route) {
      matchedRoute = firestoreRoutes.find(r => 
        r.id === matchedVehicle.route || 
        (r.name && r.name.toLowerCase().trim() === matchedVehicle.route.toLowerCase().trim())
      )
    }
  }

  // Fallback 1: Match by vehicle assignment list in routes
  if (!matchedRoute) {
    matchedRoute = firestoreRoutes.find(r => 
      (r.vehicles && (r.vehicles.includes(busNumber) || r.vehicles.includes(number_plate))) ||
      (r.busNumber && (r.busNumber === busNumber || r.busNumber === number_plate))
    )
  }

  // Fallback 2: Match by name if not a generic route name (like 'Normal Route')
  if (!matchedRoute && rawRoute) {
    const isGeneric = ["normal route", "express route", "normal", "express", "unknown route"].includes(rawRoute.toLowerCase().trim())
    if (!isGeneric) {
      matchedRoute = firestoreRoutes.find(r => r.name && r.name.toLowerCase().trim() === rawRoute.toLowerCase().trim())
    }
  }
  
  let route = rawRoute
  if (matchedRoute) {
    const start = (matchedRoute.startPoint || "").replace(/ Bus Stop/i, "")
    const end = (matchedRoute.endPoint || "").replace(/ Bus Stop/i, "")
    route = start && end ? `${matchedRoute.name} (${start} - ${end})` : matchedRoute.name
  } else if (rawRoute.toLowerCase().includes("normal") || rawRoute.toLowerCase().includes("express")) {
    const start = "Galle"
    const end = "Matara"
    route = `${rawRoute} (${start} - ${end})`
  }
  const location = deviceInfo?.location || (deviceInfo?.status === "online" ? "Online" : "Offline")

  // Generate unique ID that is guaranteed to be unique across all devices and events
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
    evidence: alert.evidence,
    evidence_path: alert.evidence_path,
  }
}

export function useLiveAlerts() {
  const [rawAlerts, setRawAlerts] = useState<Alert[]>([])
  const [rawHistoryAlerts, setRawHistoryAlerts] = useState<Alert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [devices, setDevices] = useState<Record<string, DeviceInfo>>({})
  const [firestoreVehicles, setFirestoreVehicles] = useState<Vehicle[]>([])
  const [firestoreRoutes, setFirestoreRoutes] = useState<any[]>([])
  const [firestoreDrivers, setFirestoreDrivers] = useState<any[]>([])
  const [alertStatuses, setAlertStatuses] = useState<Record<string, "active" | "acknowledged" | "resolved" | "archived">>({})
  const [availableDeviceIds, setAvailableDeviceIds] = useState<string[]>([])
  const historyAlertsMapRef = useRef<Map<string, Alert>>(new Map())

  // Helper function to update history alerts state from historyAlertsMapRef
  const updateHistoryAlerts = () => {
    const allHistory = Array.from(historyAlertsMapRef.current.values())
    
    // Deduplicate based on deviceId, timestamp, and description
    const uniqueHistory = allHistory.filter((alert, index, self) =>
      index === self.findIndex((a) => 
        a.deviceId === alert.deviceId && 
        a.timestamp === alert.timestamp && 
        a.description === alert.description
      )
    )

    const historyAlertsList = uniqueHistory.sort((a, b) => {
      const timeA = a.timestamp ? (typeof a.timestamp === "string" ? new Date(a.timestamp).getTime() : a.timestamp) : 0
      const timeB = b.timestamp ? (typeof b.timestamp === "string" ? new Date(b.timestamp).getTime() : b.timestamp) : 0
      return timeB - timeA
    })
    setRawHistoryAlerts(historyAlertsList)
  }

  // Load and sync alert statuses from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return

    const loadStatuses = () => {
      try {
        const saved = localStorage.getItem("safedriver-alert-statuses")
        if (saved) {
          const parsed = JSON.parse(saved)
          if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
            setAlertStatuses(parsed)
          }
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

  // Subscribe to Firestore routes for route start/end details
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const dbInstance = getFirebaseFirestore()
      if (!dbInstance) return

      console.log("🛣️ Subscribing to Firestore routes...")
      const routesRef = collection(dbInstance, "routes")
      
      const unsubscribe = onSnapshot(
        routesRef,
        (snapshot) => {
          const routesList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          console.log(`🛣️ Firestore routes updated: ${routesList.length} routes`)
          setFirestoreRoutes(routesList)
        },
        (error) => {
          console.error("Error subscribing to routes:", error)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up routes listener:", err)
    }
  }, [])

  // Subscribe to Firestore drivers for driver names lookup in alerts
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const dbInstance = getFirebaseFirestore()
      if (!dbInstance) return

      console.log("👤 Subscribing to Firestore drivers...")
      const driversRef = collection(dbInstance, "drivers")
      
      const unsubscribe = onSnapshot(
        driversRef,
        (snapshot) => {
          const driversList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }))
          console.log(`👤 Firestore drivers updated: ${driversList.length} drivers`)
          setFirestoreDrivers(driversList)
        },
        (error) => {
          console.error("Error subscribing to drivers:", error)
        }
      )

      return () => unsubscribe()
    } catch (err) {
      console.error("Error setting up drivers listener:", err)
    }
  }, [])

  // Initialize Firebase and listen to devices for device information
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
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

  // Listen to alerts (Only runs when network devices/vehicles change)
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    if (rawAlerts.length === 0) {
      setIsLoading(true)
    }
    setError(null)

    try {
      initializeFirebase()
      console.log("🔔 Setting up alerts listener...")

      // Test connection first
      console.log("🔍 Testing Firebase connection...")
      realtimeDbService.get("alerts").then((testData) => {
        console.log("🧪 Test fetch result:", testData)
        if (testData === null) {
          console.error("❌ Cannot read from /alerts path - check database rules!")
          setError(new Error("Cannot read from Firebase /alerts path. Check database rules allow read access."))
        } else if (testData) {
          console.log("✅ Successfully connected to Firebase!")
        }
      }).catch((err) => {
        console.error("❌ Test fetch failed:", err)
        setError(err instanceof Error ? err : new Error("Failed to connect to Firebase"))
      })

      // Listen to real-time changes in the alerts path
      const { unsubscribe } = realtimeDbService.onValue("alerts", (snapshot: DataSnapshot) => {
        try {
          console.log("📡 Firebase snapshot received")
          const data = snapshot.val()
          console.log("📊 Alerts data received from Firebase:", data)

          if (!data || data === null) {
            console.log("⚠️ No alerts data found in Firebase - path /alerts is empty or null")
            setRawAlerts([])
            setIsLoading(false)
            return
          }

          const deviceIds = Object.keys(data)
          console.log(`🔍 Found ${deviceIds.length} device(s):`, deviceIds)
          
          setAvailableDeviceIds(deviceIds)

          // Build an exhaustive map of all alerts for today
          const alertMap = new Map<string, Alert>()
          
          deviceIds.forEach((deviceId) => {
            const deviceAlert: any = data[deviceId]
            const deviceInfo = devices[deviceId]

            // 1. Process history in Realtime DB if present
            if (deviceAlert && deviceAlert.history) {
              const history = deviceAlert.history
              Object.keys(history).forEach((historyKey) => {
                const historyAlert = history[historyKey] as FirebaseAlert
                if (historyAlert && historyAlert.message && historyAlert.time) {
                  const alert = transformAlert(deviceId, historyAlert, deviceInfo, historyKey, firestoreVehicles, firestoreRoutes, firestoreDrivers)
                  
                  // Use raw status from database
                  alert.status = (historyAlert as any).status || "active"

                  // If it's today / last 24 hours, keep it in the primary alerts list
                  if (isToday(alert.timestamp) || isWithinLast24Hours(alert.timestamp)) {
                    alertMap.set(alert.id, alert)
                  }
                  
                  // Add to shared history map
                  historyAlertsMapRef.current.set(alert.id, alert)
                }
              })
            }

            // 2. Process latest alert
            if (deviceAlert && deviceAlert.latest) {
              const latest = deviceAlert.latest
              if (latest.message && latest.time) {
                const alert = transformAlert(deviceId, latest as FirebaseAlert, deviceInfo, `latest-${latest.time}`, firestoreVehicles, firestoreRoutes, firestoreDrivers)
                
                // Use raw status from database
                alert.status = (latest as any).status || "active"

                // Check if this alert is already in the map (from history)
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

                // Check if this alert is already in history by ID or content
                const isHistoryDuplicate = Array.from(historyAlertsMapRef.current.values()).some(h => 
                  h.id === alert.id || 
                  (h.deviceId === alert.deviceId && 
                   h.timestamp === alert.timestamp && 
                   h.description === alert.description)
                )

                // Add to history if not already there
                if (!isHistoryDuplicate) {
                  historyAlertsMapRef.current.set(alert.id, alert)
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

          // Sort final alerts newest first
          finalAlerts.sort((a, b) => getTime(b.timestamp) - getTime(a.timestamp))

          console.log(`📊 Final processed: ${finalAlerts.length} active/today`)

          setRawAlerts(finalAlerts)
          updateHistoryAlerts()
          setIsLoading(false)
        } catch (err) {
          console.error("❌ Error processing alerts:", err)
          setError(err instanceof Error ? err : new Error("Unknown error"))
          setIsLoading(false)
        }
      })

      return () => {
        unsubscribe()
      }
    } catch (err) {
      console.error("❌ Error setting up alerts listener:", err)
      setError(err instanceof Error ? err : new Error("Failed to set up alerts listener"))
      setIsLoading(false)
    }
  }, [devices, firestoreVehicles, firestoreRoutes, firestoreDrivers])

  // Dynamically merge alertStatuses with rawAlerts
  const alerts = useMemo(() => {
    return rawAlerts.map((alert) => {
      let status = (alertStatuses && typeof alertStatuses === "object" && !Array.isArray(alertStatuses)) ? alertStatuses[alert.id] : undefined
      if (!status && alert.timestamp && alertStatuses && typeof alertStatuses === "object" && !Array.isArray(alertStatuses)) {
        const tsStr = alert.timestamp.toString()
        const matchingKey = Object.keys(alertStatuses).find((key) => 
          key.includes(alert.deviceId || "") && key.includes(tsStr)
        )
        if (matchingKey) {
          status = alertStatuses[matchingKey]
        }
      }
      return {
        ...alert,
        status: status || alert.status,
      }
    })
  }, [rawAlerts, alertStatuses])

  // Dynamically merge alertStatuses with rawHistoryAlerts
  const historyAlerts = useMemo(() => {
    return rawHistoryAlerts.map((alert) => {
      let status = (alertStatuses && typeof alertStatuses === "object" && !Array.isArray(alertStatuses)) ? alertStatuses[alert.id] : undefined
      if (!status && alert.timestamp && alertStatuses && typeof alertStatuses === "object" && !Array.isArray(alertStatuses)) {
        const tsStr = alert.timestamp.toString()
        const matchingKey = Object.keys(alertStatuses).find((key) => 
          key.includes(alert.deviceId || "") && key.includes(tsStr)
        )
        if (matchingKey) {
          status = alertStatuses[matchingKey]
        }
      }
      return {
        ...alert,
        status: status || alert.status,
      }
    })
  }, [rawHistoryAlerts, alertStatuses])

  // Load history alerts from Firestore with real-time updates
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    try {
      initializeFirebase()
      const firestore = getFirebaseFirestore()
      
      console.log("📜 Setting up real-time history alerts listeners from Firestore...")
      
      const deviceIdsFromDevices = Object.keys(devices)
      const deviceIds = deviceIdsFromDevices.length > 0 ? deviceIdsFromDevices : availableDeviceIds
      
      if (deviceIds.length === 0) {
        console.log("⚠️ No devices found, skipping history alerts listeners")
        return
      }
      
      console.log(`📱 Setting up real-time listeners for ${deviceIds.length} device(s):`, deviceIds)
      
      const dates: string[] = []
      const today = new Date()
      for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split("T")[0]
        dates.push(dateStr)
      }
      
      historyAlertsMapRef.current.clear()
      const unsubscribeFunctions: (() => void)[] = []
      
      deviceIds.forEach((deviceId) => {
        dates.forEach((date) => {
          try {
            const deviceDocRef = doc(firestore, "alerts", deviceId)
            const alertsRef = collection(deviceDocRef, date)
            const alertsQuery = query(alertsRef, orderBy("time", "desc"))
            
            const unsubscribe = onSnapshot(
              alertsQuery,
              (querySnapshot: QuerySnapshot<DocumentData>) => {
                try {
                  console.log(`📡 Real-time update for device ${deviceId} on date ${date}: ${querySnapshot.docs.length} alerts`)
                  
                  querySnapshot.docs.forEach((doc) => {
                    const alertData = doc.data() as FirebaseAlert
                    
                    if (alertData && alertData.message && alertData.tag && alertData.time && alertData.type) {
                      const deviceInfo = devices[deviceId]
                      const alert = transformAlert(deviceId, alertData, deviceInfo, undefined, firestoreVehicles, firestoreRoutes, firestoreDrivers)
                      alert.status = "archived"
                      alert.id = `${deviceId}-${date}-${doc.id}-${alertData.time}`
                      
                      historyAlertsMapRef.current.set(alert.id, alert)
                    }
                  })
                  
                  updateHistoryAlerts()
                } catch (err) {
                  console.error(`❌ Error processing real-time update for ${deviceId}/${date}:`, err)
                }
              },
              (error) => {
                if (error.code !== "not-found") {
                  console.warn(`⚠️ Error in real-time listener for device ${deviceId} on date ${date}:`, error)
                }
              }
            )
            
            unsubscribeFunctions.push(unsubscribe)
          } catch (dateError) {
            if ((dateError as any)?.code !== "not-found") {
              console.warn(`⚠️ Error setting up listener for device ${deviceId} on date ${date}:`, dateError)
            }
          }
        })
      })
      
      return () => {
        console.log("🧹 Cleaning up history alerts real-time listeners...")
        unsubscribeFunctions.forEach((unsubscribe) => unsubscribe())
      }
    } catch (err) {
      console.error("❌ Error setting up history alerts real-time listeners:", err)
    }
  }, [devices, availableDeviceIds, firestoreVehicles, firestoreRoutes, firestoreDrivers])

  return { alerts, historyAlerts, isLoading, error }
}
