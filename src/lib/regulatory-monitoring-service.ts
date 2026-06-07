import type {
  RegulatorySource,
  RegulatoryChange,
  ImpactAssessment,
  MonitoringAlert,
  RegulatoryTrend,
  ComplianceGap,
} from "./regulatory-monitoring-types"
import { mlService } from "./ml-models/ml-service"

export class RegulatoryMonitoringService {
  private sources: RegulatorySource[] = [
    {
      id: "dot-fmcsa",
      name: "DOT Federal Motor Carrier Safety Administration",
      type: "federal",
      agency: "Department of Transportation",
      website: "https://www.fmcsa.dot.gov",
      rssFeeds: ["https://www.fmcsa.dot.gov/rss.xml"],
      apiEndpoints: ["https://api.fmcsa.dot.gov/regulations"],
      monitoringFrequency: "daily",
      isActive: true,
      lastChecked: "2024-01-10T08:00:00Z",
      credibility: 0.95,
      categories: ["safety", "hours-of-service", "vehicle-maintenance", "driver-qualification"],
    },
    {
      id: "dot-nhtsa",
      name: "National Highway Traffic Safety Administration",
      type: "federal",
      agency: "Department of Transportation",
      website: "https://www.nhtsa.gov",
      rssFeeds: ["https://www.nhtsa.gov/rss.xml"],
      apiEndpoints: ["https://api.nhtsa.gov/regulations"],
      monitoringFrequency: "daily",
      isActive: true,
      lastChecked: "2024-01-10T08:00:00Z",
      credibility: 0.93,
      categories: ["vehicle-safety", "recalls", "standards"],
    },
    {
      id: "epa",
      name: "Environmental Protection Agency",
      type: "federal",
      agency: "EPA",
      website: "https://www.epa.gov",
      rssFeeds: ["https://www.epa.gov/rss.xml"],
      apiEndpoints: ["https://api.epa.gov/regulations"],
      monitoringFrequency: "weekly",
      isActive: true,
      lastChecked: "2024-01-09T08:00:00Z",
      credibility: 0.92,
      categories: ["emissions", "environmental", "fuel-standards"],
    },
  ]

  private changes: RegulatoryChange[] = []
  private assessments: ImpactAssessment[] = []
  private alerts: MonitoringAlert[] = []

  async monitorRegulatorySources(): Promise<RegulatoryChange[]> {
    const newChanges: RegulatoryChange[] = []

    for (const source of this.sources.filter((s) => s.isActive)) {
      try {
        const changes = await this.checkSource(source)
        newChanges.push(...changes)

        // Update last checked timestamp
        source.lastChecked = new Date().toISOString()
      } catch (error) {
        console.error(`Error monitoring source ${source.name}:`, error)
        await this.createAlert({
          type: "new_change",
          severity: "error",
          title: "Monitoring Error",
          message: `Failed to monitor ${source.name}: ${error}`,
          recipients: ["compliance-team@company.com"],
          channels: ["email", "dashboard"],
        })
      }
    }

    // Process new changes with ML analysis
    for (const change of newChanges) {
      await this.processNewChangeWithML(change)
    }

    return newChanges
  }

