export interface SLARule {
  id: string
  name: string
  description: string
  isActive: boolean
  priority: "low" | "medium" | "high" | "critical"
  category?: string
  customerTier?: "basic" | "premium" | "enterprise"
  businessHours: {
    enabled: boolean
    timezone: string
    schedule: {
      [key: string]: { start: string; end: string; enabled: boolean }
    }
  }
  targets: {
    firstResponse: number // minutes
    resolution: number // minutes
    escalation: number // minutes
  }
  escalationRules: EscalationRule[]
  notifications: NotificationRule[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface EscalationRule {
  id: string
  level: number
  triggerAfter: number // minutes
  assignTo: string[] // user IDs or roles
  notifyContacts: string[]
  actions: EscalationAction[]
  isActive: boolean
}

export interface EscalationAction {
  type: "assign" | "notify" | "priority_increase" | "status_change" | "webhook"
  parameters: Record<string, any>
  delay: number // minutes
}

export interface NotificationRule {
  id: string
  trigger: "first_response_due" | "resolution_due" | "escalation" | "breach"
  recipients: string[]
  channels: ("email" | "sms" | "slack" | "webhook")[]
  template: string
  advanceNotice: number // minutes before due
  isActive: boolean
}

export interface SLAMetrics {
  id: string
  ticketId: string
  ruleId: string
  status: "on_track" | "at_risk" | "breached" | "met"
  firstResponseDue: string
  resolutionDue: string
  firstResponseTime?: number // minutes
  resolutionTime?: number // minutes
  escalationLevel: number
  breaches: SLABreach[]
  notifications: SLANotification[]
  createdAt: string
  updatedAt: string
}

export interface SLABreach {
  id: string
  type: "first_response" | "resolution" | "escalation"
  breachedAt: string
  expectedAt: string
  delayMinutes: number
  reason?: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

export interface SLANotification {
  id: string
  type: "warning" | "breach" | "escalation"
  sentAt: string
  channel: string
  recipient: string
  acknowledged: boolean
}

export interface SLAReport {
  period: {
    start: string
    end: string
  }
  overall: {
    totalTickets: number
    metSLA: number
    breachedSLA: number
    averageFirstResponse: number
    averageResolution: number
    complianceRate: number
  }
  byPriority: Record<string, SLAMetricsSummary>
  byCategory: Record<string, SLAMetricsSummary>
  byAgent: Record<string, SLAMetricsSummary>
  trends: {
    date: string
    complianceRate: number
    averageResponse: number
    averageResolution: number
  }[]
}

export interface SLAMetricsSummary {
  totalTickets: number
  metSLA: number
  breachedSLA: number
  averageFirstResponse: number
  averageResolution: number
  complianceRate: number
}
