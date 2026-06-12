"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Phone, MapPin, Clock, RefreshCw, CheckCircle, Bell, History, Eye, EyeOff } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmergencyResponseSystem } from "@/lib/emergency-response-system"
import { useLiveAlerts, type Alert, isToday, parseTimestamp } from "@/hooks/use-live-alerts"
import { useLanguage } from "@/components/language-provider"


export default function AlertsPage() {
  // Use live alerts from Firebase Realtime Database
  const { alerts: liveAlerts, historyAlerts, isLoading: isLoadingAlerts, error } = useLiveAlerts()
  const [isManualRefreshing, setIsManualRefreshing] = useState(false)
  const { t } = useLanguage()

  // Track alert statuses (acknowledged/resolved) in local state
  const [alertStatuses, setAlertStatuses] = useState<Record<string, "active" | "acknowledged" | "resolved" | "archived">>({})
  const [expandedImages, setExpandedImages] = useState<Record<string, boolean>>({})
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
      liveAlerts.map((alert) => {
        let status = (alertStatuses && typeof alertStatuses === "object" && !Array.isArray(alertStatuses)) ? alertStatuses[alert.id] : undefined
        if (!status && alert.timestamp && alertStatuses && typeof alertStatuses === "object" && !Array.isArray(alertStatuses)) {
          const tsStr = alert.timestamp.toString()
          const matchingKey = Object.keys(alertStatuses).find(key => 
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
      }),
    [liveAlerts, alertStatuses],
  )

  // Filter alerts based on active tab as derived state.
  const filteredAlerts = useMemo(() => {
    let sourceAlerts: Alert[] = []

    if (activeTab === "history") {
      sourceAlerts = [...alerts, ...historyAlerts]
    } else {
      sourceAlerts = alerts.filter((alert) => {
        if (alert.status !== activeTab) return false
        
        // Acknowledged & Resolved tabs show alerts last 24 hours
        if (alert.status === "acknowledged" || alert.status === "resolved") {
          const alertTime = parseTimestamp(alert.timestamp)?.getTime() || 0
          const now = new Date().getTime()
          const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000
          if (now - alertTime > TWENTY_FOUR_HOURS) {
            return false
          }
        }
        return true
      })
    }

    // Deduplicate alerts based on deviceId, timestamp (within 60s), and description
    const uniqueAlerts = sourceAlerts.filter((alert, index, self) =>
      index === self.findIndex((a) => {
        const timeA = parseTimestamp(a.timestamp)?.getTime() || 0
        const timeB = parseTimestamp(alert.timestamp)?.getTime() || 0
        const isWithinTimeWindow = Math.abs(timeA - timeB) <= 60000

        return (
          a.deviceId === alert.deviceId && 
          isWithinTimeWindow && 
          (a.description || "") === (alert.description || "")
        )
      })
    )

    // Sort by timestamp (newest first)
    uniqueAlerts.sort((a, b) => {
      const timeA = parseTimestamp(a.timestamp)?.getTime() || 0
      const timeB = parseTimestamp(b.timestamp)?.getTime() || 0
      return timeB - timeA
    })

    return uniqueAlerts
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
    setIsManualRefreshing(true)
    // Alerts are automatically refreshed, but this provides a manual override to completely refresh data
    setTimeout(() => {
      window.location.reload()
    }, 400)
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
        return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400"
      case "low":
        return "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400"
      default:
        return "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400"
      case "acknowledged":
        return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400"
      case "resolved":
        return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400"
      case "archived":
        return "bg-slate-100 dark:bg-slate-900/50 text-slate-600 dark:text-slate-400"
      default:
        return "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200"
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
        return <AlertTriangle className="h-5 w-5 text-muted-foreground" />
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
            <div className="mt-2 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md">
              <p className="text-sm font-medium text-red-800 dark:text-red-400 mb-2">{t("error_loading_alerts")}:</p>
              <p className="text-sm text-red-600 dark:text-red-300 font-semibold">{error.message}</p>
              {error.message.includes("Permission denied") && (
                <div className="mt-3 p-3 bg-white dark:bg-slate-900 border border-red-300 dark:border-red-900/50 rounded">
                  <p className="text-xs font-semibold text-red-800 dark:text-red-400 mb-2">🔧 {t("quick_fix")}:</p>
                  <ol className="text-xs text-red-700 dark:text-red-300 space-y-1 list-decimal list-inside">
                    <li>{t("go_to_firebase_rules").split(":")[0]}: <a href="https://console.firebase.google.com/project/safe-driver-system/database/safe-driver-system-default-rtdb/rules" target="_blank" rel="noopener noreferrer" className="underline font-medium">{t("go_to_firebase_rules").split(":")[1]}</a></li>
                    <li>{t("paste_rules")}
                      <pre className="mt-1 p-2 bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 rounded text-xs overflow-x-auto">{`{
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
              <p className="text-xs text-red-500 dark:text-red-400 mt-2">
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
            </div>
          )}
        </div>
        <div className="flex gap-2">

          <Button
            variant="outline"
            size="sm"
            onClick={refreshAlerts}
            disabled={isLoadingAlerts || isManualRefreshing}
            className="flex items-center gap-2"
            title="Refresh connection"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingAlerts || isManualRefreshing ? "animate-spin" : ""}`} />
            {isLoadingAlerts || isManualRefreshing ? t("loading") : t("live")}
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
                  <p className="mt-2 text-sm text-muted-foreground">Connecting to Firebase Realtime Database</p>
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
                            <span>{alert.driverId}</span>
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
                        <MapPin className={`h-4 w-4 ${alert.location === "Online" ? "text-green-500" : "text-muted-foreground"}`} />
                        <span className={`text-sm ${alert.location === "Online" ? "text-green-600 dark:text-green-400 font-medium" : ""}`}>{alert.location}</span>
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

                    {alert.evidence && (
                      <div className="mt-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setExpandedImages(prev => ({ ...prev, [alert.id]: !prev[alert.id] }))}
                          className="flex items-center gap-2 mb-2 bg-neutral-50 dark:bg-slate-800 hover:bg-neutral-100 dark:hover:bg-slate-700 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-slate-700"
                        >
                          {expandedImages[alert.id] ? (
                            <>
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                              Hide Image
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              Show Image
                            </>
                          )}
                        </Button>
                        
                        {expandedImages[alert.id] && (
                          <div className="rounded-xl overflow-hidden border border-neutral-200 dark:border-slate-800 max-w-md bg-neutral-50 dark:bg-slate-900 p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                            <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest px-2 py-1 flex items-center gap-1.5 mb-1">
                              <AlertTriangle className="h-3 w-3 text-orange-500" />
                              Evidence Image
                            </div>
                            <img 
                              src={alert.evidence} 
                              alt="Alert Evidence" 
                              className="w-full h-auto object-contain max-h-[500px] rounded-lg shadow-sm border border-neutral-100 dark:border-slate-800" 
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}

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
                      <Bell className="mx-auto h-12 w-12 text-muted-foreground/60" />
                      <h3 className="mt-2 text-lg font-medium">{t("no_alerts_found")}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {activeTab === "active"
                          ? t("no_alerts_moment")
                          : activeTab === "history"
                            ? t("no_history_found")
                            : t("no_status_alerts", { status: activeTab })}
                      </p>
                      {!error && activeTab === "active" && (
                        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 rounded-md text-left">
                          <p className="text-xs font-medium text-blue-800 dark:text-blue-400 mb-2">Debugging Steps:</p>
                          <ol className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
                            <li>Open browser console (F12) and check for Firebase connection messages</li>
                            <li>Verify data exists in Firebase Console at: <code className="bg-blue-100 dark:bg-blue-950 px-1 rounded text-blue-900 dark:text-blue-200">/alerts/{`<DEVICE_ID>`}/latest</code></li>
                            <li>Check that the <code className="bg-blue-100 dark:bg-blue-950 px-1 rounded text-blue-900 dark:text-blue-200">latest</code> node has: message, tag, time, type</li>
                            <li>Verify database rules allow read access to <code className="bg-blue-100 dark:bg-blue-950 px-1 rounded text-blue-900 dark:text-blue-200">/alerts</code></li>
                          </ol>
                        </div>
                      )}
                      {error && (
                        <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 rounded-md">
                          <p className="text-xs font-medium text-red-800 dark:text-red-400 mb-1">Error:</p>
                          <p className="text-xs text-red-600 dark:text-red-300">{error.message}</p>
                          <p className="mt-2 text-xs text-red-500 dark:text-red-400">
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
