import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AdminHeader } from "@/components/admin-header"
import { AdminSidebar } from "@/components/admin-sidebar"
import { MobileNav } from "@/components/mobile-nav"
import { OfflineIndicator } from "@/components/offline-indicator"
import { VoiceCommandButton } from "@/components/voice-command-button"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseInitializer } from "@/components/firebase-initializer"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { ColorSchemeInitializer } from "@/components/color-scheme-initializer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SafeDriver Authority Panel",
  description: "Transport Safety Management System",
  manifest: "/manifest.json",
  generator: 'v0.dev',
  icons: {
    icon: '/placeholder-logo.png',
    apple: '/placeholder-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SafeDriver",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#3b82f6",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/placeholder-logo.png" />
        <link rel="apple-touch-icon" href="/placeholder-logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SafeDriver" />
      </head>
      <body className={inter.className}>
        <LanguageProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ColorSchemeInitializer />
            <div className="min-h-screen bg-background text-foreground">
              <AdminHeader />
              <div className="flex">
                {/* Desktop Sidebar - hidden on mobile */}
                <div className="hidden md:block">
                  <AdminSidebar />
                </div>

                {/* Main Content - full width on mobile, adjusted margin on desktop */}
                <main className="flex-1 md:ml-64 p-4 md:p-6 pt-20 md:pt-24 bg-background min-h-screen w-full relative z-0">{children}</main>
              </div>

              {/* Mobile Navigation - visible only on mobile */}
              <div className="md:hidden">
                <MobileNav />
              </div>

              {/* Offline Indicator */}
              <OfflineIndicator />

              {/* Voice Command Button */}
              <VoiceCommandButton />

              {/* Toast Notifications */}
              <Toaster />

              {/* Firebase Initializer (client-side only) */}
              <FirebaseInitializer />

              {/* Service Worker Registration (client-side only) */}
              <ServiceWorkerRegister />
            </div>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
