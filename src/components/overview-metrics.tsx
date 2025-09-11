"use client"

import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Users, MessageCircle, Calendar, BookOpen, AlertTriangle, Heart } from "lucide-react"
import { useState, useEffect } from "react"
import { collection, getFirestore, query, where, Timestamp, Firestore, getAggregateFromServer, count, onSnapshot, orderBy, getDocs } from 'firebase/firestore';
import { initializeApp, FirebaseApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithCustomToken, Auth, onAuthStateChanged, User } from 'firebase/auth';

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

interface OverviewMetricsProps {
  dateRange: string
}

export function OverviewMetrics({ dateRange }: OverviewMetricsProps) {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    chatSessions: 0,
    counselorBookings: 0,
    resourcesAccessed: 0,
    forumPosts: 0,
    crisisInterventions: 0,
    satisfactionScore: 0,
    responseTime: 0
  });

  const [collegeId, setCollegeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Use onAuthStateChanged to get the current user and their college ID
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
            setLoading(false);
          } else {
            console.error("No admin document found for this user.");
            setLoading(false);
          }
        } catch (error) {
          console.error("Error fetching admin data:", error);
          setLoading(false);
        }
      } else {
        console.log("No user is signed in.");
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [auth, db]);

  // Fetch metrics whenever the collegeId or dateRange changes
  useEffect(() => {
    if (!db || !collegeId || loading) return;

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
        startDate = new Date(0); // Epoch time for all data
        break;
    }
    
    const startTimestamp = Timestamp.fromDate(startDate);
    
    const fetchMetrics = async () => {
      try {
        // Fetch Active Users count
        const userQuery = query(collection(db, "students"), where("collegeId", "==", collegeId), where("lastActive", ">=", startTimestamp));
        const userSnapshot = await getAggregateFromServer(userQuery, { count: count() });
        const activeUsersCount = userSnapshot.data().count;

        // Fetch Chat Sessions count
        const chatQuery = query(collection(db, "chatSessions"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const chatSnapshot = await getAggregateFromServer(chatQuery, { count: count() });
        const chatCount = chatSnapshot.data().count;

        // Fetch Bookings count
        const bookingQuery = query(collection(db, "bookings"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const bookingSnapshot = await getAggregateFromServer(bookingQuery, { count: count() });
        const bookingCount = bookingSnapshot.data().count;

        // Fetch Forum Posts count
        const forumQuery = query(collection(db, "forumPosts"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const forumSnapshot = await getAggregateFromServer(forumQuery, { count: count() });
        const forumCount = forumSnapshot.data().count;

        // Fetch Crisis Interventions count
        const crisisQuery = query(collection(db, "crisisEvents"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const crisisSnapshot = await getAggregateFromServer(crisisQuery, { count: count() });
        const crisisCount = crisisSnapshot.data().count;

        // Fetch Resources Accessed count (assuming a 'resourceAccessLogs' collection)
        const resourceQuery = query(collection(db, "resourceAccessLogs"), where("collegeId", "==", collegeId), where("timestamp", ">=", startTimestamp));
        const resourceSnapshot = await getAggregateFromServer(resourceQuery, { count: count() });
        const resourcesAccessedCount = resourceSnapshot.data().count;

        // Update the state with the fetched data
        setMetrics({
          ...metrics,
          activeUsers: activeUsersCount,
          chatSessions: chatCount,
          counselorBookings: bookingCount,
          forumPosts: forumCount,
          crisisInterventions: crisisCount,
          resourcesAccessed: resourcesAccessedCount,
        });

      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      }
    };
    
    fetchMetrics();
    // Set up real-time listener for changes (optional, but good for hackathon)
    // You would replace the interval with a listener on relevant collections
    const intervalId = setInterval(fetchMetrics, 30000); 

    return () => clearInterval(intervalId);
  }, [db, collegeId, dateRange, loading]);


  if (loading) {
    return <div className="text-center p-8">Loading metrics...</div>;
  }
  
  if (!collegeId) {
    return <div className="text-center p-8 text-red-600">Please log in to view the dashboard.</div>;
  }

  const metricsDisplay = [
    {
      title: "Chat Sessions",
      value: metrics.chatSessions.toString(),
      change: "+8%", // Mock
      trend: "up",
      icon: MessageCircle,
      description: "AI chatbot interactions",
    },
    {
      title: "Counselor Bookings",
      value: metrics.counselorBookings.toString(),
      change: "+23%", // Mock
      trend: "up",
      icon: Calendar,
      description: "Appointments scheduled",
    },
    {
      title: "Forum Posts",
      value: metrics.forumPosts.toString(),
      change: "-5%", // Mock
      trend: "down",
      icon: MessageCircle,
      description: "New peer support discussions",
    },
    {
      title: "Crisis Interventions",
      value: metrics.crisisInterventions.toString(),
      change: "+2", // Mock
      trend: "up",
      icon: AlertTriangle,
      description: "Emergency support provided",
    },
    {
        title: "Active Users",
        value: metrics.activeUsers.toLocaleString(),
        change: "+12%", // Mock
        trend: "up",
        icon: Users,
        description: "Students using the platform",
      },
      {
        title: "Resources Accessed",
        value: metrics.resourcesAccessed.toLocaleString(),
        change: "+15%", // Mock
        trend: "up",
        icon: BookOpen,
        description: "Videos, articles, and guides viewed",
      },
      {
        title: "Satisfaction Score",
        value: "4.6/5",
        change: "+0.2",
        trend: "up",
        icon: Heart,
        description: "Average user rating",
      },
      {
        title: "Response Time",
        value: "2.3min",
        change: "-15%",
        trend: "down",
        icon: TrendingUp,
        description: "Average support response time",
      },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metricsDisplay.map((metric) => (
        <Card key={metric.title} className="p-4">
          <div className="flex items-center justify-between mb-2">
            <metric.icon className="h-5 w-5 text-primary" />
            <div className={`flex items-center text-xs ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
              {metric.trend === "up" ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {metric.change}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold">{metric.value}</p>
            <p className="text-xs text-muted-foreground">{metric.title}</p>
            <p className="text-xs text-muted-foreground">{metric.description}</p>
          </div>
        </Card>
      ))}
    </div>
  )
}