  private async checkSource(source: RegulatorySource): Promise<RegulatoryChange[]> {
    const changes: RegulatoryChange[] = []

    // Simulate checking RSS feeds and APIs
    // In a real implementation, this would parse RSS feeds, call APIs, and scrape websites

    // Mock data for demonstration
    if (source.id === "dot-fmcsa") {
      changes.push({
        id: `change-${Date.now()}`,
        sourceId: source.id,
        title: "Proposed Rule: Electronic Logging Device (ELD) Requirements Update",
        description: "FMCSA proposes updates to ELD technical specifications and compliance requirements",
        category: "hours-of-service",
        type: "amendment",
        severity: "high",
        status: "proposed",
        publishedDate: "2024-01-10T00:00:00Z",
        effectiveDate: "2024-04-10T00:00:00Z",
        commentPeriodEnd: "2024-02-10T00:00:00Z",
        documentUrl: "https://www.fmcsa.dot.gov/regulations/eld-update-2024",
        fullText: `The Federal Motor Carrier Safety Administration (FMCSA) proposes to amend the Electronic Logging Device (ELD) regulations to enhance data security and driver privacy protections. The proposed amendments include new encryption requirements for data transmission, enhanced driver privacy controls, updated technical specifications for ELD devices, and modified compliance timelines for existing devices. These changes are designed to address emerging cybersecurity threats while maintaining the safety benefits of electronic logging. The rule would require ELD manufacturers to implement end-to-end encryption for all data transmissions, provide drivers with enhanced control over personal data sharing, and establish new certification requirements for device security. Implementation would be phased over 18 months to allow adequate time for manufacturers and carriers to comply with the new requirements.`,
        summary:
          "Updates ELD requirements to include new data transmission protocols and enhanced driver privacy protections.",
        keyChanges: [
          "New data transmission encryption requirements",
          "Enhanced driver privacy controls",
          "Updated technical specifications for ELD devices",
          "Modified compliance timeline for existing devices",
        ],
        affectedSections: ["49 CFR 395.8", "49 CFR 395.22", "49 CFR 395.24"],
        relatedRegulations: ["49 CFR 395", "49 CFR 390"],
        tags: ["ELD", "hours-of-service", "technology", "privacy"],
        confidence: 0.95,
        isReviewed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    }

    return changes
  }

  private async processNewChangeWithML(change: RegulatoryChange): Promise<void> {
    try {
      // Use ML service to analyze the regulatory change
      const mlAnalysis = await mlService.analyzeRegulatoryChange(change.fullText, {
        effectiveDate: change.effectiveDate,
        commentPeriodEnd: change.commentPeriodEnd,
        publishedDate: change.publishedDate,
        category: change.category,
      })

      // Update change with ML-enhanced classification
      change.category = mlAnalysis.classification.category.predicted
      change.severity = mlAnalysis.classification.severity.predicted
      change.type = mlAnalysis.classification.type.predicted
      change.confidence = Math.min(
        mlAnalysis.classification.category.confidence,
        mlAnalysis.classification.severity.confidence,
        mlAnalysis.classification.type.confidence,
      )

      // Add ML-generated tags
      const mlTags = [
        ...mlAnalysis.nlpAnalysis.keywords.slice(0, 5).map((kw) => kw.text),
        ...mlAnalysis.nlpAnalysis.topics.slice(0, 3).map((topic) => topic.topic.toLowerCase().replace(/\s+/g, "-")),
      ]
      change.tags = [...new Set([...change.tags, ...mlTags])]

      // Add to changes list
      this.changes.push(change)

      // Create ML-enhanced alert
      await this.createAlert({
        type: "new_change",
        severity: change.severity === "critical" ? "critical" : change.severity === "high" ? "error" : "warning",
        title: "New Regulatory Change Detected (ML-Enhanced)",
        message: `${change.title} - Predicted Impact: ${mlAnalysis.impactPrediction.overallImpact.predicted}/10 (${mlAnalysis.impactPrediction.overallImpact.confidence * 100}% confidence)`,
        changeId: change.id,
        recipients: ["compliance-team@company.com"],
        channels: ["email", "dashboard", "slack"],
      })

      // Create ML-enhanced impact assessment
      await this.createMLEnhancedImpactAssessment(change, mlAnalysis)
    } catch (error) {
      console.error("Error processing change with ML:", error)
      // Fallback to basic processing
      await this.processNewChange(change)
    }
  }

  private async processNewChange(change: RegulatoryChange): Promise<void> {
    // Add to changes list
    this.changes.push(change)

    // Create alert for new change
    await this.createAlert({
      type: "new_change",
      severity: change.severity === "critical" ? "critical" : change.severity === "high" ? "error" : "warning",
      title: "New Regulatory Change Detected",
      message: `${change.title} - ${change.summary}`,
      changeId: change.id,
      recipients: ["compliance-team@company.com"],
      channels: ["email", "dashboard", "slack"],
    })

    // Trigger automated impact assessment
    if (change.severity === "high" || change.severity === "critical") {
      await this.initiateImpactAssessment(change)
    }
  }

  private async createMLEnhancedImpactAssessment(change: RegulatoryChange, mlAnalysis: any): Promise<ImpactAssessment> {
    const assessment: ImpactAssessment = {
      id: `assessment-${Date.now()}`,
      changeId: change.id,
      overallImpact:
        mlAnalysis.impactPrediction.overallImpact.predicted >= 8
          ? "critical"
          : mlAnalysis.impactPrediction.overallImpact.predicted >= 6
            ? "high"
            : mlAnalysis.impactPrediction.overallImpact.predicted >= 4
              ? "medium"
              : "low",
      assessmentDate: new Date().toISOString(),
      assessedBy: "ml-enhanced-system",
      status: "completed",

      operationalImpact: {
        score: Math.round(mlAnalysis.impactPrediction.operationalImpact.predicted),
        description: `ML-predicted operational impact based on ${mlAnalysis.impactPrediction.operationalImpact.factors.length} key factors`,
        affectedProcesses: mlAnalysis.classification.affectedAreas.map((area: any) => area.area),
        requiredChanges: mlAnalysis.explanation.recommendations.slice(0, 5),
        estimatedEffort: `${mlAnalysis.impactPrediction.operationalImpact.timeline.immediate + mlAnalysis.impactPrediction.operationalImpact.timeline.shortTerm} hours`,
        timeline: this.calculateTimelineFromML(mlAnalysis.impactPrediction.operationalImpact.timeline),
      },

      financialImpact: {
        score: Math.round(mlAnalysis.impactPrediction.financialImpact.predicted),
        description: `ML-predicted financial impact with ${Math.round(mlAnalysis.impactPrediction.financialImpact.confidence * 100)}% confidence`,
        estimatedCost:
          mlAnalysis.impactPrediction.financialImpact.costBreakdown.implementation +
          mlAnalysis.impactPrediction.financialImpact.costBreakdown.training +
          mlAnalysis.impactPrediction.financialImpact.costBreakdown.technology +
          mlAnalysis.impactPrediction.financialImpact.costBreakdown.ongoing,
        costBreakdown: mlAnalysis.impactPrediction.financialImpact.costBreakdown,
        potentialSavings: mlAnalysis.impactPrediction.financialImpact.costBreakdown.implementation * 0.1,
        roi: mlAnalysis.impactPrediction.financialImpact.roi.predicted,
      },

      complianceImpact: {
        score: Math.round(mlAnalysis.impactPrediction.complianceImpact.predicted),
        description: `ML-identified compliance requirements with ${Math.round(mlAnalysis.impactPrediction.complianceImpact.confidence * 100)}% confidence`,
        affectedPolicies: [
          "Hours of Service Policy",
          "ELD Usage Policy",
          "Driver Training Manual",
          "Compliance Monitoring Procedures",
        ],
        requiredUpdates: mlAnalysis.explanation.recommendations.filter(
          (rec: string) => rec.toLowerCase().includes("policy") || rec.toLowerCase().includes("procedure"),
        ),
        complianceGaps: mlAnalysis.impactPrediction.complianceImpact.riskFactors.map((risk: any) => risk.risk),
        riskLevel:
          mlAnalysis.impactPrediction.complianceImpact.predicted >= 8
            ? "critical"
            : mlAnalysis.impactPrediction.complianceImpact.predicted >= 6
              ? "high"
              : mlAnalysis.impactPrediction.complianceImpact.predicted >= 4
                ? "medium"
                : "low",
      },

      technicalImpact: {
        score: Math.round(mlAnalysis.impactPrediction.technicalImpact.predicted),
        description: `ML-assessed technical requirements with system change analysis`,
        systemChanges: mlAnalysis.impactPrediction.technicalImpact.systemChanges.map((sc: any) => sc.component),
        dataRequirements: [
          "Enhanced encryption for data transmission",
          "New privacy control data fields",
          "Updated audit trail requirements",
        ],
        integrationNeeds: [
          "Integration with new ELD API specifications",
          "Updates to fleet management system interfaces",
          "Compliance reporting system modifications",
        ],
        securityImplications: [
          "Enhanced data encryption requirements",
          "New privacy protection measures",
          "Updated access control requirements",
        ],
      },

      stakeholderImpact: {
        score: Math.round(mlAnalysis.impactPrediction.stakeholderImpact.predicted),
        description: `ML-predicted stakeholder impact across ${mlAnalysis.impactPrediction.stakeholderImpact.affectedGroups.length} groups`,
        affectedDepartments: mlAnalysis.impactPrediction.stakeholderImpact.affectedGroups.map(
          (group: any) => group.group,
        ),
        trainingNeeds: [
          "Driver training on new ELD features",
          "IT staff training on new technical requirements",
          "Compliance team training on updated regulations",
          "Management training on new privacy requirements",
        ],
        communicationPlan: "ML-recommended multi-phase communication plan targeting all stakeholder groups",
        changeManagement: "Structured change management approach with ML-optimized phased implementation",
      },

      recommendations: {
        priority:
          mlAnalysis.impactPrediction.overallImpact.predicted >= 8
            ? "urgent"
            : mlAnalysis.impactPrediction.overallImpact.predicted >= 6
              ? "high"
              : "medium",
        actions: mlAnalysis.explanation.recommendations.map((rec: string, index: number) => ({
          id: `ml-action-${Date.now()}-${index}`,
          title: rec,
          description: `ML-recommended action based on impact analysis`,
          type: this.categorizeActionType(rec),
          priority:
            mlAnalysis.impactPrediction.overallImpact.predicted >= 8
              ? "urgent"
              : mlAnalysis.impactPrediction.overallImpact.predicted >= 6
                ? "high"
                : "medium",
          assignedTo: this.assignActionOwner(rec),
          dueDate: this.calculateDueDate(change.effectiveDate, index),
          status: "pending" as const,
          dependencies: [],
          estimatedHours: Math.round(16 + index * 8),
          notes: [`Generated by ML analysis with ${Math.round(mlAnalysis.explanation.confidence * 100)}% confidence`],
        })),
        timeline: this.calculateImplementationTimeline(mlAnalysis.impactPrediction),
        resources: ["IT team", "Compliance team", "Training team", "ML-recommended external consultants"],
        risks: mlAnalysis.explanation.uncertaintyFactors,
        mitigation: mlAnalysis.impactPrediction.complianceImpact.mitigationStrategies,
      },

      approvals: {
        requiredApprovers: ["compliance-manager", "legal-counsel", "operations-director"],
        approvedBy: [],
        rejectedBy: [],
        pendingApprovers: ["compliance-manager", "legal-counsel", "operations-director"],
      },
    }

    this.assessments.push(assessment)
    change.impactAssessment = assessment

    return assessment
  }

  private calculateTimelineFromML(timeline: any): string {
    const totalWeeks = Math.ceil((timeline.immediate + timeline.shortTerm + timeline.longTerm) / 7)
    return `${totalWeeks} weeks for full implementation`
  }

  private categorizeActionType(
    recommendation: string,
  ): "policy_update" | "system_change" | "training" | "communication" | "audit" | "documentation" {
    const rec = recommendation.toLowerCase()
    if (rec.includes("policy") || rec.includes("procedure")) return "policy_update"
    if (rec.includes("system") || rec.includes("technical") || rec.includes("technology")) return "system_change"
    if (rec.includes("training") || rec.includes("education")) return "training"
    if (rec.includes("communication") || rec.includes("notify")) return "communication"
    if (rec.includes("audit") || rec.includes("assess") || rec.includes("review")) return "audit"
    return "documentation"
  }

  private assignActionOwner(recommendation: string): string {
    const rec = recommendation.toLowerCase()
    if (rec.includes("legal") || rec.includes("compliance")) return "compliance-manager"
    if (rec.includes("technical") || rec.includes("system") || rec.includes("technology")) return "it-manager"
    if (rec.includes("training")) return "training-manager"
    if (rec.includes("communication")) return "communications-manager"
    return "project-manager"
  }

  private calculateDueDate(effectiveDate: string, actionIndex: number): string {
    const effective = new Date(effectiveDate)
    const dueDate = new Date(effective)
    dueDate.setDate(dueDate.getDate() - (90 - actionIndex * 14)) // Stagger due dates
    return dueDate.toISOString()
  }

  private calculateImplementationTimeline(impactPrediction: any): string {
    const totalImpact = impactPrediction.overallImpact.predicted
    if (totalImpact >= 8) return "16-20 weeks for critical impact implementation"
    if (totalImpact >= 6) return "12-16 weeks for high impact implementation"
    if (totalImpact >= 4) return "8-12 weeks for medium impact implementation"
    return "4-8 weeks for low impact implementation"
  }

  async initiateImpactAssessment(change: RegulatoryChange): Promise<ImpactAssessment> {
    // This is the fallback method for non-ML assessment
    const assessment: ImpactAssessment = {
      id: `assessment-${Date.now()}`,
      changeId: change.id,
      overallImpact: "medium",
      assessmentDate: new Date().toISOString(),
      assessedBy: "automated-system",
      status: "in_progress",

      operationalImpact: {
        score: 0,
        description: "",
        affectedProcesses: [],
        requiredChanges: [],
        estimatedEffort: "",
        timeline: "",
      },

      financialImpact: {
        score: 0,
        description: "",
        estimatedCost: 0,
        costBreakdown: {
          implementation: 0,
          training: 0,
          technology: 0,
          ongoing: 0,
        },
        potentialSavings: 0,
        roi: 0,
      },

      complianceImpact: {
        score: 0,
        description: "",
        affectedPolicies: [],
        requiredUpdates: [],
        complianceGaps: [],
        riskLevel: "",
      },

      technicalImpact: {
        score: 0,
        description: "",
        systemChanges: [],
        dataRequirements: [],
        integrationNeeds: [],
        securityImplications: [],
      },

      stakeholderImpact: {
        score: 0,
        description: "",
        affectedDepartments: [],
        trainingNeeds: [],
        communicationPlan: "",
        changeManagement: "",
      },

      recommendations: {
        priority: "medium",
        actions: [],
        timeline: "",
        resources: [],
        risks: [],
        mitigation: [],
      },

      approvals: {
        requiredApprovers: ["compliance-manager", "legal-counsel", "operations-director"],
        approvedBy: [],
        rejectedBy: [],
        pendingApprovers: ["compliance-manager", "legal-counsel", "operations-director"],
      },
    }

    // Perform basic automated analysis (existing logic)
    await this.performAutomatedAnalysis(change, assessment)

    this.assessments.push(assessment)
    change.impactAssessment = assessment

    return assessment
  }

  private async performAutomatedAnalysis(change: RegulatoryChange, assessment: ImpactAssessment): Promise<void> {
    // Existing automated analysis logic (simplified for brevity)
    // This would contain the original rule-based analysis
    assessment.status = "completed"
  }

  private async createAlert(
    alertData: Omit<MonitoringAlert, "id" | "sentAt" | "acknowledged">,
  ): Promise<MonitoringAlert> {
    const alert: MonitoringAlert = {
      id: `alert-${Date.now()}`,
      sentAt: new Date().toISOString(),
      acknowledged: false,
      ...alertData,
    }

    this.alerts.push(alert)

    // In a real implementation, this would send actual notifications
    console.log(`Alert sent: ${alert.title} - ${alert.message}`)

    return alert
  }

  async getRegulatorySources(): Promise<RegulatorySource[]> {
    return this.sources
  }

  async getRegulatoryChanges(filters?: {
    category?: string
    severity?: string
    status?: string
    dateFrom?: string
    dateTo?: string
  }): Promise<RegulatoryChange[]> {
    let filteredChanges = [...this.changes]

    if (filters) {
      if (filters.category) {
        filteredChanges = filteredChanges.filter((c) => c.category === filters.category)
      }
      if (filters.severity) {
        filteredChanges = filteredChanges.filter((c) => c.severity === filters.severity)
      }
      if (filters.status) {
        filteredChanges = filteredChanges.filter((c) => c.status === filters.status)
      }
      if (filters.dateFrom) {
        filteredChanges = filteredChanges.filter((c) => c.publishedDate >= filters.dateFrom!)
      }
      if (filters.dateTo) {
        filteredChanges = filteredChanges.filter((c) => c.publishedDate <= filters.dateTo!)
      }
    }

    return filteredChanges.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
  }

  async getImpactAssessments(): Promise<ImpactAssessment[]> {
    return this.assessments.sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime())
  }

  async getMonitoringAlerts(): Promise<MonitoringAlert[]> {
    return this.alerts.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime())
  }

