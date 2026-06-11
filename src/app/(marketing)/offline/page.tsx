"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { WifiOff, RefreshCw, Home } from "lucide-react"
import Link from "next/link"

export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-none shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <WifiOff className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">You're Offline</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-gray-600">
            It looks like you've lost your internet connection. Don't worry, you can still access some features of
            SafeDriver.
          </p>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-800 mb-2">Available Offline:</h3>
            <ul className="text-sm text-blue-700 space-y-1 text-left">
              <li>• View recent alerts and driver information</li>
              <li>• Access cached dashboard data</li>
              <li>• Browse vehicle and route information</li>
              <li>• Queue actions for when you're back online</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Button onClick={handleRetry} className="w-full gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>

            <Link href="/" className="block">
              <Button variant="outline" className="w-full gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            </Link>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Your actions will be automatically synced when your connection is restored.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
