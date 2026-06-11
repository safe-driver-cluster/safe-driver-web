"use client"

import { useState } from "react"
import { useOnlineStatus } from "@/lib/offline-utils"
import { OfflineStorage, type OfflineAction } from "@/lib/offline-utils"

interface UseOfflineActionOptions {
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  showToast?: boolean
}

interface UseOfflineActionResult {
  execute: (action: Omit<OfflineAction, "id" | "timestamp">) => Promise<void>
  loading: boolean
  error: string | null
}

export function useOfflineAction({
  onSuccess,
  onError,
  showToast = true,
}: UseOfflineActionOptions = {}): UseOfflineActionResult {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isOnline } = useOnlineStatus()

  const execute = async (action: Omit<OfflineAction, "id" | "timestamp">) => {
    setLoading(true)
    setError(null)

    try {
      if (isOnline) {
        // Try to execute immediately
        const response = await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body,
        })

        if (response.ok) {
          const data = await response.json()
          onSuccess?.(data)

          if (showToast) {
            // Show success toast
            showToastMessage("Action completed successfully", "success")
          }
        } else {
          throw new Error(`HTTP ${response.status}`)
        }
      } else {
        // Queue for later execution
        const storage = OfflineStorage.getInstance()
        await storage.queueAction(action)

        if (showToast) {
          showToastMessage("Action queued for when you're back online", "info")
        }

        onSuccess?.({ queued: true })
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Action failed"
      setError(errorMessage)
      onError?.(errorMessage)

      if (showToast) {
        showToastMessage(errorMessage, "error")
      }

      // Queue action if network error
      if (!isOnline || errorMessage.includes("fetch")) {
        try {
          const storage = OfflineStorage.getInstance()
          await storage.queueAction(action)

          if (showToast) {
            showToastMessage("Action queued for retry", "info")
          }
        } catch (queueError) {
          console.log("Failed to queue action:", queueError)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  return {
    execute,
    loading,
    error,
  }
}

// Simple toast implementation (you can replace with your preferred toast library)
function showToastMessage(message: string, type: "success" | "error" | "info") {
  // Create a simple toast element
  const toast = document.createElement("div")
  toast.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
    type === "success"
      ? "bg-green-500 text-white"
      : type === "error"
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
  }`
  toast.textContent = message

  document.body.appendChild(toast)

  // Remove after 3 seconds
  setTimeout(() => {
    document.body.removeChild(toast)
  }, 3000)
}
