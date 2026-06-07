"use client"

import { NotificationManager } from "./notification-manager"

export interface EmergencyContact {
  id: string
  name: string
  role: string
  phone: string
  email: string
  priority: number
  isActive: boolean
  responseTime?: number // Expected response time in minutes
}

export interface EmergencyProtocol {
  id: string
  name: string
  triggerConditions: string[]
  severity: "low" | "medium" | "high" | "critical"
  autoEscalate: boolean
  escalationTime: number // Minutes before auto-escalation
  contacts: string[] // Contact IDs to notify
  actions: EmergencyAction[]
  requiresConfirmation: boolean
}

export interface EmergencyAction {
  id: string
  type: "notify_contact" | "call_emergency_services" | "send_sms" | "dispatch_vehicle" | "log_incident"
  description: string
  delay: number // Delay in seconds before executing
  parameters: Record<string, any>
  isAutomatic: boolean
}

export interface EmergencyIncident {
  id: string
  type: string
  severity: "low" | "medium" | "high" | "critical"
  status: "active" | "acknowledged" | "responding" | "resolved" | "escalated"
  driverId?: string
  vehicleId?: string
  location: {
    latitude: number
    longitude: number
    address: string
  }
  description: string
  timestamp: number
  acknowledgedAt?: number
  resolvedAt?: number
  responseTime?: number
  contacts: string[]
  actions: EmergencyActionLog[]
  metadata: Record<string, any>
}

export interface EmergencyActionLog {
  actionId: string
  executedAt: number
  status: "pending" | "executed" | "failed" | "cancelled"
  result?: string
  error?: string
}

export class EmergencyResponseSystem {
  private static instance: EmergencyResponseSystem
  private contacts: Map<string, EmergencyContact> = new Map()
  private protocols: Map<string, EmergencyProtocol> = new Map()
  private activeIncidents: Map<string, EmergencyIncident> = new Map()
  private actionTimeouts: Map<string, NodeJS.Timeout> = new Map()
  private isEnabled = true

  private constructor() {
    this.initializeDefaultProtocols()
    this.initializeDefaultContacts()
  }

  static getInstance(): EmergencyResponseSystem {
    if (!EmergencyResponseSystem.instance) {
      EmergencyResponseSystem.instance = new EmergencyResponseSystem()
    }
    return EmergencyResponseSystem.instance
  }

  // Initialize default emergency protocols
  private initializeDefaultProtocols(): void {
    const protocols: EmergencyProtocol[] = [
      {
        id: "driver_medical_emergency",
        name: "Driver Medical Emergency",
        triggerConditions: ["driver_unconscious", "medical_alert_button", "heart_rate_critical"],
        severity: "critical",
        autoEscalate: true,
        escalationTime: 2, // 2 minutes
        contacts: ["emergency_services", "fleet_manager", "medical_team"],
        requiresConfirmation: false,
        actions: [
          {
            id: "call_ambulance",
            type: "call_emergency_services",
            description: "Call ambulance immediately",
            delay: 0,
            parameters: { service: "ambulance", priority: "critical" },
            isAutomatic: true,
          },
          {
            id: "notify_fleet_manager",
            type: "notify_contact",
            description: "Notify fleet manager",
            delay: 30,
            parameters: { contactId: "fleet_manager", method: "call" },
            isAutomatic: true,
          },

        ],
      },
      {
        id: "vehicle_accident",
        name: "Vehicle Accident",
        triggerConditions: ["impact_detected", "airbag_deployed", "panic_button"],
        severity: "critical",
        autoEscalate: true,
        escalationTime: 3,
        contacts: ["emergency_services", "fleet_manager", "insurance"],
        requiresConfirmation: false,
        actions: [
          {
            id: "call_police_ambulance",
            type: "call_emergency_services",
            description: "Call police and ambulance",
            delay: 0,
            parameters: { service: "police_ambulance", priority: "critical" },
            isAutomatic: true,
          },
          {
            id: "dispatch_recovery_vehicle",
            type: "dispatch_vehicle",
            description: "Dispatch recovery vehicle",
            delay: 300, // 5 minutes
            parameters: { vehicleType: "recovery", priority: "high" },
            isAutomatic: true,
          },
        ],
      },
      {
        id: "driver_drowsiness_critical",
        name: "Critical Driver Drowsiness",
        triggerConditions: ["drowsiness_level_critical", "eyes_closed_extended"],
        severity: "high",
        autoEscalate: true,
        escalationTime: 1,
        contacts: ["fleet_manager", "safety_supervisor"],
        requiresConfirmation: false,
        actions: [

          {
            id: "contact_driver",
            type: "notify_contact",
            description: "Call driver immediately",
            delay: 10,
            parameters: { contactId: "current_driver", method: "call" },
            isAutomatic: true,
          },
        ],
      },
      {
        id: "vehicle_breakdown_highway",
        name: "Vehicle Breakdown on Highway",
        triggerConditions: ["engine_failure", "breakdown_highway_location"],
        severity: "medium",
        autoEscalate: true,
        escalationTime: 10,
        contacts: ["roadside_assistance", "fleet_manager"],
        requiresConfirmation: true,
        actions: [
          {
            id: "call_roadside_assistance",
            type: "call_emergency_services",
            description: "Call roadside assistance",
            delay: 0,
            parameters: { service: "roadside_assistance", priority: "medium" },
            isAutomatic: true,
          },

        ],
      },
      {
        id: "severe_weather_alert",
        name: "Severe Weather Emergency",
        triggerConditions: ["severe_weather_warning", "dangerous_driving_conditions"],
        severity: "medium",
        autoEscalate: false,
        escalationTime: 15,
        contacts: ["fleet_manager", "safety_supervisor"],
        requiresConfirmation: true,
        actions: [

          {
            id: "route_advisory",
            type: "notify_contact",
            description: "Send route advisory",
            delay: 120,
            parameters: { contactId: "all_drivers", method: "sms" },
            isAutomatic: true,
          },
        ],
      },
    ]

    protocols.forEach((protocol) => {
      this.protocols.set(protocol.id, protocol)
    })
  }

