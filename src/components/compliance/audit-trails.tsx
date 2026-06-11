"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  User,
  FileText,
  Shield,
  AlertTriangle,
  Settings,
  Database,
} from "lucide-react"

export function AuditTrails() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterUser, setFilterUser] = useState("all")

  const auditLogs = [
    {
      id: 1,
      timestamp: "2024-01-10 14:30:25",
      user: "Sarah Johnson",
      userRole: "Compliance Manager",
      action: "Policy Updated",
      category: "policy",
      description: "Updated Driver Hours Policy - Maximum driving hours changed from 10 to 11 hours",
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      severity: "medium",
      status: "success",
    },
    {
      id: 2,
      timestamp: "2024-01-10 13:45:12",
      user: "Mike Chen",
      userRole: "Safety Officer",
      action: "Audit Completed",
      category: "audit",
      description: "Completed monthly safety audit for December 2023 - 96% compliance score",
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      severity: "low",
      status: "success",
    },
    {
      id: 3,
      timestamp: "2024-01-10 11:20:33",
      user: "System",
      userRole: "Automated System",
      action: "Violation Detected",
      category: "violation",
      description: "Speed violation detected - Vehicle FL-001 exceeded 75 mph limit on I-95",
      ipAddress: "N/A",
      userAgent: "SafeDriver Monitoring System v2.1",
      severity: "high",
      status: "alert",
    },
    {
      id: 4,
      timestamp: "2024-01-10 09:15:44",
      user: "Training System",
      userRole: "Automated System",
      action: "Training Completed",
      category: "training",
      description: "15 drivers completed quarterly safety training module",
      ipAddress: "N/A",
      userAgent: "SafeDriver Training System v1.8",
      severity: "low",
      status: "success",
    },
    {
      id: 5,
      timestamp: "2024-01-09 16:45:21",
      user: "Admin User",
      userRole: "System Administrator",
      action: "User Access Modified",
      category: "security",
      description: "Modified access permissions for user john.doe@company.com",
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      severity: "medium",
      status: "success",
    },
    {
      id: 6,
      timestamp: "2024-01-09 14:22:18",
      user: "Fleet Manager",
      userRole: "Fleet Manager",
      action: "Vehicle Maintenance",
      category: "maintenance",
      description: "Scheduled maintenance completed for vehicle FL-003 - Oil change and brake inspection",
      ipAddress: "192.168.1.103",
      userAgent: "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15",
      severity: "low",
      status: "success",
    },
    {
      id: 7,
      timestamp: "2024-01-09 12:10:55",
      user: "System",
      userRole: "Automated System",
      action: "Backup Completed",
      category: "system",
      description: "Daily database backup completed successfully - 2.3GB archived",
      ipAddress: "N/A",
      userAgent: "SafeDriver Backup Service v1.2",
      severity: "low",
      status: "success",
    },
    {
      id: 8,
      timestamp: "2024-01-09 10:30:12",
      user: "HR Manager",
      userRole: "HR Manager",
      action: "Driver Onboarding",
      category: "hr",
      description: "New driver onboarding completed - License verification and background check passed",
      ipAddress: "192.168.1.104",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      severity: "low",
      status: "success",
    },
  ]

  const getActionIcon = (category: string) => {
    switch (category) {
      case "policy":
        return <FileText className="h-4 w-4 text-blue-600" />
      case "audit":
        return <Shield className="h-4 w-4 text-green-600" />
      case "violation":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "training":
        return <User className="h-4 w-4 text-purple-600" />
      case "security":
        return <Shield className="h-4 w-4 text-orange-600" />
      case "maintenance":
        return <Settings className="h-4 w-4 text-gray-600" />
      case "system":
        return <Database className="h-4 w-4 text-indigo-600" />
      case "hr":
        return <User className="h-4 w-4 text-pink-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

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
      case "success":
        return "default"
      case "alert":
        return "destructive"
      case "warning":
        return "secondary"
      default:
        return "outline"
    }
  }

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || log.category === filterType
    const matchesUser = filterUser === "all" || log.user === filterUser

    return matchesSearch && matchesType && matchesUser
  })

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Audit Trail Filters
          </CardTitle>
          <CardDescription>Search and filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="policy">Policy</SelectItem>
                  <SelectItem value="audit">Audit</SelectItem>
                  <SelectItem value="violation">Violation</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                  <SelectItem value="security">Security</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="hr">HR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">User</label>
              <Select value={filterUser} onValueChange={setFilterUser}>
                <SelectTrigger>
                  <SelectValue placeholder="All users" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                  <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                  <SelectItem value="System">System</SelectItem>
                  <SelectItem value="Admin User">Admin User</SelectItem>
                  <SelectItem value="Fleet Manager">Fleet Manager</SelectItem>
                  <SelectItem value="HR Manager">HR Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Advanced
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.length}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Severity</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredLogs.filter((log) => log.severity === "high").length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Changes</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.filter((log) => log.category === "policy").length}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Events</CardTitle>
            <Settings className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredLogs.filter((log) => log.user === "System").length}</div>
            <p className="text-xs text-muted-foreground">Automated actions</p>
          </CardContent>
        </Card>
      </div>

      {/* Audit Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Audit Logs
          </CardTitle>
          <CardDescription>Detailed audit trail of all system activities and changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getActionIcon(log.category)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{log.action}</span>
                        <Badge variant={getSeverityColor(log.severity as any)}>{log.severity}</Badge>
                        <Badge variant={getStatusColor(log.status as any)}>{log.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>{log.timestamp}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          <span>
                            {log.user} ({log.userRole})
                          </span>
                        </div>
                        <div>IP: {log.ipAddress}</div>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Details
                  </Button>
                </div>

                {log.userAgent !== "N/A" && (
                  <div className="text-xs text-muted-foreground bg-gray-50 p-2 rounded">
                    <strong>User Agent:</strong> {log.userAgent}
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit logs found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Audit Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Audit Configuration
          </CardTitle>
          <CardDescription>Configure audit logging settings and retention policies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Log Retention</label>
              <Select defaultValue="365">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="180">180 days</SelectItem>
                  <SelectItem value="365">1 year</SelectItem>
                  <SelectItem value="1095">3 years</SelectItem>
                  <SelectItem value="2555">7 years</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Log Level</label>
              <Select defaultValue="all">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical Only</SelectItem>
                  <SelectItem value="high">High & Critical</SelectItem>
                  <SelectItem value="medium">Medium & Above</SelectItem>
                  <SelectItem value="all">All Events</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Export Format</label>
              <Select defaultValue="csv">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="xml">XML</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 mt-4">
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Current View
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Configure Alerts
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
