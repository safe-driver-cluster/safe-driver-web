interface WebhookPayload {
  event: string
  timestamp: string
  data: any
  metadata?: {
    source: string
    version: string
    requestId: string
  }
}

interface WebhookConfig {
  id: string
  url: string
  events: string[]
  isActive: boolean
  secret?: string
  headers?: Record<string, string>
  retryPolicy?: {
    maxRetries: number
    retryDelay: number
    backoffMultiplier: number
  }
}

interface WebhookDelivery {
  id: string
  webhookId: string
  event: string
  payload: WebhookPayload
  status: "pending" | "success" | "failed" | "retrying"
  attempts: number
  lastAttempt?: string
  nextRetry?: string
  responseCode?: number
  responseTime?: number
  error?: string
}

export class WebhookService {
  private static instance: WebhookService
  private webhooks: Map<string, WebhookConfig> = new Map()
  private deliveryQueue: WebhookDelivery[] = []

  static getInstance(): WebhookService {
    if (!WebhookService.instance) {
      WebhookService.instance = new WebhookService()
    }
    return WebhookService.instance
  }

  async registerWebhook(config: WebhookConfig): Promise<void> {
    this.webhooks.set(config.id, config)
  }

  async unregisterWebhook(webhookId: string): Promise<void> {
    this.webhooks.delete(webhookId)
  }

  async triggerWebhook(event: string, data: any): Promise<void> {
    const relevantWebhooks = Array.from(this.webhooks.values()).filter(
      (webhook) => webhook.isActive && webhook.events.includes(event),
    )

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        source: "safedriver-sla",
        version: "1.0.0",
        requestId: this.generateRequestId(),
      },
    }

    for (const webhook of relevantWebhooks) {
      const delivery: WebhookDelivery = {
        id: this.generateDeliveryId(),
        webhookId: webhook.id,
        event,
        payload,
        status: "pending",
        attempts: 0,
      }

      this.deliveryQueue.push(delivery)
      this.processDelivery(delivery, webhook)
    }
  }

  private async processDelivery(delivery: WebhookDelivery, webhook: WebhookConfig): Promise<void> {
    const maxRetries = webhook.retryPolicy?.maxRetries ?? 3
    const retryDelay = webhook.retryPolicy?.retryDelay ?? 5000
    const backoffMultiplier = webhook.retryPolicy?.backoffMultiplier ?? 2

    while (delivery.attempts <= maxRetries && delivery.status !== "success") {
      delivery.attempts++
      delivery.lastAttempt = new Date().toISOString()
      delivery.status = delivery.attempts === 1 ? "pending" : "retrying"

      try {
        const result = await this.sendWebhook(webhook, delivery.payload)

        if (result.success) {
          delivery.status = "success"
          delivery.responseCode = result.responseCode
          delivery.responseTime = result.responseTime
        } else {
          delivery.error = result.error
          delivery.responseCode = result.responseCode

          if (delivery.attempts <= maxRetries) {
            const delay = retryDelay * Math.pow(backoffMultiplier, delivery.attempts - 1)
            delivery.nextRetry = new Date(Date.now() + delay).toISOString()

            // Schedule retry
            setTimeout(() => {
              this.processDelivery(delivery, webhook)
            }, delay)
          } else {
            delivery.status = "failed"
          }
        }
      } catch (error) {
        delivery.error = error instanceof Error ? error.message : "Unknown error"

        if (delivery.attempts > maxRetries) {
          delivery.status = "failed"
        }
      }

      // Save delivery status (in real implementation, save to database)
      console.log(`Webhook delivery ${delivery.id} attempt ${delivery.attempts}:`, {
        status: delivery.status,
        responseCode: delivery.responseCode,
        error: delivery.error,
      })

      if (delivery.status === "success" || delivery.status === "failed") {
        break
      }
    }
  }

  private async sendWebhook(
    webhook: WebhookConfig,
    payload: WebhookPayload,
  ): Promise<{
    success: boolean
    responseCode?: number
    responseTime?: number
    error?: string
  }> {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "SafeDriver-Webhook/1.0",
        ...webhook.headers,
      }

      // Add signature if secret is provided
      if (webhook.secret) {
        const signature = await this.generateSignature(JSON.stringify(payload), webhook.secret)
        headers["X-SafeDriver-Signature"] = signature
      }

      const startTime = Date.now()
      const response = await fetch(webhook.url, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      })
      const endTime = Date.now()

      return {
        success: response.ok,
        responseCode: response.status,
        responseTime: endTime - startTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  private async generateSignature(payload: string, secret: string): Promise<string> {
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(payload)

    const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "HMAC", hash: "SHA-256" }, false, ["sign"])

    const signature = await crypto.subtle.sign("HMAC", cryptoKey, messageData)
    const hashArray = Array.from(new Uint8Array(signature))
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")

    return `sha256=${hashHex}`
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private generateDeliveryId(): string {
    return `del_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  async getWebhookDeliveries(webhookId: string, limit = 50): Promise<WebhookDelivery[]> {
    return this.deliveryQueue
      .filter((delivery) => delivery.webhookId === webhookId)
      .slice(-limit)
      .reverse()
  }

  async getWebhookStats(webhookId: string): Promise<{
    totalDeliveries: number
    successfulDeliveries: number
    failedDeliveries: number
    averageResponseTime: number
    lastDelivery?: string
  }> {
    const deliveries = this.deliveryQueue.filter((delivery) => delivery.webhookId === webhookId)
    const successful = deliveries.filter((d) => d.status === "success")
    const failed = deliveries.filter((d) => d.status === "failed")

    const responseTimes = successful.filter((d) => d.responseTime).map((d) => d.responseTime!)

    const averageResponseTime =
      responseTimes.length > 0 ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length : 0

    const lastDelivery = deliveries.length > 0 ? deliveries[deliveries.length - 1].lastAttempt : undefined

    return {
      totalDeliveries: deliveries.length,
      successfulDeliveries: successful.length,
      failedDeliveries: failed.length,
      averageResponseTime,
      lastDelivery,
    }
  }
}

// Export singleton instance
export const webhookService = WebhookService.getInstance()

// Helper function to trigger webhooks from other parts of the application
export async function triggerSLAWebhook(event: string, data: any): Promise<void> {
  await webhookService.triggerWebhook(event, data)
}
