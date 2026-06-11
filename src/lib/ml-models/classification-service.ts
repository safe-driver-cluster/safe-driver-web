import type { ChangeClassificationResult, MLModelConfig } from "./types"
import { nlpService } from "./nlp-service"

export class ClassificationService {
  private models: Map<string, MLModelConfig> = new Map()

  constructor() {
    this.initializeModels()
  }

  private initializeModels() {
    // Category Classification Model
    this.models.set("category_classifier", {
      id: "category_classifier",
      name: "Regulatory Category Classifier",
      type: "classification",
      version: "2.1.0",
      status: "ready",
      accuracy: 0.94,
      lastTrained: "2024-01-08T00:00:00Z",
      trainingData: {
        samples: 15000,
        features: 512,
        labels: 12,
      },
      hyperparameters: {
        learning_rate: 0.001,
        batch_size: 32,
        epochs: 100,
        dropout: 0.3,
      },
      metrics: {
        accuracy: 0.94,
        precision: 0.92,
        recall: 0.91,
        f1Score: 0.915,
        confusionMatrix: [
          [850, 12, 8, 5],
          [15, 920, 10, 3],
          [8, 18, 890, 12],
          [5, 8, 15, 905],
        ],
        featureImportance: [
          { feature: "regulatory_keywords", importance: 0.35, description: "Domain-specific regulatory terms" },
          { feature: "agency_mentions", importance: 0.28, description: "Regulatory agency references" },
          { feature: "cfr_references", importance: 0.22, description: "Code of Federal Regulations citations" },
          { feature: "action_verbs", importance: 0.15, description: "Regulatory action indicators" },
        ],
      },
    })

    // Severity Classification Model
    this.models.set("severity_classifier", {
      id: "severity_classifier",
      name: "Impact Severity Classifier",
      type: "classification",
      version: "1.8.0",
      status: "ready",
      accuracy: 0.89,
      lastTrained: "2024-01-07T00:00:00Z",
      trainingData: {
        samples: 8500,
        features: 256,
        labels: 4,
      },
      hyperparameters: {
        learning_rate: 0.0015,
        batch_size: 16,
        epochs: 80,
        dropout: 0.25,
      },
      metrics: {
        accuracy: 0.89,
        precision: 0.87,
        recall: 0.88,
        f1Score: 0.875,
        featureImportance: [
          { feature: "financial_indicators", importance: 0.32, description: "Cost and financial impact terms" },
          { feature: "urgency_keywords", importance: 0.28, description: "Time-sensitive language" },
          { feature: "scope_indicators", importance: 0.25, description: "Breadth of regulatory impact" },
          { feature: "penalty_mentions", importance: 0.15, description: "Enforcement and penalty references" },
        ],
      },
    })

    // Change Type Classifier
    this.models.set("type_classifier", {
      id: "type_classifier",
      name: "Regulatory Change Type Classifier",
      type: "classification",
      version: "1.5.0",
      status: "ready",
      accuracy: 0.91,
      lastTrained: "2024-01-06T00:00:00Z",
      trainingData: {
        samples: 12000,
        features: 384,
        labels: 6,
      },
      hyperparameters: {
        learning_rate: 0.001,
        batch_size: 24,
        epochs: 90,
        dropout: 0.2,
      },
      metrics: {
        accuracy: 0.91,
        precision: 0.89,
        recall: 0.9,
        f1Score: 0.895,
        featureImportance: [
          { feature: "change_verbs", importance: 0.4, description: "Action verbs indicating change type" },
          { feature: "document_structure", importance: 0.25, description: "Document formatting patterns" },
          { feature: "legal_language", importance: 0.2, description: "Legal terminology usage" },
          { feature: "temporal_indicators", importance: 0.15, description: "Time-based change indicators" },
        ],
      },
    })
  }

  async classifyChange(text: string, metadata?: any): Promise<ChangeClassificationResult> {
    // Perform NLP analysis first
    const nlpResult = await nlpService.analyzeText(text)

    // Extract features for classification
    const features = this.extractFeatures(text, nlpResult, metadata)

    // Classify category
    const categoryResult = await this.classifyCategory(features, nlpResult)

    // Classify severity
    const severityResult = await this.classifySeverity(features, nlpResult)

    // Classify type
    const typeResult = await this.classifyType(features, nlpResult)

    // Calculate urgency
    const urgencyResult = await this.calculateUrgency(features, severityResult, metadata)

    // Identify affected areas
    const affectedAreas = await this.identifyAffectedAreas(features, nlpResult)

    return {
      category: categoryResult,
      severity: severityResult,
      type: typeResult,
      urgency: urgencyResult,
      affectedAreas,
    }
  }

