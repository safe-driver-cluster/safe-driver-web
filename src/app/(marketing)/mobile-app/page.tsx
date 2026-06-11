import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  Bell,
  MapPin,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Star,
  Smartphone,
  Download,
  ArrowRight,
} from "lucide-react"

export default function MobileAppPage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-20 md:py-24">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-block bg-blue-600/50 px-4 py-1 rounded-full text-sm font-medium">
                Passenger Mobile App
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight">Real-Time Safety in Your Hands</h1>
              <p className="text-lg md:text-xl text-blue-100">
                The SafeDriver passenger app provides real-time safety status updates, route tracking, and emergency
                features for a transparent and secure public transport experience.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
                  Download Now <Download className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2 mt-8 md:mt-0 relative">
              <div className="relative mx-auto w-[280px] h-[560px]">
                <div className="absolute inset-0 bg-black rounded-[36px] border-[8px] border-gray-800 shadow-xl z-10 overflow-hidden">
                  <Image
                    src="/placeholder.svg?height=800&width=400"
                    alt="SafeDriver Mobile App"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -right-20 -bottom-10 w-[280px] h-[560px] bg-black rounded-[36px] border-[8px] border-gray-800 shadow-xl -z-10 opacity-50 rotate-6"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="h-16 bg-white" style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0)" }}></div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">App Features</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our passenger app is designed to provide transparency, safety, and peace of mind for public transport
              users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="h-10 w-10 text-blue-600" />,
                title: "Real-Time Safety Status",
                description:
                  "Monitor the driver's alertness level and safety status in real-time throughout your journey.",
              },
              {
                icon: <MapPin className="h-10 w-10 text-green-600" />,
                title: "Live Location Tracking",
                description: "Track your bus location in real-time and get accurate ETA to your destination.",
              },
              {
                icon: <Bell className="h-10 w-10 text-red-500" />,
                title: "Safety Alerts",
                description: "Receive instant notifications about safety concerns or when entering high-risk areas.",
              },
              {
                icon: <AlertTriangle className="h-10 w-10 text-amber-500" />,
                title: "Emergency Reporting",
                description: "Report emergencies with a single tap, alerting authorities with your exact location.",
              },
              {
                icon: <Star className="h-10 w-10 text-purple-600" />,
                title: "Driver Ratings",
                description: "Rate your journey and provide feedback on driver safety and performance.",
              },
              {
                icon: <Clock className="h-10 w-10 text-blue-800" />,
                title: "Trip History",
                description: "Access your past journeys with detailed safety records and route information.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* App Screenshots Section */}
      <section className="py-20 bg-gray-50" id="screenshots">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">App Interface</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore the intuitive and user-friendly interface of the SafeDriver passenger app.
            </p>
          </div>

          <Tabs defaultValue="safety" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="grid w-full max-w-2xl grid-cols-3">
                <TabsTrigger value="safety">Safety Dashboard</TabsTrigger>
                <TabsTrigger value="map">Live Tracking</TabsTrigger>
                <TabsTrigger value="alerts">Alerts & Reports</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="safety" className="mt-0">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                  <div className="relative mx-auto w-[280px] h-[560px]">
                    <div className="absolute inset-0 bg-black rounded-[36px] border-[8px] border-gray-800 shadow-xl overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=800&width=400"
                        alt="Safety Dashboard"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 space-y-6 mt-8 md:mt-0">
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Safety Dashboard</Badge>
                  <h3 className="text-2xl md:text-3xl font-bold">Monitor Driver Safety in Real-Time</h3>
                  <p className="text-gray-600">
                    The Safety Dashboard provides a comprehensive view of your driver's current alertness level,
                    distraction status, and overall safety score. Color-coded indicators make it easy to understand the
                    current safety status at a glance.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>Real-time driver alertness monitoring with visual indicators</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>Historical safety trends for the current driver</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>One-tap access to emergency reporting</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                  <div className="relative mx-auto w-[280px] h-[560px]">
                    <div className="absolute inset-0 bg-black rounded-[36px] border-[8px] border-gray-800 shadow-xl overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=800&width=400"
                        alt="Live Tracking Map"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 space-y-6 mt-8 md:mt-0">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Live Tracking</Badge>
                  <h3 className="text-2xl md:text-3xl font-bold">Track Your Journey in Real-Time</h3>
                  <p className="text-gray-600">
                    The Live Tracking feature allows you to see your bus's exact location on the map, with accurate
                    estimated time of arrival to your destination. You can also view nearby stops and plan your journey
                    efficiently.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>Real-time GPS tracking with accurate location updates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>Dynamic ETA calculations based on traffic conditions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>Hazard zone mapping and route safety information</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="mt-0">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="md:w-1/2">
                  <div className="relative mx-auto w-[280px] h-[560px]">
                    <div className="absolute inset-0 bg-black rounded-[36px] border-[8px] border-gray-800 shadow-xl overflow-hidden">
                      <Image
                        src="/placeholder.svg?height=800&width=400"
                        alt="Alerts & Reports"
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 space-y-6 mt-8 md:mt-0">
                  <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Alerts & Reports</Badge>
                  <h3 className="text-2xl md:text-3xl font-bold">Stay Informed and Report Issues</h3>
                  <p className="text-gray-600">
                    The Alerts & Reports section keeps you informed about safety concerns and allows you to report
                    issues directly to transport authorities. Receive instant notifications when the system detects
                    potential safety risks.
                  </p>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>Push notifications for safety alerts and warnings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>One-tap emergency reporting with location sharing</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                      <span>Historical record of alerts and reported issues</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white" id="how-it-works">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              The SafeDriver passenger app connects seamlessly with our driver monitoring system to provide real-time
              safety information.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-t-4 border-t-blue-600">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">1. Download & Register</h3>
                <p className="text-gray-600">
                  Download the app from your app store and create an account with your basic information. No special
                  hardware required.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-600">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">2. Scan Bus QR Code</h3>
                <p className="text-gray-600">
                  When boarding a SafeDriver-equipped bus, scan the QR code displayed inside to connect to that specific
                  vehicle.
                </p>
              </CardContent>
            </Card>

            <Card className="border-t-4 border-t-blue-600">
              <CardContent className="pt-6">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">3. Monitor & Stay Safe</h3>
                <p className="text-gray-600">
                  Access real-time safety information throughout your journey and receive alerts about any safety
                  concerns.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-600 mb-6">
              The app maintains a secure connection with our cloud infrastructure, ensuring you always have the most
              up-to-date safety information.
            </p>
            <Button>
              Learn More About Our Technology <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50" id="testimonials">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Users Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from passengers who have experienced the SafeDriver app during their daily commutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "The SafeDriver app gives me peace of mind during my daily commute. I can see that my driver is alert and focused, which makes me feel much safer.",
                name: "Amara Perera",
                role: "Daily Commuter",
                rating: 5,
              },
              {
                quote:
                  "As a parent, I love that my children can use this app to ensure their school bus driver is safe. The emergency alert feature is especially reassuring.",
                name: "Dinesh Jayawardena",
                role: "Parent",
                rating: 5,
              },
              {
                quote:
                  "The real-time tracking is incredibly accurate, and the safety alerts have been helpful in planning my journeys. A must-have app for public transport users.",
                name: "Lakshmi Silva",
                role: "University Student",
                rating: 4,
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex mb-4">
                  {Array(5)
                    .fill(0)
                    .map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < testimonial.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                </div>
                <p className="text-gray-600 italic mb-6">"{testimonial.quote}"</p>
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-gray-200 mr-3"></div>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Download CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 to-blue-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Download the SafeDriver App Today</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-8">
            Join thousands of passengers who are already enjoying safer public transport journeys with the SafeDriver
            app.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M17.9,19.9L17.9,19.9c-0.1,0.2-0.2,0.3-0.4,0.4c-0.2,0.1-0.4,0.2-0.6,0.2c-0.2,0-0.4-0.1-0.6-0.2c-0.2-0.1-0.3-0.2-0.4-0.4
                l-2.3-4l-0.1-0.1h-0.1H7.6c-0.2,0-0.4,0-0.5-0.1C6.9,15.6,6.8,15.5,6.7,15.4c-0.1-0.2-0.1-0.3-0.1-0.5c0-0.2,0-0.4,0.1-0.5l1.3-2.8
                l1.3-2.9c0.1-0.2,0.2-0.3,0.4-0.4c0.2-0.1,0.4-0.2,0.6-0.2c0.2,0,0.4,0.1,0.6,0.2c0.2,0.1,0.3,0.2,0.4,0.4l2.3,4l0.1,0.1h0.1h5.9
                c0.2,0,0.4,0,0.5,0.1c0.2,0.1,0.3,0.2,0.4,0.3c0.1,0.2,0.1,0.3,0.1,0.5c0,0.2,0,0.4-0.1,0.5l-1.3,2.8L17.9,19.9z"
                />
              </svg>
              App Store
            </Button>
            <Button size="lg" className="bg-white text-blue-900 hover:bg-blue-50">
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3.5,20.5c-0.3,0-0.5-0.1-0.7-0.3C2.6,20,2.5,19.8,2.5,19.5v-15C2.5,4.2,2.6,4,2.8,3.8C3,3.6,3.2,3.5,3.5,3.5h17
                c0.3,0,0.5,0.1,0.7,0.3c0.2,0.2,0.3,0.4,0.3,0.7v15c0,0.3-0.1,0.5-0.3,0.7c-0.2,0.2-0.4,0.3-0.7,0.3H3.5z M14.4,12l2.6-2.6
                c0.2-0.2,0.2-0.5,0-0.7c-0.2-0.2-0.5-0.2-0.7,0L13.5,12l2.8,2.8c0.2,0.2,0.5,0.2,0.7,0c0.2-0.2,0.2-0.5,0-0.7L14.4,12z M9.6,12
                l-2.6,2.6c-0.2,0.2-0.2,0.5,0,0.7c0.2,0.2,0.5,0.2,0.7,0l2.8-2.8l-2.8-2.8c-0.2-0.2-0.5-0.2-0.7,0c-0.2,0.2-0.2,0.5,0,0.7L9.6,12z"
                />
              </svg>
              Google Play
            </Button>
          </div>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Downloads</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4.8/5</div>
              <div className="text-blue-100">User Rating</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">500+</div>
              <div className="text-blue-100">Buses Equipped</div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white" id="faq">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Find answers to common questions about the SafeDriver passenger app.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            {[
              {
                question: "Is the SafeDriver app free to download and use?",
                answer:
                  "Yes, the SafeDriver app is completely free for passengers to download and use. The service is funded by transport authorities and bus operators to improve safety standards.",
              },
              {
                question: "Which buses are equipped with the SafeDriver system?",
                answer:
                  "Currently, the SafeDriver system is being rolled out across public buses in major cities in Sri Lanka. Look for the SafeDriver logo on buses or ask your local transport authority for more information.",
              },
              {
                question: "How does the app protect my privacy?",
                answer:
                  "The SafeDriver app only collects data necessary for its operation. Your personal information is encrypted and stored securely. We do not share your data with third parties without your explicit consent.",
              },
              {
                question: "Can I use the app without an internet connection?",
                answer:
                  "Some basic features of the app will work offline, but real-time safety monitoring and location tracking require an internet connection to function properly.",
              },
              {
                question: "How accurate is the safety monitoring system?",
                answer:
                  "The SafeDriver system has been extensively tested and calibrated to provide highly accurate safety monitoring. The system undergoes continuous improvement based on real-world data and feedback.",
              },
            ].map((item, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">{item.question}</h3>
                <p className="text-gray-600">{item.answer}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-600 mb-6">Have more questions? We're here to help.</p>
            <Link href="/contact">
              <Button>Contact Our Support Team</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
