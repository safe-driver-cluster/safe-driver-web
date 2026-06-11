"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { siteConfig } from "@/config/site"
import { Icons } from "@/components/icons"
import {
  Home,
  AlertTriangle,
  Users,
  Bus,
  Route,
  BarChart3,
  MessageSquare,
  Shield,
  Menu,
  Phone,
  Settings,
  FileText,
  Mic,
  MapPin,
} from "lucide-react"

const navigation = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Alerts",
    href: "/alerts",
    icon: AlertTriangle,
    badge: "3",
  },
  {
    title: "Drivers",
    href: "/drivers",
    icon: Users,
  },
  {
    title: "Fleet",
    href: "/fleet",
    icon: Bus,
  },
  {
    title: "Routes",
    href: "/routes",
    icon: Route,
  },
  {
    title: "Geofences",
    href: "/geofences",
    icon: MapPin,
    badge: "New",
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
]

const additionalLinks = [
  {
    title: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Phone,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-bottom md:hidden">
        <div className="grid grid-cols-4 h-16">
          <Link
            href="/"
            className={`flex flex-col items-center justify-center space-y-1 ${
              pathname === "/" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <Home className="h-5 w-5" />
            <span className="text-xs font-medium">Dashboard</span>
          </Link>

          <Link
            href="/alerts"
            className={`flex flex-col items-center justify-center space-y-1 relative ${
              pathname === "/alerts" ? "text-red-600" : "text-gray-600"
            }`}
          >
            <AlertTriangle className="h-5 w-5" />
            <span className="text-xs font-medium">Alerts</span>
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
              3
            </Badge>
          </Link>

          <Link
            href="/drivers"
            className={`flex flex-col items-center justify-center space-y-1 ${
              pathname === "/drivers" ? "text-blue-600" : "text-gray-600"
            }`}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs font-medium">Drivers</span>
          </Link>

          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="flex flex-col items-center justify-center space-y-1 h-full text-gray-600"
              >
                <Menu className="h-5 w-5" />
                <span className="text-xs font-medium">More</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <div className="flex flex-col h-full">
                <div className="flex items-center space-x-2 pb-4 border-b">
                  <Icons.logo className="h-6 w-6" />
                  <span className="font-bold">{siteConfig.name}</span>
                </div>

                <div className="flex-1 overflow-y-auto py-4">
                  <div className="space-y-1">
                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Navigation</h2>
                      <div className="space-y-1">
                        {navigation.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-100 ${
                              pathname === item.href ? "bg-gray-100" : ""
                            } ${(item as any).className || ""}`}
                          >
                            <div className="flex items-center space-x-2">
                              <item.icon className="h-4 w-4" />
                              <span>{item.title}</span>
                            </div>
                            {item.badge && (
                              <Badge variant={item.badge === "SOS" ? "destructive" : "secondary"} className="text-xs">
                                {item.badge}
                              </Badge>
                            )}
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="px-3 py-2">
                      <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">Additional</h2>
                      <div className="space-y-1">
                        {additionalLinks.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center space-x-2 rounded-md px-2 py-2 text-sm font-medium hover:bg-gray-100 ${
                              pathname === item.href ? "bg-gray-100" : ""
                            }`}
                          >
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Spacer for bottom navigation */}
      <div className="h-16 md:hidden"></div>
    </>
  )
}
