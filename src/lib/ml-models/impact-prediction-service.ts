import type { ImpactPredictionResult, PredictionFactor, RiskFactor, ModelExplanation } from "./types"

export class ImpactPredictionService {
  private historicalData: any[] = []
  private models: Map<string, any> = new Map()

  constructor() {
    this.initializeModels()
    this.loadHistoricalData()
  }

  private initializeModels() {
    // Initialize regression models for different impact types
    this.models.set("operational_impact", {
      type: "gradient_boosting",
      features: ["change_scope", "complexity", "affected_processes", "implementation_time"],
      weights: [0.3, 0.25, 0.25, 0.2],
      accuracy: 0.87,
    })

    this.models.set("financial_impact", {
      type: "ensemble",
      features: ["change_type", "scope", "technology_requirements", "training_needs", "timeline"],
      weights: [0.25, 0.2, 0.25, 0.15, 0.15],
      accuracy: 0.82,
    })

    this.models.set("compliance_impact", {
      type: "neural_network",
      features: ["regulatory_complexity", "enforcement_history", "penalty_severity", "gap_analysis"],
      weights: [0.35, 0.25, 0.25, 0.15],
      accuracy: 0.91,
    })
  }

  private loadHistoricalData() {
    // Load historical regulatory changes and their actual impacts
    // This would come from a database in a real implementation
    this.historicalData = [
      {
        id: "hist_001",
        changeType: "amendment",
        category: "hours-of-service",
        severity: "high",
        actualImpacts: {
          operational: 8.2,
          financial: 75000,
          compliance: 9.1,
          technical: 7.5,
          stakeholder: 6.8,
        },
        features: {
          changeScope: 0.8,
          complexity: 0.7,
          affectedProcesses: 12,
          implementationTime: 120,
          technologyRequirements: 0.9,
          trainingNeeds: 0.8,
        },
      },
      // More historical data would be loaded here
    ]
  }

  async predictImpact(changeText: string, classificationResult: any, metadata?: any): Promise<ImpactPredictionResult> {
    // Extract features for prediction
    const features = this.extractPredictionFeatures(changeText, classificationResult, metadata)

    // Predict each impact dimension
    const operationalImpact = await this.predictOperationalImpact(features)
    const financialImpact = await this.predictFinancialImpact(features)
    const complianceImpact = await this.predictComplianceImpact(features)
    const technicalImpact = await this.predictTechnicalImpact(features)
    const stakeholderImpact = await this.predictStakeholderImpact(features)

    // Calculate overall impact
    const overallImpact = await this.calculateOverallImpact([
      operationalImpact,
      financialImpact,
      complianceImpact,
      technicalImpact,
      stakeholderImpact,
    ])

    return {
      operationalImpact,
      financialImpact,
      complianceImpact,
      technicalImpact,
      stakeholderImpact,
      overallImpact,
    }
  }