  // Initialize default emergency contacts
  private initializeDefaultContacts(): void {
    const contacts: EmergencyContact[] = [
      {
        id: "emergency_services",
        name: "Emergency Services",
        role: "Emergency Response",
        phone: "911",
        email: "emergency@local.gov",
        priority: 1,
        isActive: true,
        responseTime: 8,
      },
      {
        id: "fleet_manager",
        name: "Fleet Manager",
        role: "Fleet Operations",
        phone: "+1-555-0101",
        email: "fleet.manager@safedriver.com",
        priority: 2,
        isActive: true,
        responseTime: 5,
      },
      {
        id: "safety_supervisor",
        name: "Safety Supervisor",
        role: "Safety Management",
        phone: "+1-555-0102",
        email: "safety@safedriver.com",
        priority: 3,
        isActive: true,
        responseTime: 10,
      },
      {
        id: "medical_team",
        name: "Medical Response Team",
        role: "Medical Support",
        phone: "+1-555-0103",
        email: "medical@safedriver.com",
        priority: 2,
        isActive: true,
        responseTime: 15,
      },
      {
        id: "roadside_assistance",
        name: "Roadside Assistance",
        role: "Vehicle Recovery",
        phone: "+1-555-0104",
        email: "roadside@safedriver.com",
        priority: 4,
        isActive: true,
        responseTime: 30,
      },
    ]

    contacts.forEach((contact) => {
      this.contacts.set(contact.id, contact)
    })
  }

  // Trigger emergency response
  async triggerEmergency(
    type: string,
    data: {
      driverId?: string
      vehicleId?: string
      location: { latitude: number; longitude: number; address: string }
      description: string
      severity?: "low" | "medium" | "high" | "critical"
      metadata?: Record<string, any>
    },
  ): Promise<string> {
    if (!this.isEnabled) {
      console.log("Emergency response system is disabled")
      return ""
    }

    // Find matching protocol
    const protocol = this.findMatchingProtocol(type)
    if (!protocol) {
      console.error("No matching protocol found for emergency type:", type)
      return ""
    }

    // Create incident
    const incident: EmergencyIncident = {
      id: `EMG-${Date.now()}`,
      type,
      severity: data.severity || protocol.severity,
      status: "active",
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      location: data.location,
      description: data.description,
      timestamp: Date.now(),
      contacts: protocol.contacts,
      actions: [],
      metadata: data.metadata || {},
    }

    // Store incident
    this.activeIncidents.set(incident.id, incident)

    // Execute protocol actions
    await this.executeProtocol(protocol, incident)

    // Set up auto-escalation if enabled
    if (protocol.autoEscalate) {
      this.scheduleEscalation(incident.id, protocol.escalationTime)
    }

    console.log(`Emergency response triggered: ${incident.id}`)
    return incident.id
  }

  // Find matching protocol for emergency type
  private findMatchingProtocol(emergencyType: string): EmergencyProtocol | null {
    for (const protocol of this.protocols.values()) {
      if (protocol.triggerConditions.includes(emergencyType)) {
        return protocol
      }
    }
    return null
  }

  // Execute emergency protocol
  private async executeProtocol(protocol: EmergencyProtocol, incident: EmergencyIncident): Promise<void> {
    console.log(`Executing emergency protocol: ${protocol.name}`)

    for (const action of protocol.actions) {
      if (action.isAutomatic) {
        this.scheduleAction(action, incident, action.delay * 1000)
      }
    }
  }

