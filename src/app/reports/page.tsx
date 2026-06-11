"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  FileText,
  Shield,
  Activity,
  AlertTriangle,
  Clock,
  BarChart3,
  PieChart,
  LineChart,
  Bus,
  Users,
  Loader2,
  FileDown,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { generatePDFReport } from "@/lib/pdf-generator"
import { useLiveAlerts, isToday, isWithinLast24Hours, isWithinLast30Days } from "@/hooks/use-live-alerts"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"

export default function ReportsPage() {
  const { t } = useLanguage()
  const { alerts: liveAlerts, historyAlerts, isLoading: isLoadingAlerts } = useLiveAlerts()

  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState<string | null>(null)
  const [drivers, setDrivers] = useState<any[]>([])
  const [fleet, setFleet] = useState<any[]>([])
  const [routes, setRoutes] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])

  const [reportEntity, setReportEntity] = useState<"fleet" | "driver" | "bus">("fleet")
  const [selectedEntityId, setSelectedEntityId] = useState<string>("all")
  const [timePeriod, setTimePeriod] = useState<"daily" | "weekly" | "monthly" | "lifetime">("daily")

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

  const data = useMemo(() => {
    const combinedAlerts = [...liveAlerts, ...historyAlerts]
    const uniqueAlerts = combinedAlerts.filter((alert, index, self) =>
      index === self.findIndex((a) => a.id === alert.id)
    )
    const todayAlertsList = uniqueAlerts.filter(
      (alert) => isToday(alert.timestamp) || isWithinLast24Hours(alert.timestamp)
    )
    const activeVehicles = fleet.filter(v => v.status === "active").length
    const alertTypesCounts: Record<string, number> = {}
    todayAlertsList.forEach(a => {
      alertTypesCounts[a.type] = (alertTypesCounts[a.type] || 0) + 1
    })
    const alertSummary = Object.entries(alertTypesCounts).map(([type, count]) => ({
      type, count, high: Math.round(count * 0.4), medium: Math.round(count * 0.4), low: Math.round(count * 0.2), avgResponse: "1m"
    }))
    const drowsinessCount = todayAlertsList.filter(a => a.type === 'drowsiness' || a.type.toLowerCase().includes('drowsi') || a.tag?.toLowerCase().includes('yawn')).length
    const phoneCount = todayAlertsList.filter(a => a.type === 'phone_usage' || a.type.toLowerCase().includes('phone')).length
    const distractionCount = todayAlertsList.filter(a => a.type === 'distraction' || a.type.toLowerCase().includes('distraction')).length
    const smokingCount = todayAlertsList.filter(a => a.type === 'smoking' || a.type.toLowerCase().includes('smoke')).length
    const drinkingCount = todayAlertsList.filter(a => a.type === 'drinking' || a.type.toLowerCase().includes('drink')).length
    const totalObjectDetection = phoneCount + smokingCount + drinkingCount

    const chartData = [
      { name: "Drowsiness", count: drowsinessCount, fill: "#EF4444" },
      { name: "Distraction", count: distractionCount, fill: "#F59E0B" },
      { name: "Object Detection", count: totalObjectDetection, fill: "#2563EB" },
      { name: "  • Mobile Phone", count: phoneCount, fill: "#3B82F6" },
      { name: "  • Smoking", count: smokingCount, fill: "#475569" },
      { name: "  • Drinking", count: drinkingCount, fill: "#6366F1" },
    ]

    const alertDensity = activeVehicles > 0 ? (todayAlertsList.length / activeVehicles).toFixed(2) : "0"
    const totalDrivers = drivers.length || 1
    const activeDrivers = drivers.filter(d => d.status === "on_duty").length
    return {
      uniqueTodayAlerts: todayAlertsList,
      alertSummary,
      alertDensity,
      activeDrivers,
      totalDrivers,
      activeVehicles,
      totalVehicles: fleet.length,
      chartData,
    }
  }, [liveAlerts, historyAlerts, fleet, drivers])

  const handleDownload = async (type: string, title: string) => {
    setIsGenerating(type)
    try {
      const now = Date.now()
      const timeMs = timePeriod === "daily" ? 24*60*60*1000 : timePeriod === "weekly" ? 7*24*60*60*1000 : timePeriod === "monthly" ? 30*24*60*60*1000 : Infinity
      const combinedAlerts = [...liveAlerts, ...historyAlerts].filter((alert, index, self) => index === self.findIndex((a) => a.id === alert.id))
      let filteredAlerts = combinedAlerts.filter(a => {
        const alertTime = new Date(a.timestamp || Date.now()).getTime()
        return (now - alertTime) <= timeMs
      })
      let entityName = "Entire Fleet"
      if (reportEntity === "driver" && selectedEntityId !== "all") {
        const driver = drivers.find(d => d.id === selectedEntityId || d.licenseNumber === selectedEntityId)
        filteredAlerts = filteredAlerts.filter(a => 
          (a.driverId && (a.driverId === selectedEntityId || (driver && a.driverId === driver.id))) || 
          (a.driverName && driver && a.driverName.toLowerCase().trim() === driver.name.toLowerCase().trim())
        )
        entityName = `Driver: ${driver?.name || selectedEntityId}`
      } else if (reportEntity === "bus" && selectedEntityId !== "all") {
        const vehicle = fleet.find(v => v.id === selectedEntityId || v.busNumberPlate === selectedEntityId || v.busNumber === selectedEntityId)
        filteredAlerts = filteredAlerts.filter(a => 
          a.busNumber === selectedEntityId || 
          a.deviceId === selectedEntityId || 
          a.number_plate === selectedEntityId ||
          (vehicle && (
            a.busNumber === vehicle.busNumber ||
            a.busNumber === vehicle.busNumberPlate ||
            a.number_plate === vehicle.busNumberPlate ||
            a.deviceId === vehicle.deviceId ||
            a.deviceId === vehicle.id
          ))
        )
        entityName = `Bus: ${vehicle?.busNumberPlate || vehicle?.busNumber || selectedEntityId}`
      }
      const drowsinessCount = filteredAlerts.filter(a => a.type === 'drowsiness' || a.type.toLowerCase().includes('drowsi') || a.tag?.toLowerCase().includes('yawn')).length
      const yawnCount = filteredAlerts.filter(a => a.tag?.toLowerCase().includes('yawn')).length
      const phoneCount = filteredAlerts.filter(a => a.type === 'phone_usage' || a.type.toLowerCase().includes('phone')).length
      const distractionCount = filteredAlerts.filter(a => a.type === 'distraction' || a.type.toLowerCase().includes('distraction')).length
      const smokingCount = filteredAlerts.filter(a => a.type === 'smoking' || a.type.toLowerCase().includes('smoke')).length
      const drinkingCount = filteredAlerts.filter(a => a.type === 'drinking' || a.type.toLowerCase().includes('drink')).length
      const alertTypesCounts: Record<string, number> = {}
      filteredAlerts.forEach(a => { alertTypesCounts[a.type] = (alertTypesCounts[a.type] || 0) + 1 })
      const dynamicAlertSummary = Object.entries(alertTypesCounts).map(([type, count]) => ({
        type, count, high: Math.round(count * 0.4), medium: Math.round(count * 0.4), low: Math.round(count * 0.2), avgResponse: "1m"
      }))
      let filteredFeedbacks = feedbacks.filter(f => {
        if (!f.timestamp && !f.createdAt) return false
        const feedbackTime = new Date((f.timestamp || f.createdAt) as string).getTime()
        return (now - feedbackTime) <= timeMs
      })
      if (reportEntity === "driver" && selectedEntityId !== "all") {
        const driver = drivers.find(d => d.id === selectedEntityId || d.licenseNumber === selectedEntityId)
        filteredFeedbacks = filteredFeedbacks.filter(f => 
          (f.driverId && (f.driverId === selectedEntityId || (driver && f.driverId === driver.id))) || 
          (f.driverName && driver && f.driverName.toLowerCase().trim() === driver.name.toLowerCase().trim())
        )
      } else if (reportEntity === "bus" && selectedEntityId !== "all") {
        const vehicle = fleet.find(v => v.id === selectedEntityId || v.busNumberPlate === selectedEntityId || v.busNumber === selectedEntityId)
        filteredFeedbacks = filteredFeedbacks.filter(f => 
          f.busNumber === selectedEntityId || 
          f.vehicleId === selectedEntityId ||
          (vehicle && (
            f.busNumber === vehicle.busNumber ||
            f.busNumber === vehicle.busNumberPlate ||
            f.vehicleId === vehicle.busNumberPlate ||
            f.vehicleId === vehicle.id
          ))
        )
      }
      const getRatingValue = (f: any) => typeof f.rating === 'object' ? (f.rating?.overall || 5) : (Number(f.rating) || 5)
      const avgFeedbackRating = filteredFeedbacks.length > 0 ? (filteredFeedbacks.reduce((sum, f) => sum + getRatingValue(f), 0) / filteredFeedbacks.length).toFixed(1) : "N/A"
      const reportData: any = {
        entityName, timePeriod: timePeriod.toUpperCase(),
        counts: { 
          total: filteredAlerts.length, 
          drowsiness: drowsinessCount, 
          yawn: yawnCount, 
          phone: phoneCount, 
          distraction: distractionCount,
          smoking: smokingCount,
          drinking: drinkingCount
        },
        feedbacks: {
          total: filteredFeedbacks.length, averageRating: avgFeedbackRating,
          recent: filteredFeedbacks.slice(0, 10).map(f => ({
            rating: typeof f.rating === 'object' ? (f.rating?.overall || 5) : (f.rating || 5),
            comment: f.description || f.comment || f.message || "No comment",
            title: f.title || "Untitled Feedback",
            userName: f.isAnonymous ? "Anonymous" : (f.userName || "Unknown Passenger"),
            busNumber: f.busNumber || "Unknown Bus",
            date: (f.createdAt || f.timestamp) ? new Date(f.createdAt || f.timestamp).toLocaleDateString() : "Recent"
          }))
        },
        summary: { totalAlerts: filteredAlerts.length, activeDrivers: data.activeDrivers, systemUptime: 100 },
        alerts: dynamicAlertSummary.length > 0 ? dynamicAlertSummary : [{ type: "No Data", count: 0, high: 0, medium: 0, low: 0, avgResponse: "0m" }],
        alertDetails: filteredAlerts.map(a => ({
          type: a.type || "Unknown",
          driverName: a.driverName || "Unknown Driver",
          busNumber: a.busNumber || a.number_plate || "N/A",
          timestamp: a.timestamp ? new Date(a.timestamp).toLocaleString() : "N/A",
          severity: a.severity || "medium",
          description: a.description || a.tag || "",
          evidence: a.evidence || null,
        })),
        drivers: (Array.isArray(drivers) ? drivers : [])
          .filter(d => {
            if (reportEntity === "driver" && selectedEntityId !== "all") {
              return d.id === selectedEntityId || d.licenseNumber === selectedEntityId
            }
            return true
          })
          .map(d => {
            const driverAlerts = filteredAlerts.filter(a => 
              (a.driverId && a.driverId === d.id) || 
              (a.driverName && a.driverName.toLowerCase().trim() === d.name.toLowerCase().trim())
            )
            return {
              name: d.name,
              license: d.licenseNumber,
              bus: d.busNumber || 'N/A',
              route: d.route || 'Unassigned',
              alerts: driverAlerts.length,
              status: d.status
            }
          }),
        routes: (Array.isArray(routes) ? routes : []).map(r => ({ name: r.name, buses: r.activeVehicles, drivers: r.activeVehicles, distance: `${r.distance}km`, riskAreas: r.safetyIncidents, efficiency: r.onTimePerformance })),
        buses: (Array.isArray(fleet) ? fleet : []).map(v => {
          // Prepare normalized keys for matching
          const vPlate = (v.busNumberPlate || v.busNumber || v.id || '').toLowerCase().trim()
          const vDeviceId = (v.deviceId || '').toLowerCase().trim()
          const vDriverId = (v.driverId || '').trim()
          const vDriverName = (v.driverName || '').toLowerCase().trim()

          // Use all combined alerts (live + history) for bus counts, applying time filter
          const busAlerts = combinedAlerts.filter(a => {
            const alertTime = new Date(a.timestamp || Date.now()).getTime()
            if ((now - alertTime) > timeMs) return false

            const aPlate = (a.number_plate || '').toLowerCase().trim()
            const aBusNum = (a.busNumber || '').toLowerCase().trim()
            const aDeviceId = (a.deviceId || '').toLowerCase().trim()
            const aDriverId = (a.driverId || '').trim()
            const aDriverName = (a.driverName || '').toLowerCase().trim()

            // Match by bus plate (most reliable)
            if (vPlate && (aBusNum === vPlate || aPlate === vPlate)) return true
            // Match by device ID
            if (vDeviceId && aDeviceId && aDeviceId === vDeviceId) return true
            // Match by assigned driver ID
            if (vDriverId && aDriverId && aDriverId === vDriverId) return true
            // Match by assigned driver name (case-insensitive)
            if (vDriverName && aDriverName && aDriverName === vDriverName) return true

            return false
          })
          return {
            busNumberPlate: v.busNumberPlate || v.busNumber || v.id || 'N/A',
            model: v.model || 'N/A',
            driver: v.driverName || v.driverId || 'Unassigned',
            route: v.route || 'Unassigned',
            alerts: busAlerts.length,
            status: v.status || 'inactive'
          }
        }),
        fleetSummary: {
          total: fleet.length,
          active: fleet.filter(v => v.status === 'active').length,
          totalAlerts: filteredAlerts.length
        },
        compliance: { driverLicenseValidity: 100, vehicleInspections: 100, safetyTraining: 100, emergencyProtocols: 100, dataReporting: 100 }
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

  if (isLoading || isLoadingAlerts) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 text-primary animate-spin" />
        <p className="text-muted-foreground font-medium">{t("loading_activities") || "Preparing analytics dashboard..."}</p>
      </div>
    )
  }

  const quickReports = [
    {
      id: "driver-performance",
      title: t("driver_performance_report") || "Driver Performance Report",
      desc: t("driver_performance_desc") || "Individual driver safety scores and incident history with performance charts",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      id: "fleet-analytics",
      title: t("fleet_analytics_report") || "Fleet Analytics Report",
      desc: t("fleet_analytics_desc") || "Vehicle-wise safety metrics and maintenance alerts with route analysis charts",
      icon: Bus,
      color: "text-emerald-500",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      id: "daily-summary",
      title: t("todays_summary") || "Safety Summary Report",
      desc: t("daily_summary_desc") || "Full breakdown of safety incidents and system alerts for the selected period",
      icon: Shield,
      color: "text-rose-500",
      bg: "bg-rose-50 dark:bg-rose-950/30",
    },
  ]

  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground min-h-screen">

      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Reports &amp; Analytics</h1>
          <p className="text-muted-foreground">Generate comprehensive reports with live fleet analytics.</p>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Alerts</CardTitle>
            <Activity className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-500">{data.uniqueTodayAlerts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alert Density</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-muted-foreground">{data.alertDensity}</div>
          </CardContent>
        </Card>
      </div>

      {/* Report Configuration + Quick Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Config Card */}
        <Card>
          <CardHeader>
            <CardTitle>{t("report_config") || "Report Configuration"}</CardTitle>
            <CardDescription>{t("report_params") || "Customize your report parameters"}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("report_format") || "Report Format"}</label>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" className="bg-primary/10 border-primary text-primary text-xs">PDF</Button>
                <Button variant="outline" className="opacity-40 cursor-not-allowed text-xs" disabled>XLS</Button>
                <Button variant="outline" className="opacity-40 cursor-not-allowed text-xs" disabled>CSV</Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Target Entity</label>
              <Select value={reportEntity} onValueChange={(val) => { setReportEntity(val as any); setSelectedEntityId("all") }}>
                <SelectTrigger className="w-full">
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Driver</label>
                <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select a driver..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Drivers</SelectItem>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Select Bus</label>
                <Select value={selectedEntityId} onValueChange={setSelectedEntityId}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Select a bus..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Buses</SelectItem>
                    {(Array.isArray(fleet) ? fleet : []).map(f => (
                      <SelectItem key={f.id || f.busNumber} value={f.id || f.busNumber}>
                        {f.busNumberPlate || f.busNumber || f.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">{t("time_period") || "Time Period"}</label>
              <Select value={timePeriod} onValueChange={(val) => setTimePeriod(val as any)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select time period..." /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily (Last 24 Hours)</SelectItem>
                  <SelectItem value="weekly">Weekly (Last 7 Days)</SelectItem>
                  <SelectItem value="monthly">Monthly (Last 30 Days)</SelectItem>
                  <SelectItem value="lifetime">Lifetime (All Time)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              className="w-full"
              onClick={() => handleDownload('custom', 'Custom Fleet Analysis')}
              disabled={isGenerating !== null}
            >
              {isGenerating === 'custom' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <FileDown className="h-4 w-4 mr-2" />
              )}
              {t("generate_custom_report") || "Generate Custom Report"}
            </Button>
          </CardContent>
        </Card>

        {/* Quick Reports Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          {quickReports.map((report) => (
            <Card key={report.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <div className={`${report.bg} p-3 rounded-lg`}>
                    <report.icon className={`h-5 w-5 ${report.color}`} />
                  </div>
                  <Badge variant="secondary">Dynamic</Badge>
                </div>
                <CardTitle className="text-base">{report.title}</CardTitle>
                <CardDescription className="text-sm">{report.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    LIVE STATUS
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary hover:bg-primary/10 text-xs font-medium"
                    onClick={() => handleDownload(report.id, report.title)}
                    disabled={isGenerating !== null}
                  >
                    {isGenerating === report.id ? (
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                    ) : (
                      <Download className="h-3 w-3 mr-1" />
                    )}
                    {t("download_pdf") || "download_pdf"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Fleet Analytics Overview & Safety Incident Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Left: Analytics Overview (col-span-1) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Fleet Analytics Overview</CardTitle>
            <CardDescription>Live metrics from the active fleet and driver data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Active Drivers */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Users className="h-4 w-4" /> Active Duty Drivers
                </span>
                <span className="text-sm font-bold text-green-500">{data.activeDrivers} / {data.totalDrivers}</span>
              </div>
              <Progress value={(data.activeDrivers / data.totalDrivers) * 100} className="h-2" />
            </div>

            {/* Active Vehicles */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Bus className="h-4 w-4" /> Active Vehicles
                </span>
                <span className="text-sm font-bold text-primary">{data.activeVehicles} / {data.totalVehicles}</span>
              </div>
              <Progress value={data.totalVehicles > 0 ? (data.activeVehicles / data.totalVehicles) * 100 : 0} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Right: Safety Incident Summary Chart (col-span-2) */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today's Incident Summary</CardTitle>
            <CardDescription>Breakdown of safety incidents and object detections</CardDescription>
          </CardHeader>
          <CardContent className="h-[220px]">
            {data.uniqueTodayAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <BarChart3 className="h-10 w-10 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground font-medium">No safety alerts logged today.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={data.chartData}
                  margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                >
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={150}
                    tick={{ fontSize: 11, fontWeight: "bold" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "transparent" }}
                    formatter={(value: any) => [`${value} incidents`, "Count"]}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={12}>
                    {data.chartData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>


    </div>
  )
}
