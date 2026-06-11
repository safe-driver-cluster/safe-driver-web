"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Download, Eye } from "lucide-react"

export function ComplianceOverview() {
  const complianceMetrics = [
    {
      category: "DOT Regulations",
      score: 96,
      status: "compliant",
      lastCheck: "2024-01-10",
      issues: 1,
    },
    {
      category: "FMCSA Requirements",
      score: 100,
      status: "compliant",
      lastCheck: "2024-01-09",
      issues: 0,
    },
    {
      category: "State Regulations",
      score: 98,
      status: "compliant",
      lastCheck: "2024-01-08",
      issues: 0,
    },
    {
      category: "Safety Standards",
      score: 94,
      status: "warning",
      lastCheck: "2024-01-07",
      issues: 2,
    },
    {
      category: "Environmental",
      score: 100,
      status: "compliant",
      lastCheck: "2024-01-06",
      issues: 0,
    },
  ]

  const recentActivities = [
    {
      id: 1,
      type: "policy_update",
      title: "Driver Hours Policy Updated",
      description: "Updated maximum driving hours per day from 10 to 11 hours",
      timestamp: "2024-01-10 14:30",
      user: "Sarah Johnson",
      status: "completed",
    },
    {
      id: 2,
      type: "audit",
      title: "Monthly Safety Audit Completed",
      description: "Comprehensive safety audit for December 2023",
      timestamp: "2024-01-09 16:45",
      user: "Mike Chen",
      status: "completed",
    },
    {
      id: 3,
      type: "violation",
      title: "Speed Violation Detected",
      description: "Vehicle FL-001 exceeded speed limit on I-95",
      timestamp: "2024-01-09 11:20",
      user: "System",
      status: "investigating",
    },
    {
      id: 4,
      type: "training",
      title: "Safety Training Completed",
      description: "15 drivers completed quarterly safety training",
      timestamp: "2024-01-08 09:15",
      user: "Training System",
      status: "completed",
    },
  ]

  const upcomingDeadlines = [
    {
      id: 1,
      title: "Annual DOT Inspection",
      dueDate: "2024-01-15",
      priority: "high",
      responsible: "Fleet Manager",
    },
    {
      id: 2,
      title: "Driver License Renewals",
      dueDate: "2024-01-20",
      priority: "medium",
      responsible: "HR Department",
    },
    {
      id: 3,
      title: "Vehicle Registration Updates",
      dueDate: "2024-01-25",
      priority: "medium",
      responsible: "Fleet Manager",
    },
    {
      id: 4,
      title: "Safety Training Refresh",
      dueDate: "2024-02-01",
      priority: "low",
      responsible: "Training Coordinator",
    },
  ]

  return (
    <div className="space-y-6">
      {/* Compliance Score Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-green-600" />
              Overall Compliance Score
            </CardTitle>
            <CardDescription>Current compliance status across all regulatory categories</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">98.5%</div>
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <TrendingUp className="h-4 w-4 text-green-600" />
                +2.1% from last month
              </div>
            </div>
            <Progress value={98.5} className="h-3" />
            <div className="flex justify-between text-sm">
              <span>Target: 95%</span>
              <span className="text-green-600 font-medium">Exceeding Target</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Compliance Issues
            </CardTitle>
            <CardDescription>Active compliance issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-xs text-muted-foreground">High Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">1</div>
                <div className="text-xs text-muted-foreground">Medium Priority</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">0</div>
                <div className="text-xs text-muted-foreground">Low Priority</div>
              </div>
            </div>
            <Button className="w-full" variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              View All Issues
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Categories</CardTitle>
          <CardDescription>Detailed compliance status by regulatory category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceMetrics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    {metric.status === "compliant" ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-orange-600" />
                    )}
                    <span className="font-medium">{metric.category}</span>
                  </div>
                  <Badge variant={metric.status === "compliant" ? "default" : "secondary"}>
                    {metric.status === "compliant" ? "Compliant" : "Needs Attention"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-lg">{metric.score}%</div>
                    <div className="text-xs text-muted-foreground">Last check: {metric.lastCheck}</div>
                  </div>
                  <div className="w-24">
                    <Progress value={metric.score} className="h-2" />
                  </div>
                  {metric.issues > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {metric.issues} issue{metric.issues > 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest compliance-related activities and updates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    {activity.type === "policy_update" && <FileText className="h-4 w-4 text-blue-600" />}
                    {activity.type === "audit" && <Shield className="h-4 w-4 text-green-600" />}
                    {activity.type === "violation" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                    {activity.type === "training" && <CheckCircle className="h-4 w-4 text-purple-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{activity.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">{activity.description}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <span>{activity.timestamp}</span>
                      <span>•</span>
                      <span>{activity.user}</span>
                    </div>
                  </div>
                  <Badge variant={activity.status === "completed" ? "default" : "secondary"} className="text-xs">
                    {activity.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>Important compliance deadlines and requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingDeadlines.map((deadline) => (
                <div key={deadline.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{deadline.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">Responsible: {deadline.responsible}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        deadline.priority === "high"
                          ? "destructive"
                          : deadline.priority === "medium"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {deadline.priority}
                    </Badge>
                    <div className="text-right">
                      <div className="text-sm font-medium">{deadline.dueDate}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.ceil(
                          (new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                        )}{" "}
                        days
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common compliance management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
              <Download className="h-6 w-6" />
              <span>Generate Compliance Report</span>
            </Button>
            <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
              <Shield className="h-6 w-6" />
              <span>Run Compliance Check</span>
            </Button>
            <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
              <FileText className="h-6 w-6" />
              <span>Update Policies</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
