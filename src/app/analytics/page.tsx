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
import {
  TrendingUp,
  Shield,
  Activity,
  AlertTriangle,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  Clock,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Target,
  Brain,
  ChevronRight,
} from "lucide-react"
import { useLanguage } from "@/components/language-provider"
import { useLiveAlerts, isToday } from "@/hooks/use-live-alerts"

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

export default function AnalyticsPage() {
  const { t } = useLanguage()
  const { alerts: liveAlerts, historyAlerts, isLoading: isLoadingAlerts } = useLiveAlerts()
  const [fleetVehicles, setFleetVehicles] = useState<any[]>([])
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [isLoadingFleet, setIsLoadingFleet] = useState(true)
  const [isLoadingFeedbacks, setIsLoadingFeedbacks] = useState(true)

  // Fetch feedbacks
  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        setIsLoadingFeedbacks(true)
        const response = await fetch("/api/feedback", { cache: "no-store" })
        if (response.ok) {
          const data = await response.json()
          setFeedbacks(data)
        }
      } catch (error) {
        console.error("Error fetching feedbacks:", error)
      } finally {
        setIsLoadingFeedbacks(false)
      }
    }
    fetchFeedbacks()
    const interval = setInterval(fetchFeedbacks, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fetch fleet vehicles
  useEffect(() => {
    const fetchFleetVehicles = async () => {
      try {
        setIsLoadingFleet(true)
        const response = await fetch("/api/fleet", { cache: "no-store" })
        if (response.ok) {
          const vehicles = await response.json()
          setFleetVehicles(vehicles)
        }
      } catch (error) {
        console.error("Error fetching fleet:", error)
      } finally {
        setIsLoadingFleet(false)
      }
    }

    fetchFleetVehicles()
    const interval = setInterval(fetchFleetVehicles, 30000)
    return () => clearInterval(interval)
  }, [])

  // Process Live Data
  const data = useMemo(() => {
    const combinedTodayAlerts = [...liveAlerts.filter(a => isToday(a.timestamp)), ...historyAlerts.filter(a => isToday(a.timestamp))]
    const uniqueTodayAlerts = combinedTodayAlerts.filter((alert, index, self) => index === self.findIndex((a) => a.id === alert.id))

    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const isYesterday = (ts: string | number) => new Date(ts).toDateString() === yesterday.toDateString()

    // 1. Health Monitor
    const activeNodes = new Set(uniqueTodayAlerts.map(a => a.deviceId)).size
    
    let latencyValue = "Syncing"
    if (uniqueTodayAlerts.length > 0) {
      const newestTs = Math.max(...uniqueTodayAlerts.map(a => new Date(a.timestamp).getTime() || 0))
      const diffMs = Date.now() - newestTs
      if (diffMs > 0 && diffMs < 60000) {
        latencyValue = `${diffMs}ms`
      } else {
        latencyValue = "Optimal"
      }
    } else {
      latencyValue = "Awaiting"
    }


    
    const totalVehicles = fleetVehicles.length || 1
    const activeVehicles = fleetVehicles.filter(v => v.status === "active").length
    const fleetActivity = Math.round((activeVehicles / totalVehicles) * 100)

    const totalAlertsCount = uniqueTodayAlerts.length || 1
    const resolvedAlerts = uniqueTodayAlerts.filter(a => a.status === "resolved").length
    const resolutionRate = uniqueTodayAlerts.length > 0 ? Math.round((resolvedAlerts / totalAlertsCount) * 100) : 100

    // 3. High Risk Zones
    const routeAlertCounts: Record<string, number> = {}
    const routeYesterdayAlertCounts: Record<string, number> = {}
    
    uniqueTodayAlerts.forEach(a => {
      const route = (a.route && a.route !== "Unknown Route") ? a.route : (a.location || "Unmapped Location")
      routeAlertCounts[route] = (routeAlertCounts[route] || 0) + 1
    })

    // Calculate yesterday's counts for the trend
    historyAlerts.filter(a => isYesterday(a.timestamp)).forEach(a => {
      const route = (a.route && a.route !== "Unknown Route") ? a.route : (a.location || "Unmapped Location")
      routeYesterdayAlertCounts[route] = (routeYesterdayAlertCounts[route] || 0) + 1
    })

    const sortedRoutes = Object.entries(routeAlertCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([zone, alerts]) => {
        let risk = "Low"
        if (alerts >= 8) risk = "High"
        else if (alerts >= 3) risk = "Medium"
        
        const yesterdayCount = routeYesterdayAlertCounts[zone] || 0
        const trend = alerts > yesterdayCount ? "up" : "down"

        return { zone, risk, trend, alerts }
      })
      .slice(0, 3)

    const highRiskZones = sortedRoutes.length > 0 ? sortedRoutes : [
      { zone: "No active risk zones detected today", risk: "Low", trend: "down", alerts: 0 }
    ]

    // 4. Fatigue Prediction
    const fatigueAlerts = uniqueTodayAlerts.filter(a => a.type.toLowerCase().includes("drowsy") || a.tag?.toLowerCase().includes("yawn"))
    const fatigueRouteCounts: Record<string, number> = {}
    fatigueAlerts.forEach(a => {
      const route = (a.route && a.route !== "Unknown Route") ? a.route : "Multiple Routes"
      fatigueRouteCounts[route] = (fatigueRouteCounts[route] || 0) + 1
    })
    const mostFatigueRoute = Object.entries(fatigueRouteCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "No Data"
    const fatigueRiskIncrease = fatigueAlerts.length > 0 ? Math.min(45, fatigueAlerts.length * 5) : 5

    // 5. Customer Feedbacks
    const averageRating = feedbacks.length > 0 ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 5), 0) / feedbacks.length).toFixed(1) : "5.0"

    return {
      activeNodes,
      latencyValue,
      fleetActivity,
      resolutionRate,
      highRiskZones,
      mostFatigueRoute,
      fatigueRiskIncrease,
      totalAlerts: uniqueTodayAlerts.length,
      averageRating
    }
  }, [liveAlerts, historyAlerts, fleetVehicles, feedbacks])

  const isLoading = isLoadingAlerts || isLoadingFleet || isLoadingFeedbacks

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-12 w-12 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <p className="text-muted-foreground font-medium animate-pulse">Synchronizing performance data...</p>
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
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground mb-2">
            {t("analytics_dashboard") || "Performance Analytics"}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl">
            {t("analytics_desc") || "Deep-dive into fleet performance, safety metrics, and operational efficiency with live AI-driven insights."}
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-2 hover:bg-accent dark:hover:bg-slate-800 shadow-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            {t("refresh_data") || "Live Refresh"}
          </Button>
          <Button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-700 shadow-lg dark:shadow-none">
            <Zap className="h-4 w-4 mr-2" />
            {t("ai_insights") || "Run AI Analysis"}
          </Button>
        </div>
      </motion.div>

      {/* Real-time Health Monitor */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: "Network Health", value: data.activeNodes > 0 ? "Optimal" : "Checking", sub: "Live Connection", icon: Zap, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/20" },
          { label: "Data Latency", value: data.latencyValue, sub: "Live stream", icon: Clock, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/20" },
          { label: "Active Connections", value: data.activeNodes.toString(), sub: "Devices streaming", icon: Activity, color: "text-indigo-600 dark:text-indigo-400", bg: "bg-indigo-50 dark:bg-indigo-950/20" },
        ].map((item, i) => (
          <Card key={i} className="border-2 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md">
            <CardContent className="p-6 flex items-center gap-6">
              <div className={`${item.bg} p-4 rounded-2xl`}>
                <item.icon className={`h-8 w-8 ${item.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground/60 uppercase tracking-widest">{item.label}</p>
                <h3 className="text-2xl font-bold text-foreground">{item.value}</h3>
                <p className="text-xs font-medium text-muted-foreground mt-1">{item.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Main Analytics View */}
      <Tabs defaultValue="performance" className="space-y-8">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border-2 dark:border-slate-800 overflow-x-auto flex flex-nowrap w-full justify-start md:w-auto">
          <TabsTrigger value="performance" className="rounded-xl px-10 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-md transition-all font-bold shrink-0">
            <BarChart3 className="h-4 w-4 mr-2 text-indigo-600" />
            {t("performance_metrics") || "Performance"}
          </TabsTrigger>
          <TabsTrigger value="compliance" className="rounded-xl px-10 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-md transition-all font-bold shrink-0">
            <Shield className="h-4 w-4 mr-2 text-emerald-600" />
            {t("compliance_overview") || "Feedbacks"}
          </TabsTrigger>
          <TabsTrigger value="risk" className="rounded-xl px-10 py-2.5 data-[state=active]:bg-white data-[state=active]:text-slate-900 dark:data-[state=active]:bg-slate-800 dark:data-[state=active]:text-slate-100 data-[state=active]:shadow-md transition-all font-bold shrink-0">
            <AlertTriangle className="h-4 w-4 mr-2 text-rose-600" />
            Risk Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Chart */}
            <Card className="lg:col-span-2 border-2 rounded-3xl shadow-xl overflow-hidden group">
              <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b-2 dark:border-slate-800 p-8">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-2xl font-bold">Operational Efficiency</CardTitle>
                    <CardDescription>Real-time fleet tracking & alert metrics</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className="bg-indigo-100 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 border-none px-4 py-1 rounded-lg">Live Stream</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0 h-[400px] flex items-center justify-center relative bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                 <div className="text-center space-y-4 group-hover:scale-105 transition-transform duration-500">
                    <div className="inline-flex bg-indigo-100 dark:bg-indigo-950 p-6 rounded-3xl shadow-inner">
                      <LineChart className="h-16 w-16 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <p className="text-muted-foreground/60 font-bold uppercase tracking-widest text-sm">Real-time Visualizer Ready</p>
                 </div>
                 <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-indigo-500/5 to-transparent" />
              </CardContent>
            </Card>

            {/* KPIs */}
            <div className="space-y-6">
              {[
                { label: "Fleet Activity", value: data.fleetActivity, color: "bg-blue-500", icon: Activity },
                { label: "Resolution Rate", value: data.resolutionRate, color: "bg-indigo-500", icon: Target },
              ].map((kpi, i) => (
                <Card key={i} className="border-2 rounded-3xl shadow-lg hover:translate-x-2 transition-transform duration-300">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                          <kpi.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                        </div>
                        <span className="font-bold text-foreground">{kpi.label}</span>
                      </div>
                      <span className="text-xl font-black text-foreground">{kpi.value}%</span>
                    </div>
                    <Progress value={kpi.value} className={`h-3 ${kpi.color} rounded-full`} />
                    <div className="mt-3 flex justify-between items-center">
                       <span className="text-xs font-bold text-muted-foreground/60">Live Status</span>
                       <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                         <ArrowUpRight className="h-3 w-3 mr-1" />
                         Active
                       </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-8">
           <Card className="border-2 rounded-[2rem] shadow-2xl overflow-hidden">
             <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-12 space-y-8">
                   <div>
                     <Badge className={`${Number(data.averageRating) >= 4.0 ? 'bg-emerald-600' : Number(data.averageRating) >= 3.0 ? 'bg-amber-500' : 'bg-rose-500'} mb-4 px-4 py-1`}>
                       {Number(data.averageRating) >= 4.0 ? 'High Satisfaction' : Number(data.averageRating) >= 3.0 ? 'Needs Improvement' : 'Critical Satisfaction'}
                     </Badge>
                     <h2 className="text-4xl font-black text-foreground leading-tight">Customer Feedbacks</h2>
                     <p className="text-muted-foreground text-lg mt-4 leading-relaxed">
                       Direct passenger feedback collected regarding driver behavior and overall fleet safety.
                     </p>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-8">
                      <div>
                        <p className={`text-3xl font-black ${Number(data.averageRating) >= 4.0 ? 'text-emerald-600 dark:text-emerald-400' : Number(data.averageRating) >= 3.0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          {data.averageRating} / 5.0
                        </p>
                        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Average Rating</p>
                      </div>
                      <div>
                        <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{feedbacks.length}</p>
                        <p className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest mt-1">Total Feedbacks</p>
                      </div>
                   </div>

                   <Button className="w-full py-7 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200 text-white font-bold transition-all shadow-xl dark:shadow-none group">
                     View All Feedbacks
                     <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                   </Button>
                </div>
                
                <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-12 flex flex-col items-center justify-start relative group max-h-[600px] overflow-y-auto">
                   <div className="w-full space-y-4">
                      <h4 className="text-xl font-bold text-foreground sticky top-0 bg-slate-50 dark:bg-slate-900 py-2 z-10">Recent Feedbacks</h4>
                      {feedbacks.length === 0 ? (
                        <p className="text-muted-foreground">No feedbacks available.</p>
                      ) : (
                        feedbacks.slice(0, 10).map((fb, i) => (
                          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-2">
                             <div className="flex justify-between items-center">
                               <div className="flex items-center gap-2">
                                 <div className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md text-xs font-bold">{fb.busNumber || 'Unknown Bus'}</div>
                                 <span className="text-xs text-muted-foreground">{new Date(fb.createdAt || Date.now()).toLocaleDateString()}</span>
                               </div>
                               <Badge className={`${Number(fb.rating) >= 4 ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' : Number(fb.rating) >= 3 ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400' : 'bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400'} border-none`}>
                                 {fb.rating || 5} Stars
                               </Badge>
                             </div>
                             <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">"{fb.message || fb.comment || 'No comment provided.'}"</p>
                             {fb.type && <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold uppercase">{fb.type}</p>}
                          </div>
                        ))
                      )}
                   </div>
                </div>
             </div>
           </Card>
        </TabsContent>

         <TabsContent value="risk" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <Card className="border-2 rounded-3xl shadow-xl p-10 bg-slate-900 dark:bg-slate-950 text-white overflow-hidden relative group">
                 <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Brain className="h-64 w-64 -mr-20 -mt-20" />
                 </div>
                 <div className="relative z-10">
                   <Badge className="bg-rose-500 border-none mb-6 px-4 py-1 text-xs font-bold tracking-widest uppercase">Live Risk Forecast</Badge>
                   <h3 className="text-3xl font-extrabold mb-4 leading-tight">Predictive Fatigue Analysis</h3>
                   <p className="text-slate-400 text-lg leading-relaxed mb-8">
                     Live AI models indicate a {data.fatigueRiskIncrease}% risk increase in driver fatigue currently detected on <strong className="text-white">{data.mostFatigueRoute}</strong>.
                   </p>
                   <div className="flex gap-4">
                     <Button className="rounded-xl bg-white text-slate-900 hover:bg-slate-100 font-bold px-8">Mitigate Risk</Button>
                     <Button variant="ghost" className="rounded-xl text-white hover:bg-white/10 font-bold border-2 border-white/20">View Data</Button>
                   </div>
                 </div>
               </Card>

               <Card className="border-2 rounded-3xl shadow-xl p-10 bg-white dark:bg-slate-900 overflow-hidden group">
                 <h3 className="text-2xl font-bold mb-6 flex items-center gap-3 text-slate-900 dark:text-slate-100">
                   <div className="h-2 w-2 rounded-full bg-rose-600" />
                   High-Risk Zones Detected
                 </h3>
                 <div className="space-y-6">
                   {data.highRiskZones.map((zone, i) => (
                     <div key={i} className="flex items-center justify-between p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all">
                       <div className="flex items-center gap-4">
                         <div className={`p-3 rounded-xl ${zone.risk === 'High' ? 'bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400' : zone.risk === 'Medium' ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'}`}>
                           <MapPin className="h-5 w-5" />
                         </div>
                         <div className="max-w-[150px] sm:max-w-[200px]">
                           <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{zone.zone}</p>
                           <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{zone.alerts} Alerts logged</p>
                         </div>
                       </div>
                       <div className="text-right shrink-0">
                          <Badge className={`${zone.risk === 'High' ? 'bg-rose-500' : zone.risk === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'} text-white border-none`}>
                            {zone.risk} Risk
                          </Badge>
                          <p className={`text-[10px] font-black uppercase mt-1 flex items-center justify-end ${zone.trend === 'up' ? 'text-rose-600' : 'text-emerald-600'}`}>
                            {zone.trend === 'up' ? <ArrowUpRight className="h-2 w-2 mr-0.5" /> : <ArrowDownRight className="h-2 w-2 mr-0.5" />}
                            Trending {zone.trend}
                          </p>
                       </div>
                     </div>
                   ))}
                 </div>
               </Card>
            </div>
         </TabsContent>
      </Tabs>
    </motion.div>
  )
}

function MapPin(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}
