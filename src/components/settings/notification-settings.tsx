"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"

export function NotificationSettings() {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [pushNotifications, setPushNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [alertSeverity, setAlertSeverity] = useState("medium")
  const [alertVolume, setAlertVolume] = useState([75])
  const [dailyDigest, setDailyDigest] = useState(true)
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true)
  const [driverBehaviorAlerts, setDriverBehaviorAlerts] = useState(true)
  const [geofenceAlerts, setGeofenceAlerts] = useState(true)
  const [systemUpdates, setSystemUpdates] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Settings</CardTitle>
        <CardDescription>Configure how and when you receive notifications and alerts.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Notification Channels</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications via email</p>
            </div>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="push-notifications">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive notifications in browser and mobile app</p>
            </div>
            <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive critical alerts via SMS</p>
            </div>
            <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Alert Settings</h3>

          <div className="space-y-2">
            <Label htmlFor="alert-severity">Minimum Alert Severity</Label>
            <Select value={alertSeverity} onValueChange={setAlertSeverity}>
              <SelectTrigger id="alert-severity">
                <SelectValue placeholder="Select minimum severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (All Alerts)</SelectItem>
                <SelectItem value="medium">Medium (Moderate and Critical)</SelectItem>
                <SelectItem value="high">High (Critical Only)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Only receive alerts at or above this severity level.</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="alert-volume">Alert Volume</Label>
              <span className="text-sm text-muted-foreground">{alertVolume}%</span>
            </div>
            <Slider id="alert-volume" defaultValue={alertVolume} max={100} step={1} onValueChange={setAlertVolume} />
            <p className="text-sm text-muted-foreground">Volume level for audible alerts.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Notification Types</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="daily-digest">Daily Digest</Label>
              <p className="text-sm text-muted-foreground">Receive a daily summary of system activity</p>
            </div>
            <Switch id="daily-digest" checked={dailyDigest} onCheckedChange={setDailyDigest} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-alerts">Maintenance Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications about vehicle maintenance needs</p>
            </div>
            <Switch id="maintenance-alerts" checked={maintenanceAlerts} onCheckedChange={setMaintenanceAlerts} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="driver-behavior-alerts">Driver Behavior Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications about unsafe driving behaviors</p>
            </div>
            <Switch
              id="driver-behavior-alerts"
              checked={driverBehaviorAlerts}
              onCheckedChange={setDriverBehaviorAlerts}
            />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="geofence-alerts">Geofence Alerts</Label>
              <p className="text-sm text-muted-foreground">Notifications when vehicles enter/exit geofenced areas</p>
            </div>
            <Switch id="geofence-alerts" checked={geofenceAlerts} onCheckedChange={setGeofenceAlerts} />
          </div>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="system-updates">System Updates</Label>
              <p className="text-sm text-muted-foreground">Notifications about system updates and maintenance</p>
            </div>
            <Switch id="system-updates" checked={systemUpdates} onCheckedChange={setSystemUpdates} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
