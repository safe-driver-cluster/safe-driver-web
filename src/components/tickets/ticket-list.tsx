"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Clock, MessageSquare, Paperclip, AlertTriangle, CheckCircle, XCircle, Pause, Play } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { Ticket } from "./ticket-management"

interface TicketListProps {
  tickets: Ticket[]
  selectedTicket: Ticket | null
  onSelectTicket: (ticket: Ticket) => void
  isLoading: boolean
}

export function TicketList({ tickets, selectedTicket, onSelectTicket, isLoading }: TicketListProps) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "waiting":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
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

  const getSLAColor = (slaStatus: string) => {
    switch (slaStatus) {
      case "overdue":
        return "text-red-600"
      case "at-risk":
        return "text-yellow-600"
      case "on-time":
        return "text-green-600"
      default:
        return "text-gray-600"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-4 bg-gray-200 rounded w-24" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-gray-200 rounded-full" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (tickets.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No tickets found</h3>
          <p className="text-gray-600">No tickets match your current filters.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tickets.map((ticket) => (
        <Card
          key={ticket.id}
          className={`border-0 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md ${
            selectedTicket?.id === ticket.id ? "ring-2 ring-blue-500 shadow-md" : ""
          }`}
          onClick={() => onSelectTicket(ticket)}
        >
          <CardContent className="p-4">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium text-gray-600">#{ticket.id}</span>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(ticket.priority)}`} />
                  <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                    {getStatusIcon(ticket.status)}
                    <span className="ml-1 capitalize">{ticket.status.replace("-", " ")}</span>
                  </Badge>
                </div>
                <span className={`text-xs font-medium ${getSLAColor(ticket.slaStatus)}`}>
                  {ticket.slaStatus === "overdue" && "OVERDUE"}
                  {ticket.slaStatus === "at-risk" && "AT RISK"}
                  {ticket.slaStatus === "on-time" && "ON TIME"}
                </span>
              </div>

              {/* Subject */}
              <h3 className="font-semibold text-gray-900 line-clamp-1">{ticket.subject}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>

              {/* Tags */}
              {ticket.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {ticket.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {ticket.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{ticket.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={ticket.requester.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {ticket.requester.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">{ticket.requester.name}</span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  {ticket.messages.length > 0 && (
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{ticket.messages.length}</span>
                    </div>
                  )}
                  {ticket.attachments.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Paperclip className="h-3 w-3" />
                      <span>{ticket.attachments.length}</span>
                    </div>
                  )}
                  <span>{formatDistanceToNow(new Date(ticket.updatedAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Assigned Agent */}
              {ticket.assignedTo && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 rounded-lg p-2">
                  <span>Assigned to:</span>
                  <span className="font-medium">{ticket.assignedTo}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
