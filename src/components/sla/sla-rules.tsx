"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Settings,
  MoreVertical,
  Edit,
  Trash2,
  Clock,
  Users,
  Bell,
  Search,
  AlertTriangle,
  CheckCircle,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { SLARule } from "@/lib/sla-types"

interface SLARulesProps {
  slaRules: SLARule[]
  onUpdateRule: (rule: SLARule) => void
  onDeleteRule: (ruleId: string) => void
  isLoading: boolean
}

export function SLARules({ slaRules, onUpdateRule, onDeleteRule, isLoading }: SLARulesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [ruleToDelete, setRuleToDelete] = useState<string | null>(null)

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

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
    } else {
      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      return hours > 0 ? `${days}d ${hours}h` : `${days}d`
    }
  }

  const filteredRules = slaRules.filter(
    (rule) =>
      rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleRule = (rule: SLARule) => {
    const updatedRule = { ...rule, isActive: !rule.isActive, updatedAt: new Date().toISOString() }
    onUpdateRule(updatedRule)
  }

  const handleDeleteRule = () => {
    if (ruleToDelete) {
      onDeleteRule(ruleToDelete)
      setRuleToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-5 bg-gray-200 rounded w-48" />
                  <div className="h-6 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search SLA rules..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Rules List */}
      <div className="space-y-4">
        {filteredRules.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No SLA rules found</h3>
              <p className="text-gray-600">
                {searchQuery ? "No rules match your search criteria." : "Create your first SLA rule to get started."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredRules.map((rule) => (
            <Card key={rule.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{rule.name}</h3>
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(rule.priority)}`} />
                        <Badge variant="outline" className="text-xs capitalize">
                          {rule.priority}
                        </Badge>
                        {rule.customerTier && (
                          <Badge variant="outline" className="text-xs capitalize">
                            {rule.customerTier}
                          </Badge>
                        )}
                        {rule.isActive ? (
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                      <p className="text-gray-600">{rule.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.isActive} onCheckedChange={() => handleToggleRule(rule)} />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Rule
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Configure
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => {
                              setRuleToDelete(rule.id)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* SLA Targets */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">First Response</span>
                      </div>
                      <div className="text-2xl font-bold text-blue-600">{formatTime(rule.targets.firstResponse)}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Resolution</span>
                      </div>
                      <div className="text-2xl font-bold text-green-600">{formatTime(rule.targets.resolution)}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        <span className="text-sm font-medium text-gray-700">Escalation</span>
                      </div>
                      <div className="text-2xl font-bold text-orange-600">{formatTime(rule.targets.escalation)}</div>
                    </div>
                  </div>

                  {/* Business Hours */}
                  {rule.businessHours.enabled && (
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700">Business Hours</span>
                        <Badge variant="outline" className="text-xs">
                          {rule.businessHours.timezone}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        {Object.entries(rule.businessHours.schedule).map(([day, schedule]) => (
                          <div key={day} className={`p-2 rounded ${schedule.enabled ? "bg-white" : "bg-gray-100"}`}>
                            <div className="font-medium capitalize">{day.slice(0, 3)}</div>
                            <div className={schedule.enabled ? "text-blue-600" : "text-gray-500"}>
                              {schedule.enabled ? `${schedule.start}-${schedule.end}` : "Closed"}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Escalation Rules */}
                  {rule.escalationRules.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Escalation Rules</span>
                      </div>
                      <div className="space-y-2">
                        {rule.escalationRules.map((escalation) => (
                          <div
                            key={escalation.id}
                            className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                          >
                            <div>
                              <span className="text-sm font-medium text-yellow-800">Level {escalation.level}</span>
                              <p className="text-xs text-yellow-600">
                                Triggers after {formatTime(escalation.triggerAfter)}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-yellow-600">Assign to: {escalation.assignTo.join(", ")}</div>
                              <div className="text-xs text-yellow-600">
                                {escalation.actions.length} actions configured
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notifications */}
                  {rule.notifications.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Notifications</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {rule.notifications.map((notification) => (
                          <div key={notification.id} className="p-3 bg-purple-50 rounded-lg">
                            <div className="text-sm font-medium text-purple-800 capitalize">
                              {notification.trigger.replace("_", " ")}
                            </div>
                            <div className="text-xs text-purple-600">
                              {notification.channels.join(", ")} • {formatTime(notification.advanceNotice)} notice
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500">
                    <span>Created by {rule.createdBy}</span>
                    <span>Updated {formatDistanceToNow(new Date(rule.updatedAt), { addSuffix: true })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete SLA Rule</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this SLA rule? This action cannot be undone and will affect any tickets
              currently using this rule.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteRule} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
