"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Download,
  FileText,
  CalendarIcon,
  TrendingUp,
  BarChart3,
  PieChart,
  Eye,
  Share,
  Clock,
  CheckCircle,
} from "lucide-react"
import { format } from "date-fns"

export function ComplianceReports() {
  const [selectedReport, setSelectedReport] = useState("overview")
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: new Date(2024, 0, 1),
    to: new Date(),
  })

  const reportTypes = [
    {
      id: "overview",
      name: "Compliance Overview",
      description: "Comprehensive compliance status across all categories",
      icon: <BarChart3 className="h-5 w-5" />,
      frequency: "Monthly",
      lastGenerated: "2024-01-10",
    },
    {
      id: "regulatory",
      name: "Regulatory Compliance",
      description: "DOT, FMCSA, and state regulation compliance status",
      icon: <FileText className="h-5 w-5" />,
      frequency: "Quarterly",
      lastGenerated: "2024-01-05",
    },
    {
      id: "safety",
      name: "Safety Performance",
      description: "Safety incidents, violations, and training compliance",
      icon: <CheckCircle className="h-5 w-5" />,
      frequency: "Monthly",
      lastGenerated: "2024-01-08",
    },
    {
      id: "audit",
      name: "Audit Summary",
      description: "Internal and external audit results and findings",
      icon: <PieChart className="h-5 w-5" />,
      frequency: "Quarterly",
      lastGenerated: "2024-01-05",
    },
    {
      id: "violations",
      name: "Violations Report",
      description: "Traffic violations, safety breaches, and corrective actions",
      icon: <TrendingUp className="h-5 w-5" />,
      frequency: "Weekly",
      lastGenerated: "2024-01-09",
    },
  ]

  const complianceMetrics = {
    overview: {
      overallScore: 98.5,
      trend: "+2.1%",
      categories: [
        { name: "DOT Regulations", score: 96, status: "compliant" },
        { name: "FMCSA Requirements", score: 100, status: "compliant" },
        { name: "State Regulations", score: 98, status: "compliant" },
        { name: "Safety Standards", score: 94, status: "warning" },
        { name: "Environmental", score: 100, status: "compliant" },
      ],
      keyFindings: [
        "Overall compliance improved by 2.1% from last month",
        "Safety standards require attention due to 2 recent incidents",
        "All regulatory requirements are being met",
        "Training completion rate is at 98%",
      ],
    },
    regulatory: {
      dotCompliance: 96,
      fmcsaCompliance: 100,
      stateCompliance: 98,
      requirements: [
        { category: "Driver Qualification", status: "compliant", score: 100 },
        { category: "Hours of Service", status: "warning", score: 92 },
        { category: "Vehicle Maintenance", status: "compliant", score: 98 },
        { category: "Drug Testing", status: "compliant", score: 100 },
      ],
    },
    safety: {
      incidentRate: 0.02,
      trainingCompletion: 98,
      violationCount: 3,
      incidents: [
        { type: "Speed Violation", count: 2, severity: "medium" },
        { type: "Hours of Service", count: 1, severity: "high" },
        { type: "Vehicle Inspection", count: 0, severity: "low" },
      ],
    },
  }

  const generateReport = (reportId: string) => {
    // Simulate report generation
    console.log(
      `Generating ${reportId} report for ${format(dateRange.from, "yyyy-MM-dd")} to ${format(dateRange.to, "yyyy-MM-dd")}`,
    )
  }

  return (
    <div className="space-y-6">
      {/* Report Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={`cursor-pointer transition-all ${selectedReport === report.id ? "ring-2 ring-primary" : ""}`}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {report.icon}
                <CardTitle className="text-base">{report.name}</CardTitle>
              </div>
              <CardDescription className="text-sm">{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm">
                <div>
                  <div className="text-muted-foreground">Frequency</div>
                  <div className="font-medium">{report.frequency}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Last Generated</div>
                  <div className="font-medium">{report.lastGenerated}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report Configuration
          </CardTitle>
          <CardDescription>Configure report parameters and date range</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Date Range</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    {...({
                      initialFocus: true,
                      mode: "range",
                      defaultMonth: dateRange.from,
                      selected: dateRange,
                      onSelect: (range: any) => range && setDateRange(range as { from: Date; to: Date }),
                      numberOfMonths: 2,
                    } as any)}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Format</label>
              <Select defaultValue="pdf">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF Report</SelectItem>
                  <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                  <SelectItem value="csv">CSV Data</SelectItem>
                  <SelectItem value="json">JSON Data</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Detail Level</label>
              <Select defaultValue="detailed">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Actions</label>
              <div className="flex gap-2">
                <Button className="flex-1" onClick={() => generateReport(selectedReport)}>
                  <Download className="h-4 w-4 mr-2" />
                  Generate
                </Button>
                <Button variant="outline" size="icon">
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {selectedReport === "overview" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Compliance Overview Report Preview
            </CardTitle>
            <CardDescription>Preview of the compliance overview report</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Executive Summary */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Executive Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">{complianceMetrics.overview.overallScore}%</div>
                  <div className="text-sm text-green-700">Overall Compliance</div>
                  <div className="text-xs text-green-600 mt-1">{complianceMetrics.overview.trend} from last month</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">5</div>
                  <div className="text-sm text-blue-700">Categories Monitored</div>
                  <div className="text-xs text-blue-600 mt-1">All active</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-3xl font-bold text-orange-600">1</div>
                  <div className="text-sm text-orange-700">Areas Needing Attention</div>
                  <div className="text-xs text-orange-600 mt-1">Safety standards</div>
                </div>
              </div>
            </div>

            {/* Compliance by Category */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Compliance by Category</h3>
              <div className="space-y-3">
                {complianceMetrics.overview.categories.map((category, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {category.status === "compliant" ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-orange-600" />
                        )}
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Badge variant={category.status === "compliant" ? "default" : "secondary"}>
                        {category.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="font-bold text-lg">{category.score}%</div>
                      </div>
                      <div className="w-24">
                        <Progress value={category.score} className="h-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Key Findings */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
              <ul className="space-y-2">
                {complianceMetrics.overview.keyFindings.map((finding, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm">{finding}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Scheduled Reports
          </CardTitle>
          <CardDescription>Automatically generated compliance reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Monthly Compliance Summary",
                schedule: "First Monday of each month",
                recipients: "compliance@company.com, management@company.com",
                nextRun: "2024-02-05 09:00",
                status: "active",
              },
              {
                name: "Quarterly Regulatory Report",
                schedule: "End of each quarter",
                recipients: "legal@company.com, ceo@company.com",
                nextRun: "2024-03-31 17:00",
                status: "active",
              },
              {
                name: "Weekly Safety Violations",
                schedule: "Every Friday",
                recipients: "safety@company.com, fleet@company.com",
                nextRun: "2024-01-12 16:00",
                status: "active",
              },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{report.name}</div>
                  <div className="text-sm text-muted-foreground mt-1">Schedule: {report.schedule}</div>
                  <div className="text-sm text-muted-foreground">Recipients: {report.recipients}</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">Next Run</div>
                    <div className="text-sm text-muted-foreground">{report.nextRun}</div>
                  </div>
                  <Badge variant="default">{report.status}</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Report History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Report History
          </CardTitle>
          <CardDescription>Previously generated compliance reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Compliance Overview Report",
                generatedDate: "2024-01-10 14:30",
                type: "PDF",
                size: "2.3 MB",
                generatedBy: "Sarah Johnson",
              },
              {
                name: "Safety Performance Report",
                generatedDate: "2024-01-08 16:45",
                type: "Excel",
                size: "1.8 MB",
                generatedBy: "Mike Chen",
              },
              {
                name: "Regulatory Compliance Report",
                generatedDate: "2024-01-05 09:15",
                type: "PDF",
                size: "3.1 MB",
                generatedBy: "System",
              },
              {
                name: "Violations Summary",
                generatedDate: "2024-01-03 11:20",
                type: "CSV",
                size: "0.5 MB",
                generatedBy: "Fleet Manager",
              },
            ].map((report, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <div className="font-medium">{report.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Generated by {report.generatedBy} on {report.generatedDate}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm">
                    <div>{report.type}</div>
                    <div className="text-muted-foreground">{report.size}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
