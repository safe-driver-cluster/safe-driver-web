import { Alert } from "@/hooks/use-live-alerts"

/**
 * Calculates the total risk using weighted severity for detected events.
 * 
 * Weights:
 * - Drowsiness: 0.40
 * - Phone usage: 0.25
 * - Distraction: 0.20
 * - Smoking: 0.10
 * - Drinking: 0.05
 */
export function calculateRisk(alerts: Alert[]): number {
  let risk = 0

  alerts.forEach(alert => {
    const type = (alert.type || "").toLowerCase()
    const tag = (alert.tag || "").toLowerCase()
    const desc = (alert.description || "").toLowerCase()

    const searchString = `${type} ${tag} ${desc}`

    if (searchString.includes("drowsy") || searchString.includes("drowsiness")) {
      risk += 0.40
    } else if (searchString.includes("phone")) {
      risk += 0.25
    } else if (searchString.includes("distract") || searchString.includes("distraction")) {
      risk += 0.20
    } else if (searchString.includes("smoking") || searchString.includes("smoke")) {
      risk += 0.10
    } else if (searchString.includes("drink") || searchString.includes("drinking")) {
      risk += 0.05
    }
  })

  return risk
}

/**
 * Calculates the safety score based on the AI-based weighted severity formula:
 * Safety Score = 100 - (Risk * 100)
 */
export function calculateSafetyScore(alerts: Alert[]): number {
  const risk = calculateRisk(alerts)
  const score = 100 - (risk * 100)
  
  // Ensure score stays between 0 and 100
  return Math.max(0, Math.min(100, score))
}

/**
 * Determines the Risk Level string and formatting based on the safety score.
 */
export function getRiskLevelDetails(score: number): { level: string; colorClass: string; barColor: string } {
  if (score >= 80) return { level: "Low", colorClass: "text-slate-900 dark:text-white", barColor: "bg-blue-600" }
  if (score >= 50) return { level: "Medium", colorClass: "text-yellow-600 dark:text-yellow-400", barColor: "bg-yellow-500" }
  if (score >= 20) return { level: "High", colorClass: "text-orange-600 dark:text-orange-500", barColor: "bg-orange-500" }
  return { level: "Critical", colorClass: "text-rose-600 dark:text-rose-500", barColor: "bg-rose-600" }
}

/**
 * Calculates the trend by comparing recent alerts vs older alerts if available.
 * For now, this returns a static positive trend as a placeholder if no historical context is passed, 
 * or calculates it if a comparative dataset is provided.
 */
export function calculateSafetyTrend(currentScore: number, previousScore: number = 90): string {
  const diff = currentScore - previousScore;
  const sign = diff >= 0 ? "+" : "";
  return `${sign}${diff.toFixed(1)}%`;
}