  // Schedule an emergency action
  private scheduleAction(action: EmergencyAction, incident: EmergencyIncident, delay: number): void {
    const timeoutId = setTimeout(async () => {
      await this.executeAction(action, incident)
    }, delay)

    this.actionTimeouts.set(`${incident.id}-${action.id}`, timeoutId)
  }

  // Execute an emergency action
  private async executeAction(action: EmergencyAction, incident: EmergencyIncident): Promise<void> {
    const actionLog: EmergencyActionLog = {
      actionId: action.id,
      executedAt: Date.now(),
      status: "pending",
    }

    try {
      console.log(`Executing emergency action: ${action.description}`)

      switch (action.type) {

        case "notify_contact":
          await this.executeNotifyContact(action, incident)
          break
        case "call_emergency_services":
          await this.executeCallEmergencyServices(action, incident)
          break
        case "send_sms":
          await this.executeSendSMS(action, incident)
          break
        case "dispatch_vehicle":
          await this.executeDispatchVehicle(action, incident)
          break
        case "log_incident":
          await this.executeLogIncident(action, incident)
          break
      }

      actionLog.status = "executed"
      actionLog.result = "Action completed successfully"
    } catch (error) {
      actionLog.status = "failed"
      actionLog.error = error instanceof Error ? error.message : "Unknown error"
      console.error(`Failed to execute action ${action.id}:`, error)
    }

    // Update incident with action log
    const updatedIncident = this.activeIncidents.get(incident.id)
    if (updatedIncident) {
      updatedIncident.actions.push(actionLog)
      this.activeIncidents.set(incident.id, updatedIncident)
    }
  }



  // Execute notify contact action
  private async executeNotifyContact(action: EmergencyAction, incident: EmergencyIncident): Promise<void> {
    const { contactId, method } = action.parameters
    const contact = this.contacts.get(contactId)

    if (!contact) {
      throw new Error(`Contact not found: ${contactId}`)
    }

    // In a real implementation, this would make actual calls/send messages
    console.log(`Notifying ${contact.name} via ${method}: ${contact.phone}`)

    // Simulate notification
    const notificationManager = NotificationManager.getInstance()
    await notificationManager.sendToAll({
      title: "Emergency Response",
      body: `Emergency incident ${incident.id}: ${incident.description}`,
      type: "critical_alert",
      requireInteraction: true,
      data: { incidentId: incident.id },
    })
  }

  // Execute call emergency services action
  private async executeCallEmergencyServices(action: EmergencyAction, incident: EmergencyIncident): Promise<void> {
    const { service, priority } = action.parameters

    // In a real implementation, this would integrate with emergency services APIs
    console.log(`Calling ${service} with ${priority} priority for incident ${incident.id}`)
    console.log(`Location: ${incident.location.address}`)
    console.log(`Description: ${incident.description}`)

    // Log the emergency call
    await this.logEmergencyCall(incident, service, priority)
  }

  // Execute send SMS action
  private async executeSendSMS(action: EmergencyAction, incident: EmergencyIncident): Promise<void> {
    const { recipients, message } = action.parameters

    // In a real implementation, this would use an SMS service
    console.log(`Sending SMS to ${recipients}: ${message}`)
  }

  // Execute dispatch vehicle action
  private async executeDispatchVehicle(action: EmergencyAction, incident: EmergencyIncident): Promise<void> {
    const { vehicleType, priority } = action.parameters

    // In a real implementation, this would dispatch actual vehicles
    console.log(`Dispatching ${vehicleType} vehicle with ${priority} priority to ${incident.location.address}`)
  }

  // Execute log incident action
  private async executeLogIncident(action: EmergencyAction, incident: EmergencyIncident): Promise<void> {
    // In a real implementation, this would log to a database
    console.log(`Logging incident ${incident.id} to emergency database`)
  }

  // Log emergency call
  private async logEmergencyCall(incident: EmergencyIncident, service: string, priority: string): Promise<void> {
    const callLog = {
      incidentId: incident.id,
      service,
      priority,
      timestamp: Date.now(),
      location: incident.location,
      description: incident.description,
    }

    // In a real implementation, this would be stored in a database
    console.log("Emergency call logged:", callLog)
  }

  // Schedule escalation
  private scheduleEscalation(incidentId: string, escalationTime: number): void {
    const timeoutId = setTimeout(
      () => {
        this.escalateIncident(incidentId)
      },
      escalationTime * 60 * 1000,
    ) // Convert minutes to milliseconds

    this.actionTimeouts.set(`${incidentId}-escalation`, timeoutId)
  }

