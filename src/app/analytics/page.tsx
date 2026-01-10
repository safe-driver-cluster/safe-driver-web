"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  Brain,
  Target,
  Users,
  Clock,
  RefreshCw,
  Download,
  Settings,
  CheckCircle,
  Bell,
  MessageSquare,
  Bus,
  Car,
} from "lucide-react"
import { useLiveAlerts } from "@/hooks/use-live-alerts"
import { useLanguage } from "@/components/language-provider"

// Helper function to format relative time
const formatRelativeTime = (timestamp: string | number, t: (key: string) => string): string => {
  if (!timestamp) return t("unknown")

  const timestampMs = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp
  const now = Date.now()
  const diffMs = now - timestampMs
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) {
    return `${diffSeconds} ${t("seconds_ago")}`
  } else if (diffMinutes < 60) {
    return `${diffMinutes} ${t("minutes_ago")}`
  } else if (diffHours < 24) {
    return `${diffHours} ${t("hours_ago")}`
  } else {
    return `${diffDays} ${t("days_ago")}`
  }
}

export default function AnalyticsPage() {
  // Get real-time alerts
  const { alerts: liveAlerts, isLoading: isLoadingAlerts } = useLiveAlerts()
  const { t } = useLanguage()

  // Feedback state
  const [feedback, setFeedback] = useState<any[]>([])
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(true)

  // Drivers state
  const [recentDrivers, setRecentDrivers] = useState<any[]>([])
  const [isLoadingDrivers, setIsLoadingDrivers] = useState(true)

  // Fleet state
  const [recentFleet, setRecentFleet] = useState<any[]>([])
  const [isLoadingFleet, setIsLoadingFleet] = useState(true)
  // Simple static data - no undefined values possible
  const metrics = {
    safetyScore: 94,
    totalAlerts: 23,
    riskLevel: "medium",
    performanceIndex: 87,
    complianceRate: 96,
    efficiency: 87,
    quality: 94,
    reliability: 91,
  }

  // Fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setIsLoadingFeedback(true)
        const response = await fetch("/api/feedback?limit=10", {
          cache: "no-store",
        })
        if (response.ok) {
          const data = await response.json()
          setFeedback(data)
        }
      } catch (error) {
        console.error("Error fetching feedback:", error)
      } finally {
        setIsLoadingFeedback(false)
      }
    }

    fetchFeedback()
    const interval = setInterval(fetchFeedback, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch recent drivers
  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        setIsLoadingDrivers(true)
        const response = await fetch("/api/drivers?limit=10", {
          cache: "no-store",
        })
        if (response.ok) {
          const data = await response.json()
          // Filter to only recent registrations (last 7 days)
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          const recent = data.filter((driver: any) => {
            if (!driver.createdAt) return false
            const createdAt = new Date(driver.createdAt).getTime()
            return createdAt > sevenDaysAgo
          })
          setRecentDrivers(recent)
        }
      } catch (error) {
        console.error("Error fetching drivers:", error)
      } finally {
        setIsLoadingDrivers(false)
      }
    }

    fetchDrivers()
    const interval = setInterval(fetchDrivers, 30000)
    return () => clearInterval(interval)
  }, [])

  // Fetch recent fleet
  useEffect(() => {
    const fetchFleet = async () => {
      try {
        setIsLoadingFleet(true)
        const response = await fetch("/api/fleet?limit=10", {
          cache: "no-store",
        })
        if (response.ok) {
          const data = await response.json()
          // Filter to only recent registrations (last 7 days)
          const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
          const recent = data.filter((vehicle: any) => {
            if (!vehicle.createdAt) return false
            const createdAt = new Date(vehicle.createdAt).getTime()
            return createdAt > sevenDaysAgo
          })
          setRecentFleet(recent)
        }
      } catch (error) {
        console.error("Error fetching fleet:", error)
      } finally {
        setIsLoadingFleet(false)
      }
    }

    fetchFleet()
    const interval = setInterval(fetchFleet, 30000)
    return () => clearInterval(interval)
  }, [])

  // Combine all activities into a unified feed
  const recentActivities = useMemo(() => {
    const activities: any[] = []

    // Add alerts
    liveAlerts.slice(0, 5).forEach((alert) => {
      const busNumber = alert.number_plate || alert.busNumber || "Unknown"
      activities.push({
        id: `alert-${alert.id}`,
        type: "alert",
        title: `${alert.type} alert`,
        description: `${alert.description || alert.type} - Vehicle ${busNumber}`,
        timestamp: alert.timestamp || Date.now(),
        icon: AlertTriangle,
        iconColor: alert.severity === "high" ? "text-red-600" : "text-orange-600",
      })
    })

    // Add feedback
    feedback.slice(0, 3).forEach((item) => {
      activities.push({
        id: `feedback-${item.id || item.documentId}`,
        type: "feedback",
        title: item.title || "New feedback received",
        description: item.description || item.comment || "Customer feedback",
        timestamp: item.timestamp || Date.now(),
        icon: MessageSquare,
        iconColor: item.status === "resolved" ? "text-green-600" : "text-blue-600",
      })
    })

    // Add driver registrations
    recentDrivers.slice(0, 2).forEach((driver) => {
      activities.push({
        id: `driver-${driver.id || driver.documentId}`,
        type: "driver",
        title: "New driver registered",
        description: `${driver.name || "Driver"} has been registered`,
        timestamp: driver.createdAt || Date.now(),
        icon: Users,
        iconColor: "text-green-600",
      })
    })

    // Add fleet registrations
    recentFleet.slice(0, 2).forEach((vehicle) => {
      activities.push({
        id: `fleet-${vehicle.id || vehicle.documentId}`,
        type: "fleet",
        title: "New vehicle registered",
        description: `${vehicle.busNumberPlate || vehicle.busNumber || "Vehicle"} has been added to fleet`,
        timestamp: vehicle.createdAt || Date.now(),
        icon: Bus,
        iconColor: "text-blue-600",
      })
    })

    // Sort by timestamp (newest first) and limit to 6 most recent
    return activities
      .sort((a, b) => {
        const timeA = typeof a.timestamp === "string" ? new Date(a.timestamp).getTime() : a.timestamp
        const timeB = typeof b.timestamp === "string" ? new Date(b.timestamp).getTime() : b.timestamp
        return timeB - timeA
      })
      .slice(0, 6)
  }, [liveAlerts, feedback, recentDrivers, recentFleet, t])

  const insights = [
    {
      id: "1",
      title: "Safety Training Effectiveness",
      description: "Driver safety training completion rates have improved significantly",
      type: "success",
      confidence: 92,
      category: "safety",
      recommendation: "Continue current training programs and expand to include advanced scenarios",
    },
    // ... skipping hardcoded values for now, ideally fetch or translate dynamic content too
    // For now assuming these are static examples or will come from API
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("analytics_dashboard")}</h1>
          <p className="text-gray-600 mt-2">
            {t("analytics_desc")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh_data")}
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t("export")}
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            {t("configure")}
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("overall_safety_score")}</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{metrics.safetyScore}%</div>
            <p className="text-xs text-muted-foreground">+2.3% {t("from_last_month")}</p>
            <Progress value={metrics.safetyScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_alerts")}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
            <p className="text-xs text-muted-foreground">-12.5% {t("from_last_month")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("risk_level")}</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{metrics.riskLevel}</div>
            <Badge variant="secondary" className="mt-2">
              {metrics.riskLevel}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("performance_index")}</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{metrics.performanceIndex}%</div>
            <p className="text-xs text-muted-foreground">+2.1% {t("from_last_month")}</p>
            <Progress value={metrics.performanceIndex} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard">{t("dashboard")}</TabsTrigger>
          <TabsTrigger value="compliance">{t("compliance")}</TabsTrigger>
          <TabsTrigger value="performance">{t("performance")}</TabsTrigger>
          <TabsTrigger value="insights">{t("ai_insights")}</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Compliance Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  {t("compliance_overview")}
                </CardTitle>
                <CardDescription>{t("compliance_desc")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("regulatory_compliance")}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={96} className="w-20" />
                      <span className="text-sm font-medium">96%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("safety_standards")}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={92} className="w-20" />
                      <span className="text-sm font-medium">92%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("environmental")}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={98} className="w-20" />
                      <span className="text-sm font-medium">98%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("operational")}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={91} className="w-20" />
                      <span className="text-sm font-medium">91%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  {t("performance_metrics")}
                </CardTitle>
                <CardDescription>{t("kpi")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("efficiency")}</span>
                    <span className="font-bold">{metrics.efficiency}%</span>
                  </div>
                  <Progress value={metrics.efficiency} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("quality")}</span>
                    <span className="font-bold">{metrics.quality}%</span>
                  </div>
                  <Progress value={metrics.quality} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("reliability")}</span>
                    <span className="font-bold">{metrics.reliability}%</span>
                  </div>
                  <Progress value={metrics.reliability} />

                  <div className="flex items-center justify-between">
                    <span className="text-sm">{t("safety")}</span>
                    <span className="font-bold">89%</span>
                  </div>
                  <Progress value={89} />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                {t("recent_activity")}
              </CardTitle>
              <CardDescription>{t("latest_alerts_notifs")}</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingAlerts && isLoadingFeedback && isLoadingDrivers && isLoadingFleet ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">{t("loading_activities")}</div>
                </div>
              ) : recentActivities.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-sm text-gray-500">{t("no_recent_activities")}</div>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivities.map((activity) => {
                    const IconComponent = activity.icon || Bell
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <IconComponent className={`h-5 w-5 ${activity.iconColor || "text-gray-600"}`} />
                        <div className="flex-1">
                          <div className="font-medium">{activity.title}</div>
                          <div className="text-sm text-gray-600">{activity.description}</div>
                        </div>
                        <div className="text-xs text-gray-500">{formatRelativeTime(activity.timestamp, t)}</div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  {t("overall_score")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{metrics.safetyScore}%</div>
                <Progress value={metrics.safetyScore} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  {t("total_alerts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalAlerts}</div>
                <div className="text-xs text-muted-foreground mt-1">-12.5% vs last period</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  {t("risk_level")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold capitalize">{metrics.riskLevel}</div>
                <Badge variant="secondary" className="mt-2">
                  {metrics.riskLevel}
                </Badge>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  {t("trend")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">+2.3%</div>
                <div className="text-xs text-muted-foreground mt-1">{t("safety_improvement")}</div>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t("compliance_details")}</CardTitle>
              <CardDescription>{t("compliance_breakdown")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">{t("regulatory_compliance")}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t("dot_regulations")}</span>
                      <span className="font-medium">98%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t("safety_standards")}</span>
                      <span className="font-medium">95%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t("environmental")}</span>
                      <span className="font-medium">97%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">{t("operational")} {t("compliance")}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t("driver_training")}</span>
                      <span className="font-medium">96%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t("vehicle_maintenance")}</span>
                      <span className="font-medium">94%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">{t("documentation")}</span>
                      <span className="font-medium">99%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  {t("performance_metrics")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("efficiency")}</span>
                    <span className="font-bold">{metrics.efficiency}%</span>
                  </div>
                  <Progress value={metrics.efficiency} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("quality")}</span>
                    <span className="font-bold">{metrics.quality}%</span>
                  </div>
                  <Progress value={metrics.quality} />

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("reliability")}</span>
                    <span className="font-bold">{metrics.reliability}%</span>
                  </div>
                  <Progress value={metrics.reliability} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-green-600" />
                  {t("team_performance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("training_completion")}</span>
                    <span className="font-bold text-green-600">98%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("certification_rate")}</span>
                    <span className="font-bold text-blue-600">95%</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("engagement_score")}</span>
                    <span className="font-bold text-purple-600">89%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  {t("response_times")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("incident_response")}</span>
                    <span className="font-bold">4.2 min</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("alert_processing")}</span>
                    <span className="font-bold">1.8 min</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm">{t("resolution_time")}</span>
                    <span className="font-bold">24.5 min</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-600" />
                {t("ai_insights")}
              </CardTitle>
              <CardDescription>{t("ai_desc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium">{insight.title}</h4>
                      <Badge variant={insight.type === "warning" ? "secondary" : "default"}>{insight.type}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{insight.description}</p>
                    <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <strong>{t("recommendation")}:</strong> {insight.recommendation}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{t("confidence")}: {insight.confidence}%</Badge>
                      <Badge variant="outline">{insight.category}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
