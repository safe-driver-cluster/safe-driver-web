export interface RegulatorySource {
  id: string
  name: string
  type: "federal" | "state" | "local" | "international"
  agency: string
  website: string
  rssFeeds: string[]
  apiEndpoints: string[]
  monitoringFrequency: "real-time" | "hourly" | "daily" | "weekly"
  isActive: boolean
  lastChecked: string
  credibility: number
  categories: string[]
}

export interface RegulatoryChange {
  id: string
  sourceId: string
  title: string
  description: string
  category: string
  type: "new_regulation" | "amendment" | "repeal" | "interpretation" | "guidance" | "enforcement"
  severity: "low" | "medium" | "high" | "critical"
  status: "proposed" | "final" | "effective" | "delayed" | "withdrawn"
  publishedDate: string
  effectiveDate: string
  commentPeriodEnd?: string
  documentUrl: string
  fullText: string
  summary: string
  keyChanges: string[]
  affectedSections: string[]
  relatedRegulations: string[]
  tags: string[]
  confidence: number
  isReviewed: boolean
  reviewedBy?: string
  reviewedAt?: string
  impactAssessment?: ImpactAssessment
  createdAt: string
  updatedAt: string
}

export interface ImpactAssessment {
  id: string
  changeId: string
  overallImpact: "none" | "low" | "medium" | "high" | "critical"
  assessmentDate: string
  assessedBy: string
  status: "pending" | "in_progress" | "completed" | "approved"

  // Impact Categories
  operationalImpact: {
    score: number
    description: string
    affectedProcesses: string[]
    requiredChanges: string[]
    estimatedEffort: string
    timeline: string
  }

  financialImpact: {
    score: number
    description: string
    estimatedCost: number
    costBreakdown: {
      implementation: number
      training: number
      technology: number
      ongoing: number
    }
    potentialSavings: number
    roi: number
  }

  complianceImpact: {
    score: number
    description: string
    affectedPolicies: string[]
    requiredUpdates: string[]
    complianceGaps: string[]
    riskLevel: string
  }

  technicalImpact: {
    score: number
    description: string
    systemChanges: string[]
    dataRequirements: string[]
    integrationNeeds: string[]
    securityImplications: string[]
  }

  stakeholderImpact: {
    score: number
    description: string
    affectedDepartments: string[]
    trainingNeeds: string[]
    communicationPlan: string
    changeManagement: string
  }

  recommendations: {
    priority: "low" | "medium" | "high" | "urgent"
    actions: ActionItem[]
    timeline: string
    resources: string[]
    risks: string[]
    mitigation: string[]
  }

  approvals: {
    requiredApprovers: string[]
    approvedBy: string[]
    rejectedBy: string[]
    pendingApprovers: string[]
    finalApproval?: {
      approvedBy: string
      approvedAt: string
      comments: string
    }
  }
}

export interface ActionItem {
  id: string
  title: string
  description: string
  type: "policy_update" | "system_change" | "training" | "communication" | "audit" | "documentation"
  priority: "low" | "medium" | "high" | "urgent"
  assignedTo: string
  dueDate: string
  status: "pending" | "in_progress" | "completed" | "blocked"
  dependencies: string[]
  estimatedHours: number
  actualHours?: number
  completedAt?: string
  notes: string[]
}

export interface MonitoringAlert {
  id: string
  type: "new_change" | "high_impact" | "deadline_approaching" | "assessment_required" | "action_overdue"
  severity: "info" | "warning" | "error" | "critical"
  title: string
  message: string
  changeId?: string
  actionItemId?: string
  recipients: string[]
  channels: ("email" | "sms" | "slack" | "dashboard")[]
  sentAt: string
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

export interface RegulatoryTrend {
  category: string
  period: string
  changeCount: number
  averageImpact: number
  topKeywords: string[]
  emergingThemes: string[]
  predictedChanges: {
    topic: string
    probability: number
    timeframe: string
    reasoning: string
  }[]
}

export interface ComplianceGap {
  id: string
  changeId: string
  title: string
  description: string
  currentState: string
  requiredState: string
  gapSeverity: "low" | "medium" | "high" | "critical"
  remediation: {
    actions: string[]
    timeline: string
    cost: number
    resources: string[]
  }
  status: "identified" | "planned" | "in_progress" | "resolved"
  assignedTo: string
  dueDate: string
}
