"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase-config';

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OverviewMetrics } from "@/components/overview-metrics"
import { UsageAnalytics } from "@/components/usage-analytics"
import { CrisisTracking } from "@/components/crisis-tracking"
import { ModerationTools } from "@/components/moderation-tools"
import { TrendAnalysis } from "@/components/trend-analysis"
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users, AlertTriangle, Shield, TrendingUp, Download, CalendarDays, Users2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Import the new components we will create
import { CounselorManagement } from './counselor-management';
import { AppointmentViewer } from './appointment-viewer';


export function AdminDashboard() {
  const [dateRange, setDateRange] = useState("7d")
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push('/login');
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);


  const handleExportData = () => {
    console.log("Exporting data for range:", dateRange)
  }
  
  if (loading) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          All data displayed is anonymized and aggregated to protect student privacy.
        </AlertDescription>
      </Alert>

      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium">Time Period:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1 border border-border rounded-md text-sm bg-background"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>
          <Button onClick={handleExportData} variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </Card>

      <OverviewMetrics dateRange={dateRange} />

      {/* MODIFIED: Added two new tabs and adjusted grid columns */}
      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="usage"><BarChart3 className="mr-2 h-4 w-4" />Usage</TabsTrigger>
          <TabsTrigger value="trends"><TrendingUp className="mr-2 h-4 w-4" />Trends</TabsTrigger>
          <TabsTrigger value="crisis"><AlertTriangle className="mr-2 h-4 w-4" />Crisis</TabsTrigger>
          <TabsTrigger value="moderation"><Shield className="mr-2 h-4 w-4" />Moderation</TabsTrigger>
          <TabsTrigger value="appointments"><CalendarDays className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
          <TabsTrigger value="counselors"><Users2 className="mr-2 h-4 w-4" />Counsellors</TabsTrigger>
          <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />Users</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-6"><UsageAnalytics dateRange={dateRange} /></TabsContent>
        <TabsContent value="trends" className="mt-6"><TrendAnalysis dateRange={dateRange} /></TabsContent>
        <TabsContent value="crisis" className="mt-6"><CrisisTracking dateRange={dateRange} /></TabsContent>
        <TabsContent value="moderation" className="mt-6"><ModerationTools /></TabsContent>
        
        {/* NEW: Content for the new tabs */}
        <TabsContent value="appointments" className="mt-6"><AppointmentViewer /></TabsContent>
        <TabsContent value="counselors" className="mt-6"><CounselorManagement /></TabsContent>

        <TabsContent value="users" className="mt-6">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Demographics</h3>
              {/* Placeholder Content */}
            </Card>
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Platform Satisfaction</h3>
              {/* Placeholder Content */}
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
