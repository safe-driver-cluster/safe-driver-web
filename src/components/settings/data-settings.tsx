"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Database, Download, Upload, Trash2, HardDrive } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export function DataSettings() {
  const [dataRetention, setDataRetention] = useState("365")
  const [autoBackup, setAutoBackup] = useState(true)
  const [backupFrequency, setBackupFrequency] = useState("daily")
  const [compressionLevel, setCompressionLevel] = useState("medium")
  const [encryptBackups, setEncryptBackups] = useState(true)
  const [storageUsed, setStorageUsed] = useState(68)
  const [storageLimit, setStorageLimit] = useState(100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Management</CardTitle>
        <CardDescription>Configure data retention, backup settings, and storage options.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Data Retention</h3>

          <div className="space-y-2">
            <Label htmlFor="data-retention">Data Retention Period (days)</Label>
            <Input
              id="data-retention"
              type="number"
              value={dataRetention}
              onChange={(e) => setDataRetention(e.target.value)}
              min="30"
              max="3650"
            />
            <p className="text-sm text-muted-foreground">
              Number of days to retain historical data before automatic archiving.
            </p>
          </div>

          <div className="pt-2">
            <Button variant="outline" className="w-full">
              <Database className="mr-2 h-4 w-4" />
              Manage Data Archives
            </Button>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Backup Settings</h3>

          <div className="flex items-center justify-between space-y-0">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Automatic Backups</Label>
              <p className="text-sm text-muted-foreground">Automatically backup system data</p>
            </div>
            <Switch id="auto-backup" checked={autoBackup} onCheckedChange={setAutoBackup} />
          </div>

          {autoBackup && (
            <>
              <div className="space-y-2">
                <Label htmlFor="backup-frequency">Backup Frequency</Label>
                <Select value={backupFrequency} onValueChange={setBackupFrequency}>
                  <SelectTrigger id="backup-frequency">
                    <SelectValue placeholder="Select backup frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compression-level">Compression Level</Label>
                <Select value={compressionLevel} onValueChange={setCompressionLevel}>
                  <SelectTrigger id="compression-level">
                    <SelectValue placeholder="Select compression level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Faster, Larger Files)</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High (Slower, Smaller Files)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between space-y-0">
                <div className="space-y-0.5">
                  <Label htmlFor="encrypt-backups">Encrypt Backups</Label>
                  <p className="text-sm text-muted-foreground">Encrypt backup data for additional security</p>
                </div>
                <Switch id="encrypt-backups" checked={encryptBackups} onCheckedChange={setEncryptBackups} />
              </div>
            </>
          )}

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download Backup
            </Button>
            <Button variant="outline" className="flex-1">
              <Upload className="mr-2 h-4 w-4" />
              Restore Backup
            </Button>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="text-lg font-medium">Storage Management</h3>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Storage Usage</Label>
              <span className="text-sm text-muted-foreground">
                {storageUsed} GB / {storageLimit} GB
              </span>
            </div>
            <Progress value={(storageUsed / storageLimit) * 100} className="h-2" />
            <p className="text-sm text-muted-foreground">
              {Math.round((storageUsed / storageLimit) * 100)}% of your storage limit used.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1">
              <HardDrive className="mr-2 h-4 w-4" />
              Manage Storage
            </Button>
            <Button className="flex-1" variant="destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Cache
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
