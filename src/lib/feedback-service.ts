import { firestoreService } from "./firebase/firestore"

const FEEDBACK_COLLECTION = "feedback"

export interface Feedback {
  id?: string
  documentId?: string
  attachments?: any[]
  busId?: string
  busNumber?: string
  category?: string
  comment?: string
  description?: string
  driverId?: string | null
  driverName?: string | null
  helpfulCount?: number
  images?: any[]
  isAnonymous?: boolean
  isPublic?: boolean
  location?: any | null
  metadata?: any
  test?: boolean
  timestamp?: string
  priority?: "low" | "medium" | "high"
  rating?: {
    cleanliness?: number | null
    comfort?: number | null
    driverBehavior?: number | null
    overall?: number
    punctuality?: number | null
    safety?: number | null
    vehicleCondition?: number | null
  }
  relatedFeedbackIds?: any[]
  respondedAt?: string | null
  respondedBy?: string | null
  response?: string | null
  routeId?: string | null
  routeNumber?: string | null
  status?: "submitted" | "acknowledged" | "resolved" | "closed"
  submittedAt?: string
  tags?: any[]
  title?: string
  type?: "positive" | "negative" | "neutral" | "complaint" | "suggestion"
  userId?: string
  userName?: string
  createdAt?: string
  updatedAt?: string
}

export interface FeedbackFilters {
  status?: Feedback["status"] | "all"
  type?: Feedback["type"] | "all"
  category?: string
  priority?: Feedback["priority"] | "all"
  search?: string
  limit?: number
}

export const feedbackService = {
  // Get all feedback with optional filters
  getAllFeedback: async (filters?: FeedbackFilters): Promise<Feedback[]> => {
    try {
      const constraints: any[] = []

      // Apply status filter server-side
      if (filters?.status && filters.status !== "all") {
        constraints.push(firestoreService.where("status", "==", filters.status))
      }

      // Apply type filter server-side
      if (filters?.type && filters.type !== "all") {
        constraints.push(firestoreService.where("type", "==", filters.type))
      }

      // Apply priority filter server-side
      if (filters?.priority && filters.priority !== "all") {
        constraints.push(firestoreService.where("priority", "==", filters.priority))
      }

      // Apply category filter server-side
      if (filters?.category) {
        constraints.push(firestoreService.where("category", "==", filters.category))
      }

      // Order by timestamp (newest first)
      constraints.push(firestoreService.orderByField("timestamp", "desc"))

      // Add limit
      const limit = filters?.limit || 100
      if (limit > 0) {
        constraints.push(firestoreService.limitResults(limit))
      }

      // Fetch with server-side filters
      let feedback = await firestoreService.getCollection<Feedback>(FEEDBACK_COLLECTION, constraints)

      // Ensure documentId is set for all feedback items
      feedback = feedback.map((item) => ({
        ...item,
        documentId: item.documentId || item.id || "",
        id: item.id || item.documentId || "",
      }))

      // Apply client-side filters that can't be done server-side (text search)
      if (filters?.search) {
        const searchLower = filters.search.toLowerCase()
        feedback = feedback.filter(
          (item) =>
            item.title?.toLowerCase().includes(searchLower) ||
            item.description?.toLowerCase().includes(searchLower) ||
            item.comment?.toLowerCase().includes(searchLower) ||
            item.busNumber?.toLowerCase().includes(searchLower) ||
            item.userName?.toLowerCase().includes(searchLower) ||
            item.driverName?.toLowerCase().includes(searchLower),
        )
      }

      return feedback
    } catch (error) {
      console.error("Error fetching feedback:", error)
      throw new Error("Failed to fetch feedback")
    }
  },

  // Get a single feedback by ID
  getFeedbackById: async (id: string): Promise<Feedback | null> => {
    try {
      const feedback = await firestoreService.getDocument<Feedback>(FEEDBACK_COLLECTION, id)
      if (feedback) {
        // Ensure documentId is set
        return { ...feedback, documentId: feedback.documentId || feedback.id || id, id: feedback.id || feedback.documentId || id }
      }
      return null
    } catch (error) {
      console.error("Error fetching feedback:", error)
      throw new Error("Failed to fetch feedback")
    }
  },

  // Update feedback status
  updateFeedbackStatus: async (id: string, status: Feedback["status"]): Promise<Feedback> => {
    try {
      const existing = await feedbackService.getFeedbackById(id)
      if (!existing) {
        throw new Error("Feedback not found")
      }

      const docId = existing.documentId || existing.id || id
      await firestoreService.updateDocument(FEEDBACK_COLLECTION, docId, {
        status,
        updatedAt: new Date().toISOString(),
      })

      return {
        ...existing,
        status,
      } as Feedback
    } catch (error) {
      console.error("Error updating feedback status:", error)
      throw new Error("Failed to update feedback status")
    }
  },

  // Add response to feedback
  addResponse: async (id: string, response: string, respondedBy: string): Promise<Feedback> => {
    try {
      const existing = await feedbackService.getFeedbackById(id)
      if (!existing) {
        throw new Error("Feedback not found")
      }

      const docId = existing.documentId || existing.id || id
      await firestoreService.updateDocument(FEEDBACK_COLLECTION, docId, {
        response,
        respondedBy,
        respondedAt: new Date().toISOString(),
        status: "resolved",
        updatedAt: new Date().toISOString(),
      })

      return {
        ...existing,
        response,
        respondedBy,
        respondedAt: new Date().toISOString(),
        status: "resolved",
      } as Feedback
    } catch (error) {
      console.error("Error adding response:", error)
      throw new Error("Failed to add response")
    }
  },

  // Get feedback statistics
  getFeedbackStats: async (): Promise<{
    total: number
    submitted: number
    acknowledged: number
    resolved: number
    closed: number
    positive: number
    negative: number
    averageRating: number
  }> => {
    try {
      const feedback = await feedbackService.getAllFeedback()

      const stats = {
        total: feedback.length,
        submitted: feedback.filter((f) => f.status === "submitted").length,
        acknowledged: feedback.filter((f) => f.status === "acknowledged").length,
        resolved: feedback.filter((f) => f.status === "resolved").length,
        closed: feedback.filter((f) => f.status === "closed").length,
        positive: feedback.filter((f) => f.type === "positive").length,
        negative: feedback.filter((f) => f.type === "negative" || f.type === "complaint").length,
        averageRating:
          feedback.length > 0
            ? Math.round(
                (feedback.reduce((sum, f) => sum + (f.rating?.overall || 0), 0) / feedback.length) * 10,
              ) / 10
            : 0,
      }

      return stats
    } catch (error) {
      console.error("Error fetching feedback stats:", error)
      throw new Error("Failed to fetch feedback statistics")
    }
  },
}

