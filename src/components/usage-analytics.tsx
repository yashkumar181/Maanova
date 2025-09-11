"use client"

import { Card } from "@/components/ui/card"
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
import { collection, getFirestore, query, where, Timestamp, Firestore, onSnapshot, getDocs } from 'firebase/firestore';
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

interface UsageAnalyticsProps {
  dateRange: string
}

// Define the shape of your data documents
interface UsageEvent {
  id: string;
  timestamp: Timestamp;
  collegeId: string;
  // Add other fields from your documents here if needed
}

// Define a type for the Pie chart label props
interface PieLabelProps {
  name?: string;
  percent?: number;
}

const COLORS = ["#0891b2", "#f97316", "#22c55e", "#a855f7"];

export function UsageAnalytics({ dateRange }: UsageAnalyticsProps) {
  const [dailyUsage, setDailyUsage] = useState<any[]>([]);
  const [hourlyPattern, setHourlyPattern] = useState<any[]>([]);
  const [featureUsage, setFeatureUsage] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeId, setCollegeId] = useState<string | null>(null);

  // Get the college ID of the authenticated admin
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
  }, [auth, db]);

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

    const startTimestamp = Timestamp.fromDate(startDate);
    
    // We need to fetch from multiple collections now
    const chatQuery = query(collection(db, "chatSessions"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
    const forumQuery = query(collection(db, "forumPosts"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
    const bookingsQuery = query(collection(db, "bookings"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
    const resourcesQuery = query(collection(db, "resources"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));

    const unsubscribeChat = onSnapshot(chatQuery, async (chatSnapshot) => {
        const chatEvents = chatSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UsageEvent));
        const forumSnapshot = await getDocs(forumQuery);
        const forumEvents = forumSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UsageEvent));
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookingEvents = bookingsSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UsageEvent));
        const resourcesSnapshot = await getDocs(resourcesQuery);
        const resourceEvents = resourcesSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as UsageEvent));

        // Daily Usage Data
        const dailyDataMap = new Map();
        const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - (6 - i));
            const day = daysOfWeek[d.getDay()];
            dailyDataMap.set(day, { day, chatSessions: 0, bookings: 0, resources: 0, forum: 0 });
        }
    
        chatEvents.forEach(event => {
            const day = daysOfWeek[event.timestamp.toDate().getDay()];
            const entry = dailyDataMap.get(day);
            if (entry) entry.chatSessions += 1;
        });
        bookingEvents.forEach(event => {
            const day = daysOfWeek[event.timestamp.toDate().getDay()];
            const entry = dailyDataMap.get(day);
            if (entry) entry.bookings += 1;
        });
        resourceEvents.forEach(event => {
            const day = daysOfWeek[event.timestamp.toDate().getDay()];
            const entry = dailyDataMap.get(day);
            if (entry) entry.resources += 1;
        });
        forumEvents.forEach(event => {
            const day = daysOfWeek[event.timestamp.toDate().getDay()];
            const entry = dailyDataMap.get(day);
            if (entry) entry.forum += 1;
        });
        setDailyUsage(Array.from(dailyDataMap.values()));
    
        // Hourly Usage Data
        const hourlyDataMap = new Map();
        for (let i = 0; i < 24; i++) {
            const hour = `${i}:00`;
            hourlyDataMap.set(i, { hour, usage: 0 });
        }
        
        chatEvents.forEach(event => {
            const hour = event.timestamp.toDate().getHours();
            const entry = hourlyDataMap.get(hour);
            if (entry) entry.usage += 1;
        });
        setHourlyPattern(Array.from(hourlyDataMap.values()));
        
        // Feature Distribution Data
        const featureData = [
            { name: "AI Chat", value: chatEvents.length, color: COLORS[0] },
            { name: "Resources", value: resourceEvents.length, color: COLORS[1] },
            { name: "Bookings", value: bookingEvents.length, color: COLORS[2] },
            { name: "Forum", value: forumEvents.length, color: COLORS[3] },
        ];
        setFeatureUsage(featureData);
    
        setLoading(false);
    }, (error) => {
        console.error("Error fetching usage analytics:", error);
        setLoading(false);
    });

    return () => unsubscribeChat();
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
                label={({ name, percent }: PieLabelProps) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
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