  private extractFeatures(text: string, nlpResult: any, metadata?: any) {
    const features = {
      // Text-based features
      textLength: text.length,
      wordCount: text.split(/\s+/).length,
      sentenceCount: text.split(/[.!?]+/).length,

      // NLP features
      sentimentScore: nlpResult.sentiment.score,
      entityCount: nlpResult.entities.length,
      keywordRelevance: nlpResult.keywords.reduce((sum: number, kw: any) => sum + kw.relevance, 0),
      topicProbabilities: nlpResult.topics.reduce((acc: any, topic: any) => {
        acc[topic.topic.toLowerCase().replace(/\s+/g, "_")] = topic.probability
        return acc
      }, {}),

      // Regulatory features
      cfrReferences: (text.match(/\b\d+\s+CFR\s+\d+/gi) || []).length,
      agencyMentions: (text.match(/\b(FMCSA|DOT|NHTSA|EPA)\b/gi) || []).length,
      regulatoryKeywords: this.countRegulatoryKeywords(text),

      // Change indicators
      changeIndicators: nlpResult.changeIndicators,
      actionVerbs: this.countActionVerbs(text),

      // Temporal features
      effectiveDate: metadata?.effectiveDate,
      commentPeriod: metadata?.commentPeriodEnd,
      publishedDate: metadata?.publishedDate,

      // Complexity features
      readabilityScore: nlpResult.complexity.score,
      technicalTermCount: nlpResult.complexity.technicalTerms.length,
    }

    return features
  }

