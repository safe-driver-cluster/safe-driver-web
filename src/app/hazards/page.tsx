"use client"

import { HazardMonitoringMap } from "@/components/hazards/hazard-monitoring-map"
import { useLanguage } from "@/components/language-provider"
import { AlertTriangle, ShieldAlert } from "lucide-react"
import { Card } from "@/components/ui/card"

export default function HazardsPage() {
  const { t } = useLanguage()

  return (
    <div className="container mx-auto px-4 py-8 bg-background text-foreground min-h-screen">
      {/* Page Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t("hazards")}
          </h1>
          <p className="text-muted-foreground">
            Identify and monitor critical danger zones across the transit network. 
            Associated routes will automatically receive real-time alerts when vehicles approach these zones.
          </p>
        </div>
      </div>

      {/* Main Map Component */}
      <div className="mb-8">
        <HazardMonitoringMap />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 rounded-3xl border border-border shadow-sm flex gap-4 items-start">
          <div className="h-12 w-12 rounded-2xl bg-amber-50 dark:bg-amber-950/20 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Dangerous Bends</h3>
            <p className="text-sm text-muted-foreground font-medium">Mark sharp curves and mountain passes that require reduced speed.</p>
          </div>
        </Card>
        
        <Card className="p-6 rounded-3xl border border-border shadow-sm flex gap-4 items-start">
          <div className="h-12 w-12 rounded-2xl bg-red-50 dark:bg-red-950/20 text-red-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-foreground mb-1">Accident Prone</h3>
            <p className="text-sm text-muted-foreground font-medium">Historical high-risk areas identified through driver feedback and data.</p>
          </div>
        </Card>
      </div>
    </div>
  )
}