  private extractPredictionFeatures(changeText: string, classificationResult: any, metadata?: any) {
    return {
      // Classification-based features
      category: classificationResult.category.predicted,
      severity: classificationResult.severity.predicted,
      type: classificationResult.type.predicted,
      urgency: classificationResult.urgency.score,

      // Text-based features
      textLength: changeText.length,
      wordCount: changeText.split(/\s+/).length,
      technicalTerms: (
        changeText.match(/\b(?:specification|protocol|implementation|certification|compliance)\b/gi) || []
      ).length,

      // Scope indicators
      affectedAreas: classificationResult.affectedAreas.length,
      maxAreaImpact: Math.max(...classificationResult.affectedAreas.map((a: any) => a.impactLevel)),

      // Temporal features
      timeToEffective: metadata?.effectiveDate
        ? Math.ceil((new Date(metadata.effectiveDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 90,
      hasCommentPeriod: !!metadata?.commentPeriodEnd,

      // Regulatory features
      cfrReferences: (changeText.match(/\b\d+\s+CFR\s+\d+/gi) || []).length,
      agencyCount: new Set(changeText.match(/\b(FMCSA|DOT|NHTSA|EPA)\b/gi) || []).size,

      // Historical similarity
      historicalSimilarity: this.findSimilarHistoricalCases(changeText, classificationResult),
    }
  }

  private findSimilarHistoricalCases(changeText: string, classificationResult: any) {
    // Find similar historical cases for better prediction
    const similarities = this.historicalData.map((historical) => {
      let similarity = 0

      // Category similarity
      if (historical.category === classificationResult.category.predicted) similarity += 0.3

      // Severity similarity
      if (historical.severity === classificationResult.severity.predicted) similarity += 0.2

      // Type similarity
      if (historical.changeType === classificationResult.type.predicted) similarity += 0.2

      // Text similarity (simplified)
      const textSimilarity = this.calculateTextSimilarity(changeText, historical.changeText || "")
      similarity += textSimilarity * 0.3

      return { ...historical, similarity }
    })

    return similarities.sort((a, b) => b.similarity - a.similarity).slice(0, 3)
  }

  private calculateTextSimilarity(text1: string, text2: string): number {
    // Simplified text similarity using Jaccard similarity
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))

    const intersection = new Set([...words1].filter((x) => words2.has(x)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
  }

  private async predictOperationalImpact(features: any) {
    // Advanced operational impact prediction
    let predicted = 0
    let confidence = 0.7

    // Base prediction on severity and category
    const severityMultipliers = { low: 0.2, medium: 0.5, high: 0.8, critical: 1.0 }
    predicted += severityMultipliers[features.severity as keyof typeof severityMultipliers] * 4

    // Category-specific adjustments
    const categoryMultipliers = {
      "hours-of-service": 1.2,
      "vehicle-safety": 1.0,
      technology: 1.3,
      environmental: 0.8,
      "driver-qualification": 1.1,
    }
    predicted *= categoryMultipliers[features.category as keyof typeof categoryMultipliers] || 1.0

    // Affected areas impact
    predicted += features.affectedAreas * 0.5
    predicted += features.maxAreaImpact * 2

    // Time pressure impact
    if (features.timeToEffective < 60) predicted += 1
    if (features.timeToEffective < 30) predicted += 1

    // Historical similarity adjustment
    if (features.historicalSimilarity.length > 0) {
      const avgHistoricalImpact =
        features.historicalSimilarity.reduce((sum: number, case_: any) => sum + case_.actualImpacts.operational, 0) /
        features.historicalSimilarity.length
      predicted = (predicted + avgHistoricalImpact) / 2
      confidence += 0.1
    }

    predicted = Math.min(predicted, 10)
    confidence = Math.min(confidence, 0.95)

    // Generate factors
    const factors: PredictionFactor[] = [
      {
        factor: "Change Severity",
        weight: 0.3,
        value: severityMultipliers[features.severity as keyof typeof severityMultipliers],
        contribution: severityMultipliers[features.severity as keyof typeof severityMultipliers] * 4 * 0.3,
        description: `${features.severity} severity changes typically require significant operational adjustments`,
      },
      {
        factor: "Affected Areas",
        weight: 0.25,
        value: features.affectedAreas,
        contribution: features.affectedAreas * 0.5 * 0.25,
        description: `${features.affectedAreas} operational areas will be impacted`,
      },
      {
        factor: "Implementation Timeline",
        weight: 0.2,
        value: features.timeToEffective,
        contribution: features.timeToEffective < 60 ? 1 * 0.2 : 0,
        description: `${features.timeToEffective} days until effective date affects implementation complexity`,
      },
      {
        factor: "Category Complexity",
        weight: 0.15,
        value: categoryMultipliers[features.category as keyof typeof categoryMultipliers] || 1.0,
        contribution: (categoryMultipliers[features.category as keyof typeof categoryMultipliers] || 1.0) * 0.15,
        description: `${features.category} changes have specific operational complexity patterns`,
      },
      {
        factor: "Historical Precedent",
        weight: 0.1,
        value:
          features.historicalSimilarity.length > 0 ? features.historicalSimilarity[0].actualImpacts.operational : 5,
        contribution:
          features.historicalSimilarity.length > 0
            ? features.historicalSimilarity[0].actualImpacts.operational * 0.1
            : 0,
        description: "Similar historical changes provide impact precedent",
      },
    ]

    // Timeline prediction
    const timeline = {
      immediate: predicted * 0.3, // Impact in first 30 days
      shortTerm: predicted * 0.5, // Impact in 30-90 days
      longTerm: predicted * 0.2, // Impact beyond 90 days
    }

    return {
      predicted,
      confidence,
      factors,
      timeline,
    }
  }

  private async predictFinancialImpact(features: any) {
    // Advanced financial impact prediction
    let baseCost = 0
    let confidence = 0.75

    // Base cost estimation
    const severityCosts = { low: 5000, medium: 25000, high: 75000, critical: 150000 }
    baseCost = severityCosts[features.severity as keyof typeof severityCosts]

    // Category-specific cost multipliers
    const categoryCosts = {
      "hours-of-service": 1.2,
      "vehicle-safety": 1.0,
      technology: 1.8,
      environmental: 1.3,
      "driver-qualification": 0.9,
    }
    baseCost *= categoryCosts[features.category as keyof typeof categoryCosts] || 1.0

    // Complexity adjustments
    baseCost += features.technicalTerms * 2000
    baseCost += features.cfrReferences * 1500
    baseCost += features.affectedAreas * 5000

    // Timeline pressure costs
    if (features.timeToEffective < 60) baseCost *= 1.3
    if (features.timeToEffective < 30) baseCost *= 1.5

    // Cost breakdown
    const costBreakdown = {
      implementation: Math.round(baseCost * 0.4),
      training: Math.round(baseCost * 0.25),
      technology: Math.round(baseCost * 0.25),
      ongoing: Math.round(baseCost * 0.1),
      uncertainty: Math.round(baseCost * 0.2), // Uncertainty buffer
    }

    // ROI calculation
    const potentialSavings = baseCost * 0.15 // Assume 15% savings from compliance efficiency
    const roi = (potentialSavings - baseCost) / baseCost
    const timeToBreakeven = roi < 0 ? -1 : Math.round(12 / Math.abs(roi)) // months

    // Historical adjustment
    if (features.historicalSimilarity.length > 0) {
      const avgHistoricalCost =
        features.historicalSimilarity.reduce((sum: number, case_: any) => sum + case_.actualImpacts.financial, 0) /
        features.historicalSimilarity.length
      baseCost = (baseCost + avgHistoricalCost) / 2
      confidence += 0.1
    }

    confidence = Math.min(confidence, 0.95)

    return {
      predicted: Math.round(baseCost / 10000), // Scale to 1-10
      confidence,
      costBreakdown,
      roi: {
        predicted: roi,
        timeToBreakeven,
        confidence: confidence * 0.8, // Lower confidence for ROI
      },
    }
  }

  private async predictComplianceImpact(features: any) {
    // Advanced compliance impact prediction
    let predicted = 0
    const confidence = 0.8

    // Base compliance impact
    const severityImpacts = { low: 2, medium: 5, high: 8, critical: 10 }
    predicted = severityImpacts[features.severity as keyof typeof severityImpacts]

    // Regulatory complexity
    predicted += features.cfrReferences * 0.3
    predicted += features.agencyCount * 0.5

    // Type-specific adjustments
    const typeMultipliers = {
      new_regulation: 1.2,
      amendment: 1.0,
      repeal: 0.7,
      interpretation: 0.6,
      guidance: 0.5,
      enforcement: 1.1,
    }
    predicted *= typeMultipliers[features.type as keyof typeof typeMultipliers] || 1.0

    // Timeline pressure
    if (features.timeToEffective < 90) predicted += 1
    if (features.hasCommentPeriod) predicted += 0.5

    predicted = Math.min(predicted, 10)

    // Risk factors
    const riskFactors: RiskFactor[] = [
      {
        risk: "Non-compliance penalties",
        probability: features.severity === "critical" ? 0.8 : features.severity === "high" ? 0.6 : 0.3,
        impact: 8,
        severity: features.severity as any,
        mitigation: ["Immediate compliance assessment", "Legal review", "Implementation planning"],
      },
      {
        risk: "Audit findings",
        probability: 0.4,
        impact: 6,
        severity: "medium",
        mitigation: ["Documentation updates", "Process improvements", "Staff training"],
      },
      {
        risk: "Regulatory interpretation changes",
        probability: 0.3,
        impact: 5,
        severity: "medium",
        mitigation: ["Ongoing monitoring", "Legal consultation", "Flexible implementation"],
      },
    ]

    // Mitigation strategies
    const mitigationStrategies = [
      "Establish compliance monitoring system",
      "Regular legal and regulatory updates",
      "Staff training and awareness programs",
      "Documentation and record keeping improvements",
      "Proactive regulatory engagement",
    ]

    return {
      predicted,
      confidence,
      riskFactors,
      mitigationStrategies,
    }
  }

  private async predictTechnicalImpact(features: any) {
    // Technical impact prediction
    let predicted = 0
    const confidence = 0.7

    // Base technical impact
    if (features.category === "technology") predicted += 4
    predicted += features.technicalTerms * 0.3
    predicted += features.affectedAreas * 0.4

    // Severity adjustment
    const severityMultipliers = { low: 0.5, medium: 0.8, high: 1.2, critical: 1.5 }
    predicted *= severityMultipliers[features.severity as keyof typeof severityMultipliers]

    predicted = Math.min(predicted, 10)

    // System changes prediction
    const systemChanges = [
      {
        component: "ELD Systems",
        changeType: "Configuration Update",
        effort: Math.round(predicted * 0.3),
        risk: Math.round(predicted * 0.2),
      },
      {
        component: "Fleet Management System",
        changeType: "Integration Update",
        effort: Math.round(predicted * 0.4),
        risk: Math.round(predicted * 0.3),
      },
      {
        component: "Compliance Monitoring",
        changeType: "Process Enhancement",
        effort: Math.round(predicted * 0.3),
        risk: Math.round(predicted * 0.2),
      },
    ]

    return {
      predicted,
      confidence,
      systemChanges,
    }
  }

  private async predictStakeholderImpact(features: any) {
    // Stakeholder impact prediction
    let predicted = 0
    const confidence = 0.75

    // Base stakeholder impact
    predicted += features.affectedAreas * 0.8
    predicted += features.maxAreaImpact * 3

    // Category-specific adjustments
    if (features.category === "driver-qualification") predicted += 2
    if (features.category === "hours-of-service") predicted += 1.5
    if (features.category === "technology") predicted += 1

    predicted = Math.min(predicted, 10)

    // Affected groups
    const affectedGroups = [
      {
        group: "Drivers",
        impactLevel:
          features.category === "hours-of-service" ? 8 : features.category === "driver-qualification" ? 9 : 5,
        adaptationTime: 30, // days
      },
      {
        group: "Operations Team",
        impactLevel: Math.round(predicted * 0.8),
        adaptationTime: 45,
      },
      {
        group: "IT Department",
        impactLevel: features.category === "technology" ? 9 : 4,
        adaptationTime: 60,
      },
      {
        group: "Compliance Team",
        impactLevel: Math.round(predicted * 0.9),
        adaptationTime: 21,
      },
      {
        group: "Management",
        impactLevel: Math.round(predicted * 0.6),
        adaptationTime: 14,
      },
    ]

    return {
      predicted,
      confidence,
      affectedGroups: affectedGroups.filter((group) => group.impactLevel > 3),
    }
  }

  private async calculateOverallImpact(impacts: any[]) {
    // Weighted overall impact calculation
    const weights = {
      operational: 0.25,
      financial: 0.2,
      compliance: 0.3,
      technical: 0.15,
      stakeholder: 0.1,
    }

    const weightedSum =
      impacts[0].predicted * weights.operational +
      impacts[1].predicted * weights.financial +
      impacts[2].predicted * weights.compliance +
      impacts[3].predicted * weights.technical +
      impacts[4].predicted * weights.stakeholder

    const avgConfidence = impacts.reduce((sum, impact) => sum + impact.confidence, 0) / impacts.length

    // Key drivers identification
    const keyDrivers = [
      { name: "Compliance Requirements", impact: impacts[2].predicted },
      { name: "Operational Changes", impact: impacts[0].predicted },
      { name: "Financial Investment", impact: impacts[1].predicted },
      { name: "Technical Implementation", impact: impacts[3].predicted },
      { name: "Stakeholder Adaptation", impact: impacts[4].predicted },
    ]
      .sort((a, b) => b.impact - a.impact)
      .slice(0, 3)
      .map((driver) => driver.name)

    const explanation = this.generateImpactExplanation(weightedSum, keyDrivers, impacts)

    return {
      predicted: Math.round(weightedSum * 10) / 10,
      confidence: avgConfidence,
      explanation,
      keyDrivers,
    }
  }

  private generateImpactExplanation(overallImpact: number, keyDrivers: string[], impacts: any[]): string {
    let explanation = ""

    if (overallImpact >= 8) {
      explanation = "This regulatory change will have a critical impact on the organization. "
    } else if (overallImpact >= 6) {
      explanation = "This regulatory change will have a high impact on the organization. "
    } else if (overallImpact >= 4) {
      explanation = "This regulatory change will have a moderate impact on the organization. "
    } else {
      explanation = "This regulatory change will have a low impact on the organization. "
    }

    explanation += `The primary drivers are ${keyDrivers.join(", ")}. `

    // Add specific insights
    if (impacts[2].predicted >= 8) {
      explanation += "Immediate compliance action is required to avoid regulatory violations. "
    }
    if (impacts[1].predicted >= 7) {
      explanation += "Significant financial investment will be needed for implementation. "
    }
    if (impacts[0].predicted >= 7) {
      explanation += "Major operational process changes will be required. "
    }

    return explanation
  }

  async explainPrediction(
    changeText: string,
    classificationResult: any,
    predictionResult: ImpactPredictionResult,
  ): Promise<ModelExplanation> {
    const features = this.extractPredictionFeatures(changeText, classificationResult)

    // Find key factors that influenced the prediction
    const keyFactors = [
      {
        factor: "Regulatory Severity",
        contribution: predictionResult.overallImpact.predicted * 0.3,
        direction: "positive" as const,
        importance: 0.9,
      },
      {
        factor: "Compliance Complexity",
        contribution: predictionResult.complianceImpact.predicted * 0.25,
        direction: "positive" as const,
        importance: 0.8,
      },
      {
        factor: "Implementation Timeline",
        contribution: features.timeToEffective < 60 ? 2 : -1,
        direction: features.timeToEffective < 60 ? ("positive" as const) : ("negative" as const),
        importance: 0.7,
      },
      {
        factor: "Technical Requirements",
        contribution: predictionResult.technicalImpact.predicted * 0.2,
        direction: "positive" as const,
        importance: 0.6,
      },
    ]

    // Find similar historical cases
    const similarCases = features.historicalSimilarity.slice(0, 3).map((case_: any) => ({
      caseId: case_.id,
      similarity: case_.similarity,
      outcome: case_.actualImpacts.operational,
      description: `${case_.category} ${case_.changeType} with ${case_.severity} severity`,
    }))

    // Identify uncertainty factors
    const uncertaintyFactors = [
      "Regulatory interpretation may evolve",
      "Implementation costs may vary based on current system state",
      "Stakeholder adoption rates are difficult to predict",
      "External factors may influence timeline",
    ]

    // Generate recommendations
    const recommendations = [
      "Conduct detailed impact assessment with stakeholders",
      "Develop phased implementation plan",
      "Establish regular monitoring and review process",
      "Consider pilot program for high-risk changes",
      "Engage legal counsel for compliance strategy",
    ]

    return {
      prediction: predictionResult.overallImpact.predicted,
      confidence: predictionResult.overallImpact.confidence,
      explanation: predictionResult.overallImpact.explanation,
      keyFactors,
      similarCases,
      uncertaintyFactors,
      recommendations,
    }
  }
}

export const impactPredictionService = new ImpactPredictionService()
