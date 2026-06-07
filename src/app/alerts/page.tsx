"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Phone, MapPin, Clock, RefreshCw, CheckCircle, Bell, History } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmergencyResponseSystem } from "@/lib/emergency-response-system"
import { useLiveAlerts, type Alert, isToday, parseTimestamp } from "@/hooks/use-live-alerts"
import { useLanguage } from "@/components/language-provider"


export default function AlertsPage() {
  // Use live alerts from Firebase Realtime Database
  const { alerts: liveAlerts, historyAlerts, isLoading: isLoadingAlerts, error } = useLiveAlerts()
  const { t } = useLanguage()

  // Track alert statuses (acknowledged/resolved) in local state
  const [alertStatuses, setAlertStatuses] = useState<Record<string, "active" | "acknowledged" | "resolved">>({})
  const [activeTab, setActiveTab] = useState("active")
  const previousAlertsRef = useRef<Alert[]>([])
  const isInitialLoadRef = useRef(true)

  // Load saved statuses on mount
  useEffect(() => {
    try {
      const savedStatuses = localStorage.getItem("safedriver-alert-statuses")
      if (savedStatuses) {
        setAlertStatuses(JSON.parse(savedStatuses))
      }
    } catch (e) {
      console.error("Failed to load alert statuses", e)
    }
  }, [])

  // Debug: Log alerts when they change
  useEffect(() => {
    if (liveAlerts.length > 0) {
      console.log("🎯 Live alerts updated:", liveAlerts.length, "alerts")
      liveAlerts.forEach((alert, index) => {
        console.log(`  Alert ${index + 1}:`, {
          id: alert.id,
          deviceId: alert.deviceId,
          type: alert.type,
          message: alert.description,
          timestamp: alert.timestamp,
        })
      })
    }
  }, [liveAlerts])


  // Merge live alerts with status tracking.
  // Memoization prevents unnecessary re-renders and effect loops.
  const alerts = useMemo(
    () =>
      liveAlerts.map((alert) => ({
        ...alert,
        status: alertStatuses[alert.id] || alert.status,
      })),
    [liveAlerts, alertStatuses],
  )

  // Filter alerts based on active tab as derived state.
  const filteredAlerts = useMemo(() => {
    if (activeTab === "history") {
      const combinedAlerts = [...alerts, ...historyAlerts]
      const uniqueAlerts = combinedAlerts.filter((alert, index, self) =>
        index === self.findIndex((a) => a.id === alert.id),
      )

      uniqueAlerts.sort((a, b) => {
        const timeA = a.timestamp ? (typeof a.timestamp === "string" ? new Date(a.timestamp).getTime() : a.timestamp) : 0
        const timeB = b.timestamp ? (typeof b.timestamp === "string" ? new Date(b.timestamp).getTime() : b.timestamp) : 0
        return timeB - timeA
      })

      return uniqueAlerts
    }

    return alerts.filter((alert) => alert.status === activeTab)
  }, [alerts, historyAlerts, activeTab])

  // Detect new alerts and trigger voice/emergency notifications
  useEffect(() => {
    if (liveAlerts.length === 0) return

    // Find new alerts (alerts that weren't in the previous list)
    const previousAlertIds = new Set(previousAlertsRef.current.map((a) => a.id))
    const newAlerts = liveAlerts.filter((alert) => !previousAlertIds.has(alert.id))

    // Update previous alerts ref
    previousAlertsRef.current = liveAlerts

    // Skip triggering actions for the initial historical data load
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
      return
    }

    // Process new alerts
    newAlerts.forEach((alert) => {


      // Trigger emergency response for high severity alerts
      if (alert.severity === "high" && (alert.type === "drowsiness" || alert.type === "distraction")) {
        const emergencySystem = EmergencyResponseSystem.getInstance()
        emergencySystem.triggerEmergency(`${alert.type}_level_critical`, {
          driverId: alert.driverId,
          vehicleId: alert.busNumber,
          location: {
            latitude: 6.9271, // Default location - you may want to get this from devices collection
            longitude: 79.8612,
            address: alert.location,
          },
          description: `Critical ${alert.type} detected for driver ${alert.driverName}`,
          severity: "critical",
          metadata: { alertId: alert.id },
        })
      }
    })
  }, [liveAlerts])

  useEffect(() => {
    // Set up event listener for voice commands
    const handleVoiceAcknowledge = () => {
      // Find the first active alert and acknowledge it
      const activeAlert = alerts.find((alert) => alert.status === "active")
      if (activeAlert) {
        handleAcknowledgeAlert(activeAlert.id)
      }
    }

    document.addEventListener("voice-acknowledge-alert", handleVoiceAcknowledge)

    // Clean up
    return () => {
      document.removeEventListener("voice-acknowledge-alert", handleVoiceAcknowledge)
    }
  }, [alerts])

  const refreshAlerts = () => {
    // Alerts are automatically refreshed via Firebase Realtime Database listener
    // This function can be used to manually trigger a refresh if needed
    console.log("Alerts are automatically updated in real-time from Firebase")
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlertStatuses((prev) => {
      const newStatuses = { ...prev, [alertId]: "acknowledged" as const }
      localStorage.setItem("safedriver-alert-statuses", JSON.stringify(newStatuses))
      window.dispatchEvent(new Event("safedriver-alert-status-change"))
      return newStatuses
    })
  }

  const handleResolveAlert = (alertId: string) => {
    setAlertStatuses((prev) => {
      const newStatuses = { ...prev, [alertId]: "resolved" as const }
      localStorage.setItem("safedriver-alert-statuses", JSON.stringify(newStatuses))
      window.dispatchEvent(new Event("safedriver-alert-status-change"))
      return newStatuses
    })
  }

  const handleContactDriver = (alert: any) => {
    // In a real app, this would initiate contact with the driver
    console.log(`Contacting driver ${alert.driverName}`)
  }



  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 text-red-800"
      case "acknowledged":
        return "bg-yellow-100 text-yellow-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "drowsiness":
      case "distraction":
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      case "phone_usage":
      case "speeding":
        return <Bell className="h-5 w-5 text-yellow-500" />
      case "maintenance":
        return <Clock className="h-5 w-5 text-blue-500" />
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />
    }
  }

  const getAlertDescription = (type: string) => {
    switch (type) {
      case "drowsiness":
        return t("drowsiness_desc")
      case "phone_usage":
        return t("phone_usage_desc")
      case "speeding":
        return t("speeding_desc")
      case "distraction":
        return t("distraction_desc")
      case "maintenance":
        return t("maintenance_desc")
      default:
        return t("alert_detected")
    }
  }

  const formatTime = (timestamp: string) => {
    let date: Date
    if (/^\d+$/.test(timestamp)) {
      date = new Date(Number(timestamp))
    } else {
      date = new Date(timestamp)
    }
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 1) return t("just_now")
    if (diffMins < 60) return `${diffMins}${t("minutes_ago").replace("minutes ago", "m ago").replace("විනාඩි කිහිපයකට පෙර", "m").replace("நிமிடங்களுக்கு முன்", "m")}` // Fallback logic might be needed for cleaner short form, for now ad-hoc
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}${t("hours_ago").replace("hours ago", "h ago").replace("පැය කිහිපයකට පෙර", "h").replace("மணிநேரங்களுக்கு முன்", "h")}`
    return date.toLocaleDateString()
  }

  return (
    <div className="container mx-auto py-6">


      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex-1">
          <h1 className="text-2xl font-bold mb-1">{t("live_alerts_title")}</h1>
          {error && (
            <div className="mt-2 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm font-medium text-red-800 mb-2">{t("error_loading_alerts")}:</p>
              <p className="text-sm text-red-600 font-semibold">{error.message}</p>
              {error.message.includes("Permission denied") && (
                <div className="mt-3 p-3 bg-white border border-red-300 rounded">
                  <p className="text-xs font-semibold text-red-800 mb-2">🔧 {t("quick_fix")}:</p>
                  <ol className="text-xs text-red-700 space-y-1 list-decimal list-inside">
                    <li>{t("go_to_firebase_rules").split(":")[0]}: <a href="https://console.firebase.google.com/project/safe-driver-system/database/safe-driver-system-default-rtdb/rules" target="_blank" rel="noopener noreferrer" className="underline font-medium">{t("go_to_firebase_rules").split(":")[1]}</a></li>
                    <li>{t("paste_rules")}
                      <pre className="mt-1 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{`{
  "rules": {
    "alerts": {
      ".read": true,
      ".write": false
    },
    "devices": {
      ".read": true,
      ".write": false
    }
  }
}`}</pre>
                    </li>
                    <li>{t("click_publish")}</li>
                    <li>{t("wait_refresh")}</li>
                  </ol>
                </div>
              )}
              <p className="text-xs text-red-500 mt-2">
                {t("check_console")}
              </p>
            </div>
          )}
          {isLoadingAlerts && !error && (
            <p className="text-sm text-blue-600 flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              {t("connecting_firebase")}
            </p>
          )}
          {!error && !isLoadingAlerts && (
            <div>
              <p className="text-sm text-muted-foreground">
                {t("realtime_alerts")} • {t(filteredAlerts.length === 1 ? "alert_found" : "alerts_found", { count: filteredAlerts.length })}
              </p>
              {filteredAlerts.length === 0 && (
                <p className="text-xs text-orange-600 mt-1">
                  ⚠️ {t("no_alerts_warning")}
                </p>
              )}
            </div>
          )}
        </div>
        <div className="flex gap-2">

          <Button
            variant="outline"
            size="sm"
            onClick={refreshAlerts}
            disabled={isLoadingAlerts}
            className="flex items-center gap-2"
            title="Alerts update automatically in real-time"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingAlerts ? "animate-spin" : ""}`} />
            {isLoadingAlerts ? t("loading") : t("live")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="active">
            {t("active")}
          </TabsTrigger>
          <TabsTrigger value="acknowledged">
            {t("acknowledged")}
          </TabsTrigger>
          <TabsTrigger value="resolved">
            {t("resolved")}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-1">
            <History className="h-3 w-3" />
            {t("history")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoadingAlerts && (
            <Card>
              <CardContent className="flex items-center justify-center p-12">
                <div className="text-center">
                  <RefreshCw className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                  <h3 className="mt-4 text-lg font-medium">Loading alerts...</h3>
                  <p className="mt-2 text-sm text-gray-500">Connecting to Firebase Realtime Database</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoadingAlerts && (
            <div className="space-y-4">
              {filteredAlerts.map((alert) => (
                <Card key={alert.id} className="w-full">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <CardTitle className="text-lg">{alert.description || getAlertDescription(alert.type)}</CardTitle>
                          <CardDescription className="flex items-center gap-2 mt-1 flex-wrap">
                            <span>{alert.driverName}</span>
                            <span>•</span>
                            {/* Show number_plate if available, otherwise show busNumber, but not both if they're the same */}
                            {(alert.number_plate || alert.busNumber) && (
                              <>
                                <span className="font-medium">{alert.number_plate || alert.busNumber}</span>
                                <span>•</span>
                              </>
                            )}
                            <span>{formatTime(alert.timestamp)}</span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        <Badge className={getStatusColor(alert.status)}>{t(alert.status as any) || alert.status}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <MapPin className={`h-4 w-4 ${alert.location === "Online" ? "text-green-500" : "text-gray-500"}`} />
                        <span className={`text-sm ${alert.location === "Online" ? "text-green-600 font-medium" : ""}`}>{alert.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{t("route_label")}:</span>
                        <span className="text-sm">{alert.route}</span>
                      </div>
                      {alert.number_plate && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{t("bus_number_plate")}:</span>
                          <span className="text-sm font-semibold">{alert.number_plate}</span>
                        </div>
                      )}
                    </div>

                    {alert.status === "active" && activeTab !== "history" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {t("acknowledge")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactDriver(alert)}
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          {t("contact_driver")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveAlert(alert.id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {t("resolved")}
                        </Button>
                      </div>
                    )}
                    {alert.status === "acknowledged" && activeTab !== "history" && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleContactDriver(alert)}
                          className="flex items-center gap-2"
                        >
                          <Phone className="h-4 w-4" />
                          {t("contact_driver")}
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleResolveAlert(alert.id)}
                          className="flex items-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          {t("resolved")}
                        </Button>
                      </div>
                    )}
                    {activeTab === "history" && (
                      <div className="text-xs text-muted-foreground italic">
                        {t("historical_archived")}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {filteredAlerts.length === 0 && !isLoadingAlerts && (
                <Card>
                  <CardContent className="flex items-center justify-center p-6">
                    <div className="text-center max-w-md">
                      <Bell className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-lg font-medium">{t("no_alerts_found")}</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {activeTab === "active"
                          ? t("no_alerts_moment")
                          : activeTab === "history"
                            ? t("no_history_found")
                            : t("no_status_alerts", { status: activeTab })}
                      </p>
                      {!error && (
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-left">
                          <p className="text-xs font-medium text-blue-800 mb-2">Debugging Steps:</p>
                          <ol className="text-xs text-blue-700 space-y-1 list-decimal list-inside">
                            <li>Open browser console (F12) and check for Firebase connection messages</li>
                            <li>Verify data exists in Firebase Console at: <code className="bg-blue-100 px-1 rounded">/alerts/{`<DEVICE_ID>`}/latest</code></li>
                            <li>Check that the <code className="bg-blue-100 px-1 rounded">latest</code> node has: message, tag, time, type</li>
                            <li>Verify database rules allow read access to <code className="bg-blue-100 px-1 rounded">/alerts</code></li>
                          </ol>
                        </div>
                      )}
                      {error && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                          <p className="text-xs font-medium text-red-800 mb-1">Error:</p>
                          <p className="text-xs text-red-600">{error.message}</p>
                          <p className="mt-2 text-xs text-red-500">
                            Check browser console (F12) for detailed error messages
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
