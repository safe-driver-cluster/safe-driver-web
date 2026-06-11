"use client"

import { useState, useEffect } from "react"

// Offline detection hook
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [wasOffline, setWasOffline] = useState(false)

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      if (wasOffline) {
        // Trigger sync when coming back online
        syncOfflineData()
        setWasOffline(false)
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      setWasOffline(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [wasOffline])

  return { isOnline, wasOffline }
}

// Local storage utilities
export class OfflineStorage {
  private static instance: OfflineStorage
  private dbName = "SafeDriverDB"
  private version = 1
  private db: IDBDatabase | null = null

  static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage()
    }
    return OfflineStorage.instance
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create object stores
        if (!db.objectStoreNames.contains("alerts")) {
          const alertsStore = db.createObjectStore("alerts", { keyPath: "id" })
          alertsStore.createIndex("status", "status", { unique: false })
          alertsStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("drivers")) {
          const driversStore = db.createObjectStore("drivers", { keyPath: "id" })
          driversStore.createIndex("status", "status", { unique: false })
        }

        if (!db.objectStoreNames.contains("vehicles")) {
          const vehiclesStore = db.createObjectStore("vehicles", { keyPath: "id" })
          vehiclesStore.createIndex("status", "status", { unique: false })
        }

        if (!db.objectStoreNames.contains("routes")) {
          db.createObjectStore("routes", { keyPath: "id" })
        }

        if (!db.objectStoreNames.contains("queuedActions")) {
          const queueStore = db.createObjectStore("queuedActions", { keyPath: "id", autoIncrement: true })
          queueStore.createIndex("timestamp", "timestamp", { unique: false })
        }

        if (!db.objectStoreNames.contains("settings")) {
          db.createObjectStore("settings", { keyPath: "key" })
        }
      }
    })
  }

  async saveData(storeName: string, data: any): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)

      const request = Array.isArray(data)
        ? (store.clear().onsuccess = () => {
            data.forEach((item) => store.add(item))
          })
        : store.put(data)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async getData(storeName: string, key?: string): Promise<any> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readonly")
      const store = transaction.objectStore(storeName)

      const request = key ? store.get(key) : store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  async queueAction(action: OfflineAction): Promise<void> {
    const actionWithTimestamp = {
      ...action,
      timestamp: Date.now(),
      id: `${Date.now()}-${Math.random()}`,
    }

    await this.saveData("queuedActions", actionWithTimestamp)
  }

  async getQueuedActions(): Promise<OfflineAction[]> {
    return await this.getData("queuedActions")
  }

  async removeQueuedAction(id: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(["queuedActions"], "readwrite")
      const store = transaction.objectStore("queuedActions")

      const request = store.delete(id)

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }

  async clearStore(storeName: string): Promise<void> {
    if (!this.db) await this.init()

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], "readwrite")
      const store = transaction.objectStore(storeName)

      const request = store.clear()

      transaction.oncomplete = () => resolve()
      transaction.onerror = () => reject(transaction.error)
    })
  }
}

export interface OfflineAction {
  id?: string
  type: "acknowledge_alert" | "contact_driver" | "update_driver_status" | "add_vehicle" | "update_vehicle"
  url: string
  method: string
  headers: Record<string, string>
  body?: string
  timestamp?: number
  retryCount?: number
}

// Sync offline data when back online
export async function syncOfflineData(): Promise<void> {
  const storage = OfflineStorage.getInstance()
  const queuedActions = await storage.getQueuedActions()

  for (const action of queuedActions) {
    try {
      const response = await fetch(action.url, {
        method: action.method,
        headers: action.headers,
        body: action.body,
      })

      if (response.ok) {
        await storage.removeQueuedAction(action.id!)
        console.log("Synced action:", action.type)
      } else {
        throw new Error(`HTTP ${response.status}`)
      }
    } catch (error) {
      console.log("Failed to sync action:", action.type, error)

      // Increment retry count
      const updatedAction = {
        ...action,
        retryCount: (action.retryCount || 0) + 1,
      }

      // Remove if too many retries
      if (updatedAction.retryCount > 3) {
        await storage.removeQueuedAction(action.id!)
      } else {
        await storage.saveData("queuedActions", updatedAction)
      }
    }
  }
}

// Cache management
export async function cacheEssentialData(): Promise<void> {
  const storage = OfflineStorage.getInstance()

  try {
    // Cache recent alerts
    const alertsResponse = await fetch("/api/alerts?limit=50")
    if (alertsResponse.ok) {
      const alerts = await alertsResponse.json()
      await storage.saveData("alerts", alerts)
    }

    // Cache drivers
    const driversResponse = await fetch("/api/drivers")
    if (driversResponse.ok) {
      const drivers = await driversResponse.json()
      await storage.saveData("drivers", drivers)
    }

    // Cache vehicles
    const vehiclesResponse = await fetch("/api/vehicles")
    if (vehiclesResponse.ok) {
      const vehicles = await vehiclesResponse.json()
      await storage.saveData("vehicles", vehicles)
    }

    // Cache routes
    const routesResponse = await fetch("/api/routes")
    if (routesResponse.ok) {
      const routes = await routesResponse.json()
      await storage.saveData("routes", routes)
    }

    console.log("Essential data cached successfully")
  } catch (error) {
    console.log("Failed to cache essential data:", error)
  }
}
