"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Settings, BarChart3, AlertTriangle, Clock, TrendingUp } from "lucide-react"

import { SLARules } from "./sla-rules"
import { SLAMonitoring } from "./sla-monitoring"
import { SLAReports } from "./sla-reports"
import { SLAConfiguration } from "./sla-configuration"
import { CreateSLARuleDialog } from "./create-sla-rule-dialog"
import type { SLARule, SLAMetrics, SLAReport } from "@/lib/sla-types"

export function SLAManagement() {
  const [slaRules, setSLARules] = useState<SLARule[]>([])
  const [slaMetrics, setSLAMetrics] = useState<SLAMetrics[]>([])
  const [slaReports, setSLAReports] = useState<SLAReport | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")

  // Mock data initialization
  useEffect(() => {
    const mockSLARules: SLARule[] = [
      {
        id: "sla-1",
        name: "Critical Issues - Enterprise",
        description: "SLA for critical priority tickets from enterprise customers",
        isActive: true,
        priority: "critical",
        customerTier: "enterprise",
        businessHours: {
          enabled: true,
          timezone: "America/New_York",
          schedule: {
            monday: { start: "09:00", end: "17:00", enabled: true },
            tuesday: { start: "09:00", end: "17:00", enabled: true },
            wednesday: { start: "09:00", end: "17:00", enabled: true },
            thursday: { start: "09:00", end: "17:00", enabled: true },
            friday: { start: "09:00", end: "17:00", enabled: true },
            saturday: { start: "10:00", end: "14:00", enabled: false },
            sunday: { start: "10:00", end: "14:00", enabled: false },
          },
        },
        targets: {
          firstResponse: 15, // 15 minutes
          resolution: 240, // 4 hours
          escalation: 60, // 1 hour
        },
        escalationRules: [
          {
            id: "esc-1",
            level: 1,
            triggerAfter: 30,
            assignTo: ["senior-support"],
            notifyContacts: ["support-manager"],
            actions: [
              {
                type: "assign",
                parameters: { role: "senior-support" },
                delay: 0,
              },
              {
                type: "notify",
                parameters: { contacts: ["support-manager"] },
                delay: 0,
              },
            ],
            isActive: true,
          },
          {
            id: "esc-2",
            level: 2,
            triggerAfter: 120,
            assignTo: ["engineering-lead"],
            notifyContacts: ["cto", "support-director"],
            actions: [
              {
                type: "priority_increase",
                parameters: {},
                delay: 0,
              },
              {
                type: "notify",
                parameters: { contacts: ["cto", "support-director"] },
                delay: 0,
              },
            ],
            isActive: true,
          },
        ],
        notifications: [
          {
            id: "notif-1",
            trigger: "first_response_due",
            recipients: ["assigned-agent"],
            channels: ["email", "slack"],
            template: "first_response_reminder",
            advanceNotice: 5,
            isActive: true,
          },
          {
            id: "notif-2",
            trigger: "resolution_due",
            recipients: ["assigned-agent", "support-manager"],
            channels: ["email", "sms"],
            template: "resolution_reminder",
            advanceNotice: 30,
            isActive: true,
          },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-15T10:30:00Z",
        createdBy: "admin",
      },
      {
        id: "sla-2",
        name: "High Priority - All Customers",
        description: "SLA for high priority tickets from all customer tiers",
        isActive: true,
        priority: "high",
        businessHours: {
          enabled: true,
          timezone: "America/New_York",
          schedule: {
            monday: { start: "08:00", end: "18:00", enabled: true },
            tuesday: { start: "08:00", end: "18:00", enabled: true },
            wednesday: { start: "08:00", end: "18:00", enabled: true },
            thursday: { start: "08:00", end: "18:00", enabled: true },
            friday: { start: "08:00", end: "18:00", enabled: true },
            saturday: { start: "10:00", end: "16:00", enabled: true },
            sunday: { start: "12:00", end: "16:00", enabled: false },
          },
        },
        targets: {
          firstResponse: 60, // 1 hour
          resolution: 480, // 8 hours
          escalation: 180, // 3 hours
        },
        escalationRules: [
          {
            id: "esc-3",
            level: 1,
            triggerAfter: 120,
            assignTo: ["senior-support"],
            notifyContacts: ["support-manager"],
            actions: [
              {
                type: "assign",
                parameters: { role: "senior-support" },
                delay: 0,
              },
            ],
            isActive: true,
          },
        ],
        notifications: [
          {
            id: "notif-3",
            trigger: "first_response_due",
            recipients: ["assigned-agent"],
            channels: ["email"],
            template: "first_response_reminder",
            advanceNotice: 15,
            isActive: true,
          },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-10T14:20:00Z",
        createdBy: "admin",
      },
      {
        id: "sla-3",
        name: "Standard Support",
        description: "Default SLA for medium and low priority tickets",
        isActive: true,
        priority: "medium",
        businessHours: {
          enabled: true,
          timezone: "America/New_York",
          schedule: {
            monday: { start: "09:00", end: "17:00", enabled: true },
            tuesday: { start: "09:00", end: "17:00", enabled: true },
            wednesday: { start: "09:00", end: "17:00", enabled: true },
            thursday: { start: "09:00", end: "17:00", enabled: true },
            friday: { start: "09:00", end: "17:00", enabled: true },
            saturday: { start: "10:00", end: "14:00", enabled: false },
            sunday: { start: "10:00", end: "14:00", enabled: false },
          },
        },
        targets: {
          firstResponse: 240, // 4 hours
          resolution: 1440, // 24 hours
          escalation: 720, // 12 hours
        },
        escalationRules: [],
        notifications: [
          {
            id: "notif-4",
            trigger: "first_response_due",
            recipients: ["assigned-agent"],
            channels: ["email"],
            template: "first_response_reminder",
            advanceNotice: 60,
            isActive: true,
          },
        ],
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-05T09:15:00Z",
        createdBy: "admin",
      },
    ]

    const mockSLAMetrics: SLAMetrics[] = [
      {
        id: "metric-1",
        ticketId: "SD-001",
        ruleId: "sla-1",
        status: "at_risk",
        firstResponseDue: "2024-01-15T10:45:00Z",
        resolutionDue: "2024-01-15T14:30:00Z",
        firstResponseTime: 45,
        escalationLevel: 1,
        breaches: [],
        notifications: [
          {
            id: "notif-sent-1",
            type: "warning",
            sentAt: "2024-01-15T10:40:00Z",
            channel: "email",
            recipient: "sarah.johnson@safedriver.com",
            acknowledged: true,
          },
        ],
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T14:22:00Z",
      },
      {
        id: "metric-2",
        ticketId: "SD-002",
        ruleId: "sla-2",
        status: "on_track",
        firstResponseDue: "2024-01-14T16:45:00Z",
        resolutionDue: "2024-01-14T23:45:00Z",
        firstResponseTime: 30,
        escalationLevel: 0,
        breaches: [],
        notifications: [],
        createdAt: "2024-01-14T15:45:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
      },
      {
        id: "metric-3",
        ticketId: "SD-004",
        ruleId: "sla-3",
        status: "met",
        firstResponseDue: "2024-01-10T13:15:00Z",
        resolutionDue: "2024-01-11T09:15:00Z",
        firstResponseTime: 120,
        resolutionTime: 1800,
        escalationLevel: 0,
        breaches: [],
        notifications: [],
        createdAt: "2024-01-10T09:15:00Z",
        updatedAt: "2024-01-12T14:30:00Z",
      },
    ]

    const mockSLAReport: SLAReport = {
      period: {
        start: "2024-01-01T00:00:00Z",
        end: "2024-01-15T23:59:59Z",
      },
      overall: {
        totalTickets: 156,
        metSLA: 142,
        breachedSLA: 14,
        averageFirstResponse: 45,
        averageResolution: 320,
        complianceRate: 91.0,
      },
      byPriority: {
        critical: {
          totalTickets: 8,
          metSLA: 7,
          breachedSLA: 1,
          averageFirstResponse: 12,
          averageResolution: 180,
          complianceRate: 87.5,
        },
        high: {
          totalTickets: 24,
          metSLA: 22,
          breachedSLA: 2,
          averageFirstResponse: 35,
          averageResolution: 280,
          complianceRate: 91.7,
        },
        medium: {
          totalTickets: 89,
          metSLA: 84,
          breachedSLA: 5,
          averageFirstResponse: 65,
          averageResolution: 420,
          complianceRate: 94.4,
        },
        low: {
          totalTickets: 35,
          metSLA: 29,
          breachedSLA: 6,
          averageFirstResponse: 180,
          averageResolution: 720,
          complianceRate: 82.9,
        },
      },
      byCategory: {
        "Technical Issue": {
          totalTickets: 67,
          metSLA: 61,
          breachedSLA: 6,
          averageFirstResponse: 42,
          averageResolution: 380,
          complianceRate: 91.0,
        },
        "Billing Question": {
          totalTickets: 23,
          metSLA: 22,
          breachedSLA: 1,
          averageFirstResponse: 35,
          averageResolution: 180,
          complianceRate: 95.7,
        },
        "Feature Request": {
          totalTickets: 31,
          metSLA: 28,
          breachedSLA: 3,
          averageFirstResponse: 120,
          averageResolution: 1440,
          complianceRate: 90.3,
        },
        "Account Access": {
          totalTickets: 35,
          metSLA: 31,
          breachedSLA: 4,
          averageFirstResponse: 25,
          averageResolution: 90,
          complianceRate: 88.6,
        },
      },
      byAgent: {
        "Sarah Johnson": {
          totalTickets: 42,
          metSLA: 39,
          breachedSLA: 3,
          averageFirstResponse: 28,
          averageResolution: 245,
          complianceRate: 92.9,
        },
        "Mike Chen": {
          totalTickets: 38,
          metSLA: 35,
          breachedSLA: 3,
          averageFirstResponse: 35,
          averageResolution: 310,
          complianceRate: 92.1,
        },
        "Emma Wilson": {
          totalTickets: 34,
          metSLA: 32,
          breachedSLA: 2,
          averageFirstResponse: 45,
          averageResolution: 280,
          complianceRate: 94.1,
        },
        "David Kim": {
          totalTickets: 42,
          metSLA: 36,
          breachedSLA: 6,
          averageFirstResponse: 65,
          averageResolution: 420,
          complianceRate: 85.7,
        },
      },
      trends: [
        { date: "2024-01-01", complianceRate: 88.5, averageResponse: 52, averageResolution: 340 },
        { date: "2024-01-02", complianceRate: 91.2, averageResponse: 48, averageResolution: 325 },
        { date: "2024-01-03", complianceRate: 89.8, averageResponse: 55, averageResolution: 355 },
        { date: "2024-01-04", complianceRate: 93.1, averageResponse: 42, averageResolution: 310 },
        { date: "2024-01-05", complianceRate: 90.5, averageResponse: 47, averageResolution: 330 },
        { date: "2024-01-08", complianceRate: 92.8, averageResponse: 38, averageResolution: 295 },
        { date: "2024-01-09", complianceRate: 91.7, averageResponse: 45, averageResolution: 315 },
        { date: "2024-01-10", complianceRate: 94.2, averageResponse: 35, averageResolution: 280 },
        { date: "2024-01-11", complianceRate: 89.9, averageResponse: 58, averageResolution: 365 },
        { date: "2024-01-12", complianceRate: 92.5, averageResponse: 41, averageResolution: 305 },
        { date: "2024-01-15", complianceRate: 91.0, averageResponse: 45, averageResolution: 320 },
      ],
    }

    setTimeout(() => {
      setSLARules(mockSLARules)
      setSLAMetrics(mockSLAMetrics)
      setSLAReports(mockSLAReport)
      setIsLoading(false)
    }, 1000)
  }, [])

  // Calculate overview statistics
  const overviewStats = {
    totalRules: slaRules.length,
    activeRules: slaRules.filter((rule) => rule.isActive).length,
    totalTicketsTracked: slaMetrics.length,
    complianceRate: slaReports?.overall.complianceRate || 0,
    atRiskTickets: slaMetrics.filter((metric) => metric.status === "at_risk").length,
    breachedTickets: slaMetrics.filter((metric) => metric.status === "breached").length,
  }

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overviewStats.totalRules}</div>
            <p className="text-xs text-muted-foreground">{overviewStats.activeRules} active rules</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overviewStats.complianceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">{overviewStats.totalTicketsTracked} tickets tracked</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">At Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{overviewStats.atRiskTickets}</div>
            <p className="text-xs text-muted-foreground">Tickets approaching deadline</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Breached</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overviewStats.breachedTickets}</div>
            <p className="text-xs text-muted-foreground">SLA targets missed</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                SLA Management
              </CardTitle>
              <CardDescription>Configure service level agreements and monitor performance</CardDescription>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New SLA Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="rules">SLA Rules</TabsTrigger>
              <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
              <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <SLAConfiguration
                slaRules={slaRules}
                slaMetrics={slaMetrics}
                slaReports={slaReports}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="rules" className="space-y-6">
              <SLARules
                slaRules={slaRules}
                onUpdateRule={(updatedRule) => {
                  setSLARules((prev) => prev.map((rule) => (rule.id === updatedRule.id ? updatedRule : rule)))
                }}
                onDeleteRule={(ruleId) => {
                  setSLARules((prev) => prev.filter((rule) => rule.id !== ruleId))
                }}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <SLAMonitoring
                slaMetrics={slaMetrics}
                slaRules={slaRules}
                onUpdateMetric={(updatedMetric) => {
                  setSLAMetrics((prev) =>
                    prev.map((metric) => (metric.id === updatedMetric.id ? updatedMetric : metric)),
                  )
                }}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <SLAReports slaReports={slaReports} slaRules={slaRules} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create SLA Rule Dialog */}
      <CreateSLARuleDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateRule={(newRule) => {
          setSLARules((prev) => [newRule, ...prev])
        }}
      />
    </div>
  )
}
