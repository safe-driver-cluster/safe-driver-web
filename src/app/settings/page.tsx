import type { Metadata } from "next"
import { Settings } from "@/components/settings/settings"

export const metadata: Metadata = {
  title: "System Settings | SafeDriver",
  description: "Configure system settings for your SafeDriver platform",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <Settings />
      </div>
    </div>
  )
}
