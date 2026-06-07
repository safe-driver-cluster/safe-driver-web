import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { FirebaseInitializer } from "@/components/firebase-initializer"
import { ServiceWorkerRegister } from "@/components/service-worker-register"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider } from "@/components/language-provider"
import { ColorSchemeInitializer } from "@/components/color-scheme-initializer"
import { AuthProvider } from "@/components/auth-provider"
import { LayoutWrapper } from "@/components/layout-wrapper"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "SafeDriver Authority Panel",
  description: "Transport Safety Management System",
  manifest: "/manifest.json",
  generator: 'v0.dev',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
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
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="SafeDriver" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(event) {
                var msg = event.message || '';
                if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Loading chunk') !== -1 || msg.indexOf('Cannot read properties of undefined (reading \\'call\\')') !== -1) {
                  console.warn('ChunkLoadError detected, reloading window...');
                  window.location.reload();
                }
              });
              window.addEventListener('unhandledrejection', function(event) {
                var msg = (event.reason && event.reason.message) ? event.reason.message : String(event.reason);
                if (msg.indexOf('ChunkLoadError') !== -1 || msg.indexOf('Loading chunk') !== -1 || msg.indexOf('Cannot read properties of undefined (reading \\'call\\')') !== -1) {
                  console.warn('ChunkLoadError rejection detected, reloading window...');
                  window.location.reload();
                }
              });
            `,
          }}
        />
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
            <AuthProvider>
              <LayoutWrapper>{children}</LayoutWrapper>

              {/* Toast Notifications */}
              <Toaster />

              {/* Firebase Initializer (client-side only) */}
              <FirebaseInitializer />

              {/* Service Worker Registration (client-side only) */}
              <ServiceWorkerRegister />
            </AuthProvider>
          </ThemeProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
