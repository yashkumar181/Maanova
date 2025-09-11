"use client"

import { Card } from "./ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useState, useEffect } from "react"
import { collection, getFirestore, query, where, Timestamp, Firestore, getDocs, onSnapshot } from 'firebase/firestore';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';
import { Skeleton } from "@/components/ui/skeleton"


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

interface UsageAnalyticsProps {
  dateRange: string
}

interface DailyUsageData {
    day: string;
    chatSessions: number;
    bookings: number;
    resources: number;
    forum: number;
}
interface HourlyUsageData {
    hour: string;
    usage: number;
}
interface FeatureUsageData {
    name: string;
    value: number;
    color: string;
}

// Define the shape of your data documents
interface UsageEvent {
  id: string;
  timestamp: Timestamp;
  collegeId: string;
}
interface BookingEvent {
  id: string;
  createdAt: Timestamp;
  collegeId: string;
}

export function UsageAnalytics({ dateRange }: UsageAnalyticsProps) {
  const [dailyUsage, setDailyUsage] = useState<DailyUsageData[]>([]);
  const [hourlyPattern, setHourlyPattern] = useState<HourlyUsageData[]>([]);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);

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
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!db || !collegeId) return;
    setLoading(true);

    let startDate = new Date();
    switch (dateRange) {
      case '24h':
        startDate.setHours(startDate.getHours() - 24);
        break;
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate = new Date(0);
        break;
    }
    const startTimestamp = Timestamp.fromDate(startDate);
    
    // Define queries here so they are in the scope for onSnapshot and its cleanup
    const chatQuery = query(collection(db, "chatSessions"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
    const bookingQuery = query(collection(db, "bookings"), where("collegeId", "==", collegeId), where("createdAt", ">=", startTimestamp));
    const resourceQuery = query(collection(db, "resourceAccessLogs"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
    const forumQuery = query(collection(db, "forumPosts"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));

    const fetchData = async () => {
      try {
        const chatSnapshot = await getDocs(chatQuery);
        const chatEvents = chatSnapshot.docs.map(doc => ({ ...doc.data() as UsageEvent, id: doc.id }));

        const bookingSnapshot = await getDocs(bookingQuery);
        const bookingEvents = bookingSnapshot.docs.map(doc => ({ ...doc.data() as BookingEvent, id: doc.id }));
        
        const resourceSnapshot = await getDocs(resourceQuery);
        const resourceEvents = resourceSnapshot.docs.map(doc => ({ ...doc.data() as UsageEvent, id: doc.id }));
        
        const forumSnapshot = await getDocs(forumQuery);
        const forumEvents = forumSnapshot.docs.map(doc => ({ ...doc.data() as UsageEvent, id: doc.id }));

        // Process data for charts
        const dailyMap = new Map<string, { chatSessions: number; bookings: number; resources: number; forum: number; }>();
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        days.forEach(day => dailyMap.set(day, { chatSessions: 0, bookings: 0, resources: 0, forum: 0 }));

        const hourlyMap = new Map<string, number>();
        for (let i = 0; i < 24; i++) {
            hourlyMap.set(`${i}:00`, 0);
        }

        const featureCounts = { chatSessions: 0, bookings: 0, resources: 0, forum: 0 };
        
        chatEvents.forEach((event) => {
            const day = (event.timestamp.toDate()).toLocaleString('default', { weekday: 'short' });
            if (dailyMap.has(day)) {
                dailyMap.get(day)!.chatSessions++;
            }
            const hour = (event.timestamp.toDate()).getHours();
            hourlyMap.set(`${hour}:00`, (hourlyMap.get(`${hour}:00`) || 0) + 1);
            featureCounts.chatSessions++;
        });
        
        bookingEvents.forEach((event) => {
            const day = (event.createdAt.toDate()).toLocaleString('default', { weekday: 'short' });
            if (dailyMap.has(day)) {
                dailyMap.get(day)!.bookings++;
            }
            featureCounts.bookings++;
        });

        resourceEvents.forEach((event) => {
            const day = (event.timestamp.toDate()).toLocaleString('default', { weekday: 'short' });
            if (dailyMap.has(day)) {
                dailyMap.get(day)!.resources++;
            }
            featureCounts.resources++;
        });

        forumEvents.forEach((event) => {
            const day = (event.timestamp.toDate()).toLocaleString('default', { weekday: 'short' });
            if (dailyMap.has(day)) {
                dailyMap.get(day)!.forum++;
            }
            featureCounts.forum++;
        });

        setDailyUsage(Array.from(dailyMap.entries()).map(([day, values]) => ({ day, ...values })));
        setHourlyPattern(Array.from(hourlyMap.entries()).map(([hour, usage]) => ({ hour, usage })));
        setFeatureUsage([
            { name: "AI Chat", value: featureCounts.chatSessions, color: "#0891b2" },
            { name: "Resources", value: featureCounts.resources, color: "#f97316" },
            { name: "Bookings", value: featureCounts.bookings, color: "#22c55e" },
            { name: "Forum", value: featureCounts.forum, color: "#a855f7" },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching usage data:", error);
        setLoading(false);
      }
    };
    
    fetchData();
    const unsubscribeChat = onSnapshot(chatQuery, fetchData);
    const unsubscribeBooking = onSnapshot(bookingQuery, fetchData);
    const unsubscribeResource = onSnapshot(resourceQuery, fetchData);
    const unsubscribeForum = onSnapshot(forumQuery, fetchData);

    return () => {
        unsubscribeChat();
        unsubscribeBooking();
        unsubscribeResource();
        unsubscribeForum();
    };

  }, [db, collegeId, dateRange]);


  if (loading) {
    return <div className="text-center p-8">Loading usage analytics...</div>;
  }
  
  if (!collegeId) {
    return <div className="text-center p-8 text-red-600">Please log in to view this section.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Daily Feature Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailyUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="chatSessions" fill="#0891b2" name="Chat Sessions" />
              <Bar dataKey="bookings" fill="#f97316" name="Bookings" />
              <Bar dataKey="resources" fill="#22c55e" name="Resources" />
              <Bar dataKey="forum" fill="#a855f7" name="Forum Posts" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Hourly Usage Pattern</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyPattern}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="usage" stroke="#0891b2" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Feature Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
  data={featureUsage}
  cx="50%"
  cy="50%"
  outerRadius={80}
  fill="#8884d8"
  dataKey="value"
  label={({ name }) => name}
>
  {featureUsage.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
</Pie>

              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Top Resources</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm">Breathing Techniques Video</span>
              <span className="text-sm font-medium">234 views</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Study Stress Guide</span>
              <span className="text-sm font-medium">189 downloads</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Mindfulness Audio</span>
              <span className="text-sm font-medium">156 plays</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Sleep Hygiene Article</span>
              <span className="text-sm font-medium">142 reads</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Anxiety Management</span>
              <span className="text-sm font-medium">128 views</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
