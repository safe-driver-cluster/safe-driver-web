"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { OfflineIndicator } from "@/components/offline-indicator"

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthPage = pathname === "/login"

  if (isAuthPage) {
    return <div className="min-h-screen bg-slate-950 text-white">{children}</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AdminHeader />
      <div className="flex">
        {/* Desktop Sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <AdminSidebar />
        </div>

        {/* Main Content - full width on mobile, adjusted margin on desktop */}
        <main className="flex-1 md:ml-64 p-4 md:p-6 pt-20 md:pt-24 bg-background min-h-screen w-full relative z-0">
          {children}
        </main>
      </div>

      {/* Mobile Navigation - visible only on mobile */}
      <div className="md:hidden">
        <MobileNav />
      </div>

      {/* Offline Indicator */}
      <OfflineIndicator />
    </div>
  )
}
