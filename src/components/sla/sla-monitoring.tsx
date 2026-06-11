"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { AlertTriangle, Clock, CheckCircle, XCircle, Search, RefreshCw, Bell } from "lucide-react"
import { formatDistanceToNow, format, differenceInMinutes } from "date-fns"
import type { SLAMetrics, SLARule } from "@/lib/sla-types"

interface SLAMonitoringProps {
  slaMetrics: SLAMetrics[]
  slaRules: SLARule[]
  onUpdateMetric: (metric: SLAMetrics) => void
  isLoading: boolean
}

export function SLAMonitoring({ slaMetrics, slaRules, onUpdateMetric, isLoading }: SLAMonitoringProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "on_track":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "at_risk":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "breached":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "met":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "on_track":
        return "bg-green-100 text-green-800 border-green-200"
      case "at_risk":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "breached":
        return "bg-red-100 text-red-800 border-red-200"
      case "met":
        return "bg-blue-100 text-blue-800 border-blue-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const calculateTimeRemaining = (dueDate: string) => {
    const now = new Date()
    const due = new Date(dueDate)
    const diffMinutes = differenceInMinutes(due, now)

    if (diffMinutes < 0) {
      return { text: `Overdue by ${Math.abs(diffMinutes)} min`, isOverdue: true }
    } else if (diffMinutes < 60) {
      return { text: `${diffMinutes} min remaining`, isOverdue: false }
    } else {
      const hours = Math.floor(diffMinutes / 60)
      const minutes = diffMinutes % 60
      return { text: `${hours}h ${minutes}m remaining`, isOverdue: false }
    }
  }

  const calculateProgress = (metric: SLAMetrics) => {
    const rule = slaRules.find((r) => r.id === metric.ruleId)
    if (!rule) return 0

    const now = new Date()
    const created = new Date(metric.createdAt)
    const due = new Date(metric.resolutionDue)

    const totalTime = differenceInMinutes(due, created)
    const elapsedTime = differenceInMinutes(now, created)

    return Math.min(100, Math.max(0, (elapsedTime / totalTime) * 100))
  }

  const filteredMetrics = slaMetrics.filter((metric) => {
    const matchesSearch = metric.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || metric.status === statusFilter

    const rule = slaRules.find((r) => r.id === metric.ruleId)
    const matchesPriority = priorityFilter === "all" || rule?.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const acknowledgeNotification = (metricId: string, notificationId: string) => {
    const metric = slaMetrics.find((m) => m.id === metricId)
    if (!metric) return

    const updatedMetric = {
      ...metric,
      notifications: metric.notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, acknowledged: true } : notif,
      ),
    }

    onUpdateMetric(updatedMetric)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-2 bg-gray-200 rounded w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search by ticket ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="on_track">On Track</SelectItem>
            <SelectItem value="at_risk">At Risk</SelectItem>
            <SelectItem value="breached">Breached</SelectItem>
            <SelectItem value="met">Met</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* SLA Metrics List */}
      <div className="space-y-4">
        {filteredMetrics.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No SLA metrics found</h3>
              <p className="text-gray-600">No tickets match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredMetrics.map((metric) => {
            const rule = slaRules.find((r) => r.id === metric.ruleId)
            const progress = calculateProgress(metric)
            const timeRemaining = calculateTimeRemaining(metric.resolutionDue)
            const firstResponseRemaining = calculateTimeRemaining(metric.firstResponseDue)

            return (
              <Card key={metric.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-medium text-gray-600">#{metric.ticketId}</span>
                        <Badge className={`${getStatusColor(metric.status)}`}>
                          {getStatusIcon(metric.status)}
                          <span className="ml-1 capitalize">{metric.status.replace("_", " ")}</span>
                        </Badge>
                        {rule && (
                          <Badge variant="outline" className="text-xs">
                            {rule.name}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {metric.escalationLevel > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            Escalation Level {metric.escalationLevel}
                          </Badge>
                        )}
                        {metric.notifications.some((n) => !n.acknowledged) && (
                          <Button variant="outline" size="sm">
                            <Bell className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Resolution Progress</span>
                        <span className={timeRemaining.isOverdue ? "text-red-600 font-medium" : "text-gray-600"}>
                          {timeRemaining.text}
                        </span>
                      </div>
                      <Progress
                        value={progress}
                        className={`h-2 ${
                          metric.status === "breached"
                            ? "bg-red-100"
                            : metric.status === "at_risk"
                              ? "bg-yellow-100"
                              : "bg-green-100"
                        }`}
                      />
                    </div>

                    {/* SLA Targets */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">First Response:</span>
                          {metric.firstResponseTime ? (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                              {metric.firstResponseTime}m
                            </Badge>
                          ) : (
                            <span
                              className={
                                firstResponseRemaining.isOverdue ? "text-red-600 font-medium" : "text-gray-900"
                              }
                            >
                              {firstResponseRemaining.text}
                            </span>
                          )}
                        </div>
                        {rule && <div className="text-xs text-gray-500">Target: {rule.targets.firstResponse}m</div>}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Resolution:</span>
                          {metric.resolutionTime ? (
                            <Badge variant="outline" className="text-xs">
                              <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                              {Math.floor(metric.resolutionTime / 60)}h {metric.resolutionTime % 60}m
                            </Badge>
                          ) : (
                            <span className={timeRemaining.isOverdue ? "text-red-600 font-medium" : "text-gray-900"}>
                              {timeRemaining.text}
                            </span>
                          )}
                        </div>
                        {rule && (
                          <div className="text-xs text-gray-500">
                            Target: {Math.floor(rule.targets.resolution / 60)}h {rule.targets.resolution % 60}m
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-600">Created:</span>
                          <span className="text-gray-900">
                            {formatDistanceToNow(new Date(metric.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(metric.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>

                    {/* Breaches */}
                    {metric.breaches.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-red-600 mb-2">SLA Breaches</h4>
                        <div className="space-y-2">
                          {metric.breaches.map((breach) => (
                            <div key={breach.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                              <div>
                                <span className="text-sm font-medium text-red-800 capitalize">
                                  {breach.type.replace("_", " ")} breach
                                </span>
                                <p className="text-xs text-red-600">Overdue by {breach.delayMinutes} minutes</p>
                              </div>
                              {!breach.acknowledged && (
                                <Button variant="outline" size="sm" className="text-red-600 border-red-200">
                                  Acknowledge
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notifications */}
                    {metric.notifications.length > 0 && (
                      <div className="pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Notifications</h4>
                        <div className="space-y-2">
                          {metric.notifications.slice(0, 3).map((notification) => (
                            <div
                              key={notification.id}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-2">
                                <Bell className="h-3 w-3 text-gray-500" />
                                <span className="text-sm text-gray-700 capitalize">
                                  {notification.type} notification
                                </span>
                                <span className="text-xs text-gray-500">via {notification.channel}</span>
                              </div>
                              {!notification.acknowledged && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => acknowledgeNotification(metric.id, notification.id)}
                                  className="text-xs"
                                >
                                  Acknowledge
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