  async getRegulatoryTrends(): Promise<RegulatoryTrend[]> {
    try {
      // Use ML service for enhanced trend forecasting
      const mlForecasts = await mlService.forecastRegulatoryTrends()

      return mlForecasts.map((forecast) => ({
        category: forecast.category,
        period: "2024-Q1",
        changeCount: Math.round(forecast.predictions.changeVolume.predicted),
        averageImpact: Math.round(forecast.predictions.averageImpact.predicted * 10) / 10,
        topKeywords: forecast.predictions.emergingTopics.slice(0, 5).map((topic) => topic.topic.split(" ")[0]),
        emergingThemes: forecast.predictions.emergingTopics.map((topic) => topic.topic),
        predictedChanges: forecast.predictions.emergingTopics.map((topic) => ({
          topic: topic.topic,
          probability: topic.probability,
          timeframe: topic.timeframe,
          reasoning: topic.drivers.join(", "),
        })),
      }))
    } catch (error) {
      console.error("Error getting ML trends, falling back to basic trends:", error)
      // Fallback to basic trend data
      return [
        {
          category: "hours-of-service",
          period: "2024-Q1",
          changeCount: 3,
          averageImpact: 7.5,
          topKeywords: ["ELD", "privacy", "technology", "compliance"],
          emergingThemes: ["Driver privacy protection", "Technology modernization", "Data security"],
          predictedChanges: [
            {
              topic: "Autonomous vehicle regulations",
              probability: 0.75,
              timeframe: "6-12 months",
              reasoning: "Increasing industry adoption and safety concerns",
            },
          ],
        },
      ]
    }
  }

