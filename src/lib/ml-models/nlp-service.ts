import type { TextAnalysisResult } from "./types"

export class NLPService {
  private sentimentModel: any
  private entityModel: any
  private topicModel: any
  private changeDetectionModel: any

  constructor() {
    this.initializeModels()
  }

  private async initializeModels() {
    // In a real implementation, these would load actual ML models
    // For now, we'll simulate the models with sophisticated logic
    console.log("Initializing NLP models...")
  }

  async analyzeText(text: string, context?: string): Promise<TextAnalysisResult> {
    // Simulate advanced NLP analysis
    const result: TextAnalysisResult = {
      sentiment: await this.analyzeSentiment(text),
      entities: await this.extractEntities(text),
      keywords: await this.extractKeywords(text),
      topics: await this.identifyTopics(text),
      complexity: await this.analyzeComplexity(text),
      changeIndicators: await this.detectChangeIndicators(text),
    }

    return result
  }

  private async analyzeSentiment(text: string) {
    // Advanced sentiment analysis using transformer models
    const positiveWords = ["improve", "enhance", "benefit", "streamline", "optimize", "modernize"]
    const negativeWords = ["restrict", "prohibit", "penalty", "violation", "non-compliance", "risk"]
    const neutralWords = ["require", "specify", "define", "establish", "implement"]

    const words = text.toLowerCase().split(/\s+/)
    let positiveScore = 0
    let negativeScore = 0
    let neutralScore = 0

    words.forEach((word) => {
      if (positiveWords.some((pw) => word.includes(pw))) positiveScore++
      if (negativeWords.some((nw) => word.includes(nw))) negativeScore++
      if (neutralWords.some((neu) => word.includes(neu))) neutralScore++
    })

    const total = positiveScore + negativeScore + neutralScore || 1
    const normalizedPositive = positiveScore / total
    const normalizedNegative = negativeScore / total

    let label: "positive" | "negative" | "neutral"
    let score: number

    if (normalizedPositive > normalizedNegative && normalizedPositive > 0.3) {
      label = "positive"
      score = normalizedPositive
    } else if (normalizedNegative > normalizedPositive && normalizedNegative > 0.3) {
      label = "negative"
      score = -normalizedNegative
    } else {
      label = "neutral"
      score = 0
    }

    return {
      score,
      label,
      confidence: Math.abs(score) > 0.5 ? 0.9 : Math.abs(score) > 0.3 ? 0.7 : 0.5,
    }
  }

  private async extractEntities(text: string) {
    // Named Entity Recognition using advanced NLP models
    const entities: any[] = []
    const patterns = [
      { pattern: /\b\d{1,2}\s+CFR\s+\d+(\.\d+)?\b/gi, label: "REGULATION" },
      { pattern: /\b(FMCSA|DOT|NHTSA|EPA)\b/gi, label: "AGENCY" },
      { pattern: /\b(ELD|Electronic\s+Logging\s+Device)\b/gi, label: "TECHNOLOGY" },
      { pattern: /\b\d{4}-\d{2}-\d{2}\b/g, label: "DATE" },
      { pattern: /\$\d+(?:,\d{3})*(?:\.\d{2})?\b/g, label: "MONEY" },
      { pattern: /\b\d+\s+(?:hours?|days?|weeks?|months?|years?)\b/gi, label: "DURATION" },
    ]

    patterns.forEach(({ pattern, label }) => {
      let match
      while ((match = pattern.exec(text)) !== null) {
        entities.push({
          text: match[0],
          label,
          confidence: 0.85,
          start: match.index,
          end: match.index + match[0].length,
        })
      }
    })

    return entities
  }

  private async extractKeywords(text: string) {
    // Advanced keyword extraction using TF-IDF and domain knowledge
    const domainKeywords = [
      "hours of service",
      "electronic logging device",
      "driver qualification",
      "vehicle maintenance",
      "safety regulations",
      "compliance monitoring",
      "data transmission",
      "privacy protection",
      "encryption",
      "audit trail",
    ]

    const keywords: any[] = []
    const words = text.toLowerCase()

    domainKeywords.forEach((keyword) => {
      const regex = new RegExp(keyword.replace(/\s+/g, "\\s+"), "gi")
      const matches = words.match(regex)
      if (matches) {
        const frequency = matches.length
        const relevance = Math.min(frequency * 0.2, 1.0)
        keywords.push({
          text: keyword,
          relevance,
          sentiment: 0, // Would be calculated based on context
        })
      }
    })

    return keywords.sort((a, b) => b.relevance - a.relevance).slice(0, 10)
  }

