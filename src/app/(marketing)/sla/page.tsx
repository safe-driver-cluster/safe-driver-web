export default function SLAPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">SLA Management</h1>
          <p className="text-xl text-gray-600">
            Configure and monitor service level agreements for optimal support performance
          </p>
        </div>

        <SLAManagement />
      </div>
    </div>
  )
}

import { SLAManagement } from "@/components/sla/sla-management"
