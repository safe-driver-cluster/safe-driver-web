"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertTriangle,
  Shield,
  TrendingUp,
  TrendingDown,
  Eye,
  RefreshCw,
  BarChart3,
  Target,
  Clock,
  CheckCircle,
} from "lucide-react"

export function RiskAssessment() {
  const [selectedRiskCategory, setSelectedRiskCategory] = useState("operational")

  const riskCategories = {
    operational: {
      name: "Operational Risks",
      description: "Day-to-day operational safety and compliance risks",
      overallScore: "Medium",
      riskCount: 8,
      risks: [
        {
          id: 1,
          name: "Driver Fatigue",
          severity: "high",
          probability: "medium",
          impact: "high",
          riskScore: 8.5,
          trend: "increasing",
          description: "Risk of accidents due to driver fatigue and hours of service violations",
          mitigationActions: [
            "Implement mandatory rest periods",
            "Install fatigue monitoring systems",
            "Regular driver wellness checks",
          ],
          lastAssessment: "2024-01-10",
          nextReview: "2024-02-10",
        },
        {
          id: 2,
          name: "Vehicle Maintenance Delays",
          severity: "medium",
          probability: "low",
          impact: "medium",
          riskScore: 4.2,
          trend: "stable",
          description: "Delayed maintenance leading to vehicle breakdowns and safety issues",
          mitigationActions: [
            "Preventive maintenance scheduling",
            "Real-time vehicle monitoring",
            "Backup vehicle availability",
          ],
          lastAssessment: "2024-01-08",
          nextReview: "2024-02-08",
        },
        {
          id: 3,
          name: "Weather-Related Incidents",
          severity: "medium",
          probability: "high",
          impact: "medium",
          riskScore: 6.8,
          trend: "seasonal",
          description: "Increased accident risk during adverse weather conditions",
          mitigationActions: [
            "Weather monitoring systems",
            "Driver training for adverse conditions",
            "Route optimization for weather",
          ],
          lastAssessment: "2024-01-05",
          nextReview: "2024-02-05",
        },
      ],
    },
    regulatory: {
      name: "Regulatory Risks",
      description: "Compliance and regulatory violation risks",
      overallScore: "Low",
      riskCount: 5,
      risks: [
        {
          id: 4,
          name: "DOT Compliance Violations",
          severity: "high",
          probability: "low",
          impact: "high",
          riskScore: 7.2,
          trend: "decreasing",
          description: "Risk of DOT violations leading to fines and operational restrictions",
          mitigationActions: [
            "Regular compliance audits",
            "Staff training programs",
            "Automated compliance monitoring",
          ],
          lastAssessment: "2024-01-09",
          nextReview: "2024-02-09",
        },
        {
          id: 5,
          name: "Driver Qualification Issues",
          severity: "medium",
          probability: "low",
          impact: "high",
          riskScore: 5.5,
          trend: "stable",
          description: "Risk of employing unqualified drivers or license violations",
          mitigationActions: [
            "Continuous license monitoring",
            "Background check updates",
            "Regular driver evaluations",
          ],
          lastAssessment: "2024-01-07",
          nextReview: "2024-02-07",
        },
      ],
    },
    financial: {
      name: "Financial Risks",
      description: "Financial and insurance-related risks",
      overallScore: "Low",
      riskCount: 4,
      risks: [
        {
          id: 6,
          name: "Insurance Premium Increases",
          severity: "medium",
          probability: "medium",
          impact: "medium",
          riskScore: 5.0,
          trend: "stable",
          description: "Risk of increased insurance costs due to claims history",
          mitigationActions: [
            "Safety program implementation",
            "Claims management optimization",
            "Driver training investments",
          ],
          lastAssessment: "2024-01-06",
          nextReview: "2024-02-06",
        },
      ],
    },
  }

  const getRiskColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600"
      case "medium":
        return "text-orange-600"
      case "low":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  const getRiskBadgeColor = (severity: string) => {
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

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "increasing":
        return <TrendingUp className="h-4 w-4 text-red-600" />
      case "decreasing":
        return <TrendingDown className="h-4 w-4 text-green-600" />
      case "stable":
        return <Target className="h-4 w-4 text-blue-600" />
      case "seasonal":
        return <Clock className="h-4 w-4 text-orange-600" />
      default:
        return <Target className="h-4 w-4 text-gray-600" />
    }
  }

  const currentCategory = riskCategories[selectedRiskCategory as keyof typeof riskCategories]

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">Medium</div>
            <p className="text-xs text-muted-foreground">Requires monitoring</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">Immediate attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Trend</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">-5%</div>
            <p className="text-xs text-muted-foreground">Improving this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Assessment</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5 days</div>
            <p className="text-xs text-muted-foreground">Next: Jan 15, 2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(riskCategories).map(([key, category]) => (
          <Card
            key={key}
            className={`cursor-pointer transition-all ${selectedRiskCategory === key ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedRiskCategory(key)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant={getRiskBadgeColor(category.overallScore.toLowerCase() as any)}>
                  {category.overallScore}
                </Badge>
              </div>
              <CardDescription className="text-sm">{category.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Risk Items</span>
                <span className="text-lg font-bold">{category.riskCount}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Category Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {currentCategory.name}
              </CardTitle>
              <CardDescription>{currentCategory.description}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Reassess
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="risks" className="space-y-4">
            <TabsList>
              <TabsTrigger value="risks">Risk Items</TabsTrigger>
              <TabsTrigger value="matrix">Risk Matrix</TabsTrigger>
              <TabsTrigger value="mitigation">Mitigation Plans</TabsTrigger>
            </TabsList>

            <TabsContent value="risks" className="space-y-4">
              <div className="grid gap-4">
                {currentCategory.risks.map((risk) => (
                  <Card key={risk.id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">{risk.name}</CardTitle>
                          <Badge variant={getRiskBadgeColor(risk.severity as any)}>{risk.severity}</Badge>
                          {getTrendIcon(risk.trend)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-red-600">{risk.riskScore}</span>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>{risk.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium mb-1">Severity</div>
                            <Badge variant={getRiskBadgeColor(risk.severity as any)}>{risk.severity}</Badge>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Probability</div>
                            <Badge variant={getRiskBadgeColor(risk.probability as any)}>{risk.probability}</Badge>
                          </div>
                          <div>
                            <div className="text-sm font-medium mb-1">Impact</div>
                            <Badge variant={getRiskBadgeColor(risk.impact as any)}>{risk.impact}</Badge>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Risk Score</div>
                          <div className="flex items-center gap-2">
                            <Progress value={risk.riskScore * 10} className="flex-1" />
                            <span className="text-sm font-medium">{risk.riskScore}/10</span>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium mb-2">Mitigation Actions</div>
                          <ul className="space-y-1">
                            {risk.mitigationActions.map((action, index) => (
                              <li key={index} className="flex items-start gap-2 text-sm">
                                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span>{action}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>Last assessed: {risk.lastAssessment}</span>
                          <span>Next review: {risk.nextReview}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="matrix" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Assessment Matrix</CardTitle>
                  <CardDescription>Visual representation of risks by probability and impact</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center text-sm font-medium">Impact →</div>
                    <div className="text-center text-xs text-green-600 font-medium">Low</div>
                    <div className="text-center text-xs text-orange-600 font-medium">Medium</div>
                    <div className="text-center text-xs text-red-600 font-medium">High</div>

                    <div className="text-sm font-medium text-red-600">High</div>
                    <div className="h-16 bg-orange-200 rounded flex items-center justify-center text-xs"></div>
                    <div className="h-16 bg-red-200 rounded flex items-center justify-center text-xs">Weather</div>
                    <div className="h-16 bg-red-300 rounded flex items-center justify-center text-xs">Fatigue</div>

                    <div className="text-sm font-medium text-orange-600">Medium</div>
                    <div className="h-16 bg-green-200 rounded flex items-center justify-center text-xs"></div>
                    <div className="h-16 bg-orange-200 rounded flex items-center justify-center text-xs">Insurance</div>
                    <div className="h-16 bg-red-200 rounded flex items-center justify-center text-xs">DOT</div>

                    <div className="text-sm font-medium text-green-600">Low</div>
                    <div className="h-16 bg-green-100 rounded flex items-center justify-center text-xs"></div>
                    <div className="h-16 bg-green-200 rounded flex items-center justify-center text-xs">
                      Maintenance
                    </div>
                    <div className="h-16 bg-orange-200 rounded flex items-center justify-center text-xs">
                      Qualification
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-200 rounded"></div>
                        <span>Low Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-orange-200 rounded"></div>
                        <span>Medium Risk</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-red-200 rounded"></div>
                        <span>High Risk</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="mitigation" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Mitigation Plans</CardTitle>
                  <CardDescription>Comprehensive mitigation strategies and action plans</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {currentCategory.risks.map((risk) => (
                      <div key={risk.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">{risk.name}</h4>
                          <Badge variant={getRiskBadgeColor(risk.severity as any)}>Risk Score: {risk.riskScore}</Badge>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium mb-2">Mitigation Actions</h5>
                            <div className="grid gap-2">
                              {risk.mitigationActions.map((action, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                  <div className="flex items-center gap-2">
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                    <span className="text-sm">{action}</span>
                                  </div>
                                  <Badge variant="outline" className="text-xs">
                                    In Progress
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Target Risk Reduction:</span>
                              <span className="ml-2 font-medium">30%</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Implementation Timeline:</span>
                              <span className="ml-2 font-medium">Q1 2024</span>
                            </div>
                          </div>
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
    </div>
  )
}
