"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Plus } from "lucide-react"
import type { Ticket } from "./ticket-management"

interface CreateTicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTicket: (ticket: Ticket) => void
}

export function CreateTicketDialog({ open, onOpenChange, onCreateTicket }: CreateTicketDialogProps) {
  const [formData, setFormData] = useState({
    subject: "",
    description: "",
    category: "",
    priority: "medium",
    tags: [] as string[],
    attachments: [] as File[],
  })
  const [newTag, setNewTag] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    "Technical Issue",
    "Billing Question",
    "Feature Request",
    "Account Access",
    "Device Setup",
    "Data Export",
    "Integration Help",
    "General Question",
  ]

  const priorities = [
    { value: "low", label: "Low", color: "bg-green-500" },
    { value: "medium", label: "Medium", color: "bg-yellow-500" },
    { value: "high", label: "High", color: "bg-orange-500" },
    { value: "critical", label: "Critical", color: "bg-red-500" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    const newTicket: Ticket = {
      id: `SD-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`,
      subject: formData.subject,
      description: formData.description,
      status: "open",
      priority: formData.priority as any,
      category: formData.category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requester: {
        name: "Current User",
        email: "current.user@company.com",
        avatar: "/placeholder.svg?height=40&width=40&text=CU",
      },
      messages: [
        {
          id: "msg-initial",
          content: formData.description,
          author: {
            name: "Current User",
            email: "current.user@company.com",
            role: "user",
            avatar: "/placeholder.svg?height=40&width=40&text=CU",
          },
          timestamp: new Date().toISOString(),
          isInternal: false,
        },
      ],
      attachments: formData.attachments.map((file, index) => ({
        id: `att-${index}`,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        uploadedAt: new Date().toISOString(),
        uploadedBy: "Current User",
      })),
      tags: formData.tags,
      slaStatus: "on-time",
    }

    onCreateTicket(newTicket)
    setFormData({
      subject: "",
      description: "",
      category: "",
      priority: "medium",
      tags: [],
      attachments: [],
    })
    setNewTag("")
    setIsSubmitting(false)
    onOpenChange(false)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }))
  }

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Support Ticket</DialogTitle>
          <DialogDescription>
            Provide detailed information about your issue to help us assist you better.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Brief description of your issue"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, priority: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${priority.color}`} />
                        {priority.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Please provide detailed information about your issue, including steps to reproduce if applicable..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag"
                onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
              />
              <Button type="button" variant="outline" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {formData.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-gray-500 hover:text-gray-700"
                      onClick={() => removeTag(tag)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.txt"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Click to upload files or drag and drop</p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF, DOC up to 10MB each</p>
                </div>
              </label>
            </div>

            {formData.attachments.length > 0 && (
              <div className="space-y-2">
                {formData.attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeAttachment(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !formData.subject || !formData.description || !formData.category}
            >
              {isSubmitting ? "Creating..." : "Create Ticket"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
