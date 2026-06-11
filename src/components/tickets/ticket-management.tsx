"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Search, Download, RefreshCw, MessageSquare } from "lucide-react"

import { TicketList } from "./ticket-list"
import { TicketDetails } from "./ticket-details"
import { CreateTicketDialog } from "./create-ticket-dialog"
import { TicketStats } from "./ticket-stats"
import { TicketFilters } from "./ticket-filters"

export interface Ticket {
  id: string
  subject: string
  description: string
  status: "open" | "in-progress" | "waiting" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "critical"
  category: string
  createdAt: string
  updatedAt: string
  assignedTo?: string
  requester: {
    name: string
    email: string
    avatar?: string
  }
  messages: TicketMessage[]
  attachments: TicketAttachment[]
  tags: string[]
  slaStatus: "on-time" | "at-risk" | "overdue"
  estimatedResolution?: string
}

export interface TicketMessage {
  id: string
  content: string
  author: {
    name: string
    email: string
    role: "user" | "agent" | "system"
    avatar?: string
  }
  timestamp: string
  isInternal: boolean
  attachments?: TicketAttachment[]
}

export interface TicketAttachment {
  id: string
  name: string
  size: number
  type: string
  url: string
  uploadedAt: string
  uploadedBy: string
}

export function TicketManagement() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [assigneeFilter, setAssigneeFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  // Mock data - in real app, this would come from API
  useEffect(() => {
    const mockTickets: Ticket[] = [
      {
        id: "SD-001",
        subject: "GPS tracking not updating in real-time",
        description:
          "The GPS location for vehicle VH-123 hasn't updated in the last 2 hours. The last known location was at the depot.",
        status: "open",
        priority: "high",
        category: "Technical Issue",
        createdAt: "2024-01-15T10:30:00Z",
        updatedAt: "2024-01-15T14:22:00Z",
        assignedTo: "Sarah Johnson",
        requester: {
          name: "John Smith",
          email: "john.smith@company.com",
          avatar: "/placeholder.svg?height=40&width=40&text=JS",
        },
        messages: [
          {
            id: "msg-1",
            content:
              "The GPS location for vehicle VH-123 hasn't updated in the last 2 hours. The last known location was at the depot. This is affecting our delivery schedule.",
            author: {
              name: "John Smith",
              email: "john.smith@company.com",
              role: "user",
              avatar: "/placeholder.svg?height=40&width=40&text=JS",
            },
            timestamp: "2024-01-15T10:30:00Z",
            isInternal: false,
          },
          {
            id: "msg-2",
            content:
              "Thank you for reporting this issue. I'm looking into the GPS connectivity for vehicle VH-123. Can you confirm if the device is properly connected to the OBD-II port?",
            author: {
              name: "Sarah Johnson",
              email: "sarah.johnson@safedriver.com",
              role: "agent",
              avatar: "/placeholder.svg?height=40&width=40&text=SJ",
            },
            timestamp: "2024-01-15T11:15:00Z",
            isInternal: false,
          },
        ],
        attachments: [
          {
            id: "att-1",
            name: "vehicle-location-screenshot.png",
            size: 245760,
            type: "image/png",
            url: "/placeholder.svg?height=200&width=300&text=Screenshot",
            uploadedAt: "2024-01-15T10:32:00Z",
            uploadedBy: "John Smith",
          },
        ],
        tags: ["gps", "tracking", "vehicle-vh-123"],
        slaStatus: "at-risk",
        estimatedResolution: "2024-01-16T10:00:00Z",
      },
      {
        id: "SD-002",
        subject: "Unable to access driver performance reports",
        description: "Getting a 403 error when trying to access the driver performance analytics page.",
        status: "in-progress",
        priority: "medium",
        category: "Account Access",
        createdAt: "2024-01-14T15:45:00Z",
        updatedAt: "2024-01-15T09:30:00Z",
        assignedTo: "Mike Chen",
        requester: {
          name: "Lisa Rodriguez",
          email: "lisa.rodriguez@logistics.com",
          avatar: "/placeholder.svg?height=40&width=40&text=LR",
        },
        messages: [
          {
            id: "msg-3",
            content:
              "I'm getting a 403 Forbidden error when trying to access the driver performance analytics page. This started happening yesterday.",
            author: {
              name: "Lisa Rodriguez",
              email: "lisa.rodriguez@logistics.com",
              role: "user",
              avatar: "/placeholder.svg?height=40&width=40&text=LR",
            },
            timestamp: "2024-01-14T15:45:00Z",
            isInternal: false,
          },
          {
            id: "msg-4",
            content: "I've identified the issue - it's related to a recent permission update. Working on a fix now.",
            author: {
              name: "Mike Chen",
              email: "mike.chen@safedriver.com",
              role: "agent",
              avatar: "/placeholder.svg?height=40&width=40&text=MC",
            },
            timestamp: "2024-01-15T09:30:00Z",
            isInternal: false,
          },
        ],
        attachments: [],
        tags: ["permissions", "analytics", "403-error"],
        slaStatus: "on-time",
        estimatedResolution: "2024-01-15T16:00:00Z",
      },
      {
        id: "SD-003",
        subject: "Feature request: Custom geofence shapes",
        description: "Would like the ability to create custom polygon geofences instead of just circular ones.",
        status: "waiting",
        priority: "low",
        category: "Feature Request",
        createdAt: "2024-01-13T11:20:00Z",
        updatedAt: "2024-01-14T16:45:00Z",
        requester: {
          name: "David Park",
          email: "david.park@transport.com",
          avatar: "/placeholder.svg?height=40&width=40&text=DP",
        },
        messages: [
          {
            id: "msg-5",
            content:
              "Our delivery routes often follow irregular shapes that don't fit well with circular geofences. It would be great to have polygon geofences for better coverage.",
            author: {
              name: "David Park",
              email: "david.park@transport.com",
              role: "user",
              avatar: "/placeholder.svg?height=40&width=40&text=DP",
            },
            timestamp: "2024-01-13T11:20:00Z",
            isInternal: false,
          },
        ],
        attachments: [],
        tags: ["geofencing", "feature-request", "polygon"],
        slaStatus: "on-time",
      },
      {
        id: "SD-004",
        subject: "Billing discrepancy for December",
        description: "The December invoice shows charges for 15 vehicles but we only have 12 active.",
        status: "resolved",
        priority: "medium",
        category: "Billing Question",
        createdAt: "2024-01-10T09:15:00Z",
        updatedAt: "2024-01-12T14:30:00Z",
        assignedTo: "Emma Wilson",
        requester: {
          name: "Robert Taylor",
          email: "robert.taylor@fleet.com",
          avatar: "/placeholder.svg?height=40&width=40&text=RT",
        },
        messages: [
          {
            id: "msg-6",
            content:
              "I've reviewed your account and found the discrepancy. You had 3 vehicles that were deactivated mid-month but were charged for the full month. I've processed a credit for the difference.",
            author: {
              name: "Emma Wilson",
              email: "emma.wilson@safedriver.com",
              role: "agent",
              avatar: "/placeholder.svg?height=40&width=40&text=EW",
            },
            timestamp: "2024-01-12T14:30:00Z",
            isInternal: false,
          },
        ],
        attachments: [],
        tags: ["billing", "invoice", "credit"],
        slaStatus: "on-time",
      },
    ]

    setTimeout(() => {
      setTickets(mockTickets)
      setIsLoading(false)
    }, 1000)
  }, [])

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.requester.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || ticket.status === statusFilter
    const matchesPriority = priorityFilter === "all" || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === "all" || ticket.category === categoryFilter
    const matchesAssignee = assigneeFilter === "all" || ticket.assignedTo === assigneeFilter

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "my-tickets" && ticket.requester.email === "current-user@company.com") ||
      (activeTab === "assigned" && ticket.assignedTo) ||
      (activeTab === "unassigned" && !ticket.assignedTo)

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory && matchesAssignee && matchesTab
  })

  const handleRefresh = () => {
    setIsLoading(true)
    // Simulate API refresh
    setTimeout(() => setIsLoading(false), 1000)
  }

  const handleExport = () => {
    // Implement export functionality
    console.log("Exporting tickets...")
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <TicketStats tickets={tickets} />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Support Tickets
                  </CardTitle>
                  <CardDescription>Manage and track all support requests</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    New Ticket
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All Tickets</TabsTrigger>
                  <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
                  <TabsTrigger value="assigned">Assigned</TabsTrigger>
                  <TabsTrigger value="unassigned">Unassigned</TabsTrigger>
                </TabsList>

                {/* Search and Filters */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search tickets by ID, subject, or requester..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <TicketFilters
                      statusFilter={statusFilter}
                      setStatusFilter={setStatusFilter}
                      priorityFilter={priorityFilter}
                      setPriorityFilter={setPriorityFilter}
                      categoryFilter={categoryFilter}
                      setCategoryFilter={setCategoryFilter}
                      assigneeFilter={assigneeFilter}
                      setAssigneeFilter={setAssigneeFilter}
                    />
                  </div>
                </div>

                <TabsContent value={activeTab} className="space-y-4">
                  <TicketList
                    tickets={filteredTickets}
                    selectedTicket={selectedTicket}
                    onSelectTicket={setSelectedTicket}
                    isLoading={isLoading}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details */}
        <div className="lg:col-span-1">
          <TicketDetails
            ticket={selectedTicket}
            onUpdateTicket={(updatedTicket) => {
              setTickets((prev) => prev.map((t) => (t.id === updatedTicket.id ? updatedTicket : t)))
              setSelectedTicket(updatedTicket)
            }}
          />
        </div>
      </div>

      {/* Create Ticket Dialog */}
      <CreateTicketDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onCreateTicket={(newTicket) => {
          setTickets((prev) => [newTicket, ...prev])
          setSelectedTicket(newTicket)
        }}
      />
    </div>
  )
}
