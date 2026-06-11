"use client"

import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Filter, X } from "lucide-react"

interface TicketFiltersProps {
  statusFilter: string
  setStatusFilter: (value: string) => void
  priorityFilter: string
  setPriorityFilter: (value: string) => void
  categoryFilter: string
  setCategoryFilter: (value: string) => void
  assigneeFilter: string
  setAssigneeFilter: (value: string) => void
}

export function TicketFilters({
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  categoryFilter,
  setCategoryFilter,
  assigneeFilter,
  setAssigneeFilter,
}: TicketFiltersProps) {
  const activeFilters = [
    statusFilter !== "all" && { key: "status", value: statusFilter, setter: setStatusFilter },
    priorityFilter !== "all" && { key: "priority", value: priorityFilter, setter: setPriorityFilter },
    categoryFilter !== "all" && { key: "category", value: categoryFilter, setter: setCategoryFilter },
    assigneeFilter !== "all" && { key: "assignee", value: assigneeFilter, setter: setAssigneeFilter },
  ].filter(Boolean)

  const clearAllFilters = () => {
    setStatusFilter("all")
    setPriorityFilter("all")
    setCategoryFilter("all")
    setAssigneeFilter("all")
  }

  return (
    <div className="flex items-center gap-2">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filters</h4>
              {activeFilters.length > 0 && (
                <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                  Clear all
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="waiting">Waiting</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Priority</label>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Technical Issue">Technical Issue</SelectItem>
                    <SelectItem value="Billing Question">Billing Question</SelectItem>
                    <SelectItem value="Feature Request">Feature Request</SelectItem>
                    <SelectItem value="Account Access">Account Access</SelectItem>
                    <SelectItem value="Device Setup">Device Setup</SelectItem>
                    <SelectItem value="Data Export">Data Export</SelectItem>
                    <SelectItem value="Integration Help">Integration Help</SelectItem>
                    <SelectItem value="General Question">General Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Assignee</label>
                <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Assignees</SelectItem>
                    <SelectItem value="Sarah Johnson">Sarah Johnson</SelectItem>
                    <SelectItem value="Mike Chen">Mike Chen</SelectItem>
                    <SelectItem value="Emma Wilson">Emma Wilson</SelectItem>
                    <SelectItem value="David Kim">David Kim</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-1">
          {activeFilters.map((filter: any) => (
            <Badge key={filter.key} variant="secondary" className="gap-1">
              {filter.key}: {filter.value}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 text-gray-500 hover:text-gray-700"
                onClick={() => filter.setter("all")}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}
