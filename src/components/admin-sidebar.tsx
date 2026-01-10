"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useLiveAlerts } from "@/hooks/use-live-alerts"
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  FileText,
  Settings,
  Bus,
  MapPin,
  BarChart3,
  Shield,
  HelpCircle,
} from "lucide-react"

import { useLanguage } from "@/components/language-provider"

const navigation = [
  { id: "dashboard", href: "/", icon: LayoutDashboard },
  { id: "live_alerts", href: "/alerts", icon: AlertTriangle },
  { id: "drivers", href: "/drivers", icon: Users },
  { id: "fleet", href: "/fleet", icon: Bus },
  { id: "routes", href: "/routes", icon: MapPin },
  { id: "reports", href: "/reports", icon: FileText },
  { id: "analytics", href: "/analytics", icon: BarChart3 },
  { id: "compliance", href: "/compliance", icon: Shield },
  { id: "settings", href: "/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { alerts: liveAlerts } = useLiveAlerts()
  const { t } = useLanguage()

  // Count active alerts (alerts with status "active")
  const activeAlertsCount = liveAlerts.filter((alert) => alert.status === "active").length

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-background border-r border-border overflow-y-auto shadow-sm z-50">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">{t("main_navigation")}</div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer relative z-10",
                    isActive ? "bg-primary/20 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary-500" : "text-gray-400")} />
                  <span>{t(item.id)}</span>
                  {item.id === "live_alerts" && activeAlertsCount > 0 && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {activeAlertsCount}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="mt-auto p-4 border-t border-gray-200">
          <Link
            href="/help"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
          >
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <span>{t("help_support")}</span>
          </Link>

          <div className="mt-4 bg-muted rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium">
                SD
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{t("safedriver_pro")}</p>
                <p className="text-xs text-muted-foreground">v2.4.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
