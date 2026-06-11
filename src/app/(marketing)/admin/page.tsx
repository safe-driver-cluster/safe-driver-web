"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Download,
  Eye,
  Phone,
  MapPin,
  Clock,
  Users,
  Bus,
  FileText,
  Activity,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data for demonstration
const mockAlerts = [
  {
    id: "ALT001",
    type: "drowsiness",
    severity: "high",
    driverName: "Kamal Perera",
    busNumber: "NB-1234",
    route: "Colombo - Kandy",
    location: "Kadawatha Junction",
    timestamp: "2025-01-09 14:30:25",
    status: "active",
    duration: "45 seconds",
    escalationLevel: 3,
  },
  {
    id: "ALT002",
    type: "phone_usage",
    severity: "medium",
    driverName: "Sunil Silva",
    busNumber: "WP-5678",
    route: "Galle - Matara",
    location: "Hikkaduwa",
    timestamp: "2025-01-09 14:25:10",
    status: "resolved",
    duration: "12 seconds",
    escalationLevel: 1,
  },
  {
    id: "ALT003",
    type: "distraction",
    severity: "low",
    driverName: "Nimal Fernando",
    busNumber: "CP-9012",
    route: "Negombo - Colombo",
    location: "Ja-Ela",
    timestamp: "2025-01-09 14:20:45",
    status: "acknowledged",
    duration: "8 seconds",
    escalationLevel: 1,
  },
]

const mockDrivers = [
  {
    id: "DRV001",
    name: "Kamal Perera",
    licenseNumber: "B1234567",
    busNumber: "NB-1234",
    route: "Colombo - Kandy",
    status: "on_duty",
    alertCount: 3,
    lastAlert: "2025-01-09 14:30:25",
  },
  {
    id: "DRV002",
    name: "Sunil Silva",
    licenseNumber: "B2345678",
    busNumber: "WP-5678",
    route: "Galle - Matara",
    status: "on_duty",
    alertCount: 1,
    lastAlert: "2025-01-09 14:25:10",
  },
  {
    id: "DRV003",
    name: "Nimal Fernando",
    licenseNumber: "B3456789",
    busNumber: "CP-9012",
    route: "Negombo - Colombo",
    status: "off_duty",
    alertCount: 0,
    lastAlert: "2025-01-08 18:45:30",
  },
]

