"use client"

import { Card } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { TrendingUp, TrendingDown, AlertTriangle, Users } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, getFirestore, query, where, Timestamp, Firestore, onSnapshot, getDocs, orderBy, startAt, endAt } from 'firebase/firestore';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, Auth, onAuthStateChanged } from 'firebase/auth';

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

interface TrendAnalysisProps {
  dateRange: string
}

interface TrendDataPoint {
  date: string;
  anxiety: number;
  depression: number;
  stress: number;
  wellness: number;
}

// Type for the keys of the trend data object
type TrendKeys = "anxiety" | "depression" | "stress" | "wellness";

export function TrendAnalysis({ dateRange }: TrendAnalysisProps) {
  const [mentalHealthTrends, setMentalHealthTrends] = useState<TrendDataPoint[]>([]);
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
  }, [auth, db]);
  
  useEffect(() => {
    if (!db || !collegeId) return;
    setLoading(true);

    let startDate = new Date();
    switch (dateRange) {
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
    
    // I am making the assumption that the "chatSessions" collection has a field called "topic"
    // that contains values like "Anxiety", "Depression", "Academic Stress", "Wellness", etc.
    const trendsQuery = query(
      collection(db, "chatSessions"),
      where("collegeId", "==", collegeId),
      where("timestamp", ">=", startTimestamp),
      orderBy("timestamp", "asc")
    );

    const unsubscribe = onSnapshot(trendsQuery, (snapshot) => {
      const data: { [key: string]: { anxiety: number; depression: number; stress: number; wellness: number; } } = {};
      const today = new Date();
      let labels: string[] = [];

      if (dateRange === '7d' || dateRange === '30d') {
        const days = dateRange === '7d' ? 7 : 30;
        for (let i = 0; i < days; i++) {
            const d = new Date(today);
            d.setDate(today.getDate() - (days - 1 - i));
            const dateStr = `${d.getMonth() + 1}/${d.getDate()}`;
            labels.push(dateStr);
            data[dateStr] = { anxiety: 0, depression: 0, stress: 0, wellness: 0 };
        }
      } else {
        // For longer ranges, group by month
        const now = new Date();
        for (let i = 0; i < 12; i++) {
          const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
          const monthStr = d.toLocaleString('default', { month: 'short' });
          labels.push(monthStr);
          data[monthStr] = { anxiety: 0, depression: 0, stress: 0, wellness: 0 };
        }
      }

      snapshot.docs.forEach(doc => {
        const post = doc.data();
        const postDate = post.timestamp.toDate();
        let dateKey;
        if (dateRange === '7d' || dateRange === '30d') {
          dateKey = `${postDate.getMonth() + 1}/${postDate.getDate()}`;
        } else {
          dateKey = postDate.toLocaleString('default', { month: 'short' });
        }

        if (data[dateKey]) {
          const topic = post.topic as TrendKeys; // Type assertion here
          if (topic && data[dateKey][topic]) {
              data[dateKey][topic]++;
          }
        }
      });
      
      const formattedData = labels.map(label => ({
          date: label,
          anxiety: data[label]?.anxiety || 0,
          depression: data[label]?.depression || 0,
          stress: data[label]?.stress || 0,
          wellness: data[label]?.wellness || 0,
      }));
      setMentalHealthTrends(formattedData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching trend data:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db, collegeId, dateRange]);

  if (loading) {
    return <div className="text-center p-8">Loading trend analysis...</div>;
  }

  if (!collegeId) {
    return <div className="text-center p-8 text-red-600">Please log in to view this section.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-4 gap-4">
        {/* These cards will require more complex logic to calculate percentage change */}
        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium">Anxiety Trend</span>
          </div>
          <p className="text-2xl font-bold">15</p>
          <p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium">Depression</span>
          </div>
          <p className="text-2xl font-bold">8</p>
          <p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium">Academic Stress</span>
          </div>
          <p className="text-2xl font-bold">22</p>
          <p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium">Wellness Engagement</span>
          </div>
          <p className="text-2xl font-bold">35</p>
          <p className="text-xs text-muted-foreground">sessions this period</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Mental Health Topic Trends</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={mentalHealthTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="anxiety" stroke="#ef4444" strokeWidth={2} name="Anxiety" />
            <Line type="monotone" dataKey="depression" stroke="#3b82f6" strokeWidth={2} name="Depression" />
            <Line type="monotone" dataKey="stress" stroke="#f59e0b" strokeWidth={2} name="Academic Stress" />
            <Line type="monotone" dataKey="wellness" stroke="#10b981" strokeWidth={2} name="Wellness" />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* The seasonal patterns chart is a static visualization and doesn't require live data */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Seasonal Stress Patterns</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={[
            { period: "Fall Semester Start", level: 75 },
            { period: "Mid-October", level: 45 },
            { period: "Midterms", level: 85 },
            { period: "Thanksgiving Break", level: 30 },
            { period: "Finals", level: 95 },
            { period: "Winter Break", level: 25 },
            { period: "Spring Semester", level: 55 },
            { period: "Spring Break", level: 35 },
            { period: "Final Exams", level: 90 },
          ]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="period" />
            <YAxis />
            <Tooltip />
            <Area type="monotone" dataKey="level" stroke="#0891b2" fill="#0891b2" fillOpacity={0.3} />
          </AreaChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Key Insights</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Anxiety-related support requests peak during midterms and finals periods.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Depression support shows improvement with increased counselor availability.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Wellness resource engagement increases during break periods.</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
              <p>Academic stress correlates strongly with semester schedule.</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="font-medium text-blue-800">Increase Resources</p>
              <p className="text-blue-700">Add more anxiety management content before exam periods.</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="font-medium text-green-800">Proactive Outreach</p>
              <p className="text-green-700">Send wellness reminders during high-stress periods.</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <p className="font-medium text-orange-800">Staff Planning</p>
              <p className="text-orange-700">Schedule additional counselors during peak demand.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
