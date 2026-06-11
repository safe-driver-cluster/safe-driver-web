"use client"

export interface NotificationSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface NotificationPayload {
  title: string
  body: string
  type: "critical_alert" | "driver_emergency" | "maintenance_due" | "route_deviation" | "general"
  icon?: string
  badge?: string
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
  data?: Record<string, any>
  url?: string
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "your-vapid-public-key"

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  // Check if push notifications are supported
  isSupported(): boolean {
    return (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window
    )
  }

  // Get current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) return "denied"
    return Notification.permission
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported")
    }

    if (Notification.permission === "granted") {
      return "granted"
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  // Subscribe to push notifications
  async subscribe(): Promise<NotificationSubscription | null> {
    if (!this.isSupported()) {
      throw new Error("Push notifications are not supported")
    }

    const permission = await this.requestPermission()
    if (permission !== "granted") {
      throw new Error("Notification permission denied")
    }

    const registration = await navigator.serviceWorker.ready

    // Check if already subscribed
    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      return this.subscriptionToJSON(existingSubscription)
    }

    // Create new subscription
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey) as any,
    })

    const subscriptionJSON = this.subscriptionToJSON(subscription)

    // Send subscription to server
    await this.sendSubscriptionToServer(subscriptionJSON)

    return subscriptionJSON
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported()) return false

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      const success = await subscription.unsubscribe()
      if (success) {
        // Remove subscription from server
        await this.removeSubscriptionFromServer(this.subscriptionToJSON(subscription))
      }
      return success
    }

    return true
  }

  // Get current subscription
  async getSubscription(): Promise<NotificationSubscription | null> {
    if (!this.isSupported()) return null

    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    return subscription ? this.subscriptionToJSON(subscription) : null
  }

  // Send test notification
  async sendTestNotification(): Promise<void> {
    const subscription = await this.getSubscription()
    if (!subscription) {
      throw new Error("No active subscription")
    }

    await fetch("/api/notifications/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    })
  }

  // Convert subscription to JSON
  private subscriptionToJSON(subscription: PushSubscription): NotificationSubscription {
    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: this.arrayBufferToBase64(subscription.getKey("p256dh")!),
        auth: this.arrayBufferToBase64(subscription.getKey("auth")!),
      },
    }
  }

  // Send subscription to server
  private async sendSubscriptionToServer(subscription: NotificationSubscription): Promise<void> {
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subscription,
        userAgent: navigator.userAgent,
        timestamp: Date.now(),
      }),
    })
  }

  // Remove subscription from server
  private async removeSubscriptionFromServer(subscription: NotificationSubscription): Promise<void> {
    await fetch("/api/notifications/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subscription }),
    })
  }

  // Utility functions
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

// Notification templates
export const NotificationTemplates = {
  criticalAlert: (alert: any): NotificationPayload => ({
    title: "🚨 Critical Safety Alert",
    body: `Driver ${alert.driverName} - ${alert.message}`,
    type: "critical_alert",
    requireInteraction: true,
    tag: `critical-alert-${alert.id}`,
    data: {
      alertId: alert.id,
      driverId: alert.driverId,
      severity: "critical",
      trackDismissal: true,
    },
    url: `/alerts/${alert.id}`,
  }),

  driverEmergency: (driver: any, location: any): NotificationPayload => ({
    title: "🆘 Driver Emergency",
    body: `${driver.name} has triggered an emergency alert at ${location.address}`,
    type: "driver_emergency",
    requireInteraction: true,
    tag: `emergency-${driver.id}`,
    data: {
      driverId: driver.id,
      location: location,
      severity: "emergency",
      trackDismissal: true,
    },
    url: `/drivers/${driver.id}?emergency=true`,
  }),

  maintenanceDue: (vehicle: any): NotificationPayload => ({
    title: "🔧 Maintenance Due",
    body: `Vehicle ${vehicle.plateNumber} is due for ${vehicle.maintenanceType}`,
    type: "maintenance_due",
    tag: `maintenance-${vehicle.id}`,
    data: {
      vehicleId: vehicle.id,
      maintenanceType: vehicle.maintenanceType,
    },
    url: `/fleet/${vehicle.id}/maintenance`,
  }),

  routeDeviation: (driver: any, route: any): NotificationPayload => ({
    title: "📍 Route Deviation",
    body: `${driver.name} has deviated from assigned route ${route.name}`,
    type: "route_deviation",
    tag: `deviation-${driver.id}`,
    data: {
      driverId: driver.id,
      routeId: route.id,
    },
    url: `/routes/${route.id}/track`,
  }),

  speedingAlert: (driver: any, speed: number, limit: number): NotificationPayload => ({
    title: "⚡ Speeding Alert",
    body: `${driver.name} is traveling at ${speed} km/h in a ${limit} km/h zone`,
    type: "critical_alert",
    tag: `speeding-${driver.id}`,
    data: {
      driverId: driver.id,
      speed: speed,
      speedLimit: limit,
      alertType: "speeding",
    },
    url: `/drivers/${driver.id}`,
  }),

  drowsinessAlert: (driver: any): NotificationPayload => ({
    title: "😴 Drowsiness Detected",
    body: `${driver.name} shows signs of drowsiness - immediate attention required`,
    type: "critical_alert",
    requireInteraction: true,
    tag: `drowsiness-${driver.id}`,
    data: {
      driverId: driver.id,
      alertType: "drowsiness",
      severity: "high",
      trackDismissal: true,
    },
    url: `/drivers/${driver.id}?alert=drowsiness`,
  }),
}