export default function AdminDashboard() {
  const [alerts, setAlerts] = useState(mockAlerts)
  const [drivers, setDrivers] = useState(mockDrivers)
  const [selectedAlert, setSelectedAlert] = useState(null)
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "warning"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "destructive"
      case "acknowledged":
        return "warning"
      case "resolved":
        return "success"
      default:
        return "secondary"
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const statusMatch = filterStatus === "all" || alert.status === filterStatus
    const severityMatch = filterSeverity === "all" || alert.severity === filterSeverity
    return statusMatch && severityMatch
  })

  const generateReport = (type: string) => {
    // Mock report generation
    const reportData = {
      type,
      generatedAt: new Date().toISOString(),
      data: type === "alerts" ? alerts : drivers,
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `safedriver-${type}-report-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">SafeDriver Authority Dashboard</h1>
        <p className="text-neutral-600">Real-time monitoring and management of driver safety alerts</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {alerts.filter((a) => a.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">+2 from last hour</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Drivers on Duty</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {drivers.filter((d) => d.status === "on_duty").length}
            </div>
            <p className="text-xs text-muted-foreground">Out of {drivers.length} total drivers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
            <Bus className="h-4 w-4 text-tech-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-tech-600">24</div>
            <p className="text-xs text-muted-foreground">Across 8 routes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Activity className="h-4 w-4 text-safety-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-safety-600">99.8%</div>
            <p className="text-xs text-muted-foreground">+0.2% from last month</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="alerts">Live Alerts</TabsTrigger>
          <TabsTrigger value="drivers">Driver Management</TabsTrigger>
          <TabsTrigger value="reports">Reports & Analytics</TabsTrigger>
          <TabsTrigger value="settings">System Settings</TabsTrigger>
          <TabsTrigger value="proposal">Project Details</TabsTrigger>
        </TabsList>

        {/* Live Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Real-Time Safety Alerts</CardTitle>
                  <CardDescription>Monitor and manage driver safety incidents</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="acknowledged">Acknowledged</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4 hover:bg-neutral-50 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <Badge variant={getSeverityColor(alert.severity)}>{alert.severity.toUpperCase()}</Badge>
                        <Badge variant={getStatusColor(alert.status)}>
                          {alert.status.replace("_", " ").toUpperCase()}
                        </Badge>
                        <span className="text-sm text-neutral-500">#{alert.id}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                        {alert.status === "active" && (
                          <Button size="sm" variant="destructive">
                            <Phone className="h-4 w-4 mr-1" />
                            Contact Driver
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-neutral-900">{alert.driverName}</p>
                        <p className="text-neutral-600">Bus: {alert.busNumber}</p>
                        <p className="text-neutral-600">Route: {alert.route}</p>
                      </div>
                      <div>
                        <p className="flex items-center gap-1 text-neutral-600">
                          <MapPin className="h-3 w-3" />
                          {alert.location}
                        </p>
                        <p className="flex items-center gap-1 text-neutral-600">
                          <Clock className="h-3 w-3" />
                          {alert.timestamp}
                        </p>
                        <p className="text-neutral-600">Duration: {alert.duration}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Alert Type: {alert.type.replace("_", " ")}</p>
                        <p className="text-neutral-600">Escalation Level: {alert.escalationLevel}</p>
                        {alert.status === "active" && (
                          <p className="text-destructive font-medium">⚠️ Requires Immediate Attention</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Driver Management Tab */}
        <TabsContent value="drivers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Driver Management</CardTitle>
              <CardDescription>Monitor driver performance and safety metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {drivers.map((driver) => (
                  <div key={driver.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-lg">{driver.name}</h3>
                        <p className="text-sm text-neutral-600">License: {driver.licenseNumber}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={driver.status === "on_duty" ? "success" : "secondary"}>
                          {driver.status.replace("_", " ").toUpperCase()}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-neutral-600">Bus: {driver.busNumber}</p>
                        <p className="text-neutral-600">Route: {driver.route}</p>
                      </div>
                      <div>
                        <p className="text-neutral-600">Total Alerts: {driver.alertCount}</p>
                        <p className="text-neutral-600">Last Alert: {driver.lastAlert}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Activity className="h-4 w-4 mr-1" />
                          View History
                        </Button>
                        <Button size="sm" variant="outline">
                          <Phone className="h-4 w-4 mr-1" />
                          Contact
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reports & Analytics Tab */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Reports</CardTitle>
                <CardDescription>Download comprehensive safety and performance reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => generateReport("alerts")} className="w-full justify-start">
                  <Download className="h-4 w-4 mr-2" />
                  Download Alert Report
                </Button>
                <Button onClick={() => generateReport("drivers")} className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Driver Performance Report
                </Button>
                <Button onClick={() => generateReport("daily")} className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Daily Summary
                </Button>
                <Button onClick={() => generateReport("monthly")} className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Monthly Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Statistics</CardTitle>
                <CardDescription>Key performance indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Alerts Today</span>
                  <span className="font-bold text-destructive">12</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Average Response Time</span>
                  <span className="font-bold text-primary">2.3 min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>System Uptime</span>
                  <span className="font-bold text-safety-600">99.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Active Monitoring Units</span>
                  <span className="font-bold text-tech-600">24/25</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Visual representation of safety metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold">Alert Types Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Drowsiness</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-neutral-200 rounded-full">
                          <div className="w-16 h-2 bg-destructive rounded-full"></div>
                        </div>
                        <span className="text-sm">67%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Phone Usage</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-neutral-200 rounded-full">
                          <div className="w-8 h-2 bg-warning-500 rounded-full"></div>
                        </div>
                        <span className="text-sm">25%</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Distraction</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-neutral-200 rounded-full">
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        <span className="text-sm">8%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold">Route Efficiency Scores</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Colombo - Kandy</span>
                      <span className="text-sm font-medium text-warning-600">82%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Galle - Matara</span>
                      <span className="text-sm font-medium text-safety-600">95%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Negombo - Colombo</span>
                      <span className="text-sm font-medium text-safety-600">99%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alert Thresholds</CardTitle>
                <CardDescription>Configure system sensitivity and alert parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Drowsiness Detection Sensitivity</label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Alert Escalation Time (seconds)</label>
                  <Input type="number" defaultValue="15" />
                </div>
                <div>
                  <label className="text-sm font-medium">Emergency Contact Numbers</label>
                  <Input placeholder="+94 11 123 4567" />
                </div>
                <Button className="w-full">Save Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Monitor system health and connectivity</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Database Connection</span>
                  <Badge variant="success">Online</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Cloud Services</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>SMS Gateway</span>
                  <Badge variant="success">Connected</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Mobile App API</span>
                  <Badge variant="success">Running</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Hardware Units</span>
                  <Badge variant="warning">24/25 Online</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Project Details Tab */}
        <TabsContent value="proposal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SafeDriver Project Proposal</CardTitle>
              <CardDescription>Comprehensive project documentation and specifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="prose max-w-none">
                <h3 className="text-xl font-bold mb-4">Project Overview</h3>
                <p className="text-neutral-700 mb-4">
                  The SafeDriver system is an AI-powered real-time driver monitoring and accident prevention solution
                  designed specifically for public transport in Sri Lanka. This comprehensive system combines advanced
                  computer vision, embedded hardware, and cloud connectivity to enhance road safety.
                </p>

                <h3 className="text-xl font-bold mb-4">System Architecture</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Hardware Components</h4>
                    <ul className="text-sm space-y-1 text-neutral-600">
                      <li>• Raspberry Pi 4 Model B (4GB RAM)</li>
                      <li>• High-resolution USB camera (1080p)</li>
                      <li>• GPS module for location tracking</li>
                      <li>• Audio buzzer for immediate alerts</li>
                      <li>• 4G/WiFi connectivity module</li>
                      <li>• Power management system</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Software Stack</h4>
                    <ul className="text-sm space-y-1 text-neutral-600">
                      <li>• Python with OpenCV for image processing</li>
                      <li>• MediaPipe for facial landmark detection</li>
                      <li>• TensorFlow Lite for AI model inference</li>
                      <li>• Firebase for real-time database</li>
                      <li>• React Native for mobile applications</li>
                      <li>• Next.js for web dashboard</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Key Features & Functionality</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-primary-700">Driver Monitoring</h4>
                    <ul className="text-sm space-y-1 text-neutral-600">
                      <li>• Real-time drowsiness detection</li>
                      <li>• Eye closure analysis (PERCLOS)</li>
                      <li>• Head pose estimation</li>
                      <li>• Blink pattern analysis</li>
                      <li>• Attention deviation tracking</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-tech-700">Distraction Detection</h4>
                    <ul className="text-sm space-y-1 text-neutral-600">
                      <li>• Mobile phone usage detection</li>
                      <li>• Hand gesture recognition</li>
                      <li>• Multi-object tracking</li>
                      <li>• Behavioral pattern analysis</li>
                      <li>• Context-aware alerts</li>
                    </ul>
                  </div>
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 text-warning-700">Alert System</h4>
                    <ul className="text-sm space-y-1 text-neutral-600">
                      <li>• Graduated alert escalation</li>
                      <li>• Audio and visual warnings</li>
                      <li>• SMS notifications to authorities</li>
                      <li>• Real-time passenger updates</li>
                      <li>• Emergency response protocols</li>
                    </ul>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Authority Panel Features</h3>
                <div className="border rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Real-time Monitoring</h4>
                      <ul className="text-sm space-y-1 text-neutral-600">
                        <li>• Live alert dashboard</li>
                        <li>• Driver status tracking</li>
                        <li>• Route-wise safety metrics</li>
                        <li>• System health monitoring</li>
                        <li>• GPS location tracking</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Reporting & Analytics</h4>
                      <ul className="text-sm space-y-1 text-neutral-600">
                        <li>• Comprehensive incident reports</li>
                        <li>• Driver performance analytics</li>
                        <li>• Safety trend analysis</li>
                        <li>• Compliance reporting</li>
                        <li>• Data export capabilities</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Technical Specifications</h3>
                <div className="border rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Performance Metrics</h4>
                      <ul className="text-sm space-y-1 text-neutral-600">
                        <li>• Processing speed: 30 FPS</li>
                        <li>• Detection accuracy: {">"}95%</li>
                        <li>• Response time: {"<"}2 seconds</li>
                        <li>• System uptime: 99.5%</li>
                        <li>• Power consumption: {"<"}15W</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Connectivity</h4>
                      <ul className="text-sm space-y-1 text-neutral-600">
                        <li>• 4G LTE connectivity</li>
                        <li>• WiFi backup connection</li>
                        <li>• GPS positioning accuracy: ±3m</li>
                        <li>• Cloud synchronization</li>
                        <li>• Offline operation capability</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold mb-4">Implementation Timeline</h3>
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-primary-600"></div>
                    <span className="text-sm">
                      <strong>Phase 1:</strong> Requirements & Design (May 11-25, 2025)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-tech-600"></div>
                    <span className="text-sm">
                      <strong>Phase 2:</strong> System Architecture (May 26 - Jun 8, 2025)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-warning-600"></div>
                    <span className="text-sm">
                      <strong>Phase 3:</strong> AI Development (Jun 9 - Jul 20, 2025)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-safety-600"></div>
                    <span className="text-sm">
                      <strong>Phase 4:</strong> Hardware Integration (Jul 21 - Sep 28, 2025)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-alert-600"></div>
                    <span className="text-sm">
                      <strong>Phase 5:</strong> Testing & Calibration (Sep 29 - Dec 12, 2025)
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-neutral-600"></div>
                    <span className="text-sm">
                      <strong>Phase 6:</strong> Documentation (Dec 13, 2025 - Apr 24, 2026)
                    </span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button onClick={() => generateReport("proposal")} className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Download Full Proposal
                  </Button>
                  <Button variant="outline" onClick={() => generateReport("technical-specs")}>
                    <FileText className="h-4 w-4 mr-2" />
                    Technical Specifications
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
