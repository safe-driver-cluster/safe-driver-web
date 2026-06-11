import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function TimelinePage() {
  const currentDate = new Date()

  // Function to determine if a phase is completed, in progress, or upcoming
  const getPhaseStatus = (startDate: Date, endDate: Date) => {
    if (currentDate > endDate) return "completed"
    if (currentDate >= startDate && currentDate <= endDate) return "in-progress"
    return "upcoming"
  }

  const phases = [
    {
      phase: "Initial Meeting & Discussion",
      activities: "Discussion with Head & Staff",
      duration: "Half day",
      dates: "10/05/2025",
      startDate: new Date("2025-05-10"),
      endDate: new Date("2025-05-10"),
    },
    {
      phase: "Requirements Gathering",
      activities: "Stakeholder meetings, specification definition",
      duration: "2 weeks",
      dates: "11/05/2025 – 25/05/2025",
      startDate: new Date("2025-05-11"),
      endDate: new Date("2025-05-25"),
    },
    {
      phase: "System Design & Architecture",
      activities: "Architectural diagrams, component selection",
      duration: "2 weeks",
      dates: "26/05/2025 – 08/06/2025",
      startDate: new Date("2025-05-26"),
      endDate: new Date("2025-06-08"),
    },
    {
      phase: "Final Proposal Submission",
      activities: "Preparation and submission of final proposal",
      duration: "1 day",
      dates: "08/06/2025",
      startDate: new Date("2025-06-08"),
      endDate: new Date("2025-06-08"),
    },
    {
      phase: "AI Model Development",
      activities: "Data collection, training, optimization",
      duration: "6 weeks",
      dates: "09/06/2025 – 20/07/2025",
      startDate: new Date("2025-06-09"),
      endDate: new Date("2025-07-20"),
    },
    {
      phase: "Progress Report 1 Submission",
      activities: "Submit progress report 1",
      duration: "1 day",
      dates: "20/07/2025",
      startDate: new Date("2025-07-20"),
      endDate: new Date("2025-07-20"),
    },
    {
      phase: "Hardware Integration",
      activities: "Component assembly, sensor integration",
      duration: "8 weeks",
      dates: "21/07/2025 – 28/09/2025",
      startDate: new Date("2025-07-21"),
      endDate: new Date("2025-09-28"),
    },
    {
      phase: "Progress Report 2 Submission",
      activities: "Submit progress report 2",
      duration: "1 day",
      dates: "28/09/2025",
      startDate: new Date("2025-09-28"),
      endDate: new Date("2025-09-28"),
    },
    {
      phase: "Testing & Calibration",
      activities: "Real-world testing, threshold tuning",
      duration: "10 weeks",
      dates: "29/09/2025 – 12/12/2025",
      startDate: new Date("2025-09-29"),
      endDate: new Date("2025-12-12"),
    },
    {
      phase: "Progress Report 3 Submission",
      activities: "Submit progress report 3",
      duration: "1 day",
      dates: "12/12/2025",
      startDate: new Date("2025-12-12"),
      endDate: new Date("2025-12-12"),
    },
    {
      phase: "Final Draft Report Preparation",
      activities: "Compilation and review of final draft",
      duration: "3 months",
      dates: "13/12/2025 – 31/03/2026",
      startDate: new Date("2025-12-13"),
      endDate: new Date("2026-03-31"),
    },
    {
      phase: "Final Draft Report Submission",
      activities: "Submit final draft report",
      duration: "1 day",
      dates: "31/03/2026",
      startDate: new Date("2026-03-31"),
      endDate: new Date("2026-03-31"),
    },
    {
      phase: "Final Report Preparation",
      activities: "Final report editing and preparation",
      duration: "3 weeks",
      dates: "01/04/2026 – 23/04/2026",
      startDate: new Date("2026-04-01"),
      endDate: new Date("2026-04-23"),
    },
    {
      phase: "Final Report Submission",
      activities: "Submit final report",
      duration: "1 day",
      dates: "24/04/2026",
      startDate: new Date("2026-04-24"),
      endDate: new Date("2026-04-24"),
    },
    {
      phase: "Reflective Log Submission",
      activities: "Submit reflective log",
      duration: "1 day",
      dates: "24/04/2026",
      startDate: new Date("2026-04-24"),
      endDate: new Date("2026-04-24"),
    },
  ]

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Project Timeline</h1>

        <p className="text-lg text-gray-600 mb-12">
          Our comprehensive project plan ensures systematic development and implementation of the SafeDriver system.
          Below is the detailed timeline of our project phases and milestones.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Project Overview</CardTitle>
            <CardDescription>May 2025 - April 2026</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">In Progress</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-sm">Upcoming</span>
              </div>
            </div>

            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-16 top-0 bottom-0 w-0.5 bg-gray-200"></div>

              <div className="space-y-8">
                {phases.map((phase, index) => {
                  const status = getPhaseStatus(phase.startDate, phase.endDate)

                  return (
                    <div key={index} className="flex gap-8">
                      {/* Status icon */}
                      <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full">
                        {status === "completed" ? (
                          <div className="bg-green-100 rounded-full p-1">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                          </div>
                        ) : status === "in-progress" ? (
                          <div className="bg-blue-100 rounded-full p-1">
                            <Clock className="h-6 w-6 text-blue-600" />
                          </div>
                        ) : (
                          <div className="bg-gray-100 rounded-full p-1">
                            <AlertCircle className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div
                          className={`p-4 rounded-lg border ${
                            status === "completed"
                              ? "bg-green-50 border-green-100"
                              : status === "in-progress"
                                ? "bg-blue-50 border-blue-100"
                                : "bg-gray-50 border-gray-100"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold">{phase.phase}</h3>
                            <Badge
                              variant={
                                status === "completed" ? "default" : status === "in-progress" ? "secondary" : "outline"
                              }
                            >
                              {status === "completed"
                                ? "Completed"
                                : status === "in-progress"
                                  ? "In Progress"
                                  : "Upcoming"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{phase.activities}</p>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{phase.dates}</span>
                            <span>{phase.duration}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Project Milestones</CardTitle>
            <CardDescription>Key deliverables and deadlines</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {phases
                .filter((phase) => phase.phase.includes("Submission"))
                .map((milestone, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 rounded-lg border border-gray-100 bg-gray-50">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        getPhaseStatus(milestone.startDate, milestone.endDate) === "completed"
                          ? "bg-green-500"
                          : getPhaseStatus(milestone.startDate, milestone.endDate) === "in-progress"
                            ? "bg-blue-500"
                            : "bg-gray-300"
                      }`}
                    ></div>
                    <div className="flex-1">
                      <h4 className="font-medium">{milestone.phase}</h4>
                      <p className="text-sm text-gray-600">{milestone.dates}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
