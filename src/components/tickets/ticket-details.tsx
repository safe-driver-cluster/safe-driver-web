"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  MessageSquare,
  Paperclip,
  Send,
  Clock,
  User,
  Tag,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Pause,
  Play,
  Download,
  Eye,
  MoreVertical,
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import type { Ticket, TicketMessage } from "./ticket-management"

interface TicketDetailsProps {
  ticket: Ticket | null
  onUpdateTicket: (ticket: Ticket) => void
}

export function TicketDetails({ ticket, onUpdateTicket }: TicketDetailsProps) {
  const [newMessage, setNewMessage] = useState("")
  const [isInternal, setIsInternal] = useState(false)
  const [isSending, setIsSending] = useState(false)

  if (!ticket) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Select a ticket</h3>
          <p className="text-gray-600">Choose a ticket from the list to view details and manage it.</p>
        </CardContent>
      </Card>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "in-progress":
        return <Play className="h-4 w-4 text-blue-500" />
      case "waiting":
        return <Pause className="h-4 w-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return

    setIsSending(true)

    const message: TicketMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      author: {
        name: "Current User",
        email: "current.user@safedriver.com",
        role: "agent",
        avatar: "/placeholder.svg?height=40&width=40&text=CU",
      },
      timestamp: new Date().toISOString(),
      isInternal,
    }

    const updatedTicket = {
      ...ticket,
      messages: [...ticket.messages, message],
      updatedAt: new Date().toISOString(),
    }

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onUpdateTicket(updatedTicket)
    setNewMessage("")
    setIsSending(false)
  }

  const handleStatusChange = (newStatus: string) => {
    const updatedTicket = {
      ...ticket,
      status: newStatus as any,
      updatedAt: new Date().toISOString(),
    }
    onUpdateTicket(updatedTicket)
  }

  const handlePriorityChange = (newPriority: string) => {
    const updatedTicket = {
      ...ticket,
      priority: newPriority as any,
      updatedAt: new Date().toISOString(),
    }
    onUpdateTicket(updatedTicket)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  return (
    <div className="space-y-6">
      {/* Ticket Header */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-medium text-gray-600">#{ticket.id}</span>
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
              </div>
              <CardTitle className="text-xl line-clamp-2">{ticket.subject}</CardTitle>
              <CardDescription>{ticket.category}</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Status and Priority Controls */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Status</label>
              <Select value={ticket.status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      Open
                    </div>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <div className="flex items-center gap-2">
                      <Play className="h-4 w-4 text-blue-500" />
                      In Progress
                    </div>
                  </SelectItem>
                  <SelectItem value="waiting">
                    <div className="flex items-center gap-2">
                      <Pause className="h-4 w-4 text-yellow-500" />
                      Waiting
                    </div>
                  </SelectItem>
                  <SelectItem value="resolved">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Resolved
                    </div>
                  </SelectItem>
                  <SelectItem value="closed">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-gray-500" />
                      Closed
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <Select value={ticket.priority} onValueChange={handlePriorityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Low
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="critical">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Critical
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Ticket Info */}
          <div className="grid grid-cols-1 gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <User className="h-4 w-4" />
              <span>Requester:</span>
              <span className="font-medium">{ticket.requester.name}</span>
              <span className="text-gray-500">({ticket.requester.email})</span>
            </div>
            {ticket.assignedTo && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span>Assigned to:</span>
                <span className="font-medium">{ticket.assignedTo}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Created:</span>
              <span className="font-medium">{format(new Date(ticket.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="h-4 w-4" />
              <span>Last updated:</span>
              <span className="font-medium">
                {formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}
              </span>
            </div>
          </div>

          {/* Tags */}
          {ticket.tags.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {ticket.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Messages */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversation ({ticket.messages.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Messages List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {ticket.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.author.role === "agent" ? "flex-row-reverse" : ""}`}
              >
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.author.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {message.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className={`flex-1 space-y-1 ${message.author.role === "agent" ? "text-right" : ""}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{message.author.name}</span>
                    <span className="text-xs text-gray-500">
                      {format(new Date(message.timestamp), "MMM d, h:mm a")}
                    </span>
                    {message.isInternal && (
                      <Badge variant="outline" className="text-xs">
                        Internal
                      </Badge>
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg text-sm ${
                      message.author.role === "agent"
                        ? "bg-blue-500 text-white"
                        : message.isInternal
                          ? "bg-yellow-50 border border-yellow-200 text-yellow-800"
                          : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* New Message Form */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              rows={3}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="internal"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <label htmlFor="internal" className="text-sm text-gray-600">
                  Internal note (not visible to customer)
                </label>
              </div>
              <Button onClick={handleSendMessage} disabled={!newMessage.trim() || isSending}>
                {isSending ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attachments */}
      {ticket.attachments.length > 0 && (
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="h-5 w-5" />
              Attachments ({ticket.attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ticket.attachments.map((attachment) => (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded">
                      <Paperclip className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{attachment.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(attachment.size)} • Uploaded by {attachment.uploadedBy}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
