"use client"

import { NotificationSettings } from "@/components/notification-settings"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Clock, CheckCircle, AlertTriangle, Shield } from "lucide-react"

// Mock notification history data
const notificationHistory = [
  {
    id: 1,
    title: "Critical Safety Alert",
    message: "Driver John Smith - Drowsiness detected on Route 45",
    type: "critical_alert",
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    read: false,
    acknowledged: false,
  },
  {
    id: 2,
    title: "Maintenance Due",
    message: "Vehicle ABC-123 is due for routine maintenance",
    type: "maintenance_due",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    acknowledged: true,
  },
  {
    id: 3,
    title: "Route Deviation",
    message: "Driver Sarah Johnson has deviated from assigned route",
    type: "route_deviation",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
    read: true,
    acknowledged: false,
  },
]

export default function NotificationsPage() {
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "critical_alert":
        return <Shield className="h-5 w-5 text-red-500" />
      case "maintenance_due":
        return <Clock className="h-5 w-5 text-blue-500" />
      case "route_deviation":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationBadge = (type: string) => {
    switch (type) {
      case "critical_alert":
        return <Badge variant="destructive">Critical</Badge>
      case "maintenance_due":
        return <Badge variant="secondary">Maintenance</Badge>
      case "route_deviation":
        return <Badge variant="outline">Route</Badge>
      default:
        return <Badge variant="secondary">General</Badge>
    }
  }

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date()
    const diff = now.getTime() - timestamp.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes} minutes ago`
    } else if (hours < 24) {
      return `${hours} hours ago`
    } else {
      return `${days} days ago`
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <p className="text-muted-foreground">Manage your push notifications and view notification history</p>
      </div>

      <NotificationSettings />

      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
          <CardDescription>Recent notifications sent to your device</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notificationHistory.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start gap-4 p-4 rounded-lg border ${
                  !notification.read ? "bg-blue-50 border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{notification.title}</h4>
                    <div className="flex items-center gap-2">
                      {getNotificationBadge(notification.type)}
                      {!notification.read && <Badge variant="secondary">New</Badge>}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</span>
                    <div className="flex items-center gap-2">
                      {notification.acknowledged ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs">Acknowledged</span>
                        </div>
                      ) : (
                        notification.type === "critical_alert" && (
                          <Button size="sm" variant="outline">
                            Acknowledge
                          </Button>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
