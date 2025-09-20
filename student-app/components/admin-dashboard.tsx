"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewMetrics } from "@/components/overview-metrics"
import { UsageAnalytics } from "@/components/usage-analytics"
import { CrisisTracking } from "@/components/crisis-tracking"
import { ModerationTools } from "@/components/moderation-tools"
import { TrendAnalysis } from "@/components/trend-analysis"
import { BarChart3, Users, AlertTriangle, Shield, TrendingUp, Download } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function AdminDashboard() {
  const [dateRange, setDateRange] = useState("7d")

  const handleExportData = () => {
    // In a real implementation, this would generate and download a report
    console.log("Exporting data for range:", dateRange)
  }

  return (
    <div className="space-y-6">
      {/* Privacy Notice */}
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          All data displayed is anonymized and aggregated to protect student privacy. Individual user information is
          never displayed or stored in identifiable formats.
        </AlertDescription>
      </Alert>

      {/* Date Range Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Time Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm bg-background"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
          </div>
          <Button onClick={handleExportData} variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </Card>

      {/* Overview Metrics */}
      <OverviewMetrics dateRange={dateRange} />

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="usage" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Usage</span>
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Trends</span>
          </TabsTrigger>
          <TabsTrigger value="crisis" className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4" />
            <span>Crisis</span>
          </TabsTrigger>
          <TabsTrigger value="moderation" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Moderation</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Users</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-6">
          <UsageAnalytics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <TrendAnalysis dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="crisis" className="mt-6">
          <CrisisTracking dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="moderation" className="mt-6">
          <ModerationTools />
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Undergraduate</span>
                  <span className="text-sm font-medium">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Graduate</span>
                  <span className="text-sm font-medium">18%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Faculty/Staff</span>
                  <span className="text-sm font-medium">4%</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Satisfaction</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Very Satisfied</span>
                  <span className="text-sm font-medium">45%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Satisfied</span>
                  <span className="text-sm font-medium">38%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Neutral</span>
                  <span className="text-sm font-medium">12%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Needs Improvement</span>
                  <span className="text-sm font-medium">5%</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
