"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, DocumentData } from "firebase/firestore";
import { auth, db } from '../lib/firebase-config';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "./ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { OverviewMetrics } from "@/components/overview-metrics"
import { UsageAnalytics } from "@/components/usage-analytics"
import { ModerationTools } from "@/components/moderation-tools"
import { TrendAnalysis } from "@/components/trend-analysis"
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart3, Users2, Shield, TrendingUp, Download, CalendarDays, BookOpen, LogOut, HeartPulse } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProgressAnalytics } from './ProgressAnalytics';
import { CounselorManagement } from './counselor-management';
import { AppointmentViewer } from './appointment-viewer';
import { ResourceManagement } from "./resource-management";
import { ThemeToggle } from "./ThemeToggle";

interface AdminData extends DocumentData {
  id: string;
  username: string;
  gmail: string;
  collegeName: string;
  collegeId?: string;
}

export function AdminDashboard() {
  const [dateRange, setDateRange] = useState("7d");
  const [loading, setLoading] = useState(true);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [inputCollegeId, setInputCollegeId] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/login');
        return;
      }

      const adminQuery = query(collection(db, "admins"), where("uid", "==", user.uid));
      const adminSnapshot = await getDocs(adminQuery);
      
      if (!adminSnapshot.empty) {
        const doc = adminSnapshot.docs[0];
        const data = { id: doc.id, ...doc.data() } as AdminData;
        setAdminData(data);
        
        if (!data.collegeId) {
          setShowSetupModal(true);
        }
      } else {
        console.error("CRITICAL: No admin document found for this UID.");
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const handleCollegeIdSubmit = async () => {
    if (!inputCollegeId.trim() || !adminData) {
        toast({ title: "Error", description: "Please enter a valid College ID.", variant: "destructive" });
        return;
    }
    
    // Simple validation to ensure the user confirms their actual ID.
    if (inputCollegeId.trim() !== adminData.id) {
        toast({ title: "Error", description: "The College ID you entered does not match your profile.", variant: "destructive" });
        return;
    }

    setIsSaving(true);
    try {
      const adminDocRef = doc(db, "admins", adminData.id);
      await updateDoc(adminDocRef, {
        collegeId: adminData.id
      });

      setAdminData(prev => prev ? { ...prev, collegeId: adminData.id } : null);
      setShowSetupModal(false);
      toast({ title: "Success!", description: "Your profile is now complete." });

    } catch (error) {
      toast({ title: "Error", description: "An error occurred while saving.", variant: "destructive" });
      console.error(error);
    } finally {
        setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading || !adminData) {
    return (
      <div className="space-y-6 p-8">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" /><Skeleton className="h-32 w-full" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (showSetupModal) {
    return (
      <Dialog open={true}>
        {/* 👇 FIX IS HERE: Removed 'hideCloseButton' and added 'onEscapeKeyDown' 👇 */}
        <DialogContent 
          className="sm:max-w-[425px]" 
          onInteractOutside={(e) => e.preventDefault()} 
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>One-Time Account Setup</DialogTitle>
            <DialogDescription>
              To complete your profile, please confirm your unique College ID. You will only need to do this once.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collegeId" className="text-right">College ID</Label>
              <Input id="collegeId" value={inputCollegeId} onChange={(e) => setInputCollegeId(e.target.value)} placeholder="Enter your ID here" className="col-span-3" />
            </div>
            <p className="text-xs text-muted-foreground text-center col-span-4 pt-2">Your ID is: <span className="font-mono bg-muted p-1 rounded-md">{adminData.id}</span></p>
          </div>
          <DialogFooter>
            <Button onClick={handleCollegeIdSubmit} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save and Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
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
              <DropdownMenuLabel className="font-normal"><p className="text-xs text-muted-foreground">College: {adminData.collegeName}</p><p className="text-xs text-muted-foreground">ID: {adminData.id}</p></DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}><LogOut className="mr-2 h-4 w-4" /><span>Sign Out</span></DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Alert className="border-primary/20 bg-primary/5">
        <Shield className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">All data displayed is anonymized and aggregated to protect student privacy.</AlertDescription>
      </Alert>

      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4"><span className="text-sm font-medium">Time Period:</span><select id="dateRange" name="dateRange" value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="px-3 py-1 border border-border rounded-md text-sm bg-background"><option value="24h">Last 24 Hours</option><option value="7d">Last 7 Days</option><option value="30d">Last 30 Days</option></select></div>
          <Button onClick={() => console.log("Exporting...")} variant="outline" className="bg-transparent"><Download className="mr-2 h-4 w-4" />Export Report</Button>
        </div>
      </Card>

      <OverviewMetrics dateRange={dateRange} />

      <Tabs defaultValue="progress" className="w-full">
        <div className="hidden md:block">
          <TabsList className="w-full justify-start"><TabsTrigger value="usage"><BarChart3 className="mr-2 h-4 w-4" />Usage</TabsTrigger><TabsTrigger value="trends"><TrendingUp className="mr-2 h-4 w-4" />Trends</TabsTrigger><TabsTrigger value="moderation"><Shield className="mr-2 h-4 w-4" />Moderation</TabsTrigger><TabsTrigger value="appointments"><CalendarDays className="mr-2 h-4 w-4" />Appointments</TabsTrigger><TabsTrigger value="counselors"><Users2 className="mr-2 h-4 w-4" />Counselors</TabsTrigger><TabsTrigger value="resources"><BookOpen className="mr-2 h-4 w-4" />Resources</TabsTrigger><TabsTrigger value="progress"><HeartPulse className="mr-2 h-4 w-4" />Progress</TabsTrigger></TabsList>
        </div>
        <div className="md:hidden">
          <TabsList className="grid w-full grid-cols-3 h-auto"><TabsTrigger value="usage"><BarChart3 className="mr-2 h-4 w-4" />Usage</TabsTrigger><TabsTrigger value="trends"><TrendingUp className="mr-2 h-4 w-4" />Trends</TabsTrigger><TabsTrigger value="moderation"><Shield className="mr-2 h-4 w-4" />Moderation</TabsTrigger><TabsTrigger value="appointments"><CalendarDays className="mr-2 h-4 w-4" />Appointments</TabsTrigger><TabsTrigger value="counselors"><Users2 className="mr-2 h-4 w-4" />Counselors</TabsTrigger><TabsTrigger value="resources"><BookOpen className="mr-2 h-4 w-4" />Resources</TabsTrigger><TabsTrigger value="progress"><HeartPulse className="mr-2 h-4 w-4" />Progress</TabsTrigger></TabsList>
        </div>

        <TabsContent value="usage" className="mt-6"><UsageAnalytics dateRange={dateRange} /></TabsContent>
        <TabsContent value="trends" className="mt-6"><TrendAnalysis dateRange={dateRange} /></TabsContent>
        <TabsContent value="moderation" className="mt-6"><ModerationTools /></TabsContent>
        <TabsContent value="appointments" className="mt-6"><AppointmentViewer /></TabsContent>
        <TabsContent value="counselors" className="mt-6"><CounselorManagement /></TabsContent>
        <TabsContent value="resources" className="mt-6"><ResourceManagement /></TabsContent>
        <TabsContent value="progress" className="mt-6">
          {adminData.collegeId ? (
            <ProgressAnalytics collegeId={adminData.collegeId} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Setup Required</CardTitle>
                <CardContent className="pt-4">
                  <p>Please complete the one-time setup prompt to view progress analytics.</p>
                </CardContent>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}