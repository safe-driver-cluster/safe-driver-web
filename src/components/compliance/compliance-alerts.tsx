"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Clock,
  Settings,
  Mail,
  MessageSquare,
  Smartphone,
  Eye,
  X,
  Plus,
} from "lucide-react"

export function ComplianceAlerts() {
  const [alertFilter, setAlertFilter] = useState("all")

  const alerts = [
    {
      id: 1,
      type: "policy_expiry",
      severity: "high",
      title: "Emergency Response Policy Expiring Soon",
      description: "Emergency Response Procedures policy expires in 5 days (Jan 15, 2024)",
      timestamp: "2024-01-10 14:30",
      status: "active",
      category: "Policy Management",
      actionRequired: true,
      assignedTo: "Safety Officer",
    },
    {
      id: 2,
      type: "sla_breach",
      severity: "high",
      title: "SLA Breach - Incident Response Time",
      description: "Safety incident response exceeded 4-hour SLA requirement",
      timestamp: "2024-01-10 11:20",
      status: "active",
      category: "SLA Management",
      actionRequired: true,
      assignedTo: "Compliance Manager",
    },
    {
      id: 3,
      type: "audit_finding",
      severity: "medium",
      title: "Audit Finding - Driver Training Records",
      description: "3 drivers missing quarterly safety training completion certificates",
      timestamp: "2024-01-09 16:45",
      status: "in_progress",
      category: "Training Compliance",
      actionRequired: true,
      assignedTo: "HR Manager",
    },
    {
      id: 4,
      type: "regulatory_change",
      severity: "medium",
      title: "New DOT Regulation Update",
      description: "DOT has updated hours of service regulations effective March 1, 2024",
      timestamp: "2024-01-09 09:15",
      status: "acknowledged",
      category: "Regulatory Updates",
      actionRequired: false,
      assignedTo: "Legal Team",
    },
    {
      id: 5,
      type: "violation",
      severity: "high",
      title: "Speed Violation Detected",
      description: "Vehicle FL-001 exceeded speed limit by 15 mph on I-95",
      timestamp: "2024-01-08 14:22",
      status: "resolved",
      category: "Safety Violations",
      actionRequired: false,
      assignedTo: "Fleet Manager",
    },
    {
      id: 6,
      type: "maintenance_overdue",
      severity: "medium",
      title: "Vehicle Maintenance Overdue",
      description: "Vehicle FL-003 scheduled maintenance is 2 days overdue",
      timestamp: "2024-01-08 08:30",
      status: "active",
      category: "Maintenance",
      actionRequired: true,
      assignedTo: "Maintenance Supervisor",
    },
  ]

  const alertSettings = [
    {
      category: "Policy Management",
      enabled: true,
      channels: ["email", "sms", "dashboard"],
      threshold: "medium",
      description: "Alerts for policy updates, expirations, and compliance issues",
    },
    {
      category: "SLA Management",
      enabled: true,
      channels: ["email", "dashboard"],
      threshold: "high",
      description: "Notifications for SLA breaches and performance issues",
    },
    {
      category: "Safety Violations",
      enabled: true,
      channels: ["email", "sms", "slack"],
      threshold: "low",
      description: "Immediate alerts for safety violations and incidents",
    },
    {
      category: "Training Compliance",
      enabled: true,
      channels: ["email", "dashboard"],
      threshold: "medium",
      description: "Training completion and certification alerts",
    },
    {
      category: "Regulatory Updates",
      enabled: false,
      channels: ["email"],
      threshold: "medium",
      description: "Updates on regulatory changes and requirements",
    },
    {
      category: "Maintenance",
      enabled: true,
      channels: ["email", "dashboard"],
      threshold: "medium",
      description: "Vehicle maintenance and inspection alerts",
    },
  ]

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "destructive"
      case "in_progress":
        return "secondary"
      case "acknowledged":
        return "default"
      case "resolved":
        return "outline"
      default:
        return "outline"
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "policy_expiry":
        return <Clock className="h-4 w-4 text-orange-600" />
      case "sla_breach":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "audit_finding":
        return <Eye className="h-4 w-4 text-blue-600" />
      case "regulatory_change":
        return <Bell className="h-4 w-4 text-purple-600" />
      case "violation":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "maintenance_overdue":
        return <Settings className="h-4 w-4 text-orange-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case "email":
        return <Mail className="h-4 w-4" />
      case "sms":
        return <Smartphone className="h-4 w-4" />
      case "slack":
        return <MessageSquare className="h-4 w-4" />
      case "dashboard":
        return <Bell className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    if (alertFilter === "all") return true
    if (alertFilter === "active") return alert.status === "active"
    if (alertFilter === "high") return alert.severity === "high"
    return alert.category === alertFilter
  })

  return (
    <div className="space-y-6">
      {/* Alert Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.filter((a) => a.status === "active").length}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alerts.filter((a) => a.severity === "high").length}</div>
            <p className="text-xs text-muted-foreground">Critical issues</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {alerts.filter((a) => a.status === "in_progress").length}
            </div>
            <p className="text-xs text-muted-foreground">Being addressed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {alerts.filter((a) => a.status === "resolved").length}
            </div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Alert Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Compliance Alerts
          </CardTitle>
          <CardDescription>Monitor and manage compliance-related alerts and notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Select value={alertFilter} onValueChange={setAlertFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter alerts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Alerts</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="Policy Management">Policy Management</SelectItem>
                  <SelectItem value="SLA Management">SLA Management</SelectItem>
                  <SelectItem value="Safety Violations">Safety Violations</SelectItem>
                  <SelectItem value="Training Compliance">Training Compliance</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Alerts
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
          <CardDescription>Current compliance alerts requiring attention</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAlerts.map((alert) => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{alert.title}</span>
                        <Badge variant={getSeverityColor(alert.severity as any)}>{alert.severity}</Badge>
                        <Badge variant={getStatusColor(alert.status as any)}>{alert.status.replace("_", " ")}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{alert.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{alert.timestamp}</span>
                        <span>•</span>
                        <span>Category: {alert.category}</span>
                        <span>•</span>
                        <span>Assigned to: {alert.assignedTo}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {alert.actionRequired && <Button size="sm">Take Action</Button>}
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredAlerts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No alerts found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Alert Configuration
          </CardTitle>
          <CardDescription>Configure alert settings and notification preferences</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {alertSettings.map((setting, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="font-medium">{setting.category}</div>
                    <div className="text-sm text-muted-foreground">{setting.description}</div>
                  </div>
                  <Switch checked={setting.enabled} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Notification Channels</label>
                    <div className="flex flex-wrap gap-2">
                      {setting.channels.map((channel) => (
                        <div key={channel} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-xs">
                          {getChannelIcon(channel)}
                          <span>{channel}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-2 block">Alert Threshold</label>
                    <Select defaultValue={setting.threshold}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center mt-6 pt-6 border-t">
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Add Alert Rule
            </Button>
            <div className="flex gap-2">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Save Configuration</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alert History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Alert Activity</CardTitle>
          <CardDescription>Historical view of compliance alerts and resolutions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getAlertIcon(alert.type)}
                  <div>
                    <div className="font-medium text-sm">{alert.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {alert.timestamp} • {alert.assignedTo}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(alert.severity as any)} className="text-xs">
                    {alert.severity}
                  </Badge>
                  <Badge variant={getStatusColor(alert.status as any)} className="text-xs">
                    {alert.status.replace("_", " ")}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
