export interface MLModelConfig {
  id: string
  name: string
  type: "classification" | "regression" | "nlp" | "time_series" | "ensemble"
  version: string
  status: "training" | "ready" | "updating" | "error"
  accuracy: number
  lastTrained: string
  trainingData: {
    samples: number
    features: number
    labels: number
  }
  hyperparameters: Record<string, any>
  metrics: ModelMetrics
}

export interface ModelMetrics {
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  mse?: number
  mae?: number
  r2Score?: number
  confusionMatrix?: number[][]
  featureImportance?: FeatureImportance[]
}

export interface FeatureImportance {
  feature: string
  importance: number
  description: string
}

export interface TextAnalysisResult {
  sentiment: {
    score: number
    label: "positive" | "negative" | "neutral"
    confidence: number
  }
  entities: {
    text: string
    label: string
    confidence: number
    start: number
    end: number
  }[]
  keywords: {
    text: string
    relevance: number
    sentiment: number
  }[]
  topics: {
    topic: string
    probability: number
    keywords: string[]
  }[]
  complexity: {
    score: number
    readabilityGrade: number
    technicalTerms: string[]
  }
  changeIndicators: {
    type: "new" | "amendment" | "repeal" | "clarification"
    confidence: number
    evidence: string[]
  }[]
}

export interface ChangeClassificationResult {
  category: {
    predicted: string
    confidence: number
    alternatives: { category: string; confidence: number }[]
  }
  severity: {
    predicted: "low" | "medium" | "high" | "critical"
    confidence: number
    score: number
  }
  type: {
    predicted: "new_regulation" | "amendment" | "repeal" | "interpretation" | "guidance" | "enforcement"
    confidence: number
  }
  urgency: {
    score: number
    timeToImplement: number
    priority: "low" | "medium" | "high" | "urgent"
  }
  affectedAreas: {
    area: string
    impactLevel: number
    confidence: number
  }[]
}

export interface ImpactPredictionResult {
  operationalImpact: {
    predicted: number
    confidence: number
    factors: PredictionFactor[]
    timeline: {
      immediate: number
      shortTerm: number
      longTerm: number
    }
  }
  financialImpact: {
    predicted: number
    confidence: number
    costBreakdown: {
      implementation: number
      training: number
      technology: number
      ongoing: number
      uncertainty: number
    }
    roi: {
      predicted: number
      timeToBreakeven: number
      confidence: number
    }
  }
  complianceImpact: {
    predicted: number
    confidence: number
    riskFactors: RiskFactor[]
    mitigationStrategies: string[]
  }
  technicalImpact: {
    predicted: number
    confidence: number
    systemChanges: {
      component: string
      changeType: string
      effort: number
      risk: number
    }[]
  }
  stakeholderImpact: {
    predicted: number
    confidence: number
    affectedGroups: {
      group: string
      impactLevel: number
      adaptationTime: number
    }[]
  }
  overallImpact: {
    predicted: number
    confidence: number
    explanation: string
    keyDrivers: string[]
  }
}

export interface PredictionFactor {
  factor: string
  weight: number
  value: number
  contribution: number
  description: string
}

export interface RiskFactor {
  risk: string
  probability: number
  impact: number
  severity: "low" | "medium" | "high" | "critical"
  mitigation: string[]
}

export interface TrendForecast {
  category: string
  timeHorizon: "1_month" | "3_months" | "6_months" | "1_year"
  predictions: {
    changeVolume: {
      predicted: number
      confidence: number
      trend: "increasing" | "decreasing" | "stable"
    }
    averageImpact: {
      predicted: number
      confidence: number
      trend: "increasing" | "decreasing" | "stable"
    }
    emergingTopics: {
      topic: string
      probability: number
      timeframe: string
      drivers: string[]
    }[]
    riskAreas: {
      area: string
      riskLevel: number
      probability: number
      description: string
    }[]
  }
  modelConfidence: number
  lastUpdated: string
}

export interface ModelExplanation {
  prediction: number
  confidence: number
  explanation: string
  keyFactors: {
    factor: string
    contribution: number
    direction: "positive" | "negative"
    importance: number
  }[]
  similarCases: {
    caseId: string
    similarity: number
    outcome: number
    description: string
  }[]
  uncertaintyFactors: string[]
  recommendations: string[]
}
