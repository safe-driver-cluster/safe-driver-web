"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { useLanguage } from "@/components/language-provider"

export function GeneralSettings() {
  const [systemName, setSystemName] = useState("SafeDriver Authority Panel")
  const { language, setLanguage } = useLanguage()

  return (
    <Card>
      <CardHeader>
        <CardTitle>General Settings</CardTitle>
        <CardDescription>Configure basic system settings and preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="system-name">System Name</Label>
          <Input id="system-name" value={systemName} onChange={(e) => setSystemName(e.target.value)} />
          <p className="text-sm text-muted-foreground">This name will appear in the browser title and system header.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Select value={language} onValueChange={(val: any) => setLanguage(val)}>
            <SelectTrigger id="language">
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="si-LK">Sinhala</SelectItem>
              <SelectItem value="en-US">English</SelectItem>
              <SelectItem value="ta-LK">Tamil</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">The language used throughout the system interface.</p>
        </div>
      </CardContent>
    </Card>
  )
}
