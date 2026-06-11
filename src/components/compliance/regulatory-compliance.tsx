"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, FileText, AlertTriangle, CheckCircle, Clock, Download, Eye, RefreshCw, Calendar } from "lucide-react"

export function RegulatoryCompliance() {
  const [selectedRegulation, setSelectedRegulation] = useState("dot")

  const regulations = {
    dot: {
      name: "DOT Regulations",
      description: "Department of Transportation compliance requirements",
      score: 96,
      status: "compliant",
      lastAudit: "2024-01-05",
      nextAudit: "2024-04-05",
      requirements: [
        {
          id: 1,
          name: "Driver Qualification Files",
          status: "compliant",
          score: 100,
          description: "Maintain complete driver qualification files",
          lastCheck: "2024-01-10",
          issues: [],
        },
        {
          id: 2,
          name: "Hours of Service Compliance",
          status: "warning",
          score: 92,
          description: "Monitor and enforce hours of service regulations",
          lastCheck: "2024-01-09",
          issues: ["2 drivers exceeded 14-hour rule last week"],
        },
        {
          id: 3,
          name: "Vehicle Maintenance Records",
          status: "compliant",
          score: 98,
          description: "Maintain detailed vehicle maintenance records",
          lastCheck: "2024-01-08",
          issues: [],
        },
        {
          id: 4,
          name: "Drug and Alcohol Testing",
          status: "compliant",
          score: 100,
          description: "Conduct required drug and alcohol testing",
          lastCheck: "2024-01-07",
          issues: [],
        },
      ],
    },
    fmcsa: {
      name: "FMCSA Requirements",
      description: "Federal Motor Carrier Safety Administration regulations",
      score: 100,
      status: "compliant",
      lastAudit: "2024-01-03",
      nextAudit: "2024-04-03",
      requirements: [
        {
          id: 1,
          name: "Safety Management System",
          status: "compliant",
          score: 100,
          description: "Implement comprehensive safety management system",
          lastCheck: "2024-01-10",
          issues: [],
        },
        {
          id: 2,
          name: "Driver Training Programs",
          status: "compliant",
          score: 100,
          description: "Provide required driver training and certification",
          lastCheck: "2024-01-09",
          issues: [],
        },
        {
          id: 3,
          name: "Accident Reporting",
          status: "compliant",
          score: 100,
          description: "Report accidents within required timeframes",
          lastCheck: "2024-01-08",
          issues: [],
        },
      ],
    },
    state: {
      name: "State Regulations",
      description: "State-specific transportation and safety regulations",
      score: 98,
      status: "compliant",
      lastAudit: "2024-01-02",
      nextAudit: "2024-04-02",
      requirements: [
        {
          id: 1,
          name: "Vehicle Registration",
          status: "compliant",
          score: 100,
          description: "Maintain current vehicle registrations",
          lastCheck: "2024-01-10",
          issues: [],
        },
        {
          id: 2,
          name: "Commercial Driver Licenses",
          status: "compliant",
          score: 96,
          description: "Ensure all drivers have valid CDLs",
          lastCheck: "2024-01-09",
          issues: [],
        },
        {
          id: 3,
          name: "State Safety Inspections",
          status: "compliant",
          score: 98,
          description: "Complete required state safety inspections",
          lastCheck: "2024-01-08",
          issues: [],
        },
      ],
    },
  }

  const currentRegulation = regulations[selectedRegulation as keyof typeof regulations]

  return (
    <div className="space-y-6">
      {/* Regulation Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(regulations).map(([key, regulation]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${selectedRegulation === key ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedRegulation(key)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{regulation.name}</CardTitle>
                {regulation.status === "compliant" ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                )}
              </div>
              <CardDescription className="text-sm">{regulation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Compliance Score</span>
                  <span className="text-lg font-bold text-green-600">{regulation.score}%</span>
                </div>
                <Progress value={regulation.score} className="h-2" />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last audit: {regulation.lastAudit}</span>
                  <Badge variant={regulation.status === "compliant" ? "default" : "secondary"}>
                    {regulation.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Regulation Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                {currentRegulation.name}
              </CardTitle>
              <CardDescription>{currentRegulation.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Run Check
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="requirements" className="space-y-4">
            <TabsList>
              <TabsTrigger value="requirements">Requirements</TabsTrigger>
              <TabsTrigger value="audit-history">Audit History</TabsTrigger>
              <TabsTrigger value="documentation">Documentation</TabsTrigger>
            </TabsList>

            <TabsContent value="requirements" className="space-y-4">
              <div className="grid gap-4">
                {currentRegulation.requirements.map((requirement) => (
                  <Card key={requirement.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {requirement.status === "compliant" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-orange-600" />
                          )}
                          <CardTitle className="text-base">{requirement.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={requirement.status === "compliant" ? "default" : "secondary"}>
                            {requirement.status}
                          </Badge>
                          <span className="text-lg font-bold text-green-600">{requirement.score}%</span>
                        </div>
                      </div>
                      <CardDescription>{requirement.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <Progress value={requirement.score} className="h-2" />
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last checked: {requirement.lastCheck}</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                        {requirement.issues.length > 0 && (
                          <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              <span className="text-sm font-medium text-orange-800">Issues Requiring Attention</span>
                            </div>
                            <ul className="text-sm text-orange-700 space-y-1">
                              {requirement.issues.map((issue, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-orange-600">•</span>
                                  <span>{issue}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="audit-history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Audit History</CardTitle>
                  <CardDescription>Historical audit results and compliance tracking</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      {
                        date: "2024-01-05",
                        type: "Quarterly Audit",
                        score: 96,
                        status: "passed",
                        auditor: "External Auditor",
                        findings: 2,
                      },
                      {
                        date: "2023-10-05",
                        type: "Quarterly Audit",
                        score: 94,
                        status: "passed",
                        auditor: "External Auditor",
                        findings: 3,
                      },
                      {
                        date: "2023-07-05",
                        type: "Quarterly Audit",
                        score: 98,
                        status: "passed",
                        auditor: "External Auditor",
                        findings: 1,
                      },
                    ].map((audit, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{audit.date}</span>
                          </div>
                          <Badge variant="outline">{audit.type}</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="font-bold text-green-600">{audit.score}%</div>
                            <div className="text-xs text-muted-foreground">
                              {audit.findings} finding{audit.findings !== 1 ? "s" : ""}
                            </div>
                          </div>
                          <Badge variant={audit.status === "passed" ? "default" : "destructive"}>{audit.status}</Badge>
                          <Button variant="ghost" size="sm">
                            <FileText className="h-4 w-4 mr-2" />
                            View Report
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Compliance Documentation</CardTitle>
                  <CardDescription>Required documents and certifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {[
                      {
                        name: "Safety Management Plan",
                        type: "Policy Document",
                        lastUpdated: "2024-01-01",
                        status: "current",
                        expiryDate: "2024-12-31",
                      },
                      {
                        name: "Driver Training Manual",
                        type: "Training Material",
                        lastUpdated: "2023-12-15",
                        status: "current",
                        expiryDate: "2024-12-15",
                      },
                      {
                        name: "Vehicle Inspection Procedures",
                        type: "Operational Procedure",
                        lastUpdated: "2023-11-20",
                        status: "current",
                        expiryDate: "2024-11-20",
                      },
                      {
                        name: "Emergency Response Plan",
                        type: "Emergency Procedure",
                        lastUpdated: "2023-10-10",
                        status: "expiring_soon",
                        expiryDate: "2024-01-10",
                      },
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div>
                            <div className="font-medium">{doc.name}</div>
                            <div className="text-sm text-muted-foreground">{doc.type}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right text-sm">
                            <div>Updated: {doc.lastUpdated}</div>
                            <div className="text-muted-foreground">Expires: {doc.expiryDate}</div>
                          </div>
                          <Badge variant={doc.status === "current" ? "default" : "secondary"}>
                            {doc.status === "current" ? "Current" : "Expiring Soon"}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upcoming Compliance Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-orange-600" />
            Upcoming Compliance Tasks
          </CardTitle>
          <CardDescription>Scheduled compliance activities and deadlines</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                task: "Quarterly DOT Audit",
                dueDate: "2024-04-05",
                priority: "high",
                responsible: "Compliance Manager",
              },
              {
                task: "Driver License Verification",
                dueDate: "2024-01-20",
                priority: "medium",
                responsible: "HR Department",
              },
              {
                task: "Vehicle Safety Inspection",
                dueDate: "2024-01-25",
                priority: "medium",
                responsible: "Fleet Manager",
              },
              {
                task: "Update Safety Policies",
                dueDate: "2024-02-01",
                priority: "low",
                responsible: "Safety Officer",
              },
            ].map((task, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{task.task}</div>
                    <div className="text-sm text-muted-foreground">Responsible: {task.responsible}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      task.priority === "high" ? "destructive" : task.priority === "medium" ? "secondary" : "outline"
                    }
                  >
                    {task.priority}
                  </Badge>
                  <div className="text-right">
                    <div className="font-medium">{task.dueDate}</div>
                    <div className="text-xs text-muted-foreground">
                      {Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))}{" "}
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
  )
}
