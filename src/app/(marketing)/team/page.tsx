import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Github, Linkedin } from "lucide-react"

export default function TeamPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Our Team</h1>

        <p className="text-lg text-gray-600 mb-12">
          The CodeCrafters team brings together expertise in AI, embedded systems, mobile development, and project
          management to create the SafeDriver system.
        </p>

        <Tabs defaultValue="team" className="mb-12">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="team">Team Members</TabsTrigger>
            <TabsTrigger value="structure">Team Structure</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="mt-6">
            <div className="grid gap-6">
              {[
                {
                  name: "D. S. Sandeepa",
                  id: "221444563",
                  role: "Project Coordinator",
                  responsibilities: [
                    "Overall project coordination and timeline management",
                    "System architecture design and integration oversight",
                    "Computer vision algorithm development (drowsiness detection)",
                    "Deep learning model training and optimization",
                    "TensorFlow Lite model conversion and deployment",
                    "API development for mobile and embedded communication",
                  ],
                  secondaryTasks: [
                    "Integration testing with embedded systems",
                    "Hardware troubleshooting and maintenance",
                    "Performance optimization for embedded deployment",
                  ],
                  image: "team-member-1",
                },
                {
                  name: "R. U. Gonalagoda",
                  id: "621429318",
                  role: "Hardware Specialist",
                  responsibilities: [
                    "Raspberry Pi hardware setup and configuration",
                    "Camera module integration and optimization",
                    "GPIO programming for buzzers and sensors",
                    "Power management and system reliability",
                    "Cloud messaging and notification systems",
                  ],
                  secondaryTasks: ["Database optimization and scaling", "Mobile app deployment and distribution"],
                  image: "team-member-2",
                },
                {
                  name: "P. S. Ekanayaka",
                  id: "621429276",
                  role: "UX Designer",
                  responsibilities: [
                    "Stakeholder communication and requirement gathering",
                    "User interface design and user experience optimization",
                    "Real-time data visualization and dashboards",
                  ],
                  secondaryTasks: [
                    "Backend API development assistance",
                    "Testing protocol design",
                    "Data collection and dataset preparation",
                    "Field testing coordination",
                    "User acceptance testing coordination",
                  ],
                  image: "team-member-3",
                },
                {
                  name: "K. J. L. Perera",
                  id: "621429815",
                  role: "Backend Developer",
                  responsibilities: [
                    "Research and implementation of the latest AI techniques",
                    "Firebase backend architecture and setup",
                    "Real-time database design and implementation",
                    "Flutter mobile application development",
                    "Passenger-facing features implementation",
                  ],
                  secondaryTasks: ["Security implementation and authentication", "Cloud infrastructure monitoring"],
                  image: "team-member-4",
                },
                {
                  name: "T. P. Denagamage",
                  id: "321429305",
                  role: "Documentation Specialist",
                  responsibilities: [
                    "Risk assessment and mitigation strategies",
                    "Technical documentation and report preparation",
                    "Performance benchmarking and accuracy validation",
                    "Data analytics and reporting systems",
                    "App testing and debugging",
                  ],
                  secondaryTasks: [
                    "Budget management and resource allocation",
                    "Model documentation and training guides",
                    "Frontend documentation and user guides",
                  ],
                  image: "team-member-5",
                },
              ].map((member, index) => (
                <Card key={index}>
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <div className="relative h-64 md:h-full rounded-t-lg md:rounded-l-lg md:rounded-tr-none overflow-hidden">
                        <Image
                          src={`/placeholder.svg?height=400&width=300&query=professional headshot of ${member.role}`}
                          alt={member.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <div className="md:w-2/3">
                      <CardHeader>
                        <CardTitle>{member.name}</CardTitle>
                        <CardDescription>
                          ID: {member.id} | {member.role}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h3 className="font-semibold text-blue-700 mb-2">Primary Responsibilities</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {member.responsibilities.map((resp, i) => (
                                <li key={i}>{resp}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="font-semibold text-blue-700 mb-2">Secondary Tasks</h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {member.secondaryTasks.map((task, i) => (
                                <li key={i}>{task}</li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex space-x-4 pt-2">
                            <a href="#" className="text-gray-500 hover:text-gray-700">
                              <Mail className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-gray-700">
                              <Github className="h-5 w-5" />
                            </a>
                            <a href="#" className="text-gray-500 hover:text-gray-700">
                              <Linkedin className="h-5 w-5" />
                            </a>
                          </div>
                        </div>
                      </CardContent>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="structure" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Structure and Collaboration Framework</CardTitle>
                <CardDescription>How we work together to deliver the SafeDriver system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold mb-3">Weekly Sprint Planning (Every Saturday)</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Sprint goal definition and task allocation</li>
                      <li>Progress review and impediment identification</li>
                      <li>Resource requirement assessment</li>
                      <li>Timeline adjustment if necessary</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">Daily Stand-ups (Monday, Wednesday, Friday)</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Individual progress updates (15 minutes maximum)</li>
                      <li>Blocker identification and resolution planning</li>
                      <li>Cross-team collaboration requirements</li>
                      <li>Next-day priority setting</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">Bi-weekly Integration Meetings</h3>
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Module integration testing and validation</li>
                      <li>System-wide compatibility checks</li>
                      <li>Performance benchmarking and optimization</li>
                      <li>Documentation updates and reviews</li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold mb-3">Quality Assurance and Testing Strategy</h3>
                    <div className="space-y-3">
                      <div>
                        <h4 className="font-semibold">Individual Module Testing</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Each team member is responsible for unit testing their components</li>
                          <li>Code review process with at least one other team member</li>
                          <li>Performance benchmarking against defined metrics</li>
                          <li>Documentation of test cases and results</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold">Integration Testing (Shared Responsibility)</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>
                            Week 1-2: AI models integration with embedded systems (R.U. Gonalagoda + P.S.Ekanayaka)
                          </li>
                          <li>Week 3-4: Backend integration with mobile app (K.J.L. Perera + T.P. Denagamage)</li>
                          <li>Week 5-6: End-to-end system testing (All members)</li>
                          <li>Week 7-8: Field testing and calibration (All members)</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold">User Acceptance Testing</h4>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>Passenger App Testing: T.P. Denagamage (Lead), D.S. Sandeepa (Support)</li>
                          <li>Driver Interface Testing: P.S. Ekanayaka (Lead), R.U. Gonalagoda (Support)</li>
                          <li>Authority Dashboard Testing: K.J.L. Perera (Lead), D.S. Sandeepa (Support)</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
          <h2 className="text-xl font-bold text-blue-800 mb-3">Communication and Documentation Standards</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Internal Communication</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Primary: Microsoft Teams for daily communication</li>
                <li>Secondary: WhatsApp group for urgent notifications</li>
                <li>Code Repository: GitHub with branch protection and review requirements</li>
                <li>Documentation: Shared Google Workspace with version control</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">External Communication</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>Supervisor Meetings: Dr. D.D.M. Ranasinghe (Supervisor)</li>
                <li>Stakeholder Updates: D.S. Sandeepa (Lead), relevant team member based on topic</li>
                <li>Progress Reports: Collaborative writing with D.S. Sandeepa as final reviewer</li>
                <li>Technical Documentation: Each member documents their respective modules</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
