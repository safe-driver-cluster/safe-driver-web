"use client"

import { useState, useEffect } from "react"
import { useOnlineStatus } from "@/lib/offline-utils"
import { OfflineStorage } from "@/lib/offline-utils"

interface UseOfflineDataOptions {
  endpoint: string
  storeName: string
  fallbackData?: any
  refetchOnReconnect?: boolean
}

interface UseOfflineDataResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  isFromCache: boolean
  refetch: () => Promise<void>
}

export function useOfflineData<T>({
  endpoint,
  storeName,
  fallbackData = null,
  refetchOnReconnect = true,
}: UseOfflineDataOptions): UseOfflineDataResult<T> {
  const [data, setData] = useState<T | null>(fallbackData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFromCache, setIsFromCache] = useState(false)
  const { isOnline, wasOffline } = useOnlineStatus()

  const fetchData = async (forceNetwork = false) => {
    setLoading(true)
    setError(null)

    const storage = OfflineStorage.getInstance()

    try {
      if (isOnline && (forceNetwork || !data)) {
        // Try to fetch from network
        const response = await fetch(endpoint)

        if (response.ok) {
          const networkData = await response.json()
          setData(networkData)
          setIsFromCache(false)

          // Cache the data
          await storage.saveData(storeName, networkData)
          return
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      }

      // Fallback to cached data
      const cachedData = await storage.getData(storeName)
      if (cachedData) {
        setData(cachedData)
        setIsFromCache(true)
      } else if (fallbackData) {
        setData(fallbackData)
        setIsFromCache(false)
      } else {
        throw new Error("No data available offline")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data")

      // Try to load cached data as fallback
      try {
        const cachedData = await storage.getData(storeName)
        if (cachedData) {
          setData(cachedData)
          setIsFromCache(true)
          setError(null) // Clear error if we have cached data
        }
      } catch (cacheError) {
        console.log("Failed to load cached data:", cacheError)
      }
    } finally {
      setLoading(false)
    }
  }

  const refetch = async () => {
    await fetchData(true)
  }

  useEffect(() => {
    fetchData()
  }, [endpoint, storeName])

  useEffect(() => {
    if (isOnline && wasOffline && refetchOnReconnect) {
      fetchData(true)
    }
  }, [isOnline, wasOffline, refetchOnReconnect])

  return {
    data,
    loading,
    error,
    isFromCache,
    refetch,
  }
}
