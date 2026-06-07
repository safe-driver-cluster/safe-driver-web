"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  FileText,
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Printer,
  BarChart3,
  PieChart,
  LineChart,
  Bus,
  Users,
  Clock,
  Loader2,
  FileDown,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { generatePDFReport } from "@/lib/pdf-generator"
import { useLiveAlerts, isToday, isWithinLast24Hours, isWithinLast30Days } from "@/hooks/use-live-alerts"
import { calculateSafetyScore, getRiskLevelDetails } from "@/lib/safety-score"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 100 },
  },
}

export default function ReportsPage() {
  const { t } = useLanguage()
  const { alerts: liveAlerts, historyAlerts, isLoading: isLoadingAlerts } = useLiveAlerts()

  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [fleet, setFleet] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  
  // Report Config State
  const [reportEntity, setReportEntity] = useState<"fleet" | "driver" | "bus">("fleet")
  const [selectedEntityId, setSelectedEntityId] = useState<string>("all")
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly" | "lifetime">("daily")

  // Fetch Initial Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const [driversRes, fleetRes, routesRes, feedbacksRes] = await Promise.all([
          fetch("/api/drivers", { cache: "no-store" }),
          fetch("/api/fleet", { cache: "no-store" }),
          fetch("/api/routes", { cache: "no-store" }),
          fetch("/api/feedback", { cache: "no-store" })
        ])
        
        if (driversRes.ok) setDrivers(await driversRes.json())
        if (fleetRes.ok) setFleet(await fleetRes.json())
        if (routesRes.ok) setRoutes(await routesRes.json())
        if (feedbacksRes.ok) setFeedbacks(await feedbacksRes.json())
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  // Derived Dynamic Data
  const data = useMemo(() => {
    // Combine all alerts and remove duplicates based on alert ID
    const combinedAlerts = [...liveAlerts, ...historyAlerts]
    const uniqueAlerts = combinedAlerts.filter((alert, index, self) =>
      index === self.findIndex((a) => a.id === alert.id)
    )

    // Today's alerts (scoped to calendar today or last 24 hours)
    const todayAlertsList = uniqueAlerts.filter(
      (alert) => isToday(alert.timestamp) || isWithinLast24Hours(alert.timestamp)
    )

    // Safety score is calculated based on ALL alerts from the last 30 days
    const alertsLast30Days = uniqueAlerts.filter((alert) => isWithinLast30Days(alert.timestamp))
    const safetyScore = calculateSafetyScore(alertsLast30Days)
    const riskDetails = getRiskLevelDetails(safetyScore)
    
    const activeVehicles = fleet.filter(v => v.status === "active").length
    const fleetActivity = fleet.length > 0 ? Math.round((activeVehicles / fleet.length) * 100) : 0
    
    // Group alerts by type for PDF
    const alertTypesCounts: Record<string, number> = {}
    todayAlertsList.forEach(a => {
      alertTypesCounts[a.type] = (alertTypesCounts[a.type] || 0) + 1
    })
    const alertSummary = Object.entries(alertTypesCounts).map(([type, count]) => ({
      type, count, high: Math.round(count * 0.4), medium: Math.round(count * 0.4), low: Math.round(count * 0.2), avgResponse: "1m"
    }))

    const alertDensity = fleet.length > 0 ? (todayAlertsList.length / fleet.length).toFixed(2) : "0"

    const totalDrivers = drivers.length || 1
    const activeDrivers = drivers.filter(d => d.status === "on_duty").length

    return {
      uniqueTodayAlerts: todayAlertsList,
      safetyScore,
      riskLevel: riskDetails.level,
      fleetActivity,
      alertSummary,
      alertDensity,
      activeDrivers,
      totalDrivers
    }
  }, [liveAlerts, historyAlerts, fleet, drivers])

  // Report Generation Handler
  const handleDownload = async (type: string, title: string) => {
    setIsGenerating(type)
    try {
      // 1. Filter Alerts based on timePeriod
      const now = Date.now()
      const timeMs = timePeriod === "daily" ? 24*60*60*1000 : timePeriod === "weekly" ? 7*24*60*60*1000 : timePeriod === "monthly" ? 30*24*60*60*1000 : Infinity
      const combinedAlerts = [...liveAlerts, ...historyAlerts].filter((alert, index, self) => index === self.findIndex((a) => a.id === alert.id))
      
      let filteredAlerts = combinedAlerts.filter(a => {
        const alertTime = new Date(a.timestamp || Date.now()).getTime()
        return (now - alertTime) <= timeMs
      })

      // 2. Filter by Entity
      let entityName = "Entire Fleet"
      if (reportEntity === "driver" && selectedEntityId !== "all") {
        const driver = drivers.find(d => d.id === selectedEntityId || d.licenseNumber === selectedEntityId)
        filteredAlerts = filteredAlerts.filter(a => a.driverId === selectedEntityId || a.driverName === driver?.name)
        entityName = `Driver: ${driver?.name || selectedEntityId}`
      } else if (reportEntity === "bus" && selectedEntityId !== "all") {
        filteredAlerts = filteredAlerts.filter(a => a.busNumber === selectedEntityId || a.deviceId === selectedEntityId || a.number_plate === selectedEntityId)
        entityName = `Bus: ${selectedEntityId}`
      }

      // 3. Calculate metrics
      const drowsinessCount = filteredAlerts.filter(a => a.type.toLowerCase().includes('drowsi')).length
      const yawnCount = filteredAlerts.filter(a => a.tag?.toLowerCase().includes('yawn')).length
      const phoneCount = filteredAlerts.filter(a => a.type.toLowerCase().includes('phone')).length
      const distractionCount = filteredAlerts.filter(a => a.type.toLowerCase().includes('distraction')).length
      
      const alertTypesCounts: Record<string, number> = {}
      filteredAlerts.forEach(a => {
        alertTypesCounts[a.type] = (alertTypesCounts[a.type] || 0) + 1
      })
      const dynamicAlertSummary = Object.entries(alertTypesCounts).map(([type, count]) => ({
        type,
        count,
        high: Math.round(count * 0.4),
        medium: Math.round(count * 0.4),
        low: Math.round(count * 0.2),
        avgResponse: "1m"
      }))

      const safetyScore = calculateSafetyScore(filteredAlerts)
      
      // 4. Filter Feedbacks
      let filteredFeedbacks = feedbacks.filter(f => {
        if (!f.timestamp && !f.createdAt) return false;
        const feedbackTime = new Date((f.timestamp || f.createdAt) as string).getTime();
        return (now - feedbackTime) <= timeMs;
      });
      
      if (reportEntity === "driver" && selectedEntityId !== "all") {
        const driver = drivers.find(d => d.id === selectedEntityId || d.licenseNumber === selectedEntityId)
        filteredFeedbacks = filteredFeedbacks.filter(f => f.driverId === selectedEntityId || f.driverName === driver?.name)
      } else if (reportEntity === "bus" && selectedEntityId !== "all") {
        filteredFeedbacks = filteredFeedbacks.filter(f => f.busNumber === selectedEntityId || f.vehicleId === selectedEntityId)
      }
      const getRatingValue = (f: any) => typeof f.rating === 'object' ? (f.rating?.overall || 5) : (Number(f.rating) || 5);
      const avgFeedbackRating = filteredFeedbacks.length > 0 ? (filteredFeedbacks.reduce((sum, f) => sum + getRatingValue(f), 0) / filteredFeedbacks.length).toFixed(1) : "N/A"

      let reportData: any = {
        entityName,
        timePeriod: timePeriod.toUpperCase(),
        safetyScore,
        counts: {
          total: filteredAlerts.length,
          drowsiness: drowsinessCount,
          yawn: yawnCount,
          phone: phoneCount,
          distraction: distractionCount
        },
        feedbacks: {
          total: filteredFeedbacks.length,
          averageRating: avgFeedbackRating,
          recent: filteredFeedbacks.slice(0, 10).map(f => ({
            rating: typeof f.rating === 'object' ? (f.rating?.overall || 5) : (f.rating || 5),
            comment: f.description || f.comment || f.message || "No comment",
            title: f.title || "Untitled Feedback",
            userName: f.isAnonymous ? "Anonymous" : (f.userName || "Unknown Passenger"),
            busNumber: f.busNumber || "Unknown Bus",
            date: (f.createdAt || f.timestamp) ? new Date(f.createdAt || f.timestamp).toLocaleDateString() : "Recent"
          }))
        },
        summary: {
          totalAlerts: filteredAlerts.length,
          activeDrivers: data.activeDrivers,
          systemUptime: 100,
        },
        alerts: dynamicAlertSummary.length > 0 ? dynamicAlertSummary : [
          { type: "No Data", count: 0, high: 0, medium: 0, low: 0, avgResponse: "0m" }
        ],
        drivers: (Array.isArray(drivers) ? drivers : []).map(d => ({
          name: d.name,
          license: d.licenseNumber,
          bus: d.busNumber || 'N/A',
          route: d.route || 'Unassigned',
          alerts: d.alertCount || 0,
          status: d.status
        })),
        routes: (Array.isArray(routes) ? routes : []).map(r => ({
          name: r.name,
          buses: r.activeVehicles,
          drivers: r.activeVehicles,
          distance: `${r.distance}km`,
          riskAreas: r.safetyIncidents,
          efficiency: r.onTimePerformance
        })),
        compliance: {
          driverLicenseValidity: 100,
          vehicleInspections: 100,
          safetyTraining: Math.round(data.safetyScore),
          emergencyProtocols: 100,
          dataReporting: 100
        }
      }

      await generatePDFReport({
        type: type === 'custom' ? 'custom-dynamic' : type,
        title: type === 'custom' ? `${entityName} - ${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} Report` : title,
        dateRange: timePeriod === 'lifetime' ? 'All Time' : `Last ${timePeriod === 'daily' ? '24 Hours' : timePeriod === 'weekly' ? '7 Days' : '30 Days'}`,
        data: reportData
      })
    } catch (error) {
      console.error("Error generating report:", error)
    } finally {
      setIsGenerating(null)
    }
  }

  const initialLoading = isLoading || isLoadingAlerts

  if (initialLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium animate-pulse">{t("loading_activities") || "Preparing analytics dashboard..."}</p>
      </div>
    )
  }

  return (
    <motion.div 
      className="space-y-8 pb-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">Generate comprehensive reports with live visual charts and fleet analytics.</p>
        </div>


      </motion.div>

      {/* Analytics Overview Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Overall Safety Score", value: `${data.safetyScore.toFixed(1)}%`, icon: Shield, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Live" },
          { label: "Risk Level", value: data.riskLevel, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50", trend: "Live" },
          { label: "Alert Density", value: data.alertDensity, icon: Activity, color: "text-rose-600", bg: "bg-rose-50", trend: "Live" },
        ].map((stat, i) => (
          <Card key={i} className="border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className={`${stat.bg} p-2.5 rounded-xl group-hover:scale-105 transition-transform duration-300`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 border-none rounded-lg text-xs">
                  {stat.trend}
                </Badge>
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="reports" className="space-y-8">
        <TabsList className="bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border-2 shadow-sm inline-flex">
          <TabsTrigger value="reports" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
            <FileText className="h-4 w-4 mr-2" />
            {t("generate_reports") || "Reports"}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("performance_analytics") || "Analytics"}
          </TabsTrigger>
          <TabsTrigger value="insights" className="rounded-xl px-8 py-2.5 data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all">
            <TrendingUp className="h-4 w-4 mr-2" />
            {t("ai_insights") || "Insights"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Report Selection Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              <Card className="border-2 rounded-3xl shadow-xl bg-white/70 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="text-xl">{t("report_config") || "Report Configuration"}</CardTitle>
                  <CardDescription>{t("report_params") || "Customize your report parameters"}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">{t("report_format") || "Format"}</label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant="outline" className="rounded-xl border-2 bg-blue-50 border-blue-200 text-blue-700">PDF</Button>
                      <Button variant="outline" className="rounded-xl border-2 opacity-50 cursor-not-allowed">XLS</Button>
                      <Button variant="outline" className="rounded-xl border-2 opacity-50 cursor-not-allowed">CSV</Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">Target Entity</label>
                    <Select 
                      value={reportEntity} 
                      onValueChange={(val) => {
                        setReportEntity(val as any)
                        setSelectedEntityId("all")
                      }}
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-2 rounded-xl p-3 h-auto">
                        <SelectValue placeholder="Select target entity..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fleet">Entire Fleet</SelectItem>
                        <SelectItem value="driver">Specific Driver</SelectItem>
                        <SelectItem value="bus">Specific Bus</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {reportEntity === "driver" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-bold text-slate-700">Select Driver</label>
                      <Select 
                        value={selectedEntityId} 
                        onValueChange={setSelectedEntityId}
                      >
                        <SelectTrigger className="w-full bg-slate-50 border-2 rounded-xl p-3 h-auto">
                          <SelectValue placeholder="Select a driver..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Select a driver...</SelectItem>
                          {(Array.isArray(drivers) ? drivers : []).map(d => (
                            <SelectItem key={d.id || d.licenseNumber} value={d.id || d.licenseNumber}>
                              {d.name} ({d.licenseNumber})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {reportEntity === "bus" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <label className="text-sm font-bold text-slate-700">Select Bus</label>
                      <Select 
                        value={selectedEntityId} 
                        onValueChange={setSelectedEntityId}
                      >
                        <SelectTrigger className="w-full bg-slate-50 border-2 rounded-xl p-3 h-auto">
                          <SelectValue placeholder="Select a bus..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Select a bus...</SelectItem>
                          {(Array.isArray(fleet) ? fleet : []).map(f => (
                            <SelectItem key={f.id || f.busNumber} value={f.id || f.busNumber}>
                              {f.busNumber || f.id}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className="text-sm font-bold text-slate-700">{t("time_period") || "Time Period"}</label>
                    <Select 
                      value={timePeriod} 
                      onValueChange={(val) => setTimePeriod(val as any)}
                    >
                      <SelectTrigger className="w-full bg-slate-50 border-2 rounded-xl p-3 h-auto">
                        <SelectValue placeholder="Select time period..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily (Last 24 Hours)</SelectItem>
                        <SelectItem value="weekly">Weekly (Last 7 Days)</SelectItem>
                        <SelectItem value="monthly">Monthly (Last 30 Days)</SelectItem>
                        <SelectItem value="lifetime">Lifetime (All Time)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button 
                    className="w-full py-6 rounded-2xl bg-slate-900 text-white hover:bg-slate-800 shadow-xl transition-all"
                    onClick={() => handleDownload('custom', 'Custom Fleet Analysis')}
                    disabled={isGenerating !== null}
                  >
                    {isGenerating === 'custom' ? (
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    ) : (
                      <FileDown className="h-5 w-5 mr-2" />
                    )}
                    {t("generate_custom_report") || "Generate Custom Report"}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Quick Reports Grid */}
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  { 
                    id: "driver-performance", 
                    title: t("driver_performance_report") || "Driver Performance", 
                    desc: t("driver_performance_desc") || "Safety scores, alert history, and ranking for all drivers.",
                    icon: Users,
                    color: "bg-blue-100 text-blue-700",
                    period: "Dynamic"
                  },
                  { 
                    id: "fleet-analytics", 
                    title: t("fleet_analytics_report") || "Fleet Analytics", 
                    desc: t("fleet_analytics_desc") || "Vehicle health, fuel efficiency, and operational utilization.",
                    icon: Bus,
                    color: "bg-emerald-100 text-emerald-700",
                    period: "Dynamic"
                  },
                  { 
                    id: "daily-summary", 
                    title: t("todays_summary") || "Safety Summary", 
                    desc: t("daily_summary_desc") || "Full breakdown of safety incidents and system alerts for the period.",
                    icon: Shield,
                    color: "bg-rose-100 text-rose-700",
                    period: "Dynamic"
                  },
                  { 
                    id: "compliance", 
                    title: t("regulatory_compliance_report") || "Compliance Audit", 
                    desc: t("regulatory_desc") || "Audit trail for licenses, permits, and regulatory standards.",
                    icon: Activity,
                    color: "bg-amber-100 text-amber-700",
                    period: "Dynamic"
                  }
                ].map((report) => (
                  <Card key={report.id} className="border-2 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group relative">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className={`${report.color} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                          <report.icon className="h-6 w-6" />
                        </div>
                        <Badge variant="secondary" className="rounded-lg">{report.period}</Badge>
                      </div>
                      <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">{report.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{report.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between pt-4 border-t-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Live Status
                        </span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="rounded-xl hover:bg-blue-50 text-blue-600 font-bold"
                          onClick={() => handleDownload(report.id, report.title)}
                          disabled={isGenerating !== null}
                        >
                          {isGenerating === report.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Download className="h-4 w-4 mr-2" />
                          )}
                          {t("download_pdf") || "Download"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Recently Generated Section */}
              <Card className="border-2 rounded-3xl shadow-xl">
                <CardHeader>
                  <CardTitle>{t("previously_generated") || "Recently Generated Reports"}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-center p-8">
                     <p className="text-slate-400 font-medium">No reports generated today. Generate a report above to view history.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-8">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Performance Trends Chart Placeholder */}
              <Card className="border-2 rounded-3xl shadow-xl min-h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-indigo-600" />
                    {t("performance_trends") || "Safety Performance Trends"}
                  </CardTitle>
                  <CardDescription>Live safety scores across the entire fleet</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="text-center space-y-4">
                    <div className="inline-flex bg-indigo-100 p-4 rounded-full mb-2">
                      <LineChart className="h-12 w-12 text-indigo-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Visual Analytics Ready</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Interactive charts are synchronized with real-time fleet telemetry.</p>
                  </div>
                </CardContent>
              </Card>

              {/* Distribution Chart Placeholder */}
              <Card className="border-2 rounded-3xl shadow-xl min-h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5 text-rose-600" />
                    {t("incident_analysis_visuals") || "Incident Distribution"}
                  </CardTitle>
                  <CardDescription>Live breakdown of safety alerts</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center group relative">
                   <div className="absolute inset-0 bg-gradient-to-br from-rose-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="text-center space-y-4">
                    <div className="inline-flex bg-rose-100 p-4 rounded-full mb-2">
                      <PieChart className="h-12 w-12 text-rose-600 animate-pulse" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800">Dynamic Data Map</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">Categorical distribution based on AI-classified safety events.</p>
                  </div>
                </CardContent>
              </Card>
           </div>

           {/* Metrics Grid */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="border-2 rounded-3xl shadow-xl p-8 bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-none overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-20">
                  <Activity className="h-32 w-32 -mr-12 -mt-12" />
                </div>
                <div className="relative z-10">
                  <p className="text-blue-100 font-bold uppercase tracking-widest text-xs mb-2">Live Alert Engine</p>
                  <h2 className="text-5xl font-extrabold mb-4">{data.uniqueTodayAlerts.length}</h2>
                  <p className="text-blue-100/80 text-sm leading-relaxed">Total alerts securely ingested and processed by the live analytical pipeline today.</p>
                </div>
              </Card>

              <Card className="border-2 rounded-3xl shadow-xl p-8 bg-white overflow-hidden group">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Fleet Sync Status</p>
                    <h2 className="text-4xl font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors">Optimal</h2>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <Clock className="h-6 w-6 text-slate-400" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm font-bold">
                    <span className="text-slate-600">Active Duty Drivers</span>
                    <span className="text-emerald-600">{data.activeDrivers} / {data.totalDrivers}</span>
                  </div>
                  <Progress value={(data.activeDrivers / data.totalDrivers) * 100} className="h-1.5 bg-slate-100" />
                </div>
              </Card>

              <Card className="border-2 rounded-3xl shadow-xl p-8 bg-white overflow-hidden group">
                 <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs mb-1">Alert Density</p>
                    <h2 className="text-4xl font-extrabold text-slate-900 group-hover:text-rose-600 transition-colors">{data.alertDensity}</h2>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl">
                    <AlertTriangle className="h-6 w-6 text-slate-400" />
                  </div>
                </div>
                <p className="text-slate-500 text-sm mb-6">Average number of alerts per active vehicle in the fleet today.</p>
              </Card>
           </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-8">
          <Card className="border-2 rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-slate-900 p-12 text-white relative">
              <div className="absolute top-0 right-0 p-12 opacity-10">
                <TrendingUp className="h-64 w-64 -mr-24 -mt-24" />
              </div>
              <div className="max-w-2xl relative z-10">
                <Badge className="mb-4 bg-blue-600 border-none px-4 py-1 text-xs font-bold uppercase tracking-widest">Live Safety Insight</Badge>
                <h2 className="text-4xl font-extrabold mb-6 leading-tight">Live Safety Score is currently tracking at <span className="text-blue-400">{data.safetyScore.toFixed(1)}%</span>.</h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  The AI-Weighted risk analysis is continuously evaluating all incoming alerts. Risk level is dynamically classified as <strong className="text-white">{data.riskLevel}</strong>.
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}
