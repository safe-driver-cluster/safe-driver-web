"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Clock, Users, Bell } from "lucide-react"
import type { SLARule, EscalationRule, NotificationRule } from "@/lib/sla-types"

interface CreateSLARuleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateRule: (rule: SLARule) => void
}

export function CreateSLARuleDialog({ open, onOpenChange, onCreateRule }: CreateSLARuleDialogProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    priority: "medium" as const,
    category: "",
    customerTier: "" as const,
    businessHoursEnabled: true,
    timezone: "America/New_York",
    firstResponse: 60,
    resolution: 480,
    escalation: 180,
  })

  const [businessHours, setBusinessHours] = useState({
    monday: { start: "09:00", end: "17:00", enabled: true },
    tuesday: { start: "09:00", end: "17:00", enabled: true },
    wednesday: { start: "09:00", end: "17:00", enabled: true },
    thursday: { start: "09:00", end: "17:00", enabled: true },
    friday: { start: "09:00", end: "17:00", enabled: true },
    saturday: { start: "10:00", end: "14:00", enabled: false },
    sunday: { start: "10:00", end: "14:00", enabled: false },
  })

  const [escalationRules, setEscalationRules] = useState<Partial<EscalationRule>[]>([])
  const [notificationRules, setNotificationRules] = useState<Partial<NotificationRule>[]>([])

  const handleSubmit = () => {
    const newRule: SLARule = {
      id: `sla-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      isActive: true,
      priority: formData.priority,
      category: formData.category || undefined,
      customerTier: formData.customerTier || undefined,
      businessHours: {
        enabled: formData.businessHoursEnabled,
        timezone: formData.timezone,
        schedule: businessHours,
      },
      targets: {
        firstResponse: formData.firstResponse,
        resolution: formData.resolution,
        escalation: formData.escalation,
      },
      escalationRules: escalationRules.filter((rule) => rule.level && rule.triggerAfter) as EscalationRule[],
      notifications: notificationRules.filter((rule) => rule.trigger && rule.recipients) as NotificationRule[],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: "current-user",
    }

    onCreateRule(newRule)
    onOpenChange(false)
    resetForm()
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      priority: "medium",
      category: "",
      customerTier: "",
      businessHoursEnabled: true,
      timezone: "America/New_York",
      firstResponse: 60,
      resolution: 480,
      escalation: 180,
    })
    setEscalationRules([])
    setNotificationRules([])
  }

  const addEscalationRule = () => {
    setEscalationRules([
      ...escalationRules,
      {
        id: `esc-${Date.now()}`,
        level: escalationRules.length + 1,
        triggerAfter: 60,
        assignTo: [],
        notifyContacts: [],
        actions: [],
        isActive: true,
      },
    ])
  }

  const addNotificationRule = () => {
    setNotificationRules([
      ...notificationRules,
      {
        id: `notif-${Date.now()}`,
        trigger: "first_response_due",
        recipients: [],
        channels: ["email"],
        template: "",
        advanceNotice: 15,
        isActive: true,
      },
    ])
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New SLA Rule</DialogTitle>
          <DialogDescription>
            Configure a new service level agreement rule with targets, escalations, and notifications.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="targets">SLA Targets</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Rule Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Critical Issues - Enterprise"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe when this SLA rule applies..."
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority Level *</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Category (Optional)</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technical-issue">Technical Issue</SelectItem>
                      <SelectItem value="billing-question">Billing Question</SelectItem>
                      <SelectItem value="feature-request">Feature Request</SelectItem>
                      <SelectItem value="account-access">Account Access</SelectItem>
                      <SelectItem value="device-setup">Device Setup</SelectItem>
                      <SelectItem value="integration-help">Integration Help</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="customerTier">Customer Tier (Optional)</Label>
                  <Select
                    value={formData.customerTier}
                    onValueChange={(value: any) => setFormData({ ...formData, customerTier: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select customer tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="businessHours">Business Hours</Label>
                    <Switch
                      id="businessHours"
                      checked={formData.businessHoursEnabled}
                      onCheckedChange={(checked) => setFormData({ ...formData, businessHoursEnabled: checked })}
                    />
                  </div>

                  {formData.businessHoursEnabled && (
                    <div>
                      <Label htmlFor="timezone">Timezone</Label>
                      <Select
                        value={formData.timezone}
                        onValueChange={(value) => setFormData({ ...formData, timezone: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="America/New_York">Eastern Time</SelectItem>
                          <SelectItem value="America/Chicago">Central Time</SelectItem>
                          <SelectItem value="America/Denver">Mountain Time</SelectItem>
                          <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                          <SelectItem value="UTC">UTC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {formData.businessHoursEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Hours Schedule</CardTitle>
                  <CardDescription>Configure operating hours for SLA calculations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(businessHours).map(([day, schedule]) => (
                      <div key={day} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="capitalize">{day}</Label>
                          <Switch
                            checked={schedule.enabled}
                            onCheckedChange={(checked) =>
                              setBusinessHours({
                                ...businessHours,
                                [day]: { ...schedule, enabled: checked },
                              })
                            }
                          />
                        </div>
                        {schedule.enabled && (
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="time"
                              value={schedule.start}
                              onChange={(e) =>
                                setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...schedule, start: e.target.value },
                                })
                              }
                            />
                            <Input
                              type="time"
                              value={schedule.end}
                              onChange={(e) =>
                                setBusinessHours({
                                  ...businessHours,
                                  [day]: { ...schedule, end: e.target.value },
                                })
                              }
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="targets" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  SLA Time Targets
                </CardTitle>
                <CardDescription>Set response and resolution time targets for this SLA rule</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstResponse">First Response Time (minutes)</Label>
                    <Input
                      id="firstResponse"
                      type="number"
                      value={formData.firstResponse}
                      onChange={(e) =>
                        setFormData({ ...formData, firstResponse: Number.parseInt(e.target.value) || 0 })
                      }
                      min="1"
                    />
                    <p className="text-xs text-gray-500">Time to acknowledge the ticket</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="resolution">Resolution Time (minutes)</Label>
                    <Input
                      id="resolution"
                      type="number"
                      value={formData.resolution}
                      onChange={(e) => setFormData({ ...formData, resolution: Number.parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                    <p className="text-xs text-gray-500">Time to fully resolve the issue</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalation">Escalation Time (minutes)</Label>
                    <Input
                      id="escalation"
                      type="number"
                      value={formData.escalation}
                      onChange={(e) => setFormData({ ...formData, escalation: Number.parseInt(e.target.value) || 0 })}
                      min="1"
                    />
                    <p className="text-xs text-gray-500">Time before automatic escalation</p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">Time Target Preview</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-blue-700">First Response:</span>
                      <div className="font-medium">
                        {formData.firstResponse < 60
                          ? `${formData.firstResponse}m`
                          : `${Math.floor(formData.firstResponse / 60)}h ${formData.firstResponse % 60}m`}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700">Resolution:</span>
                      <div className="font-medium">
                        {formData.resolution < 60
                          ? `${formData.resolution}m`
                          : `${Math.floor(formData.resolution / 60)}h ${formData.resolution % 60}m`}
                      </div>
                    </div>
                    <div>
                      <span className="text-blue-700">Escalation:</span>
                      <div className="font-medium">
                        {formData.escalation < 60
                          ? `${formData.escalation}m`
                          : `${Math.floor(formData.escalation / 60)}h ${formData.escalation % 60}m`}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escalation" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Escalation Rules
                    </CardTitle>
                    <CardDescription>Configure automatic escalation when SLA targets are at risk</CardDescription>
                  </div>
                  <Button onClick={addEscalationRule} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {escalationRules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No escalation rules configured</p>
                    <p className="text-sm">Add rules to automatically escalate tickets when needed</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {escalationRules.map((rule, index) => (
                      <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline">Level {rule.level}</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEscalationRules(escalationRules.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Trigger After (minutes)</Label>
                            <Input
                              type="number"
                              value={rule.triggerAfter || 60}
                              onChange={(e) => {
                                const updated = [...escalationRules]
                                updated[index] = { ...rule, triggerAfter: Number.parseInt(e.target.value) || 60 }
                                setEscalationRules(updated)
                              }}
                              min="1"
                            />
                          </div>

                          <div>
                            <Label>Assign To</Label>
                            <Input
                              placeholder="e.g., senior-support, manager"
                              value={rule.assignTo?.join(", ") || ""}
                              onChange={(e) => {
                                const updated = [...escalationRules]
                                updated[index] = { ...rule, assignTo: e.target.value.split(",").map((s) => s.trim()) }
                                setEscalationRules(updated)
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Bell className="h-5 w-5" />
                      Notification Rules
                    </CardTitle>
                    <CardDescription>Configure alerts and notifications for SLA events</CardDescription>
                  </div>
                  <Button onClick={addNotificationRule} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notificationRules.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No notification rules configured</p>
                    <p className="text-sm">Add rules to send alerts when SLA events occur</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {notificationRules.map((rule, index) => (
                      <div key={rule.id} className="p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="capitalize">
                            {rule.trigger?.replace("_", " ")}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setNotificationRules(notificationRules.filter((_, i) => i !== index))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label>Trigger Event</Label>
                            <Select
                              value={rule.trigger || "first_response_due"}
                              onValueChange={(value: any) => {
                                const updated = [...notificationRules]
                                updated[index] = { ...rule, trigger: value }
                                setNotificationRules(updated)
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="first_response_due">First Response Due</SelectItem>
                                <SelectItem value="resolution_due">Resolution Due</SelectItem>
                                <SelectItem value="escalation">Escalation</SelectItem>
                                <SelectItem value="breach">SLA Breach</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>Advance Notice (minutes)</Label>
                            <Input
                              type="number"
                              value={rule.advanceNotice || 15}
                              onChange={(e) => {
                                const updated = [...notificationRules]
                                updated[index] = { ...rule, advanceNotice: Number.parseInt(e.target.value) || 15 }
                                setNotificationRules(updated)
                              }}
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.name.trim()}>
            Create SLA Rule
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
