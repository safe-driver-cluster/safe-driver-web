"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

import { useLanguage } from "@/components/language-provider"

export function GeneralSettings() {
  const [systemName, setSystemName] = useState("SafeDriver Authority Panel")
  const [timezone, setTimezone] = useState("UTC")
  const { language, setLanguage } = useLanguage()
  const [autoLogout, setAutoLogout] = useState(true)
  const [sessionTimeout, setSessionTimeout] = useState("30")

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
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger id="timezone">
              <SelectValue placeholder="Select timezone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
              <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
              <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
              <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
              <SelectItem value="Europe/London">London (GMT)</SelectItem>
              <SelectItem value="Europe/Paris">Paris (CET)</SelectItem>
              <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
              <SelectItem value="Asia/Colombo">Colombo (IST)</SelectItem>
              <SelectItem value="Australia/Sydney">Sydney (AEST)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">All dates and times will be displayed in this timezone.</p>
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

        <div className="flex items-center justify-between space-y-0 pt-4">
          <div className="space-y-0.5">
            <Label htmlFor="auto-logout">Auto Logout</Label>
            <p className="text-sm text-muted-foreground">Automatically log out after period of inactivity</p>
          </div>
          <Switch id="auto-logout" checked={autoLogout} onCheckedChange={setAutoLogout} />
        </div>

        {autoLogout && (
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(e.target.value)}
              min="1"
              max="1440"
            />
            <p className="text-sm text-muted-foreground">Number of minutes of inactivity before automatic logout.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
