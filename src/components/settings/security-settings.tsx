"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Key, AlertTriangle } from "lucide-react"

export function SecuritySettings() {
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)
  const [passwordExpiry, setPasswordExpiry] = useState("90")
  const [passwordComplexity, setPasswordComplexity] = useState("medium")
  const [ipRestriction, setIpRestriction] = useState(false)
  const [allowedIps, setAllowedIps] = useState("")
  const [sessionLocking, setSessionLocking] = useState(true)
  const [auditLogging, setAuditLogging] = useState(true)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Settings</CardTitle>
        <CardDescription>Configure security settings and access controls for your system.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Authentication</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor-auth" className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Two-Factor Authentication
              </Label>
              <p className="text-sm text-muted-foreground">Require two-factor authentication for all users</p>
            </div>
            <Switch id="two-factor-auth" checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-expiry">Password Expiry (days)</Label>
            <Input
              id="password-expiry"
              type="number"
              value={passwordExpiry}
              onChange={(e) => setPasswordExpiry(e.target.value)}
              min="0"
              max="365"
            />
            <p className="text-sm text-muted-foreground">Number of days before passwords expire (0 for never).</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password-complexity">Password Complexity</Label>
            <Select value={passwordComplexity} onValueChange={setPasswordComplexity}>
              <SelectTrigger id="password-complexity">
                <SelectValue placeholder="Select complexity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low (8+ characters)</SelectItem>
                <SelectItem value="medium">Medium (8+ chars, mixed case, numbers)</SelectItem>
                <SelectItem value="high">High (12+ chars, mixed case, numbers, symbols)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">Required complexity level for user passwords.</p>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Access Control</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="ip-restriction" className="flex items-center gap-2">
                <Key className="h-4 w-4" /> IP Address Restriction
              </Label>
              <p className="text-sm text-muted-foreground">Restrict system access to specific IP addresses</p>
            </div>
            <Switch id="ip-restriction" checked={ipRestriction} onCheckedChange={setIpRestriction} />
          </div>

          {ipRestriction && (
            <div className="space-y-2">
              <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
              <Input
                id="allowed-ips"
                value={allowedIps}
                onChange={(e) => setAllowedIps(e.target.value)}
                placeholder="192.168.1.1, 10.0.0.1/24"
              />
              <p className="text-sm text-muted-foreground">Comma-separated list of IP addresses or CIDR ranges.</p>
            </div>
          )}

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="session-locking">Session Locking</Label>
              <p className="text-sm text-muted-foreground">Lock session after period of inactivity</p>
            </div>
            <Switch id="session-locking" checked={sessionLocking} onCheckedChange={setSessionLocking} />
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Monitoring & Compliance</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="audit-logging">Audit Logging</Label>
              <p className="text-sm text-muted-foreground">Log all user actions for security auditing</p>
            </div>
            <Switch id="audit-logging" checked={auditLogging} onCheckedChange={setAuditLogging} />
          </div>

          <div className="pt-2">
            <Button variant="outline" className="w-full">
              <AlertTriangle className="mr-2 h-4 w-4" />
              View Security Audit Logs
            </Button>
          </div>

          <div className="pt-2">
            <Button variant="outline" className="w-full">
              <Key className="mr-2 h-4 w-4" />
              Manage API Keys
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
