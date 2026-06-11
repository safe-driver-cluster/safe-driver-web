import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TechnicalPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Technical Approach</h1>

        <p className="text-lg text-gray-600 mb-12">
          The technical approach for the SafeDriver system focuses on the integration of computer vision, embedded
          hardware, real-time alerting, and cloud connectivity to create a robust, scalable, and cost-effective driver
          monitoring and accident prevention platform.
        </p>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">System Architecture Overview</h2>
          <p className="text-gray-600 mb-6">
            SafeDriver employs a distributed architecture combining edge computing for real-time processing with cloud
            integration for data analytics and communication. This hybrid approach ensures minimal latency for critical
            safety functions while enabling comprehensive monitoring and reporting capabilities.
          </p>

          <div className="relative h-80 rounded-xl overflow-hidden shadow-lg mb-6">
            <Image
              src="/placeholder.svg?height=500&width=800"
              alt="System Architecture Diagram"
              fill
              className="object-contain"
            />
          </div>

          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-bold text-blue-800 mb-3">Core Design Principles</h3>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-bold">Edge-First Processing:</span>
                <span>Critical safety decisions made locally to eliminate network dependency</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">Modular Architecture:</span>
                <span>Independent subsystems allowing flexible deployment and maintenance</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">Scalable Integration:</span>
                <span>Cloud backend supporting fleet-wide deployment and management</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">Fault-Tolerant Design:</span>
                <span>Multiple redundancy layers ensuring system reliability</span>
              </li>
            </ul>
          </div>
        </div>

        <Tabs defaultValue="vision" className="mb-12">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
            <TabsTrigger value="vision">Computer Vision</TabsTrigger>
            <TabsTrigger value="ai">Deep Learning</TabsTrigger>
            <TabsTrigger value="alerts">Alert System</TabsTrigger>
            <TabsTrigger value="cloud">Cloud Infrastructure</TabsTrigger>
          </TabsList>

          <TabsContent value="vision" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Computer Vision Pipeline</CardTitle>
                <CardDescription>Advanced visual processing for driver monitoring</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Facial Landmark Detection:</span>
                        <span>MediaPipe framework for robust face tracking under varying lighting conditions</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Eye State Analysis:</span>
                        <span>Advanced PERCLOS calculation using temporal filtering to reduce noise</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Head Pose Estimation:</span>
                        <span>3D head orientation tracking to detect attention deviation and nodding patterns</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Blink Pattern Analysis:</span>
                        <span>
                          Frequency and duration analysis to distinguish between normal blinking and microsleep episodes
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Computer Vision Pipeline"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Deep Learning Integration</CardTitle>
                <CardDescription>AI models optimized for embedded hardware</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Mobile Phone Detection:</span>
                        <span>
                          Custom CNN architecture trained on diverse datasets, optimized through TensorFlow Lite
                          quantization
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Behavioral Classification:</span>
                        <span>
                          Multi-class detection system identifying phone calls, texting, and other distracting
                          activities
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Adaptive Learning:</span>
                        <span>
                          System calibration based on individual driver baseline behaviors to reduce false positives
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Model Optimization:</span>
                        <span>Quantization and pruning techniques to ensure real-time performance on Raspberry Pi</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Deep Learning Models"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Intelligent Alert Escalation System</CardTitle>
                <CardDescription>Multi-tiered response protocol for driver safety</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Level 1 - Immediate Intervention:</span>
                        <span>Audio buzzer and voice alerts (0-5 seconds)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Level 2 - Persistent Warning:</span>
                        <span>Increased alert intensity with visual indicators (5-15 seconds)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Level 3 - Authority Notification:</span>
                        <span>Automated SMS/push notifications to NTC (15+ seconds)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Level 4 - Emergency Response:</span>
                        <span>GPS location sharing with emergency services for severe cases</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Alert System"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cloud" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Cloud Infrastructure and Mobile Application</CardTitle>
                <CardDescription>Backend architecture for data synchronization and reporting</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Firebase Realtime Database:</span>
                        <span>Instant data synchronization across all system components</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Cloud Functions:</span>
                        <span>Serverless processing for data analytics and report generation</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Machine Learning Pipeline:</span>
                        <span>Continuous model improvement using aggregated anonymous data</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="font-bold">Security Framework:</span>
                        <span>End-to-end encryption and secure authentication protocols</span>
                      </li>
                    </ul>
                  </div>
                  <div className="relative h-48 rounded-lg overflow-hidden">
                    <Image
                      src="/placeholder.svg?height=300&width=400"
                      alt="Cloud Infrastructure"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Implementation Tools and Technologies</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-4 py-2 text-left">Layer/Module</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Technology/Tool</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Purpose</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Hardware</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Raspberry Pi 4, Raspberry Pi Camera Module 2 NoIR, GPS Module, Buzzer
                  </td>
                  <td className="border border-gray-300 px-4 py-2">Embedded processing and sensing hardware</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Computer Vision</td>
                  <td className="border border-gray-300 px-4 py-2">OpenCV, MediaPipe</td>
                  <td className="border border-gray-300 px-4 py-2">Face/eye tracking and head pose estimation</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Deep Learning</td>
                  <td className="border border-gray-300 px-4 py-2">TensorFlow Lite</td>
                  <td className="border border-gray-300 px-4 py-2">
                    Mobile phone usage detection on embedded platform
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Backend & Cloud</td>
                  <td className="border border-gray-300 px-4 py-2">Firebase Realtime DB, Firebase Cloud Messaging</td>
                  <td className="border border-gray-300 px-4 py-2">Real-time data storage and communication</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-4 py-2">Mobile Application</td>
                  <td className="border border-gray-300 px-4 py-2">Flutter</td>
                  <td className="border border-gray-300 px-4 py-2">Cross-platform passenger app development</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">Programming Languages</td>
                  <td className="border border-gray-300 px-4 py-2">Python</td>
                  <td className="border border-gray-300 px-4 py-2">Driver monitoring and system integration scripts</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">System Block Diagram</h2>
          <div className="relative h-96 rounded-xl overflow-hidden shadow-lg">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="System Block Diagram"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
