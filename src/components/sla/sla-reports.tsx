"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, Download, BarChart3, PieChartIcon, Clock, CheckCircle, XCircle } from "lucide-react"
import type { SLAReport, SLARule } from "@/lib/sla-types"

interface SLAReportsProps {
  slaReports: SLAReport | null
  slaRules: SLARule[]
  isLoading: boolean
}

export function SLAReports({ slaReports, slaRules, isLoading }: SLAReportsProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("last-30-days")
  const [selectedMetric, setSelectedMetric] = useState("compliance")

  const COLORS = {
    primary: "#3B82F6",
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    secondary: "#6B7280",
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    } else {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    }
  }

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const complianceData =
    slaReports?.trends.map((trend) => ({
      date: new Date(trend.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      compliance: trend.complianceRate,
      response: trend.averageResponse,
      resolution: trend.averageResolution,
    })) || []

  const priorityData = slaReports
    ? Object.entries(slaReports.byPriority).map(([priority, data]) => ({
        name: priority.charAt(0).toUpperCase() + priority.slice(1),
        value: data.complianceRate,
        total: data.totalTickets,
        met: data.metSLA,
        breached: data.breachedSLA,
      }))
    : []

  const categoryData = slaReports
    ? Object.entries(slaReports.byCategory).map(([category, data]) => ({
        name: category,
        compliance: data.complianceRate,
        avgResponse: data.averageFirstResponse,
        avgResolution: data.averageResolution,
        total: data.totalTickets,
      }))
    : []

  const agentData = slaReports
    ? Object.entries(slaReports.byAgent).map(([agent, data]) => ({
        name: agent,
        compliance: data.complianceRate,
        tickets: data.totalTickets,
        avgResponse: data.averageFirstResponse,
        avgResolution: data.averageResolution,
      }))
    : []

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-6 bg-gray-200 rounded w-48" />
                <div className="h-32 bg-gray-200 rounded" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!slaReports) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No report data available</h3>
          <p className="text-gray-600">Generate your first SLA report to see analytics.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-7-days">Last 7 Days</SelectItem>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-90-days">Last 90 Days</SelectItem>
              <SelectItem value="this-month">This Month</SelectItem>
              <SelectItem value="last-month">Last Month</SelectItem>
              <SelectItem value="this-quarter">This Quarter</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedMetric} onValueChange={setSelectedMetric}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="compliance">Compliance Rate</SelectItem>
              <SelectItem value="response-time">Response Time</SelectItem>
              <SelectItem value="resolution-time">Resolution Time</SelectItem>
              <SelectItem value="escalations">Escalations</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Overall Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(slaReports.overall.complianceRate)}
            </div>
            <p className="text-xs text-muted-foreground">
              {slaReports.overall.metSLA} of {slaReports.overall.totalTickets} tickets
            </p>
            <Progress value={slaReports.overall.complianceRate} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg First Response</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatTime(slaReports.overall.averageFirstResponse)}
            </div>
            <p className="text-xs text-muted-foreground">Across all priority levels</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resolution</CardTitle>
            <CheckCircle className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{formatTime(slaReports.overall.averageResolution)}</div>
            <p className="text-xs text-muted-foreground">End-to-end resolution time</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SLA Breaches</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{slaReports.overall.breachedSLA}</div>
            <p className="text-xs text-muted-foreground">
              {formatPercentage((slaReports.overall.breachedSLA / slaReports.overall.totalTickets) * 100)} of total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Trends */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            SLA Compliance Trends
          </CardTitle>
          <CardDescription>Daily compliance rate and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={complianceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    name === "compliance" ? `${value}%` : `${value}m`,
                    name === "compliance"
                      ? "Compliance Rate"
                      : name === "response"
                        ? "Avg Response Time"
                        : "Avg Resolution Time",
                  ]}
                />
                <Line type="monotone" dataKey="compliance" stroke={COLORS.success} strokeWidth={2} name="compliance" />
                {selectedMetric === "response-time" && (
                  <Line type="monotone" dataKey="response" stroke={COLORS.primary} strokeWidth={2} name="response" />
                )}
                {selectedMetric === "resolution-time" && (
                  <Line
                    type="monotone"
                    dataKey="resolution"
                    stroke={COLORS.warning}
                    strokeWidth={2}
                    name="resolution"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Performance by Priority */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Compliance by Priority
            </CardTitle>
            <CardDescription>SLA performance across different priority levels</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.name === "Critical"
                            ? COLORS.danger
                            : entry.name === "High"
                              ? COLORS.warning
                              : entry.name === "Medium"
                                ? COLORS.primary
                                : COLORS.success
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance by Category
            </CardTitle>
            <CardDescription>Average response and resolution times by ticket category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "compliance" ? `${value}%` : `${value}m`,
                      name === "compliance"
                        ? "Compliance Rate"
                        : name === "avgResponse"
                          ? "Avg Response Time"
                          : "Avg Resolution Time",
                    ]}
                  />
                  <Bar dataKey="compliance" fill={COLORS.success} name="compliance" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agent Performance */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Agent Performance
          </CardTitle>
          <CardDescription>Individual agent SLA compliance and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {agentData.map((agent) => (
              <div key={agent.name} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900">{agent.name}</h4>
                    <p className="text-sm text-gray-600">{agent.tickets} tickets handled</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">{formatPercentage(agent.compliance)}</div>
                    <p className="text-xs text-gray-500">Compliance Rate</p>
                  </div>
                </div>

                <Progress value={agent.compliance} className="mb-3 h-2" />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Avg Response:</span>
                    <span className="ml-2 font-medium">{formatTime(agent.avgResponse)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Avg Resolution:</span>
                    <span className="ml-2 font-medium">{formatTime(agent.avgResolution)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Detailed Performance Metrics</CardTitle>
          <CardDescription>Comprehensive breakdown of SLA performance across all dimensions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Category</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Total Tickets</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">SLA Met</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Breached</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Compliance</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Response</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">Avg Resolution</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(slaReports.byCategory).map(([category, data]) => (
                  <tr key={category} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium">{category}</td>
                    <td className="py-3 px-4 text-right">{data.totalTickets}</td>
                    <td className="py-3 px-4 text-right text-green-600">{data.metSLA}</td>
                    <td className="py-3 px-4 text-right text-red-600">{data.breachedSLA}</td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        className={`${
                          data.complianceRate >= 95
                            ? "bg-green-100 text-green-800"
                            : data.complianceRate >= 90
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                        }`}
                      >
                        {formatPercentage(data.complianceRate)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">{formatTime(data.averageFirstResponse)}</td>
                    <td className="py-3 px-4 text-right">{formatTime(data.averageResolution)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
