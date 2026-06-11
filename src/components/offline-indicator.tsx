"use client"

import { useEffect, useState } from "react"
import { Wifi, WifiOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Set initial state
    setIsOnline(navigator.onLine)

    // Add event listeners
    const handleOnline = () => {
      setIsOnline(true)
      // Show the indicator briefly when coming back online
      setIsVisible(true)
      setTimeout(() => setIsVisible(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setIsVisible(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed bottom-20 left-1/2 transform -translate-x-1/2 z-50 px-4 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium transition-all duration-300",
        isOnline
          ? "bg-green-100 text-green-800 border border-green-200"
          : "bg-red-100 text-red-800 border border-red-200",
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Back online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>You're offline</span>
        </>
      )}
    </div>
  )
}

export function OfflineStatusBadge() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <Badge
      variant={isOnline ? "default" : "destructive"}
      className={cn(
        "text-xs",
        isOnline ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-red-100 text-red-800 hover:bg-red-200",
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-3 w-3 mr-1" />
          Online
        </>
      ) : (
        <>
          <WifiOff className="h-3 w-3 mr-1" />
          Offline
        </>
      )}
    </Badge>
  )
}
