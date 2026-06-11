"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Bell, Settings, LogOut, Search, Mic, AlertTriangle, MessageSquare, Users, Bus, MapPin, FileText, CheckCircle, Clock, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { useLiveAlerts } from "@/hooks/use-live-alerts"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SearchResult {
  type: "driver" | "fleet" | "route" | "alert"
  id: string
  title: string
  subtitle: string
  href: string
}

interface Notification {
  id: string
  type: "alert" | "driver_registration" | "fleet_registration" | "maintenance" | "system"
  title: string
  message: string
  timestamp: string | number
  read: boolean
  href?: string
  severity?: "high" | "medium" | "low"
}

import { useLanguage } from "@/components/language-provider"
import { useAuth } from "@/components/auth-provider"

export function AdminHeader() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const { alerts: liveAlerts } = useLiveAlerts()
  const { t } = useLanguage()

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A"
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [showResults, setShowResults] = useState(false)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Load saved notifications from localStorage
  useEffect(() => {
    try {
      const savedNotifications = localStorage.getItem("safedriver-notifications")
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications)
        setNotifications(parsed)
        setUnreadCount(parsed.filter((n: Notification) => !n.read).length)
      }
    } catch (error) {
      console.error("Error loading saved notifications:", error)
    }
  }, [])

  // Save notifications to localStorage whenever they change
  useEffect(() => {
    if (notifications.length > 0) {
      try {
        localStorage.setItem("safedriver-notifications", JSON.stringify(notifications))
      } catch (error) {
        console.error("Error saving notifications:", error)
      }
    }
  }, [notifications])

  // Fetch notifications (drivers, fleet, etc.)
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Load existing notifications from localStorage
        let existingNotifications: Notification[] = []
        try {
          const saved = localStorage.getItem("safedriver-notifications")
          if (saved) {
            existingNotifications = JSON.parse(saved)
          }
        } catch (error) {
          console.error("Error loading existing notifications:", error)
        }

        const existingIds = new Set(existingNotifications.map((n) => n.id))
        const allNotifications: Notification[] = [...existingNotifications]

        // Add live alerts as notifications (only if not already exists)
        liveAlerts
          .filter((alert) => alert.status === "active")
          .slice(0, 5) // Limit to 5 most recent
          .forEach((alert) => {
            if (!existingIds.has(alert.id)) {
              allNotifications.push({
                id: alert.id,
                type: "alert",
                title: `${alert.type} Alert`,
                message: `${alert.description} - Vehicle ${alert.number_plate || alert.busNumber || "Unknown"}`,
                timestamp: alert.timestamp || Date.now(),
                read: false,
                href: "/alerts",
                severity: alert.severity || "medium",
              })
            } else {
              // Update existing alert notification if it's still active
              const existingIndex = allNotifications.findIndex((n) => n.id === alert.id)
              if (existingIndex !== -1) {
                allNotifications[existingIndex] = {
                  ...allNotifications[existingIndex],
                  message: `${alert.description} - Vehicle ${alert.number_plate || alert.busNumber || "Unknown"}`,
                  timestamp: alert.timestamp || allNotifications[existingIndex].timestamp,
                  severity: alert.severity || "medium",
                }
              }
            }
          })

        // Fetch recent driver registrations (last 24 hours)
        try {
          const driversResponse = await fetch("/api/drivers?limit=10")
          if (driversResponse.ok) {
            const drivers = await driversResponse.json()
            const recentDrivers = drivers.filter((driver: any) => {
              if (!driver.createdAt) return false
              const createdAt = new Date(driver.createdAt).getTime()
              const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
              return createdAt > oneDayAgo
            })

            recentDrivers.slice(0, 3).forEach((driver: any) => {
              const notificationId = `driver-${driver.id || driver.documentId}`
              if (!existingIds.has(notificationId)) {
                allNotifications.push({
                  id: notificationId,
                  type: "driver_registration",
                  title: "New Driver Registered",
                  message: `${driver.name} has been registered`,
                  timestamp: driver.createdAt || Date.now(),
                  read: false,
                  href: `/drivers/${driver.id || driver.documentId}`,
                  severity: "low",
                })
              }
            })
          }
        } catch (error) {
          console.error("Error fetching driver notifications:", error)
        }

        // Fetch recent fleet registrations (last 24 hours)
        try {
          const fleetResponse = await fetch("/api/fleet?limit=10")
          if (fleetResponse.ok) {
            const vehicles = await fleetResponse.json()
            const recentVehicles = vehicles.filter((vehicle: any) => {
              if (!vehicle.createdAt) return false
              const createdAt = new Date(vehicle.createdAt).getTime()
              const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000
              return createdAt > oneDayAgo
            })

            recentVehicles.slice(0, 3).forEach((vehicle: any) => {
              const notificationId = `fleet-${vehicle.id || vehicle.documentId}`
              if (!existingIds.has(notificationId)) {
                allNotifications.push({
                  id: notificationId,
                  type: "fleet_registration",
                  title: "New Vehicle Registered",
                  message: `${vehicle.busNumberPlate || vehicle.busNumber || "Vehicle"} has been added to fleet`,
                  timestamp: vehicle.createdAt || Date.now(),
                  read: false,
                  href: `/fleet/${vehicle.id || vehicle.documentId}`,
                  severity: "low",
                })
              }
            })
          }
        } catch (error) {
          console.error("Error fetching fleet notifications:", error)
        }

        // Remove old notifications (older than 7 days)
        const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
        const filteredNotifications = allNotifications.filter((notification) => {
          const timestamp = typeof notification.timestamp === "string"
            ? new Date(notification.timestamp).getTime()
            : notification.timestamp
          return timestamp > sevenDaysAgo
        })

        // Sort by timestamp (newest first)
        filteredNotifications.sort((a, b) => {
          const timeA = typeof a.timestamp === "string" ? new Date(a.timestamp).getTime() : a.timestamp
          const timeB = typeof b.timestamp === "string" ? new Date(b.timestamp).getTime() : b.timestamp
          return timeB - timeA
        })

        // Limit to 50 most recent notifications
        const limitedNotifications = filteredNotifications.slice(0, 50)

        setNotifications(limitedNotifications)
        setUnreadCount(limitedNotifications.filter((n) => !n.read).length)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()
    // Refresh notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [liveAlerts])

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) => {
      const updated = prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      // Save to localStorage
      try {
        localStorage.setItem("safedriver-notifications", JSON.stringify(updated))
      } catch (error) {
        console.error("Error saving notifications:", error)
      }
      return updated
    })
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const updated = prev.map((n) => ({ ...n, read: true }))
      // Save to localStorage
      try {
        localStorage.setItem("safedriver-notifications", JSON.stringify(updated))
      } catch (error) {
        console.error("Error saving notifications:", error)
      }
      return updated
    })
    setUnreadCount(0)
  }

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "driver_registration":
        return <Users className="h-4 w-4 text-blue-600" />
      case "fleet_registration":
        return <Bus className="h-4 w-4 text-green-600" />
      case "maintenance":
        return <Settings className="h-4 w-4 text-yellow-600" />
      default:
        return <Bell className="h-4 w-4 text-gray-600" />
    }
  }

  const formatNotificationTime = (timestamp: string | number): string => {
    const timestampMs = typeof timestamp === "string" ? new Date(timestamp).getTime() : timestamp
    const now = Date.now()
    const diffMs = now - timestampMs
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMinutes < 1) return "Just now"
    if (diffMinutes < 60) return `${diffMinutes}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  // Handle search functionality
  useEffect(() => {
    const performSearch = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([])
        setShowResults(false)
        return
      }

      try {
        const query = searchQuery.toLowerCase().trim()
        const results: SearchResult[] = []

        // Search drivers
        try {
          const driversResponse = await fetch(`/api/drivers?search=${encodeURIComponent(query)}&limit=5`)
          if (driversResponse.ok) {
            const drivers = await driversResponse.json()
            drivers.forEach((driver: any) => {
              results.push({
                type: "driver",
                id: driver.id || driver.documentId,
                title: driver.name,
                subtitle: `License: ${driver.licenseNumber}${driver.busNumber ? ` • Bus: ${driver.busNumber}` : ""}`,
                href: `/drivers`,
              })
            })
          }
        } catch (error) {
          console.error("Error searching drivers:", error)
        }

        // Search fleet
        try {
          const fleetResponse = await fetch(`/api/fleet?search=${encodeURIComponent(query)}&limit=5`)
          if (fleetResponse.ok) {
            const vehicles = await fleetResponse.json()
            vehicles.forEach((vehicle: any) => {
              results.push({
                type: "fleet",
                id: vehicle.id || vehicle.documentId,
                title: vehicle.busNumberPlate || vehicle.busNumber || vehicle.documentId,
                subtitle: `${vehicle.model || "Vehicle"}${vehicle.route ? ` • Route: ${vehicle.route}` : ""}`,
                href: `/fleet`,
              })
            })
          }
        } catch (error) {
          console.error("Error searching fleet:", error)
        }

        // Search routes
        try {
          const routesResponse = await fetch(`/api/routes?search=${encodeURIComponent(query)}&limit=5`)
          if (routesResponse.ok) {
            const routes = await routesResponse.json()
            routes.forEach((route: any) => {
              results.push({
                type: "route",
                id: route.id || route.documentId,
                title: route.name,
                subtitle: `${route.startPoint} → ${route.endPoint}`,
                href: `/routes`,
              })
            })
          }
        } catch (error) {
          console.error("Error searching routes:", error)
        }

        setSearchResults(results.slice(0, 8)) // Limit to 8 results
        setShowResults(results.length > 0)
      } catch (error) {
        console.error("Search error:", error)
        setSearchResults([])
        setShowResults(false)
      }
    }

    const debounceTimer = setTimeout(() => {
      performSearch()
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && searchResults.length > 0) {
      router.push(searchResults[0].href)
      setSearchQuery("")
      setShowResults(false)
    }
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "driver":
        return <Users className="h-4 w-4" />
      case "fleet":
        return <Bus className="h-4 w-4" />
      case "route":
        return <MapPin className="h-4 w-4" />
      case "alert":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  return (
    <header className="bg-background border-b border-border px-4 md:px-6 py-3 fixed top-0 left-0 right-0 z-40 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0 w-8 h-8">
              <Image src="/logo.png" alt="SafeDriver Logo" width={32} height={32} className="object-contain w-8 h-8" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-bold text-foreground">SafeDriver</h1>
              <p className="text-xs text-muted-foreground hidden md:block">{t("transport_safety")}</p>
            </div>
          </div>
        </div>

        {/* Desktop Search - hidden on mobile */}
        <div className="hidden md:flex ml-8 flex-1 max-w-2xl relative" ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className="w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                ref={inputRef}
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true)
                  }
                }}
                className="pl-10 pr-4 bg-muted w-full"
              />
            </div>
          </form>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
              <div className="p-2">
                {searchResults.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.id}-${index}`}
                    href={result.href}
                    onClick={() => {
                      setSearchQuery("")
                      setShowResults(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                    <span className="text-xs text-muted-foreground capitalize">{result.type}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {showResults && searchQuery.trim() && searchResults.length === 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border text-popover-foreground rounded-lg shadow-lg z-50 p-4">
              <p className="text-sm text-muted-foreground text-center">No results found</p>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Mobile Search Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsSearchOpen(!isSearchOpen)}>
            <Search className="h-5 w-5 text-gray-600" />
          </Button>

          {/* Notifications */}
          <DropdownMenu open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5 text-gray-600" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-semibold text-sm">{t("notifications")}</h3>
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={markAllAsRead}
                  >
                    Mark all as read
                  </Button>
                )}
              </div>
              <ScrollArea className="h-[400px]">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-gray-500">
                    <Bell className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No notifications</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 hover:bg-muted transition-colors cursor-pointer relative",
                          !notification.read && "bg-blue-50/50 dark:bg-blue-950/20"
                        )}
                        onClick={() => {
                          markAsRead(notification.id)
                          if (notification.href) {
                            router.push(notification.href)
                            setIsNotificationOpen(false)
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={cn("text-sm font-medium", !notification.read && "font-semibold")}>
                                {notification.title}
                              </p>
                              {!notification.read && (
                                <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs text-muted-foreground">
                                {formatNotificationTime(notification.timestamp)}
                              </span>
                              {notification.severity && (
                                <Badge
                                  variant={
                                    notification.severity === "high"
                                      ? "destructive"
                                      : notification.severity === "medium"
                                        ? "default"
                                        : "secondary"
                                  }
                                  className="text-xs h-4"
                                >
                                  {notification.severity}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
              {notifications.length > 0 && (
                <div className="p-2 border-t">
                  <Button
                    variant="ghost"
                    className="w-full text-xs"
                    onClick={() => {
                      router.push("/alerts")
                      setIsNotificationOpen(false)
                    }}
                  >
                    View all notifications
                  </Button>
                </div>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium">
                  {initials}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-foreground truncate max-w-[120px]">
                    {user?.displayName || t("admin_user")}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                    {user?.email || "admin@safedriver.com"}
                  </p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="px-2 py-1.5 border-b">
                <p className="text-sm font-medium truncate">{user?.displayName || "Admin User"}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email || "admin@safedriver.com"}</p>
              </div>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile Search - Expandable */}
      {isSearchOpen && (
        <div className="mt-3 pb-2 md:hidden" ref={searchRef}>
          <form onSubmit={handleSearchSubmit}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder={t("search_placeholder")}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setShowResults(true)
                }}
                onFocus={() => {
                  if (searchResults.length > 0) {
                    setShowResults(true)
                  }
                }}
                className="pl-10 pr-4 bg-muted w-full"
                autoFocus
                onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
              />
            </div>
          </form>

          {/* Mobile Search Results */}
          {showResults && searchResults.length > 0 && (
            <div className="mt-2 bg-popover border border-border text-popover-foreground rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="p-2">
                {searchResults.map((result, index) => (
                  <Link
                    key={`${result.type}-${result.id}-${index}`}
                    href={result.href}
                    onClick={() => {
                      setSearchQuery("")
                      setShowResults(false)
                      setIsSearchOpen(false)
                    }}
                    className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted transition-colors"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      {getResultIcon(result.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
