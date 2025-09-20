"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, query, where, getDocs, DocumentData } from "firebase/firestore";
import { auth, db } from '../lib/firebase-config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users2, Shield, TrendingUp, Download, CalendarDays, BookOpen, LogOut, HeartPulse } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OverviewMetrics } from "@/components/overview-metrics"
import { UsageAnalytics } from "@/components/usage-analytics"
import { ModerationTools } from "@/components/moderation-tools"
import { TrendAnalysis } from "@/components/trend-analysis"
import { ProgressAnalytics } from './ProgressAnalytics';
import { CounselorManagement } from './counselor-management';
import { AppointmentViewer } from './appointment-viewer';
import { ResourceManagement } from "./resource-management";
import { ThemeToggle } from "./ThemeToggle";

interface AdminData extends DocumentData {
  id: string; // This is the collegeId
  username: string;
  gmail: string;
  collegeName: string;
}

export function AdminDashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
      } else {
        const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid));
        const adminSnapshot = await getDocs(adminQuery);
        if (!adminSnapshot.empty) {
          const doc = adminSnapshot.docs[0];
          setAdminData({ id: doc.id, ...doc.data() } as AdminData);
        } else {
          console.error("Could not find admin data for the logged-in user.");
        }
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  const handleExportData = () => { console.log("Exporting data for range:", dateRange); }

  if (loading || !adminData) {
    return (
      <div className="space-y-6 p-8">
        <div className="flex justify-between items-center">
          <Skeleton className="h-10 w-64" />
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard for {adminData.collegeName}</h1>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10"><AvatarFallback>{adminData.username?.charAt(0).toUpperCase()}</AvatarFallback></Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal"><div className="flex flex-col space-y-1"><p className="text-sm font-medium leading-none">{adminData.username}</p><p className="text-xs leading-none text-muted-foreground">{adminData.gmail}</p></div></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal"><p className="text-xs text-muted-foreground">College ID: {adminData.id}</p></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          All data displayed is anonymized and aggregated to protect student privacy.
        </AlertDescription>
      </Alert>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* 👇 FIX: Replaced <select> with the styled <Select> component for better alignment 👇 */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Time Period:</span>
            <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a time period" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <Button onClick={handleExportData} variant="outline" className="bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>
      </Card>

      <OverviewMetrics dateRange={dateRange} />

      <Tabs defaultValue="usage" className="w-full">
        <TabsList className="grid w-full h-auto grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
          <TabsTrigger value="usage"><BarChart3 className="mr-2 h-4 w-4" />Usage</TabsTrigger>
          <TabsTrigger value="trends"><TrendingUp className="mr-2 h-4 w-4" />Trends</TabsTrigger>
          <TabsTrigger value="moderation"><Shield className="mr-2 h-4 w-4" />Moderation</TabsTrigger>
          <TabsTrigger value="appointments"><CalendarDays className="mr-2 h-4 w-4" />Appointments</TabsTrigger>
          <TabsTrigger value="counselors"><Users2 className="mr-2 h-4 w-4" />Counselors</TabsTrigger>
          <TabsTrigger value="resources"><BookOpen className="mr-2 h-4 w-4" />Resources</TabsTrigger>
          <TabsTrigger value="progress"><HeartPulse className="mr-2 h-4 w-4" />Progress</TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="mt-6"><UsageAnalytics dateRange={dateRange} /></TabsContent>
        <TabsContent value="trends" className="mt-6"><TrendAnalysis dateRange={dateRange} /></TabsContent>
        <TabsContent value="moderation" className="mt-6"><ModerationTools /></TabsContent>
        <TabsContent value="appointments" className="mt-6"><AppointmentViewer collegeId={adminData.id} /></TabsContent>
        <TabsContent value="counselors" className="mt-6"><CounselorManagement /></TabsContent>
        <TabsContent value="resources" className="mt-6"><ResourceManagement /></TabsContent>
        <TabsContent value="progress" className="mt-6"><ProgressAnalytics collegeId={adminData.id} /></TabsContent>
      </Tabs>
    </div>
  )
}