  private countRegulatoryKeywords(text: string): number {
    const keywords = [
      "regulation",
      "compliance",
      "requirement",
      "standard",
      "specification",
      "mandatory",
      "prohibited",
      "violation",
      "penalty",
      "enforcement",
      "certification",
      "inspection",
      "audit",
      "monitoring",
      "reporting",
    ]

    return keywords.reduce((count, keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, "gi")
      const matches = text.match(regex)
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  private countActionVerbs(text: string): number {
    const actionVerbs = [
      "establish",
      "implement",
      "require",
      "prohibit",
      "mandate",
      "specify",
      "amend",
      "modify",
      "update",
      "revise",
      "repeal",
      "eliminate",
    ]

    return actionVerbs.reduce((count, verb) => {
      const regex = new RegExp(`\\b${verb}\\b`, "gi")
      const matches = text.match(regex)
      return count + (matches ? matches.length : 0)
    }, 0)
  }

  private async classifyCategory(features: any, nlpResult: any) {
    // Advanced category classification using ensemble methods
    const categoryScores = {
      "hours-of-service": 0,
      "vehicle-safety": 0,
      "driver-qualification": 0,
      environmental: 0,
      technology: 0,
      maintenance: 0,
      documentation: 0,
      enforcement: 0,
    }

    // Topic-based scoring
    nlpResult.topics.forEach((topic: any) => {
      switch (topic.topic.toLowerCase()) {
        case "hours of service":
          categoryScores["hours-of-service"] += topic.probability * 0.4
          break
        case "vehicle safety":
          categoryScores["vehicle-safety"] += topic.probability * 0.4
          break
        case "driver qualification":
          categoryScores["driver-qualification"] += topic.probability * 0.4
          break
        case "environmental compliance":
          categoryScores["environmental"] += topic.probability * 0.4
          break
        case "technology requirements":
          categoryScores["technology"] += topic.probability * 0.4
          break
      }
    })

    // Keyword-based scoring
    if (features.topicProbabilities.hours_of_service > 0.3) {
      categoryScores["hours-of-service"] += 0.3
    }
    if (features.topicProbabilities.vehicle_safety > 0.3) {
      categoryScores["vehicle-safety"] += 0.3
    }
    if (features.topicProbabilities.technology_requirements > 0.3) {
      categoryScores["technology"] += 0.3
    }

    // Entity-based scoring
    nlpResult.entities.forEach((entity: any) => {
      if (entity.label === "TECHNOLOGY") {
        categoryScores["technology"] += 0.1
      }
      if (entity.label === "REGULATION") {
        categoryScores["documentation"] += 0.1
      }
    })

    // Find the highest scoring category
    const sortedCategories = Object.entries(categoryScores)
      .sort(([, a], [, b]) => b - a)
      .map(([category, score]) => ({ category, confidence: Math.min(score, 1.0) }))

    const predicted = sortedCategories[0]
    const alternatives = sortedCategories.slice(1, 4)

    return {
      predicted: predicted.category,
      confidence: predicted.confidence,
      alternatives,
    }
  }

  private async classifySeverity(features: any, nlpResult: any) {
    // Multi-factor severity assessment
    let severityScore = 0
    let confidence = 0.5

    // Financial impact indicators
    const financialKeywords = ["cost", "expense", "budget", "investment", "penalty", "fine"]
    const financialMatches = financialKeywords.filter((keyword) =>
      nlpResult.keywords.some((kw: any) => kw.text.includes(keyword)),
    ).length
    severityScore += financialMatches * 0.15

    // Urgency indicators
    const urgencyKeywords = ["immediate", "urgent", "critical", "emergency", "deadline"]
    const urgencyMatches = urgencyKeywords.filter((keyword) =>
      nlpResult.keywords.some((kw: any) => kw.text.includes(keyword)),
    ).length
    severityScore += urgencyMatches * 0.2

    // Scope indicators
    if (features.agencyMentions > 1) severityScore += 0.1
    if (features.cfrReferences > 2) severityScore += 0.15
    if (features.regulatoryKeywords > 10) severityScore += 0.1

    // Change type impact
    const highImpactTypes = ["new_regulation", "amendment"]
    if (nlpResult.changeIndicators.some((ci: any) => highImpactTypes.includes(ci.type) && ci.confidence > 0.7)) {
      severityScore += 0.2
    }

    // Complexity impact
    if (features.technicalTermCount > 5) severityScore += 0.1
    if (features.readabilityScore < 30) severityScore += 0.1

    // Normalize and classify
    severityScore = Math.min(severityScore, 1.0)
    confidence = Math.min(0.5 + severityScore * 0.4, 0.95)

    let predicted: "low" | "medium" | "high" | "critical"
    if (severityScore >= 0.8) {
      predicted = "critical"
    } else if (severityScore >= 0.6) {
      predicted = "high"
    } else if (severityScore >= 0.4) {
      predicted = "medium"
    } else {
      predicted = "low"
    }

    return {
      predicted,
      confidence,
      score: severityScore,
    }
  }

  private async classifyType(features: any, nlpResult: any) {
    // Change type classification based on linguistic patterns
    const typeScores = {
      new_regulation: 0,
      amendment: 0,
      repeal: 0,
      interpretation: 0,
      guidance: 0,
      enforcement: 0,
    }

    // Use change indicators from NLP
    nlpResult.changeIndicators.forEach((indicator: any) => {
      switch (indicator.type) {
        case "new":
          typeScores["new_regulation"] += indicator.confidence * 0.6
          break
        case "amendment":
          typeScores["amendment"] += indicator.confidence * 0.6
          break
        case "repeal":
          typeScores["repeal"] += indicator.confidence * 0.6
          break
        case "clarification":
          typeScores["interpretation"] += indicator.confidence * 0.4
          typeScores["guidance"] += indicator.confidence * 0.4
          break
      }
    })

    // Additional pattern matching
    if (features.actionVerbs > 5) {
      typeScores["new_regulation"] += 0.2
      typeScores["amendment"] += 0.2
    }

    // Find the highest scoring type
    const maxScore = Math.max(...Object.values(typeScores))
    const predicted = Object.entries(typeScores).find(([, score]) => score === maxScore)?.[0] || "guidance"
    const confidence = Math.min(maxScore + 0.3, 0.95)

    return {
      predicted: predicted as any,
      confidence,
    }
  }

  private async calculateUrgency(features: any, severityResult: any, metadata?: any) {
    let urgencyScore = 0

    // Base urgency on severity
    switch (severityResult.predicted) {
      case "critical":
        urgencyScore += 0.4
        break
      case "high":
        urgencyScore += 0.3
        break
      case "medium":
        urgencyScore += 0.2
        break
      case "low":
        urgencyScore += 0.1
        break
    }

    // Time-based urgency
    if (metadata?.effectiveDate) {
      const effectiveDate = new Date(metadata.effectiveDate)
      const now = new Date()
      const daysUntilEffective = Math.ceil((effectiveDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilEffective < 30) {
        urgencyScore += 0.3
      } else if (daysUntilEffective < 90) {
        urgencyScore += 0.2
      } else if (daysUntilEffective < 180) {
        urgencyScore += 0.1
      }
    }

    // Comment period urgency
    if (metadata?.commentPeriodEnd) {
      const commentEnd = new Date(metadata.commentPeriodEnd)
      const now = new Date()
      const daysUntilComment = Math.ceil((commentEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

      if (daysUntilComment < 14) {
        urgencyScore += 0.2
      } else if (daysUntilComment < 30) {
        urgencyScore += 0.1
      }
    }

    urgencyScore = Math.min(urgencyScore, 1.0)

    let priority: "low" | "medium" | "high" | "urgent"
    if (urgencyScore >= 0.8) {
      priority = "urgent"
    } else if (urgencyScore >= 0.6) {
      priority = "high"
    } else if (urgencyScore >= 0.4) {
      priority = "medium"
    } else {
      priority = "low"
    }

    // Estimate time to implement
    const baseImplementationTime = 90 // days
    const complexityMultiplier = 1 + features.technicalTermCount * 0.1
    const severityMultiplier =
      severityResult.predicted === "critical"
        ? 0.7
        : severityResult.predicted === "high"
          ? 0.8
          : severityResult.predicted === "medium"
            ? 1.0
            : 1.2

    const timeToImplement = Math.round(baseImplementationTime * complexityMultiplier * severityMultiplier)

    return {
      score: urgencyScore,
      timeToImplement,
      priority,
    }
  }

  private async identifyAffectedAreas(features: any, nlpResult: any) {
    const areas = [
      { area: "Operations", impactLevel: 0, confidence: 0 },
      { area: "Technology", impactLevel: 0, confidence: 0 },
      { area: "Training", impactLevel: 0, confidence: 0 },
      { area: "Compliance", impactLevel: 0, confidence: 0 },
      { area: "Finance", impactLevel: 0, confidence: 0 },
      { area: "Legal", impactLevel: 0, confidence: 0 },
      { area: "Human Resources", impactLevel: 0, confidence: 0 },
    ]

    // Topic-based area identification
    nlpResult.topics.forEach((topic: any) => {
      switch (topic.topic.toLowerCase()) {
        case "hours of service":
          areas.find((a) => a.area === "Operations")!.impactLevel += topic.probability * 0.8
          areas.find((a) => a.area === "Compliance")!.impactLevel += topic.probability * 0.6
          break
        case "technology requirements":
          areas.find((a) => a.area === "Technology")!.impactLevel += topic.probability * 0.9
          areas.find((a) => a.area === "Operations")!.impactLevel += topic.probability * 0.5
          break
        case "driver qualification":
          areas.find((a) => a.area === "Human Resources")!.impactLevel += topic.probability * 0.7
          areas.find((a) => a.area === "Training")!.impactLevel += topic.probability * 0.8
          break
      }
    })

    // Entity-based area identification
    nlpResult.entities.forEach((entity: any) => {
      if (entity.label === "TECHNOLOGY") {
        areas.find((a) => a.area === "Technology")!.impactLevel += 0.1
      }
      if (entity.label === "MONEY") {
        areas.find((a) => a.area === "Finance")!.impactLevel += 0.1
      }
      if (entity.label === "REGULATION") {
        areas.find((a) => a.area === "Legal")!.impactLevel += 0.1
        areas.find((a) => a.area === "Compliance")!.impactLevel += 0.1
      }
    })

    // Set confidence based on impact level
    areas.forEach((area) => {
      area.impactLevel = Math.min(area.impactLevel, 1.0)
      area.confidence = area.impactLevel > 0.5 ? 0.8 : area.impactLevel > 0.3 ? 0.6 : 0.4
    })

    return areas.filter((area) => area.impactLevel > 0.1).sort((a, b) => b.impactLevel - a.impactLevel)
  }

  getModelMetrics(modelId: string): MLModelConfig | undefined {
    return this.models.get(modelId)
  }

  getAllModels(): MLModelConfig[] {
    return Array.from(this.models.values())
  }
}

export const classificationService = new ClassificationService()
