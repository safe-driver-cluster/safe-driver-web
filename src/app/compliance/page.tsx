"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
  RefreshCw,
  Check,
  X,
} from "lucide-react"
import type { Feedback } from "@/lib/feedback-service"
import { useLanguage } from "@/components/language-provider"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

export default function CompliancePage() {
  const { t } = useLanguage()
  const { toast } = useToast()
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")

  const fetchFeedback = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/feedback?limit=100`)
      if (response.ok) {
        const data = await response.json()
        setFeedback(data)
      }
    } catch (error) {
      console.error("Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch feedback initially
  useEffect(() => {
    fetchFeedback()
  }, [fetchFeedback])

  // Apply filters
  useEffect(() => {
    let filtered = [...feedback]

    if (typeFilter !== "all") {
      filtered = filtered.filter((f) => f.type === typeFilter)
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((f) => f.status === statusFilter || (!f.status && statusFilter === "submitted"))
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((f) => f.priority === priorityFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((f) =>
        (f.title && f.title.toLowerCase().includes(term)) ||
        (f.description && f.description.toLowerCase().includes(term)) ||
        (f.comment && f.comment.toLowerCase().includes(term)) ||
        (f.busNumber && f.busNumber.toLowerCase().includes(term)) ||
        (f.userName && f.userName.toLowerCase().includes(term)) ||
        (f.driverName && f.driverName.toLowerCase().includes(term))
      )
    }

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

    setFilteredFeedback(filtered)
  }, [feedback, typeFilter, statusFilter, priorityFilter, searchTerm, dateFilter])

  // Calculate stats
  const stats = {
    total: filteredFeedback.length,
    submitted: filteredFeedback.filter((f) => f.status === "submitted").length,
    resolved: filteredFeedback.filter((f) => f.status === "resolved").length,
    positive: filteredFeedback.filter((f) => f.type === "positive").length,
    negative: filteredFeedback.filter((f) => f.type === "negative" || f.type === "complaint").length,
    averageRating:
      filteredFeedback.length > 0
        ? Math.round(
          (filteredFeedback.reduce((sum, f) => sum + (f.rating?.overall || 0), 0) / filteredFeedback.length) * 10,
        ) / 10
        : 0,
  }

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        toast({
          title: "Status Updated",
          description: `Feedback marked as ${newStatus}.`,
        })
        setFeedback((prev) =>
          prev.map((f) =>
            f.id === id || f.documentId === id ? { ...f, status: newStatus as any } : f
          )
        )
      } else {
        const error = await response.json()
        toast({
          variant: "destructive",
          title: "Update Failed",
          description: error.error || "Failed to update status",
        })
      }
    } catch (error: any) {
      console.error("Failed to update status", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Network error",
      })
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "resolved":
      case "approved":
        return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400"
      case "acknowledged":
        return "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400"
      case "submitted":
        return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400"
      case "closed":
      case "rejected":
        return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getTypeColor = (type?: string) => {
    switch (type) {
      case "positive":
        return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400"
      case "negative":
      case "complaint":
        return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400"
      case "suggestion":
        return "bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-400"
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-400"
      case "low":
        return "bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-400"
      default:
        return "bg-muted text-muted-foreground"
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">{t("feedback_management")}</h1>
          <p className="text-sm text-muted-foreground">{t("feedback_desc")}</p>
        </div>
        <Button onClick={fetchFeedback} disabled={loading} variant="outline" className="w-full md:w-auto">
          <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
          {t("refresh_data") || "Refresh"}
        </Button>
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
            <p className="text-xs text-muted-foreground">{t("All Feedback") || "All feedback items"}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("average_rating")}</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">{t("Out of 5") || "Out of 5.0"}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>{t("filters")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
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
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
          <CardTitle>{t("Recent Passenger Comments") || "Recent Passenger Comments"}</CardTitle>
          <CardDescription>{t("feedback_items_desc") || "Review and manage comments and feedback from passengers."}</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">{t("loading_feedback")}</div>
            </div>
          ) : filteredFeedback.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-sm text-muted-foreground">{t("no_feedback_found")}</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredFeedback.map((item) => (
                <div
                  key={item.id || item.documentId}
                  className="border rounded-lg p-3 hover:bg-muted transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2 w-full">
                        <h3 className="font-semibold text-lg mr-2">{item.title || t("untitled_feedback")}</h3>
                        <Badge className={getStatusColor(item.status)}>{t(item.status as any) || item.status || t("submitted") || "submitted"}</Badge>
                        <Badge className={getTypeColor(item.type)}>{t(item.type as any) || item.type || "general"}</Badge>
                        {item.priority && (
                          <Badge className={getPriorityColor(item.priority)}>{t(item.priority as any) || item.priority}</Badge>
                        )}

                        {(!item.status || item.status === "submitted") && (
                          <div className="ml-auto flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id || item.documentId || "", "approved")}
                              className="bg-green-600 hover:bg-green-700 text-white h-7 px-2 text-xs"
                            >
                              <Check className="mr-1 h-3 w-3" />
                              {t("approve") || "Approve"}
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleStatusUpdate(item.id || item.documentId || "", "rejected")}
                              className="h-7 px-2 text-xs"
                            >
                              <X className="mr-1 h-3 w-3" />
                              {t("reject") || "Reject"}
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{item.description || item.comment || t("no_description")}</p>
                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
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
                      {((item.mediaUrls && item.mediaUrls.length > 0) || (item.images && item.images.length > 0)) && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {(item.mediaUrls || item.images || []).map((imgUrl, idx) => (
                            <a
                              key={idx}
                              href={typeof imgUrl === 'string' ? imgUrl : (imgUrl.url || '#')}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative h-24 w-24 md:h-32 md:w-32 rounded-md overflow-hidden border border-border hover:opacity-90 transition-opacity"
                            >
                              <img
                                src={typeof imgUrl === 'string' ? imgUrl : (imgUrl.url || '')}
                                alt={`Evidence ${idx + 1}`}
                                className="object-cover w-full h-full"
                              />
                            </a>
                          ))}
                        </div>
                      )}
                      {item.response && (
                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
                          <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-1">{t("response")}:</p>
                          <p className="text-sm text-blue-800 dark:text-blue-200">{item.response}</p>
                          {item.respondedBy && (
                            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">{t("by")} {item.respondedBy}</p>
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

