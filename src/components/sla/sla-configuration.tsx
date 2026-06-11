"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Settings, Clock, AlertTriangle, CheckCircle, TrendingUp, Users, Bell, Target } from "lucide-react"
import type { SLARule, SLAMetrics, SLAReport } from "@/lib/sla-types"

interface SLAConfigurationProps {
  slaRules: SLARule[]
  slaMetrics: SLAMetrics[]
  slaReports: SLAReport | null
  isLoading: boolean
}

export function SLAConfiguration({ slaRules, slaMetrics, slaReports, isLoading }: SLAConfigurationProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }

  const activeRules = slaRules.filter((rule) => rule.isActive)
  const criticalRules = activeRules.filter((rule) => rule.priority === "critical")
  const rulesWithEscalation = activeRules.filter((rule) => rule.escalationRules.length > 0)
  const rulesWithNotifications = activeRules.filter((rule) => rule.notifications.length > 0)

  const currentlyAtRisk = slaMetrics.filter((metric) => metric.status === "at_risk").length
  const currentlyBreached = slaMetrics.filter((metric) => metric.status === "breached").length
  const escalatedTickets = slaMetrics.filter((metric) => metric.escalationLevel > 0).length

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="h-20 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRules.length}</div>
            <p className="text-xs text-muted-foreground">{slaRules.length - activeRules.length} inactive</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Rules</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalRules.length}</div>
            <p className="text-xs text-muted-foreground">High priority coverage</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Escalation Rules</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{rulesWithEscalation.length}</div>
            <p className="text-xs text-muted-foreground">Rules with escalation</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{rulesWithNotifications.length}</div>
            <p className="text-xs text-muted-foreground">Rules with alerts</p>
          </CardContent>
        </Card>
      </div>

      {/* Current Status */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Current SLA Status
          </CardTitle>
          <CardDescription>Real-time overview of SLA performance and alerts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-600">{currentlyAtRisk}</div>
              <p className="text-sm text-yellow-700">Tickets At Risk</p>
              <p className="text-xs text-yellow-600 mt-1">Approaching SLA deadline</p>
            </div>

            <div className="text-center p-6 bg-red-50 rounded-lg">
              <Clock className="h-8 w-8 text-red-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-red-600">{currentlyBreached}</div>
              <p className="text-sm text-red-700">SLA Breaches</p>
              <p className="text-xs text-red-600 mt-1">Immediate attention required</p>
            </div>

            <div className="text-center p-6 bg-orange-50 rounded-lg">
              <Users className="h-8 w-8 text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{escalatedTickets}</div>
              <p className="text-sm text-orange-700">Escalated Tickets</p>
              <p className="text-xs text-orange-600 mt-1">Higher-level support engaged</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SLA Rules Summary */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SLA Rules Configuration
          </CardTitle>
          <CardDescription>Overview of configured SLA rules and their targets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeRules.map((rule) => (
              <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{rule.name}</h4>
                    <p className="text-sm text-gray-600">{rule.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs capitalize">
                      {rule.priority}
                    </Badge>
                    {rule.customerTier && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {rule.customerTier}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded">
                    <Clock className="h-4 w-4 text-blue-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-blue-700">First Response</div>
                    <div className="text-lg font-bold text-blue-600">{formatTime(rule.targets.firstResponse)}</div>
                  </div>

                  <div className="text-center p-3 bg-green-50 rounded">
                    <CheckCircle className="h-4 w-4 text-green-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-green-700">Resolution</div>
                    <div className="text-lg font-bold text-green-600">{formatTime(rule.targets.resolution)}</div>
                  </div>

                  <div className="text-center p-3 bg-orange-50 rounded">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <div className="text-sm font-medium text-orange-700">Escalation</div>
                    <div className="text-lg font-bold text-orange-600">{formatTime(rule.targets.escalation)}</div>
                  </div>
                </div>

                {rule.escalationRules.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {rule.escalationRules.length} escalation level(s) configured
                      </span>
                    </div>
                  </div>
                )}

                {rule.notifications.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {rule.notifications.length} notification rule(s) active
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      {slaReports && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performance Summary
            </CardTitle>
            <CardDescription>Recent SLA performance metrics and trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Compliance</span>
                    <span className="text-sm font-bold text-green-600">
                      {slaReports.overall.complianceRate.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={slaReports.overall.complianceRate} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Critical Priority</span>
                    <span className="text-sm font-bold text-red-600">
                      {slaReports.byPriority.critical?.complianceRate.toFixed(1) || 0}%
                    </span>
                  </div>
                  <Progress value={slaReports.byPriority.critical?.complianceRate || 0} className="h-2" />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">High Priority</span>
                    <span className="text-sm font-bold text-orange-600">
                      {slaReports.byPriority.high?.complianceRate.toFixed(1) || 0}%
                    </span>
                  </div>
                  <Progress value={slaReports.byPriority.high?.complianceRate || 0} className="h-2" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(slaReports.overall.averageFirstResponse)}
                  </div>
                  <p className="text-sm text-gray-600">Average First Response</p>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatTime(slaReports.overall.averageResolution)}
                  </div>
                  <p className="text-sm text-gray-600">Average Resolution Time</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
