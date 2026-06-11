import Image from "next/image"
import { Button } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold mb-6">About SafeDriver</h1>

        <div className="prose max-w-none">
          <h2>Background</h2>
          <p>
            Road safety is a complex challenge globally, exacerbated in developing countries where infrastructure,
            enforcement, and awareness may be inadequate. In Sri Lanka, over 2000 road fatalities are reported annually,
            with bus accidents representing a large fraction. According to the National Transport Commission (NTC), the
            leading causes include driver fatigue, distractions due to mobile phone use, and inattentiveness to driving
            conditions.
          </p>

          <div className="my-8 relative h-64 rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=400&width=800"
              alt="Road traffic in Sri Lanka"
              fill
              className="object-cover"
            />
          </div>

          <h2>Problem Statement</h2>
          <p>
            Sri Lanka's public transport system currently lacks a proactive and continuous monitoring mechanism for the
            safety of the driver and passengers while on the move.
          </p>

          <p>Key challenges include:</p>
          <ul>
            <li>
              Absence of real-time detection of driver fatigue and distraction, leading to unaddressed risky behavior
              during operation.
            </li>
            <li>Delays in accident prevention such as warnings or interventions come post-incident.</li>
            <li>
              Limited communication pathways between drivers, authorities, and passengers regarding safety status.
            </li>
            <li>Lack of scalable, cost-effective AI-enabled monitoring solutions tailored to local conditions.</li>
          </ul>

          <h2>Our Aim</h2>
          <p>
            The SafeDriver system aims to revolutionize public transport safety in Sri Lanka by providing a
            comprehensive, AI-driven monitoring solution that bridges the gap between reactive accident reporting and
            proactive safety intervention. This system will serve as a technological backbone for modernizing Sri
            Lanka's public transport infrastructure while ensuring scalability and cost-effectiveness.
          </p>

          <h2>Project Objectives</h2>
          <div className="space-y-3 my-6">
            {[
              "Develop robust computer vision algorithms for drowsiness detection through eye aspect ratio, blink frequency, and head pose estimation.",
              "Create and deploy mobile phone and distraction detection models based on convolutional neural networks optimized via TensorFlow Lite for efficient embedded execution.",
              "Design a real-time alerting system combining audio buzzers and voice warnings to the driver, plus SMS or cloud notifications for transport authorities.",
              "Integrate GPS-based hazard detection, mapping accident-prone zones and alerting drivers when entering such areas.",
              "Develop a passenger-facing mobile application using Flutter and Firebase, providing transparency and live safety updates.",
              "Conduct iterative testing and calibration under realistic conditions to minimize false positives/negatives and improve system robustness.",
              "Generate automated daily and event-triggered reports for authorities to track driver safety compliance and intervene when necessary.",
            ].map((objective, index) => (
              <div key={index} className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-gray-700">{objective}</p>
              </div>
            ))}
          </div>

          <div className="my-8 bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-xl font-bold text-blue-800 mb-3">Executive Summary</h3>
            <p className="text-gray-700">
              Road traffic accidents remain a leading cause of death and injury worldwide, with human error identified
              as the primary factor of most crashes. In Sri Lanka, public buses account for a significant proportion of
              road incidents, largely due to driver fatigue, distraction, and improper behavior. Despite this, most
              buses lack automated systems that can continuously monitor driver alertness or prevent accidents
              proactively.
            </p>
            <p className="text-gray-700 mt-3">
              SafeDriver addresses this gap by harnessing state-of-the-art artificial intelligence (AI) techniques
              combined with embedded hardware to monitor driver behavior in real-time. Using camera-based eye tracking
              and deep learning models, it detects driver drowsiness, mobile phone usage, and distraction. The system
              then issues immediate multimodal alerts to the driver (audio, buzzer, voice) and escalates warnings to
              transport authorities if unsafe behavior persists.
            </p>
          </div>

          <div className="flex justify-center mt-8">
            <Button size="lg">Learn More About Our Technology</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

