"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Star,
  Search,
  User,
  Bus,
  Calendar,
  ThumbsUp,
} from "lucide-react"
import type { Feedback } from "@/lib/feedback-service"
import { useLanguage } from "@/components/language-provider"

export default function CompliancePage() {
  const { t } = useLanguage()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  // Fetch feedback
  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (typeFilter !== "all") params.append("type", typeFilter)
        if (priorityFilter !== "all") params.append("priority", priorityFilter)
        if (searchTerm) params.append("search", searchTerm)
        params.append("limit", "100")

        const response = await fetch(`/api/feedback?${params.toString()}`)
        if (response.ok) {
          const data = await response.json()
          
          let filtered = data
          if (dateFilter !== "all") {
             const now = new Date();
             filtered = filtered.filter((f: Feedback) => {
               if (!f.timestamp && !f.createdAt) return false;
               const fDate = new Date((f.timestamp || f.createdAt) as string);
               if (dateFilter === "today") {
                 return fDate.toDateString() === now.toDateString();
               } else if (dateFilter === "week") {
                 const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                 return fDate >= weekAgo;
               } else if (dateFilter === "month") {
                 const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                 return fDate >= monthAgo;
               }
               return true;
             });
          }
          
          setFeedback(data)
          setFilteredFeedback(filtered)
        }
      } catch (error) {
        console.error("Error fetching feedback:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeedback()
    // Refresh every 30 seconds
    const interval = setInterval(fetchFeedback, 30000)
    return () => clearInterval(interval)
  }, [typeFilter, priorityFilter, searchTerm, dateFilter])

  // Calculate stats
  const stats = {
    total: feedback.length,
    submitted: feedback.filter((f) => f.status === "submitted").length,
    resolved: feedback.filter((f) => f.status === "resolved").length,
    positive: feedback.filter((f) => f.type === "positive").length,
    negative: feedback.filter((f) => f.type === "negative" || f.type === "complaint").length,
    averageRating:
      feedback.length > 0
        ? Math.round(
          (feedback.reduce((sum, f) => sum + (f.rating?.overall || 0), 0) / feedback.length) * 10,
        ) / 10
        : 0,
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800"
      case "acknowledged":
        return "bg-blue-100 text-blue-800"
      case "submitted":
        return "bg-yellow-100 text-yellow-800"
      case "closed":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 text-green-800"
      case "negative":
      case "complaint":
        return "bg-red-100 text-red-800"
      case "suggestion":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Unknown"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    } catch {
      return dateString
    }
  }


  return (
    <div className="container mx-auto p-4 md:p-6 pt-20 space-y-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t("feedback_management")}</h1>
        <p className="text-sm text-gray-600">{t("feedback_desc")}</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("total_feedback")}</CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{t("all_feedback") || "All feedback items"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("average_rating")}</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{t("out_of_5") || "Out of 5.0"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder={t("search_feedback")}
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("select_type")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_types")}</SelectItem>
                <SelectItem value="positive">{t("positive")}</SelectItem>
                <SelectItem value="negative">{t("negative")}</SelectItem>
                <SelectItem value="complaint">{t("complaint")}</SelectItem>
                <SelectItem value="suggestion">{t("suggestion")}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("select_priority")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_priorities")}</SelectItem>
                <SelectItem value="high">{t("high") || "High"}</SelectItem>
                <SelectItem value="medium">{t("medium") || "Medium"}</SelectItem>
                <SelectItem value="low">{t("low") || "Low"}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t("select_timeframe") || "Timeframe"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("all_time") || "All Time"}</SelectItem>
                <SelectItem value="today">{t("today") || "Today"}</SelectItem>
                <SelectItem value="week">{t("this_week") || "This Week"}</SelectItem>
                <SelectItem value="month">{t("this_month") || "This Month"}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Feedback List */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recent_passenger_comments") || "Recent Passenger Comments"}</CardTitle>
          <CardDescription>{t("feedback_items_desc") || "Review and manage comments and feedback from passengers."}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">{t("loading_feedback")}</div>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-gray-500">{t("no_feedback_found")}</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((item) => (
                <div
                  key={item.id || item.documentId}
                  className="border rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.title || t("untitled_feedback")}</h3>
                        <Badge className={getStatusColor(item.status)}>{t(item.status as any) || item.status || t("submitted") || "submitted"}</Badge>
                        <Badge className={getTypeColor(item.type)}>{t(item.type as any) || item.type || "general"}</Badge>
                        {item.priority && (
                          <Badge className={getPriorityColor(item.priority)}>{t(item.priority as any) || item.priority}</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{item.description || item.comment || t("no_description")}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        {item.userName && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{item.isAnonymous ? t("anonymous") : item.userName}</span>
                          </div>
                        )}
                        {item.busNumber && (
                          <div className="flex items-center gap-1">
                            <Bus className="h-3 w-3" />
                            <span>{item.busNumber}</span>
                          </div>
                        )}
                        {item.timestamp && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(item.timestamp)}</span>
                          </div>
                        )}
                        {item.rating?.overall && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{item.rating.overall}/5</span>
                          </div>
                        )}
                        {item.helpfulCount !== undefined && item.helpfulCount > 0 && (
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-3 w-3" />
                            <span>{item.helpfulCount}</span>
                          </div>
                        )}
                      </div>
                      {item.response && (
                        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-medium text-blue-900 mb-1">{t("response")}:</p>
                          <p className="text-sm text-blue-800">{item.response}</p>
                          {item.respondedBy && (
                            <p className="text-xs text-blue-600 mt-1">{t("by")} {item.respondedBy}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

