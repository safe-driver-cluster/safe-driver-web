"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
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

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },

  { name: "Live Alerts", href: "/alerts", icon: AlertTriangle },

  { name: "Driver Management", href: "/drivers", icon: Users },

  { name: "Fleet Management", href: "/fleet", icon: Bus },

  { name: "Route Monitoring", href: "/routes", icon: MapPin },

  { name: "Reports & Analytics", href: "/reports", icon: FileText },

  { name: "Performance Analytics", href: "/analytics", icon: BarChart3 },

  { name: "Compliance", href: "/compliance", icon: Shield },
  
  { name: "System Settings", href: "/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 overflow-y-auto shadow-sm">
      <div className="flex flex-col h-full">
        <div className="p-4">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Main Navigation</div>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive ? "bg-primary-50 text-primary-600" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <item.icon className={cn("h-5 w-5", isActive ? "text-primary-500" : "text-gray-400")} />
                  <span>{item.name}</span>
                  {item.name === "Live Alerts" && (
                    <span className="ml-auto bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                      3
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
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900"
          >
            <HelpCircle className="h-5 w-5 text-gray-400" />
            <span>Help & Support</span>
          </Link>

          <div className="mt-4 bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                SD
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">SafeDriver Pro</p>
                <p className="text-xs text-gray-500">v2.4.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
