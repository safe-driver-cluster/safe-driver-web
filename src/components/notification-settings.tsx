"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PushNotificationService } from "@/lib/push-notifications"
import { Bell, BellOff, TestTube, Shield, AlertTriangle, Wrench, Navigation, Info } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NotificationPreferences {
  criticalAlerts: boolean
  driverEmergencies: boolean
  maintenanceReminders: boolean
  routeDeviations: boolean
  generalUpdates: boolean
}

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    criticalAlerts: true,
    driverEmergencies: true,
    maintenanceReminders: true,
    routeDeviations: true,
    generalUpdates: false,
  })

  const { toast } = useToast()
  const pushService = PushNotificationService.getInstance()

  useEffect(() => {
    checkNotificationStatus()
  }, [])

  const checkNotificationStatus = async () => {
    const supported = pushService.isSupported()
    setIsSupported(supported)

    if (supported) {
      const currentPermission = pushService.getPermissionStatus()
      setPermission(currentPermission)

      const subscription = await pushService.getSubscription()
      setIsSubscribed(!!subscription)
    }
  }

  const handleEnableNotifications = async () => {
    setIsLoading(true)
    try {
      await pushService.subscribe()
      setIsSubscribed(true)
      setPermission("granted")
      toast({
        title: "Notifications Enabled",
        description: "You'll now receive push notifications for important alerts.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to Enable Notifications",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableNotifications = async () => {
    setIsLoading(true)
    try {
      await pushService.unsubscribe()
      setIsSubscribed(false)
      toast({
        title: "Notifications Disabled",
        description: "You'll no longer receive push notifications.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to Disable Notifications",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTestNotification = async () => {
    setIsLoading(true)
    try {
      await pushService.sendTestNotification()
      toast({
        title: "Test Notification Sent",
        description: "Check your device for the test notification.",
      })
    } catch (error: any) {
      toast({
        title: "Failed to Send Test",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePreferenceChange = (key: keyof NotificationPreferences, value: boolean) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }))

    // In a real app, you would save these preferences to the server
    toast({
      title: "Preferences Updated",
      description: "Your notification preferences have been saved.",
    })
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Configure your notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Push notifications are not supported in your current browser. Please use a modern browser like Chrome,
              Firefox, or Safari.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>Stay informed about critical safety alerts and system updates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-medium">Notification Status</h4>
              <p className="text-sm text-muted-foreground">
                {permission === "granted" && isSubscribed && "Notifications are enabled"}
                {permission === "granted" && !isSubscribed && "Notifications are available but not subscribed"}
                {permission === "denied" && "Notifications are blocked"}
                {permission === "default" && "Notifications permission not requested"}
              </p>
            </div>
            <Badge variant={isSubscribed ? "success" : "secondary"}>{isSubscribed ? "Active" : "Inactive"}</Badge>
          </div>

          <div className="flex gap-2">
            {!isSubscribed ? (
              <Button onClick={handleEnableNotifications} disabled={isLoading}>
                <Bell className="h-4 w-4 mr-2" />
                Enable Notifications
              </Button>
            ) : (
              <Button variant="outline" onClick={handleDisableNotifications} disabled={isLoading}>
                <BellOff className="h-4 w-4 mr-2" />
                Disable Notifications
              </Button>
            )}

            {isSubscribed && (
              <Button variant="outline" onClick={handleTestNotification} disabled={isLoading}>
                <TestTube className="h-4 w-4 mr-2" />
                Test Notification
              </Button>
            )}
          </div>

          {permission === "denied" && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Notifications are blocked. Please enable them in your browser settings to receive important safety
                alerts.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {isSubscribed && (
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>Choose which types of notifications you want to receive</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-red-500" />
                  <div>
                    <h4 className="font-medium">Critical Safety Alerts</h4>
                    <p className="text-sm text-muted-foreground">
                      Drowsiness, speeding, and other safety-critical events
                    </p>
                  </div>
                </div>
                <Switch
                  checked={preferences.criticalAlerts}
                  onCheckedChange={(checked) => handlePreferenceChange("criticalAlerts", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <div>
                    <h4 className="font-medium">Driver Emergencies</h4>
                    <p className="text-sm text-muted-foreground">Emergency button activations and panic alerts</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.driverEmergencies}
                  onCheckedChange={(checked) => handlePreferenceChange("driverEmergencies", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">Maintenance Reminders</h4>
                    <p className="text-sm text-muted-foreground">Vehicle maintenance due dates and schedules</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.maintenanceReminders}
                  onCheckedChange={(checked) => handlePreferenceChange("maintenanceReminders", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Navigation className="h-5 w-5 text-purple-500" />
                  <div>
                    <h4 className="font-medium">Route Deviations</h4>
                    <p className="text-sm text-muted-foreground">Unauthorized route changes and deviations</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.routeDeviations}
                  onCheckedChange={(checked) => handlePreferenceChange("routeDeviations", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Info className="h-5 w-5 text-gray-500" />
                  <div>
                    <h4 className="font-medium">General Updates</h4>
                    <p className="text-sm text-muted-foreground">System updates and non-critical information</p>
                  </div>
                </div>
                <Switch
                  checked={preferences.generalUpdates}
                  onCheckedChange={(checked) => handlePreferenceChange("generalUpdates", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
