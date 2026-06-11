"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Radar,
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Eye,
  Download,
  Filter,
  Search,
  RefreshCw,
  Settings,
  Calendar,
  Target,
  Zap,
} from "lucide-react"
import { regulatoryMonitoringService } from "@/lib/regulatory-monitoring-service"
import type {
  RegulatoryChange,
  ImpactAssessment,
  MonitoringAlert,
  RegulatoryTrend,
  ComplianceGap,
} from "@/lib/regulatory-monitoring-types"

export function RegulatoryMonitoring() {
  const [changes, setChanges] = useState<RegulatoryChange[]>([])
  const [assessments, setAssessments] = useState<ImpactAssessment[]>([])
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([])
  const [trends, setTrends] = useState<RegulatoryTrend[]>([])
  const [gaps, setGaps] = useState<ComplianceGap[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedChange, setSelectedChange] = useState<RegulatoryChange | null>(null)
  const [filters, setFilters] = useState({
    category: "",
    severity: "",
    status: "",
    search: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [changesData, assessmentsData, alertsData, trendsData] = await Promise.all([
        regulatoryMonitoringService.getRegulatoryChanges(),
        regulatoryMonitoringService.getImpactAssessments(),
        regulatoryMonitoringService.getMonitoringAlerts(),
        regulatoryMonitoringService.getRegulatoryTrends(),
      ])

      setChanges(changesData)
      setAssessments(assessmentsData)
      setAlerts(alertsData)
      setTrends(trendsData)

      // Load gaps for changes with assessments
      const allGaps: ComplianceGap[] = []
      for (const change of changesData.filter((c) => c.impactAssessment)) {
        const changeGaps = await regulatoryMonitoringService.identifyComplianceGaps(change.id)
        allGaps.push(...changeGaps)
      }
      setGaps(allGaps)
    } catch (error) {
      console.error("Error loading regulatory monitoring data:", error)
    } finally {
      setLoading(false)
    }
  }

  const runMonitoring = async () => {
    setLoading(true)
    try {
      await regulatoryMonitoringService.monitorRegulatorySources()
      await loadData()
    } catch (error) {
      console.error("Error running monitoring:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredChanges = changes.filter((change) => {
    if (filters.category && change.category !== filters.category) return false
    if (filters.severity && change.severity !== filters.severity) return false
    if (filters.status && change.status !== filters.status) return false
    if (
      filters.search &&
      !change.title.toLowerCase().includes(filters.search.toLowerCase()) &&
      !change.description.toLowerCase().includes(filters.search.toLowerCase())
    )
      return false
    return true
  })

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "critical":
        return "text-red-600"
      case "high":
        return "text-orange-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-5 w-5 animate-spin" />
          <span>Loading regulatory monitoring data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Regulatory Monitoring</h2>
          <p className="text-muted-foreground">Automated monitoring of regulatory changes with impact assessment</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={runMonitoring} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Run Monitoring
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure Sources
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Radar className="h-4 w-4 text-blue-600" />
              Active Monitoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24/7</div>
            <p className="text-xs text-muted-foreground">3 sources monitored</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Bell className="h-4 w-4 text-orange-600" />
              New Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{changes.length}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              High Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {changes.filter((c) => c.severity === "high" || c.severity === "critical").length}
            </div>
            <p className="text-xs text-muted-foreground">Requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Compliance Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{gaps.length}</div>
            <p className="text-xs text-muted-foreground">Identified gaps</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="changes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="changes">Regulatory Changes</TabsTrigger>
          <TabsTrigger value="assessments">Impact Assessments</TabsTrigger>
          <TabsTrigger value="trends">Trends & Analytics</TabsTrigger>
          <TabsTrigger value="gaps">Compliance Gaps</TabsTrigger>
          <TabsTrigger value="alerts">Monitoring Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="changes" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filter Changes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search changes..."
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={filters.category}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="hours-of-service">Hours of Service</SelectItem>
                    <SelectItem value="safety">Safety</SelectItem>
                    <SelectItem value="environmental">Environmental</SelectItem>
                    <SelectItem value="vehicle-maintenance">Vehicle Maintenance</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.severity}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="proposed">Proposed</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                    <SelectItem value="effective">Effective</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Changes List */}
          <div className="space-y-4">
            {filteredChanges.map((change) => (
              <Card key={change.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityColor(change.severity)}>{change.severity}</Badge>
                        <Badge variant="outline">{change.category}</Badge>
                        <Badge variant="secondary">{change.status}</Badge>
                        {change.impactAssessment && (
                          <Badge variant="outline" className={getImpactColor(change.impactAssessment.overallImpact)}>
                            {change.impactAssessment.overallImpact} impact
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg">{change.title}</CardTitle>
                      <CardDescription className="mt-1">{change.summary}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedChange(change)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{change.title}</DialogTitle>
                            <DialogDescription>{change.description}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2">Change Details</h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <strong>Type:</strong> {change.type}
                                  </div>
                                  <div>
                                    <strong>Category:</strong> {change.category}
                                  </div>
                                  <div>
                                    <strong>Published:</strong> {new Date(change.publishedDate).toLocaleDateString()}
                                  </div>
                                  <div>
                                    <strong>Effective:</strong> {new Date(change.effectiveDate).toLocaleDateString()}
                                  </div>
                                  {change.commentPeriodEnd && (
                                    <div>
                                      <strong>Comment Period Ends:</strong>{" "}
                                      {new Date(change.commentPeriodEnd).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Key Changes</h4>
                                <ul className="text-sm space-y-1">
                                  {change.keyChanges.map((keyChange, index) => (
                                    <li key={index} className="flex items-start gap-2">
                                      <span className="text-blue-600">•</span>
                                      <span>{keyChange}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>

                            {change.impactAssessment && (
                              <div>
                                <h4 className="font-medium mb-2">Impact Assessment</h4>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">Operational Impact</span>
                                      <span className="font-medium">
                                        {change.impactAssessment.operationalImpact.score}/10
                                      </span>
                                    </div>
                                    <Progress
                                      value={change.impactAssessment.operationalImpact.score * 10}
                                      className="h-2"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">Financial Impact</span>
                                      <span className="font-medium">
                                        {change.impactAssessment.financialImpact.score}/10
                                      </span>
                                    </div>
                                    <Progress
                                      value={change.impactAssessment.financialImpact.score * 10}
                                      className="h-2"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">Compliance Impact</span>
                                      <span className="font-medium">
                                        {change.impactAssessment.complianceImpact.score}/10
                                      </span>
                                    </div>
                                    <Progress
                                      value={change.impactAssessment.complianceImpact.score * 10}
                                      className="h-2"
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm">Technical Impact</span>
                                      <span className="font-medium">
                                        {change.impactAssessment.technicalImpact.score}/10
                                      </span>
                                    </div>
                                    <Progress
                                      value={change.impactAssessment.technicalImpact.score * 10}
                                      className="h-2"
                                    />
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Published: {new Date(change.publishedDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>Effective: {new Date(change.effectiveDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {change.isReviewed ? (
                        <div className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span>Reviewed</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-orange-600">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Needs Review</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="assessments" className="space-y-4">
          <div className="space-y-4">
            {assessments.map((assessment) => {
              const change = changes.find((c) => c.id === assessment.changeId)
              return (
                <Card key={assessment.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{change?.title || "Unknown Change"}</CardTitle>
                        <CardDescription>
                          Impact Assessment • {new Date(assessment.assessmentDate).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      <Badge
                        variant={getSeverityColor(assessment.overallImpact)}
                        className={getImpactColor(assessment.overallImpact)}
                      >
                        {assessment.overallImpact} impact
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Operational</span>
                          <span className="text-sm">{assessment.operationalImpact.score}/10</span>
                        </div>
                        <Progress value={assessment.operationalImpact.score * 10} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Financial</span>
                          <span className="text-sm">{assessment.financialImpact.score}/10</span>
                        </div>
                        <Progress value={assessment.financialImpact.score * 10} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Compliance</span>
                          <span className="text-sm">{assessment.complianceImpact.score}/10</span>
                        </div>
                        <Progress value={assessment.complianceImpact.score * 10} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Technical</span>
                          <span className="text-sm">{assessment.technicalImpact.score}/10</span>
                        </div>
                        <Progress value={assessment.technicalImpact.score * 10} className="h-2" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Stakeholder</span>
                          <span className="text-sm">{assessment.stakeholderImpact.score}/10</span>
                        </div>
                        <Progress value={assessment.stakeholderImpact.score * 10} className="h-2" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <h4 className="font-medium mb-2">Financial Impact</h4>
                        <div className="space-y-1">
                          <div>Estimated Cost: ${assessment.financialImpact.estimatedCost.toLocaleString()}</div>
                          <div>
                            Implementation: ${assessment.financialImpact.costBreakdown.implementation.toLocaleString()}
                          </div>
                          <div>Training: ${assessment.financialImpact.costBreakdown.training.toLocaleString()}</div>
                          <div>Technology: ${assessment.financialImpact.costBreakdown.technology.toLocaleString()}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Timeline</h4>
                        <div className="space-y-1">
                          <div>Implementation: {assessment.operationalImpact.timeline}</div>
                          <div>Effort: {assessment.operationalImpact.estimatedEffort}</div>
                          <div>Priority: {assessment.recommendations.priority}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Actions Required</h4>
                        <div className="space-y-1">
                          {assessment.recommendations.actions.slice(0, 3).map((action, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <span className="text-blue-600">•</span>
                              <span>{action.title}</span>
                            </div>
                          ))}
                          {assessment.recommendations.actions.length > 3 && (
                            <div className="text-muted-foreground">
                              +{assessment.recommendations.actions.length - 3} more actions
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Regulatory Trends
                </CardTitle>
                <CardDescription>Analysis of regulatory change patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {trends.map((trend, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{trend.category}</h4>
                      <Badge variant="outline">{trend.period}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Changes</div>
                        <div className="text-2xl font-bold">{trend.changeCount}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Impact</div>
                        <div className="text-2xl font-bold">{trend.averageImpact}/10</div>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Top Keywords</h5>
                      <div className="flex flex-wrap gap-1">
                        {trend.topKeywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Emerging Themes</h5>
                      <ul className="text-sm space-y-1">
                        {trend.emergingThemes.map((theme, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600">•</span>
                            <span>{theme}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Predictive Insights
                </CardTitle>
                <CardDescription>AI-powered predictions of future regulatory changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trends[0]?.predictedChanges.map((prediction, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{prediction.topic}</h4>
                        <Badge variant="outline" className="text-purple-600">
                          {Math.round(prediction.probability * 100)}% likely
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        Expected timeframe: {prediction.timeframe}
                      </div>
                      <div className="text-sm">
                        <strong>Reasoning:</strong> {prediction.reasoning}
                      </div>
                      <Progress value={prediction.probability * 100} className="h-2 mt-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaps" className="space-y-4">
          <div className="space-y-4">
            {gaps.map((gap) => (
              <Card key={gap.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{gap.title}</CardTitle>
                      <CardDescription>{gap.description}</CardDescription>
                    </div>
                    <Badge variant={getSeverityColor(gap.gapSeverity)}>{gap.gapSeverity}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Current vs Required State</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Current:</strong> {gap.currentState}
                        </div>
                        <div>
                          <strong>Required:</strong> {gap.requiredState}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Remediation Plan</h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <strong>Timeline:</strong> {gap.remediation.timeline}
                        </div>
                        <div>
                          <strong>Cost:</strong> ${gap.remediation.cost.toLocaleString()}
                        </div>
                        <div>
                          <strong>Assigned to:</strong> {gap.assignedTo}
                        </div>
                        <div>
                          <strong>Due:</strong> {new Date(gap.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Required Actions</h4>
                    <ul className="text-sm space-y-1">
                      {gap.remediation.actions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-blue-600">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          alert.severity === "critical"
                            ? "bg-red-100 text-red-600"
                            : alert.severity === "error"
                              ? "bg-orange-100 text-orange-600"
                              : alert.severity === "warning"
                                ? "bg-yellow-100 text-yellow-600"
                                : "bg-blue-100 text-blue-600"
                        }`}
                      >
                        <Bell className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{alert.title}</CardTitle>
                        <CardDescription>{alert.message}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                      {alert.acknowledged ? (
                        <Badge variant="outline" className="text-green-600">
                          Acknowledged
                        </Badge>
                      ) : (
                        <Button variant="outline" size="sm">
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div>Sent: {new Date(alert.sentAt).toLocaleString()}</div>
                      <div>Channels: {alert.channels.join(", ")}</div>
                    </div>
                    {alert.acknowledged && (
                      <div>
                        Acknowledged by {alert.acknowledgedBy} on {new Date(alert.acknowledgedAt!).toLocaleString()}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
