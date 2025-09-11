"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Phone, Clock, CheckCircle, Users } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState, useEffect } from "react"
import { collection, getDocs, getFirestore, query, where, Timestamp, Firestore, onSnapshot, getAggregateFromServer, count, orderBy } from 'firebase/firestore';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';

// Firebase initialization
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("Firebase initialization failed:", error);
  console.warn("Please check your .env.local file for correct Firebase credentials.");
}

interface CrisisTrackingProps {
  dateRange: string
}

interface CrisisEvent {
  id: string;
  timestamp: Date;
  severity: string;
  status: string;
  responseTime: number;
  followUpRequired: boolean;
  collegeId: string;
}

export function CrisisTracking({ dateRange }: CrisisTrackingProps) {
  const [crisisEvents, setCrisisEvents] = useState<CrisisEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  // Use onAuthStateChanged to get the current user's college ID
  useEffect(() => {
    if (!auth || !db) return;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const adminDocRef = collection(db, "admins");
          const q = query(adminDocRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const adminDoc = querySnapshot.docs[0];
            const fetchedCollegeId = adminDoc.id;
            setCollegeId(fetchedCollegeId);
          } else {
            console.error("No admin document found for this user.");
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
        }
      } else {
        console.log("No user is signed in.");
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  // Use onSnapshot to fetch and listen for real-time crisis data
  useEffect(() => {
    if (!db || !collegeId) return;
    
    setLoading(true);

    const now = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case '24h':
        startDate.setHours(now.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
        break;
    }

    const q = query(
      collection(db, "crisisEvents"),
      where("collegeId", "==", collegeId),
      where("timestamp", ">=", Timestamp.fromDate(startDate)),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const events: CrisisEvent[] = [];
      snapshot.forEach((doc) => {
        events.push({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp.toDate()
        } as CrisisEvent);
      });
      setCrisisEvents(events);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching crisis events:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, collegeId, dateRange]);

  const totalInterventions = crisisEvents.length;
  const resolvedEvents = crisisEvents.filter(event => event.status === 'resolved');
  const resolutionRate = totalInterventions > 0 ? ((resolvedEvents.length / totalInterventions) * 100).toFixed(0) : "0";
  const totalResponseTime = resolvedEvents.reduce((sum, event) => sum + (event.responseTime || 0), 0);
  const avgResponseTime = resolvedEvents.length > 0 ? (totalResponseTime / resolvedEvents.length) : 0;
  const followUpsRequired = crisisEvents.filter(event => event.followUpRequired).length;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200"
      case "monitoring":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "active":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return <div className="text-center p-8">Loading crisis events...</div>;
  }
  
  if (!collegeId) {
    return <div className="text-center p-8 text-red-600">Please log in to view this section.</div>;
  }

  return (
    <div className="space-y-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Crisis intervention data is highly sensitive. Access is logged and monitored. Only authorized personnel should
          view this information.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">Total Interventions</span>
          </div>
          <p className="text-2xl font-bold">{totalInterventions}</p>
          <p className="text-xs text-muted-foreground">This period</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Avg Response Time</span>
          </div>
          <p className="text-2xl font-bold">{avgResponseTime.toFixed(1)} min</p>
          <p className="text-xs text-muted-foreground">Target: &lt;5 min</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Resolution Rate</span>
          </div>
          <p className="text-2xl font-bold">{resolutionRate}%</p>
          <p className="text-xs text-muted-foreground">Successfully resolved</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium">Follow-ups</span>
          </div>
          <p className="text-2xl font-bold">{followUpsRequired}</p>
          <p className="text-xs text-muted-foreground">Requiring monitoring</p>
        </Card>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Crisis Events</h3>
          <Button variant="outline" size="sm" className="bg-transparent">
            <Phone className="mr-2 h-4 w-4" />
            Emergency Contacts
          </Button>
        </div>

        <div className="space-y-4">
          {crisisEvents.length > 0 ? (
            crisisEvents.map((event) => (
              <div key={event.id} className="border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Badge variant="outline" className={getSeverityColor(event.severity)}>
                      {event.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className={getStatusColor(event.status)}>
                      {event.status.toUpperCase()}
                    </Badge>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {event.timestamp.toLocaleDateString()} {event.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Response Time:</span>
                    <span className="ml-2">{event.responseTime} minutes</span>
                  </div>
                  <div>
                    <span className="font-medium">Follow-up Required:</span>
                    <span className="ml-2">{event.followUpRequired ? "Yes" : "No"}</span>
                  </div>
                  <div>
                    <span className="font-medium">Event ID:</span>
                    <span className="ml-2 font-mono">#{event.id.slice(0, 8)}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center text-muted-foreground p-8">No crisis events found for this period.</div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Crisis Prevention Resources</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium">Emergency Contacts</h4>
            <div className="text-sm space-y-1">
              <p>Crisis Hotline: 988</p>
              <p>Campus Emergency: (555) 123-4567</p>
              <p>Campus Counseling: (555) 123-4568</p>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">Response Protocol</h4>
            <div className="text-sm space-y-1">
              <p>1. Immediate safety assessment</p>
              <p>2. Connect to crisis counselor</p>
              <p>3. Follow-up within 24 hours</p>
              <p>4. Document and report</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
