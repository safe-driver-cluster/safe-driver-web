"use client"

import { AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getRiskLevelDetails } from "@/lib/safety-score"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface RiskLevelCardProps {
  score: number
  trend?: string
  className?: string
}

export function RiskLevelCard({ score, trend = "-5.0%", className }: RiskLevelCardProps) {
  const isPositive = trend.startsWith("+")
  const trendColor = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"

  const { level, colorClass, barColor } = getRiskLevelDetails(score)
  const riskPercentage = Math.max(0, 100 - score)

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
        <AlertTriangle className="h-4 w-4 text-orange-500" />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", colorClass)}>
          {level}
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <span className={trendColor}>{trend}</span>
          <span>vs last period</span>
        </p>
        <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
            style={{ width: `${riskPercentage}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
