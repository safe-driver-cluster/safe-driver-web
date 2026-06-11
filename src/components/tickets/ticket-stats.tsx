"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, AlertCircle, TrendingUp, TrendingDown, Users, Timer } from "lucide-react"
import type { Ticket } from "./ticket-management"

interface TicketStatsProps {
  tickets: Ticket[]
}

export function TicketStats({ tickets }: TicketStatsProps) {
  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    waiting: tickets.filter((t) => t.status === "waiting").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
    overdue: tickets.filter((t) => t.slaStatus === "overdue").length,
    atRisk: tickets.filter((t) => t.slaStatus === "at-risk").length,
    critical: tickets.filter((t) => t.priority === "critical").length,
    high: tickets.filter((t) => t.priority === "high").length,
  }

  const avgResolutionTime = "2.3 hours" // Mock data
  const satisfactionScore = "4.8/5" // Mock data

  const statCards = [
    {
      title: "Total Tickets",
      value: stats.total,
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "increase" as const,
    },
    {
      title: "Open Tickets",
      value: stats.open,
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "-5%",
      changeType: "decrease" as const,
    },
    {
      title: "In Progress",
      value: stats.inProgress,
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      change: "+8%",
      changeType: "increase" as const,
    },
    {
      title: "Resolved",
      value: stats.resolved,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+15%",
      changeType: "increase" as const,
    },
  ]

  const priorityStats = [
    {
      label: "Critical",
      count: stats.critical,
      color: "bg-red-500",
    },
    {
      label: "High",
      count: stats.high,
      color: "bg-orange-500",
    },
    {
      label: "Overdue",
      count: stats.overdue,
      color: "bg-red-600",
    },
    {
      label: "At Risk",
      count: stats.atRisk,
      color: "bg-yellow-500",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === "increase" ? (
                      <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    )}
                    <span
                      className={`text-sm font-medium ${
                        stat.changeType === "increase" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {stat.change}
                    </span>
                    <span className="text-sm text-gray-500 ml-1">vs last month</span>
                  </div>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority & SLA Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Priority Alerts
            </CardTitle>
            <CardDescription>Tickets requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {priorityStats.map((priority) => (
                <div key={priority.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${priority.color}`} />
                    <span className="text-sm font-medium text-gray-700">{priority.label}</span>
                  </div>
                  <Badge variant={priority.count > 0 ? "destructive" : "secondary"}>{priority.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-blue-600" />
              Performance Metrics
            </CardTitle>
            <CardDescription>Support team performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Avg Resolution Time</span>
                  <span className="text-sm font-bold text-gray-900">{avgResolutionTime}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: "75%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Customer Satisfaction</span>
                  <span className="text-sm font-bold text-gray-900">{satisfactionScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: "96%" }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              Team Workload
            </CardTitle>
            <CardDescription>Current agent assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sarah Johnson", tickets: 8, status: "available" },
                { name: "Mike Chen", tickets: 6, status: "busy" },
                { name: "Emma Wilson", tickets: 4, status: "available" },
                { name: "David Kim", tickets: 10, status: "busy" },
              ].map((agent) => (
                <div key={agent.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        agent.status === "available" ? "bg-green-500" : "bg-yellow-500"
                      }`}
                    />
                    <span className="text-sm font-medium text-gray-700">{agent.name}</span>
                  </div>
                  <Badge variant="outline">{agent.tickets} tickets</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