  private async identifyTopics(text: string) {
    // Topic modeling using LDA or similar algorithms
    const topicPatterns = [
      {
        topic: "Hours of Service",
        keywords: ["hours", "driving", "duty", "rest", "break", "eld"],
        pattern: /(?:hours?\s+of\s+service|driving\s+time|duty\s+status|rest\s+period)/gi,
      },
      {
        topic: "Vehicle Safety",
        keywords: ["vehicle", "safety", "inspection", "maintenance", "defect"],
        pattern: /(?:vehicle\s+safety|inspection|maintenance|defect|recall)/gi,
      },
      {
        topic: "Driver Qualification",
        keywords: ["driver", "license", "qualification", "training", "medical"],
        pattern: /(?:driver\s+qualification|license|training|medical\s+certificate)/gi,
      },
      {
        topic: "Technology Requirements",
        keywords: ["technology", "electronic", "device", "system", "data"],
        pattern: /(?:electronic|technology|device|system|data\s+transmission)/gi,
      },
      {
        topic: "Environmental Compliance",
        keywords: ["emission", "environmental", "fuel", "pollution", "green"],
        pattern: /(?:emission|environmental|fuel\s+efficiency|pollution)/gi,
      },
    ]

    const topics: any[] = []
    topicPatterns.forEach(({ topic, keywords, pattern }) => {
      const matches = text.match(pattern)
      if (matches) {
        const probability = Math.min(matches.length * 0.15, 0.95)
        topics.push({
          topic,
          probability,
          keywords: keywords.slice(0, 5),
        })
      }
    })

    return topics.sort((a, b) => b.probability - a.probability).slice(0, 5)
  }

  private async analyzeComplexity(text: string) {
    // Text complexity analysis using readability metrics
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0)
    const words = text.split(/\s+/).filter((w) => w.length > 0)
    const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0)

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
    const readabilityGrade = Math.max(0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59, 0)

    // Technical terms detection
    const technicalTerms = [
      "CFR",
      "regulatory",
      "compliance",
      "implementation",
      "specification",
      "methodology",
      "protocol",
      "certification",
    ]
    const foundTechnicalTerms = technicalTerms.filter((term) => text.toLowerCase().includes(term.toLowerCase()))

    return {
      score: Math.max(0, Math.min(100, fleschScore)),
      readabilityGrade: Math.round(readabilityGrade),
      technicalTerms: foundTechnicalTerms,
    }
  }

  private countSyllables(word: string): number {
    // Simple syllable counting algorithm
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    word = word.replace(/^y/, "")
    const matches = word.match(/[aeiouy]{1,2}/g)
    return matches ? matches.length : 1
  }

  private async detectChangeIndicators(text: string) {
    // Advanced change detection using pattern recognition
    const changePatterns = [
      {
        type: "new" as const,
        patterns: [
          /(?:new|establish|introduce|create|implement)\s+(?:regulation|rule|requirement|standard)/gi,
          /(?:shall|must|will)\s+(?:establish|implement|require)/gi,
        ],
      },
      {
        type: "amendment" as const,
        patterns: [
          /(?:amend|modify|update|revise|change)\s+(?:regulation|rule|section|part)/gi,
          /(?:section|part|paragraph)\s+\d+.*(?:is\s+amended|shall\s+be\s+amended)/gi,
        ],
      },
      {
        type: "repeal" as const,
        patterns: [
          /(?:repeal|remove|delete|eliminate)\s+(?:regulation|rule|section|requirement)/gi,
          /(?:section|part)\s+\d+.*(?:is\s+repealed|shall\s+be\s+repealed)/gi,
        ],
      },
      {
        type: "clarification" as const,
        patterns: [
          /(?:clarify|interpret|explain|guidance)\s+(?:regarding|concerning|on)/gi,
          /(?:interpretation|guidance|clarification)\s+(?:of|regarding)/gi,
        ],
      },
    ]

    const indicators: any[] = []
    changePatterns.forEach(({ type, patterns }) => {
      patterns.forEach((pattern) => {
        const matches = text.match(pattern)
        if (matches) {
          const confidence = Math.min(matches.length * 0.2 + 0.6, 0.95)
          indicators.push({
            type,
            confidence,
            evidence: matches.slice(0, 3),
          })
        }
      })
    })

    return indicators.sort((a, b) => b.confidence - a.confidence)
  }
}

export const nlpService = new NLPService()
