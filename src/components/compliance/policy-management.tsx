"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  FileText,
  Plus,
  Edit,
  Eye,
  Download,
  Upload,
  Clock,
  CheckCircle,
  AlertTriangle,
  Search,
  Filter,
} from "lucide-react"

export function PolicyManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterCategory, setFilterCategory] = useState("all")
  const [filterStatus, setFilterStatus] = useState("all")

  const policies = [
    {
      id: 1,
      title: "Driver Hours of Service Policy",
      category: "Safety",
      description: "Regulations governing maximum driving hours and mandatory rest periods",
      version: "2.1",
      status: "active",
      effectiveDate: "2024-01-01",
      expiryDate: "2024-12-31",
      lastUpdated: "2024-01-10",
      updatedBy: "Sarah Johnson",
      approvedBy: "Fleet Manager",
      documentSize: "1.2 MB",
      acknowledgmentRequired: true,
      acknowledgmentRate: 98,
    },
    {
      id: 2,
      title: "Vehicle Maintenance Standards",
      category: "Maintenance",
      description: "Comprehensive vehicle maintenance procedures and schedules",
      version: "1.8",
      status: "active",
      effectiveDate: "2023-12-01",
      expiryDate: "2024-11-30",
      lastUpdated: "2023-12-15",
      updatedBy: "Mike Chen",
      approvedBy: "Maintenance Supervisor",
      documentSize: "2.5 MB",
      acknowledgmentRequired: true,
      acknowledgmentRate: 100,
    },
    {
      id: 3,
      title: "Emergency Response Procedures",
      category: "Emergency",
      description: "Step-by-step procedures for handling various emergency situations",
      version: "1.5",
      status: "expiring_soon",
      effectiveDate: "2023-01-15",
      expiryDate: "2024-01-15",
      lastUpdated: "2023-01-15",
      updatedBy: "Safety Officer",
      approvedBy: "Operations Manager",
      documentSize: "0.8 MB",
      acknowledgmentRequired: true,
      acknowledgmentRate: 95,
    },
    {
      id: 4,
      title: "Drug and Alcohol Testing Policy",
      category: "HR",
      description: "Mandatory drug and alcohol testing procedures and consequences",
      version: "3.0",
      status: "active",
      effectiveDate: "2024-01-01",
      expiryDate: "2025-12-31",
      lastUpdated: "2023-12-20",
      updatedBy: "HR Manager",
      approvedBy: "CEO",
      documentSize: "1.5 MB",
      acknowledgmentRequired: true,
      acknowledgmentRate: 100,
    },
    {
      id: 5,
      title: "Environmental Compliance Guidelines",
      category: "Environmental",
      description: "Environmental protection measures and compliance requirements",
      version: "1.2",
      status: "draft",
      effectiveDate: "2024-02-01",
      expiryDate: "2025-01-31",
      lastUpdated: "2024-01-08",
      updatedBy: "Environmental Officer",
      approvedBy: "Pending",
      documentSize: "0.9 MB",
      acknowledgmentRequired: false,
      acknowledgmentRate: 0,
    },
    {
      id: 6,
      title: "Data Privacy and Security Policy",
      category: "Security",
      description: "Data protection, privacy, and cybersecurity requirements",
      version: "2.3",
      status: "active",
      effectiveDate: "2023-11-01",
      expiryDate: "2024-10-31",
      lastUpdated: "2023-11-01",
      updatedBy: "IT Security",
      approvedBy: "CTO",
      documentSize: "1.8 MB",
      acknowledgmentRequired: true,
      acknowledgmentRate: 92,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "draft":
        return "secondary"
      case "expiring_soon":
        return "destructive"
      case "expired":
        return "outline"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "draft":
        return <Edit className="h-4 w-4 text-gray-600" />
      case "expiring_soon":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />
      case "expired":
        return <Clock className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-600" />
    }
  }

  const filteredPolicies = policies.filter((policy) => {
    const matchesSearch =
      policy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      policy.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === "all" || policy.category === filterCategory
    const matchesStatus = filterStatus === "all" || policy.status === filterStatus

    return matchesSearch && matchesCategory && matchesStatus
  })

  return (
    <div className="space-y-6">
      {/* Policy Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Policies</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{policies.length}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {policies.filter((p) => p.status === "active").length}
            </div>
            <p className="text-xs text-muted-foreground">Currently in effect</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {policies.filter((p) => p.status === "expiring_soon").length}
            </div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Acknowledgment</CardTitle>
            <Eye className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {Math.round(policies.reduce((acc, p) => acc + p.acknowledgmentRate, 0) / policies.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Employee acknowledgment</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Policy Management
              </CardTitle>
              <CardDescription>Manage organizational policies and procedures</CardDescription>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Policy
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Policy</DialogTitle>
                  <DialogDescription>Add a new policy document to the system</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Policy Title</label>
                      <Input placeholder="Enter policy title" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Category</label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="safety">Safety</SelectItem>
                          <SelectItem value="maintenance">Maintenance</SelectItem>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="environmental">Environmental</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="emergency">Emergency</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <Textarea placeholder="Enter policy description" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Effective Date</label>
                      <Input type="date" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Expiry Date</label>
                      <Input type="date" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Upload Document</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        Drag and drop your policy document here, or click to browse
                      </p>
                      <Button variant="outline" className="mt-2">
                        Choose File
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Policy</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search policies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Safety">Safety</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Environmental">Environmental</SelectItem>
                  <SelectItem value="Security">Security</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="expiring_soon">Expiring Soon</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy List */}
      <div className="grid gap-4">
        {filteredPolicies.map((policy) => (
          <Card key={policy.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(policy.status)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{policy.title}</CardTitle>
                      <Badge variant="outline">v{policy.version}</Badge>
                      <Badge variant={getStatusColor(policy.status as any)}>{policy.status.replace("_", " ")}</Badge>
                      <Badge variant="outline">{policy.category}</Badge>
                    </div>
                    <CardDescription className="text-sm">{policy.description}</CardDescription>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Effective:</span> {policy.effectiveDate}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Expires:</span> {policy.expiryDate}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Size:</span> {policy.documentSize}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Last Updated:</span> {policy.lastUpdated}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Updated By:</span> {policy.updatedBy}
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Approved By:</span> {policy.approvedBy}
                  </div>
                </div>

                <div className="space-y-2">
                  {policy.acknowledgmentRequired && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Acknowledgment Required:</span> Yes
                    </div>
                  )}
                  {policy.acknowledgmentRequired && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Acknowledgment Rate:</span>
                      <span
                        className={`ml-1 font-medium ${
                          policy.acknowledgmentRate >= 95
                            ? "text-green-600"
                            : policy.acknowledgmentRate >= 80
                              ? "text-orange-600"
                              : "text-red-600"
                        }`}
                      >
                        {policy.acknowledgmentRate}%
                      </span>
                    </div>
                  )}
                  {policy.status === "expiring_soon" && (
                    <div className="text-sm text-orange-600 font-medium">
                      ⚠️ Expires in{" "}
                      {Math.ceil(
                        (new Date(policy.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                      )}{" "}
                      days
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPolicies.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">No policies found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