  // Escalate incident
  private escalateIncident(incidentId: string): void {
    const incident = this.activeIncidents.get(incidentId)
    if (!incident || incident.status !== "active") {
      return
    }

    console.log(`Escalating incident ${incidentId}`)

    // Update incident status
    incident.status = "escalated"
    this.activeIncidents.set(incidentId, incident)

    // Trigger higher-level response
    this.triggerEscalatedResponse(incident)
  }

  // Trigger escalated response
  private async triggerEscalatedResponse(incident: EmergencyIncident): Promise<void> {
    // Notify senior management
    const notificationManager = NotificationManager.getInstance()
    await notificationManager.sendToAll({
      title: "🚨 ESCALATED EMERGENCY",
      body: `Incident ${incident.id} has been escalated - immediate attention required`,
      type: "critical_alert",
      requireInteraction: true,
      data: { incidentId: incident.id, escalated: true },
    })


  }

  // Acknowledge incident
  acknowledgeIncident(incidentId: string, acknowledgedBy: string): boolean {
    const incident = this.activeIncidents.get(incidentId)
    if (!incident) return false

    incident.status = "acknowledged"
    incident.acknowledgedAt = Date.now()
    incident.metadata.acknowledgedBy = acknowledgedBy

    this.activeIncidents.set(incidentId, incident)

    // Cancel escalation if pending
    const escalationTimeoutId = this.actionTimeouts.get(`${incidentId}-escalation`)
    if (escalationTimeoutId) {
      clearTimeout(escalationTimeoutId)
      this.actionTimeouts.delete(`${incidentId}-escalation`)
    }

    console.log(`Incident ${incidentId} acknowledged by ${acknowledgedBy}`)
    return true
  }

  // Resolve incident
  resolveIncident(incidentId: string, resolvedBy: string, resolution: string): boolean {
    const incident = this.activeIncidents.get(incidentId)
    if (!incident) return false

    incident.status = "resolved"
    incident.resolvedAt = Date.now()
    incident.responseTime = incident.resolvedAt - incident.timestamp
    incident.metadata.resolvedBy = resolvedBy
    incident.metadata.resolution = resolution

    this.activeIncidents.set(incidentId, incident)

    // Cancel any pending actions
    this.cancelIncidentActions(incidentId)

    console.log(`Incident ${incidentId} resolved by ${resolvedBy}`)
    return true
  }

  // Cancel incident actions
  private cancelIncidentActions(incidentId: string): void {
    const keysToDelete: string[] = []

    for (const [key, timeoutId] of this.actionTimeouts.entries()) {
      if (key.startsWith(incidentId)) {
        clearTimeout(timeoutId)
        keysToDelete.push(key)
      }
    }

    keysToDelete.forEach((key) => {
      this.actionTimeouts.delete(key)
    })
  }

  // Get active incidents
  getActiveIncidents(): EmergencyIncident[] {
    return Array.from(this.activeIncidents.values()).filter((incident) => incident.status !== "resolved")
  }

  // Get incident by ID
  getIncident(incidentId: string): EmergencyIncident | null {
    return this.activeIncidents.get(incidentId) || null
  }

  // Enable/disable emergency response system
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled
    console.log(`Emergency response system ${enabled ? "enabled" : "disabled"}`)
  }

  // Add emergency contact
  addContact(contact: EmergencyContact): void {
    this.contacts.set(contact.id, contact)
  }

  // Add emergency protocol
  addProtocol(protocol: EmergencyProtocol): void {
    this.protocols.set(protocol.id, protocol)
  }

  // Get emergency statistics
  getEmergencyStats(): {
    totalIncidents: number
    activeIncidents: number
    averageResponseTime: number
    incidentsByType: Record<string, number>
    incidentsBySeverity: Record<string, number>
  } {
    const incidents = Array.from(this.activeIncidents.values())
    const resolvedIncidents = incidents.filter((i) => i.status === "resolved")

    const averageResponseTime =
      resolvedIncidents.length > 0
        ? resolvedIncidents.reduce((sum, i) => sum + (i.responseTime || 0), 0) / resolvedIncidents.length
        : 0

    const incidentsByType: Record<string, number> = {}
    const incidentsBySeverity: Record<string, number> = {}

    incidents.forEach((incident) => {
      incidentsByType[incident.type] = (incidentsByType[incident.type] || 0) + 1
      incidentsBySeverity[incident.severity] = (incidentsBySeverity[incident.severity] || 0) + 1
    })

    return {
      totalIncidents: incidents.length,
      activeIncidents: incidents.filter((i) => i.status === "active").length,
      averageResponseTime: Math.round(averageResponseTime / 1000 / 60), // Convert to minutes
      incidentsByType,
      incidentsBySeverity,
    }
  }
}
