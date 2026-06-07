import type { Metadata } from "next"
import { LanguageThemeSettings } from "@/components/settings/language-theme-settings"

export const metadata: Metadata = {
  title: "System Settings | SafeDriver",
  description: "Configure system settings for your SafeDriver platform",
}

export default function SettingsPage() {
  return (
    <div className="container mx-auto">
      <div className="flex flex-col gap-6">
        <LanguageThemeSettings />
      </div>
    </div>
  )
}
