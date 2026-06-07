"use client"

import { Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface SafetyScoreCardProps {
  score: number
  trend?: string
  className?: string
}

export function SafetyScoreCard({ score, trend = "+0.0%", className }: SafetyScoreCardProps) {
  const isPositive = trend.startsWith("+")
  const trendColor = isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
  const barColor = "bg-blue-600" 

  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Overall Safety Score</CardTitle>
        <Shield className="h-4 w-4 text-emerald-600" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {Number.isInteger(score) ? score : score.toFixed(1)}%
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <span className={trendColor}>{trend}</span>
          <span>vs last period</span>
        </p>
        <div className="mt-3 h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", barColor)}
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
