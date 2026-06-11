import Image from "next/image"
import { CheckCircle, AlertTriangle, MapPin, Bell, Shield, FileText, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">Key System Features</h1>

        <p className="text-lg text-gray-600 mb-12">
          SafeDriver combines cutting-edge AI technology with embedded hardware to create a comprehensive safety
          solution for public transport. Here's a detailed look at our key features:
        </p>

        <div className="space-y-16">
          {/* Feature 1 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <CheckCircle className="h-4 w-4" />
                <span>Core Feature</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Real-Time Driver Alertness Monitoring</h2>
              <p className="text-gray-600 mb-4">
                Our system provides continuous surveillance of driver behavior through advanced eye-tracking algorithms,
                monitoring eye aspect ratio (EAR), blink frequency, and head pose to detect early signs of fatigue and
                drowsiness before they lead to accidents.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Advanced PERCLOS (Percentage of Eyelid Closure) calculation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Head pose estimation to detect nodding and attention deviation</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Blink pattern analysis to distinguish between normal blinking and microsleep</span>
                </li>
              </ul>
              <Button variant="outline" className="flex items-center gap-2">
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Driver Alertness Monitoring"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Distraction Detection"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <AlertTriangle className="h-4 w-4" />
                <span>Safety Feature</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Intelligent Distraction Detection</h2>
              <p className="text-gray-600 mb-4">
                Our AI-powered recognition system identifies mobile phone usage and other distracting behaviors using
                lightweight convolutional neural networks optimized for embedded platforms, ensuring immediate
                intervention.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Custom CNN architecture trained on diverse datasets</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Multi-class detection for various distracting activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>TensorFlow Lite optimization for efficient embedded execution</span>
                </li>
              </ul>
              <Button variant="outline" className="flex items-center gap-2">
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="order-2 md:order-1">
              <div className="inline-flex items-center gap-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <Bell className="h-4 w-4" />
                <span>Alert System</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">Multi-Modal Alert System</h2>
              <p className="text-gray-600 mb-4">
                Our graduated response mechanism features immediate audio buzzers and voice warnings for drivers, with
                automatic escalation to transport authorities through SMS and cloud notifications when unsafe behavior
                persists.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Level 1: Immediate audio buzzer and voice alerts (0-5 seconds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Level 2: Persistent warning with visual indicators (5-15 seconds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Level 3: Authority notification via SMS/push notifications (15+ seconds)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Level 4: Emergency response with GPS location sharing</span>
                </li>
              </ul>
              <Button variant="outline" className="flex items-center gap-2">
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <div className="order-1 md:order-2">
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Multi-Modal Alert System"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="GPS-Integrated Hazard Mapping"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                <MapPin className="h-4 w-4" />
                <span>Location Intelligence</span>
              </div>
              <h2 className="text-2xl font-bold mb-4">GPS-Integrated Hazard Mapping</h2>
              <p className="text-gray-600 mb-4">
                Our location-aware safety system correlates real-time vehicle position with accident-prone zones,
                providing context-sensitive alerts when entering high-risk areas while driver attention is compromised.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Dynamic risk mapping with traffic and weather data integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Predictive analytics for high-risk scenario identification</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Geofencing technology for automatic alert activation</span>
                </li>
              </ul>
              <Button variant="outline" className="flex items-center gap-2">
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Features */}
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <Shield className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="text-xl font-bold mb-3">Passenger Transparency Platform</h3>
              <p className="text-gray-600 mb-4">
                Dedicated mobile applications provide passengers with real-time safety status updates, fostering
                accountability and enabling community participation in transport safety monitoring.
              </p>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
              <FileText className="h-10 w-10 text-blue-800 mb-4" />
              <h3 className="text-xl font-bold mb-3">Automated Compliance Reporting</h3>
              <p className="text-gray-600 mb-4">
                An intelligent reporting system generating daily and incident-based reports for transport authorities,
                enabling data-driven policy decisions and targeted safety interventions.
              </p>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                Learn More <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