  async identifyComplianceGaps(changeId: string): Promise<ComplianceGap[]> {
    const change = this.changes.find((c) => c.id === changeId)
    if (!change || !change.impactAssessment) {
      return []
    }

    const gaps: ComplianceGap[] = []
    const assessment = change.impactAssessment

    // Identify gaps based on compliance impact
    assessment.complianceImpact.complianceGaps.forEach((gap, index) => {
      gaps.push({
        id: `gap-${changeId}-${index}`,
        changeId: changeId,
        title: `Compliance Gap: ${gap}`,
        description: gap,
        currentState: "Non-compliant with new requirements",
        requiredState: "Fully compliant with updated regulations",
        gapSeverity: assessment.overallImpact === "critical" ? "critical" : "high",
        remediation: {
          actions: assessment.recommendations.actions.map((a) => a.title),
          timeline: assessment.recommendations.timeline,
          cost: assessment.financialImpact.estimatedCost,
          resources: assessment.recommendations.resources,
        },
        status: "identified",
        assignedTo: "compliance-manager",
        dueDate: change.effectiveDate,
      })
    })

    return gaps
  }

  async getMLModelPerformance(): Promise<any> {
    try {
      return await mlService.getModelPerformance()
    } catch (error) {
      console.error("Error getting ML model performance:", error)
      return {
        classification: [],
        forecasting: {},
        overall: {
          accuracy: 0,
          confidence: 0,
          lastUpdated: new Date().toISOString(),
        },
      }
    }
  }

  async retrainMLModels(category?: string): Promise<any> {
    try {
      return await mlService.retrainModels(category)
    } catch (error) {
      console.error("Error retraining ML models:", error)
      return {
        success: false,
        modelsRetrained: [],
        newAccuracy: 0,
      }
    }
  }
}

// Singleton instance
export const regulatoryMonitoringService = new RegulatoryMonitoringService()
