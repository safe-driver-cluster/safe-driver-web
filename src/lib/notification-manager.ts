import { type NotificationPayload, NotificationTemplates } from "./push-notifications"

export class NotificationManager {
  private static instance: NotificationManager

  static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager()
    }
    return NotificationManager.instance
  }

  // Send notification to all subscribed users
  async sendToAll(payload: NotificationPayload, options?: { urgency?: string; ttl?: number }): Promise<void> {
    try {
      // In a real app, you would get all active subscriptions from your database
      const subscriptions = await this.getAllSubscriptions()

      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptions,
          payload,
          options,
        }),
      })
    } catch (error) {
      console.error("Failed to send notification to all users:", error)
    }
  }

  // Send notification to specific users
  async sendToUsers(
    userIds: string[],
    payload: NotificationPayload,
    options?: { urgency?: string; ttl?: number },
  ): Promise<void> {
    try {
      const subscriptions = await this.getSubscriptionsByUsers(userIds)

      await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptions,
          payload,
          options,
        }),
      })
    } catch (error) {
      console.error("Failed to send notification to specific users:", error)
    }
  }

  // Send critical alert notification
  async sendCriticalAlert(alert: any): Promise<void> {
    const payload = NotificationTemplates.criticalAlert(alert)
    await this.sendToAll(payload, { urgency: "high", ttl: 3600 }) // 1 hour TTL
  }

  // Send driver emergency notification
  async sendDriverEmergency(driver: any, location: any): Promise<void> {
    const payload = NotificationTemplates.driverEmergency(driver, location)
    await this.sendToAll(payload, { urgency: "high", ttl: 1800 }) // 30 minutes TTL
  }

  // Send maintenance reminder
  async sendMaintenanceReminder(vehicle: any): Promise<void> {
    const payload = NotificationTemplates.maintenanceDue(vehicle)
    await this.sendToAll(payload, { urgency: "normal", ttl: 86400 }) // 24 hours TTL
  }

  // Send route deviation alert
  async sendRouteDeviation(driver: any, route: any): Promise<void> {
    const payload = NotificationTemplates.routeDeviation(driver, route)
    await this.sendToAll(payload, { urgency: "normal", ttl: 7200 }) // 2 hours TTL
  }

  // Send speeding alert
  async sendSpeedingAlert(driver: any, speed: number, limit: number): Promise<void> {
    const payload = NotificationTemplates.speedingAlert(driver, speed, limit)
    await this.sendToAll(payload, { urgency: "high", ttl: 3600 }) // 1 hour TTL
  }

  // Send drowsiness alert
  async sendDrowsinessAlert(driver: any): Promise<void> {
    const payload = NotificationTemplates.drowsinessAlert(driver)
    await this.sendToAll(payload, { urgency: "high", ttl: 1800 }) // 30 minutes TTL
  }

  // Helper methods (in a real app, these would query your database)
  private async getAllSubscriptions(): Promise<any[]> {
    // Mock data - replace with actual database query
    return [
      {
        endpoint: "https://fcm.googleapis.com/fcm/send/example1",
        keys: {
          p256dh: "example-p256dh-key-1",
          auth: "example-auth-key-1",
        },
      },
      // Add more subscriptions...
    ]
  }

  private async getSubscriptionsByUsers(userIds: string[]): Promise<any[]> {
    // Mock data - replace with actual database query
    return [
      {
        endpoint: "https://fcm.googleapis.com/fcm/send/example1",
        keys: {
          p256dh: "example-p256dh-key-1",
          auth: "example-auth-key-1",
        },
      },
    ]
  }
}

// Utility function to trigger notifications based on system events
export async function triggerNotificationForEvent(eventType: string, data: any): Promise<void> {
  const notificationManager = NotificationManager.getInstance()

  switch (eventType) {
    case "drowsiness_detected":
      await notificationManager.sendDrowsinessAlert(data.driver)
      break

    case "speeding_detected":
      await notificationManager.sendSpeedingAlert(data.driver, data.speed, data.speedLimit)
      break

    case "emergency_button_pressed":
      await notificationManager.sendDriverEmergency(data.driver, data.location)
      break

    case "route_deviation":
      await notificationManager.sendRouteDeviation(data.driver, data.route)
      break

    case "maintenance_due":
      await notificationManager.sendMaintenanceReminder(data.vehicle)
      break

    case "critical_alert":
      await notificationManager.sendCriticalAlert(data.alert)
      break

    default:
      console.log("Unknown event type for notification:", eventType)
  }
}
