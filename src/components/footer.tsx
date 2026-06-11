import Link from "next/link"
import { Shield, Mail, Phone, MapPin, Github, Twitter, Facebook, Linkedin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary-400" />
              <h2 className="text-xl font-bold text-white">SafeDriver</h2>
            </div>
            <p className="text-sm text-gray-400 max-w-xs">
              Advanced driver monitoring system for enhanced road safety and fleet management.
            </p>
            <div className="flex space-x-4 pt-2">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
                <span className="sr-only">GitHub</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-white transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/technical" className="hover:text-white transition-colors">
                  Technical Details
                </Link>
              </li>
              <li>
                <Link href="/team" className="hover:text-white transition-colors">
                  Our Team
                </Link>
              </li>
              <li>
                <Link href="/timeline" className="hover:text-white transition-colors">
                  Project Timeline
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/mobile-app" className="hover:text-white transition-colors">
                  Mobile App
                </Link>
              </li>
              <li>
                <Link href="/architecture" className="hover:text-white transition-colors">
                  System Architecture
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-white transition-colors">
                  Reports & Analytics
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-white transition-colors">
                  Admin Dashboard
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Support
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span>123 Safety Road, Colombo 05, Sri Lanka</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span>+94 11 234 5678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary-400 flex-shrink-0" />
                <span>info@safedriver.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} SafeDriver. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
            <Link href="/cookies" className="hover:text-white transition-colors">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
