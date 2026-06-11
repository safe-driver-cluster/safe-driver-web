export default function TicketsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support Tickets</h1>
          <p className="text-xl text-gray-600">Manage and track all your support requests in one place</p>
        </div>

        <TicketManagement />
      </div>
    </div>
  )
}

import { TicketManagement } from "@/components/tickets/ticket-management"
